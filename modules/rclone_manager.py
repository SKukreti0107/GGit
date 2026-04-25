import subprocess
import shutil
import sys
import tempfile
import urllib.request
import zipfile
from pathlib import Path


class RcloneManager:
    RCLONE_WINDOWS_AMD64_URL = "https://downloads.rclone.org/rclone-current-windows-amd64.zip"

    def __init__(self):
        self.project_root = Path(__file__).resolve().parents[1]
        self.remote_name = "ggit_mega"
        self.rclone_exe = self.get_rclone_executable_path()
        self.ensure_rclone_installed()

    def configure(self):
        if not self.rclone_exe and not self.ensure_rclone_installed():
            return False
        return self.setup_mega_remote()

    def get_rclone_executable_path(self):
        """Returns the bundled rclone executable path when available."""
        bundled_locations = [
            self.project_root / "rclone.exe",
            self.project_root / "rclone" / "rclone.exe",
        ]
        for bundled_exe in bundled_locations:
            if bundled_exe.exists() and bundled_exe.is_file():
                return bundled_exe

        return shutil.which("rclone")

    def ensure_rclone_installed(self):
        """Ensures rclone is available, optionally bootstrapping a local install."""
        if self.rclone_exe:
            print(f"Rclone detected at: {self.rclone_exe}")
            return True

        print("Rclone not found.")

        if sys.stdin is None or not sys.stdin.isatty():
            if self.rclone_exe:
                return True
            return False

        try:
            choice = input("Install rclone now in the project root? [Y/n]: ").strip().lower()
            if choice in ("", "y", "yes"):
                if self.download_and_install_rclone():
                    self.rclone_exe = self.get_rclone_executable_path()
                    if self.rclone_exe:
                        print(f"Rclone installed at: {self.rclone_exe}")
                        return True
        except (EOFError, IOError):
            pass

        return False

    def download_and_install_rclone(self):
        """Downloads rclone zip and installs rclone.exe into the project root."""
        target_exe = self.project_root / "rclone.exe"
        print("Downloading rclone...")

        try:
            with tempfile.TemporaryDirectory() as tmp_dir:
                temp_root = Path(tmp_dir)
                zip_path = temp_root / "rclone-windows-amd64.zip"
                urllib.request.urlretrieve(self.RCLONE_WINDOWS_AMD64_URL, zip_path)

                with zipfile.ZipFile(zip_path) as archive:
                    archive.extractall(temp_root)

                extracted_binaries = list(temp_root.rglob("rclone.exe"))
                if not extracted_binaries:
                    print("Downloaded archive did not contain rclone.exe.")
                    return False

                shutil.copy2(extracted_binaries[0], target_exe)
                return True
        except (urllib.error.URLError, zipfile.BadZipFile, OSError) as error:
            print(f"Failed to install rclone automatically: {error}")
            return False

    def run_rclone(self, *args, capture_output=False, text=True, check=False):
        """Runs the bundled rclone executable when available."""
        if not self.rclone_exe:
            raise FileNotFoundError("Rclone executable was not found.")

        command = [str(self.rclone_exe), *args]
        return subprocess.run(command, capture_output=capture_output, text=text, check=check, creationflags=getattr(subprocess, 'CREATE_NO_WINDOW', 0))

    def setup_mega_remote(self):
        """Guides the user through setting up a MEGA remote for GGit."""
        print("\n--- GGit: MEGA Cloud Setup ---")

        result = self.run_rclone("listremotes", capture_output=True)
        if f"{self.remote_name}:" in result.stdout:
            print(f"Remote '{self.remote_name}' is already configured.")
            return True

        print("This will link GGit to your MEGA account.")
        user_email = input("Enter your MEGA email: ").strip()
        user_pass = input("Enter your MEGA password: ").strip()

        try:
            print(f"Configuring '{self.remote_name}'...")
            self.run_rclone(
                "config",
                "create",
                self.remote_name,
                "mega",
                "user",
                user_email,
                "pass",
                user_pass,
                check=True,
            )
            print(f"Successfully linked to MEGA as '{self.remote_name}'")
            return True
        except subprocess.CalledProcessError:
            print("Failed to create MEGA remote. Please check your credentials.")
            return False

if __name__ == "__main__":
    rc = RcloneManager()