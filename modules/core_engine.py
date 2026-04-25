import csv
import hashlib
import io
import json
import subprocess
import time


class GameEngine:
    def __init__(self, game_instance, rclone_manager, logger=None):
        self.game = game_instance
        self.rclone = rclone_manager
        self.remote_path = f"{self.rclone.remote_name}:GGit/Saves/{self.game.name}"
        self.logger = logger

    def _emit(self, message, level="INFO"):
        print(message)
        if callable(self.logger):
            self.logger(level, "engine", message)

    def run_rclone(self, *args, check=False, capture_output=False, text=True):
        if not self.rclone.rclone_exe:
            raise FileNotFoundError("Rclone executable was not found.")

        command = [str(self.rclone.rclone_exe), *args]
        return subprocess.run(command, check=check, capture_output=capture_output, text=text)

    def has_remote_files(self):
        try:
            result = self.run_rclone(
                "lsf",
                self.remote_path,
                "--files-only",
                "-R",
                capture_output=True,
                check=True,
            )
            return bool(result.stdout.strip())
        except subprocess.CalledProcessError:
            return False

    def has_local_files(self):
        save_path = self.game.save_path
        if not save_path or not save_path.exists() or not save_path.is_dir():
            return False
        return any(path.is_file() for path in save_path.rglob("*"))

    def prompt_yes_no(self, prompt_text, default_yes=True):
        default_hint = "Y/n" if default_yes else "y/N"
        while True:
            user_input = input(f"{prompt_text} [{default_hint}]: ").strip().lower()
            if not user_input:
                return default_yes
            if user_input in {"y", "yes"}:
                return True
            if user_input in {"n", "no"}:
                return False
            self._emit("Please enter 'y' or 'n'.", "WARN")

    def get_manifest_hash(self, path):
        """Builds a stable hash of file listings for local/remote comparison."""
        result = self.run_rclone("lsjson", "-R", "--hash", path, capture_output=True, check=True)
        raw_items = json.loads(result.stdout or "[]")

        normalized = []
        for item in raw_items:
            if item.get("IsDir"):
                continue
            normalized.append(
                {
                    "Path": item.get("Path", ""),
                    "Size": item.get("Size", 0),
                    "Hashes": item.get("Hashes", {}),
                }
            )

        normalized.sort(key=lambda entry: entry["Path"])
        manifest = json.dumps(normalized, sort_keys=True)
        return hashlib.sha256(manifest.encode("utf-8")).hexdigest()

    def push_local_to_remote(self):
        if not self.has_local_files():
            self._emit("Warning: Local save folder is missing or empty. Skipping upload to protect remote saves.", "WARN")
            return False

        # Use copy instead of sync to avoid deleting remote saves if local files disappear.
        self.run_rclone("copy", str(self.game.save_path), self.remote_path, "--update", "-v", check=True)
        return True

    def pull_remote_to_local(self):
        self.run_rclone(
            "copy",
            self.remote_path,
            str(self.game.save_path),
            "--update",
            "--use-server-modtime",
            "-v",
            check=True,
        )

    def get_process_ids_by_image(self, image_name):
        """Returns process IDs for a given image name using tasklist (Windows)."""
        result = subprocess.run(
            ["tasklist", "/FO", "CSV", "/NH", "/FI", f"IMAGENAME eq {image_name}"],
            capture_output=True,
            text=True,
        )
        if result.returncode != 0 or not result.stdout.strip():
            return set()

        process_ids = set()
        reader = csv.reader(io.StringIO(result.stdout))
        for row in reader:
            if len(row) < 2:
                continue

            image = row[0].strip().strip('"')
            if image.lower() != image_name.lower():
                continue

            pid_text = row[1].replace(",", "").strip()
            if pid_text.isdigit():
                process_ids.add(int(pid_text))

        return process_ids

    def wait_for_game_process(self, launcher_process, image_name, baseline_pids):
        """Waits for launcher handoff and tracks the real game process lifetime."""
        startup_deadline = time.time() + 90
        observed_game_process = False

        while time.time() < startup_deadline:
            current_pids = self.get_process_ids_by_image(image_name)
            new_pids = current_pids - baseline_pids
            if new_pids:
                observed_game_process = True
                break
            if launcher_process.poll() is None:
                observed_game_process = True
                break
            time.sleep(1)

        if not observed_game_process:
            return launcher_process.poll() or 0

        while True:
            current_pids = self.get_process_ids_by_image(image_name)
            active_game_pids = current_pids - baseline_pids
            launcher_running = launcher_process.poll() is None
            if not active_game_pids and not launcher_running:
                break
            time.sleep(2)

        return launcher_process.poll() or 0

    def start(self):
        self._emit(f"\n--- GGit Engine: Starting {self.game.name} ---")

        self._emit("Preparing cloud save folder...")

        try:
            self.run_rclone("mkdir", self.remote_path, check=True, capture_output=True)
        except subprocess.CalledProcessError:
            self._emit("Warning: Could not ensure cloud save folder exists. Proceeding with local saves.", "WARN")
            return

        if not self.has_remote_files():
            self._emit("First-time setup detected. Pushing current local saves to remote...")
            try:
                if self.push_local_to_remote():
                    self._emit("Initial save backup completed.")
                else:
                    self._emit("Initial save backup skipped to protect existing remote saves.", "WARN")
            except subprocess.CalledProcessError:
                self._emit("Failed to create initial cloud backup.", "ERROR")
                return
        else:
            self._emit("Comparing local and remote save hashes...")
            try:
                local_hash = self.get_manifest_hash(str(self.game.save_path))
                remote_hash = self.get_manifest_hash(self.remote_path)
                if local_hash == remote_hash:
                    self._emit("Local and remote saves are identical. Starting game.")
                else:
                    self._emit("Local and remote saves differ. Pulling latest remote updates before launch...")
                    self.pull_remote_to_local()
                    self._emit("Local saves updated from remote.")
            except subprocess.CalledProcessError:
                self._emit("Warning: Hash comparison failed.", "WARN")
                if self.prompt_yes_no("Fetch saves from remote before launch?", default_yes=True):
                    try:
                        self.pull_remote_to_local()
                        self._emit("Local saves updated from remote.")
                    except subprocess.CalledProcessError:
                        self._emit("Failed to fetch saves from remote. Proceeding with existing local saves.", "WARN")
                else:
                    self._emit("Proceeding with existing local saves.", "WARN")

        self._emit(f"Launching {self.game.exe_path}...")
        start_time = time.time()
        game_image_name = self.game.exe_path.name
        baseline_pids = self.get_process_ids_by_image(game_image_name)

        try:
            process = subprocess.Popen([str(self.game.exe_path)])
        except OSError:
            self._emit("Failed to launch game executable.", "ERROR")
            return

        self._emit("Game is running.....")
        return_code = self.wait_for_game_process(process, game_image_name, baseline_pids)

        end_time = time.time()
        duration_seconds = int(end_time - start_time)
        minutes, seconds = divmod(duration_seconds, 60)
        self._emit(f"Game closed. Session duration: {minutes}m {seconds}s.")
        if return_code != 0:
            self._emit(f"Warning: Game process exited with code {return_code}.", "WARN")

        self._emit("Syncing latest saves to remote...")
        try:
            if self.push_local_to_remote():
                self._emit(f"Successfully synced saves to {self.rclone.remote_name}.")
            else:
                self._emit("Skipped cloud sync to avoid accidental remote data deletion.", "WARN")
        except subprocess.CalledProcessError:
            self._emit("Failed to sync saves to cloud. Check your connection.", "ERROR")