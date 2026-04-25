import webview
import json
import time
from datetime import datetime
from pathlib import Path
from threading import Lock
from helpers.config import get_saved_state,load_config,save_config
from modules.core_engine import GameEngine
from modules.game import Game
from modules.rclone_manager import RcloneManager

class GGitBridgeApi:
    def __init__(self):
        self._log_lock = Lock()
        self._logs = []
        self._log_seq = 0
        self._max_logs = 500
        self._status_cache_items = []
        self._status_cache_at = 0.0
        self._status_cache_ttl_seconds = 1800.0

        self.rclone_manager = RcloneManager()
        self.config = load_config()
        self.saved_state = get_saved_state(self.config)
        self.games = [self._game_from_data(item) for item in self.saved_state["games"]]

        if self.saved_state["remote_name"]:
            self.rclone_manager.remote_name  = self.saved_state["remote_name"]

        self.active_game_name = self.saved_state["active_game_name"]

        self._append_log("INFO", "bridge", f"Bridge ready with {len(self.games)} configured game(s).")

    def _invalidate_status_cache(self, reason=None):
        had_cache = bool(self._status_cache_items)
        self._status_cache_items = []
        self._status_cache_at = 0.0
        if had_cache and reason:
            self._append_log("INFO", "status", f"Status cache invalidated: {reason}")

    def _is_status_cache_fresh(self, max_age_seconds):
        if not self._status_cache_items or self._status_cache_at <= 0:
            return False
        return (time.monotonic() - self._status_cache_at) < max_age_seconds

    def _append_log(self, level, source, message):
        timestamp = datetime.now().strftime("%H:%M:%S")
        with self._log_lock:
            self._log_seq += 1
            self._logs.append(
                {
                    "id": self._log_seq,
                    "timestamp": timestamp,
                    "level": level,
                    "source": source,
                    "message": str(message),
                }
            )
            if len(self._logs) > self._max_logs:
                self._logs = self._logs[-self._max_logs:]

    def _game_from_data(self,data):

        game = Game()
        game.name = data.get("name","")
        exe_path = data.get("exe_path","")
        save_path = data.get("save_path","")
        game.exe_path = Path(exe_path) if exe_path else None
        game.save_path = Path(save_path) if save_path else None
        return game

    def _get_window(self):
        if not webview.windows:
            return None
        return webview.windows[0]
    
    # api methods callable form JS

    def _build_library_item(self, game, status="Unknown"):
        return {
            "name": game.name,
            "exe": str(game.exe_path) if game.exe_path else "",
            "save": str(game.save_path) if game.save_path else "",
            "status": status,
        }

    def _parse_latest_modtime(self, engine, path):
        result = engine.run_rclone("lsjson", "-R", path, capture_output=True, check=True)
        items = json.loads(result.stdout or "[]")

        latest = None
        for item in items:
            if item.get("IsDir"):
                continue
            mod_time = item.get("ModTime")
            if not mod_time:
                continue

            parsed = datetime.fromisoformat(mod_time.replace("Z", "+00:00"))
            if latest is None or parsed > latest:
                latest = parsed

        return latest

    def _get_game_status(self, game):
        self._append_log("INFO", "status", f"Checking status for {game.name}...")

        if not game.exe_path or not game.save_path:
            status = "Not Configured"
            self._append_log("WARN", "status", f"{game.name}: {status}")
            return status

        if not self.rclone_manager.rclone_exe:
            status = "Rclone Missing"
            self._append_log("WARN", "status", f"{game.name}: {status}")
            return status

        if not self.rclone_manager.remote_name:
            status = "Remote Missing"
            self._append_log("WARN", "status", f"{game.name}: {status}")
            return status

        engine = GameEngine(game, self.rclone_manager)

        try:
            has_local = engine.has_local_files()
            has_remote = engine.has_remote_files()

            if has_local and not has_remote:
                status = "Local Only"
                self._append_log("INFO", "status", f"{game.name}: {status}")
                return status
            if has_remote and not has_local:
                status = "Remote Only"
                self._append_log("INFO", "status", f"{game.name}: {status}")
                return status
            if not has_local and not has_remote:
                status = "No Saves"
                self._append_log("INFO", "status", f"{game.name}: {status}")
                return status

            local_hash = engine.get_manifest_hash(str(game.save_path))
            remote_hash = engine.get_manifest_hash(engine.remote_path)
            if local_hash == remote_hash:
                status = "Synced"
                self._append_log("INFO", "status", f"{game.name}: {status}")
                return status

            local_latest = self._parse_latest_modtime(engine, str(game.save_path))
            remote_latest = self._parse_latest_modtime(engine, engine.remote_path)

            if local_latest and remote_latest:
                if local_latest > remote_latest:
                    status = "Local Newer"
                    self._append_log("INFO", "status", f"{game.name}: {status}")
                    return status
                if remote_latest > local_latest:
                    status = "Remote Newer"
                    self._append_log("INFO", "status", f"{game.name}: {status}")
                    return status

            status = "Out of Sync"
            self._append_log("WARN", "status", f"{game.name}: {status}")
            return status
        except Exception as exc:
            self._append_log("ERROR", "status", f"{game.name}: Status Error ({exc})")
            return "Status Error"

    def get_logs(self, since_id=0, limit=200):
        try:
            since_id = int(since_id)
        except (TypeError, ValueError):
            since_id = 0

        try:
            limit = int(limit)
        except (TypeError, ValueError):
            limit = 200
        limit = max(1, min(limit, 500))

        with self._log_lock:
            filtered = [entry for entry in self._logs if entry["id"] > since_id]
            return filtered[-limit:]

    def clear_logs(self):
        with self._log_lock:
            self._logs = []
        self._append_log("INFO", "bridge", "Terminal logs cleared.")
        return {"status": "success"}

    def get_library(self):
        return [self._build_library_item(g, "Unknown") for g in self.games]

    def get_library_with_status(self, force_refresh=False, max_age_seconds=None):
        # Sequentially checks each game to support the launcher workflow.
        if isinstance(force_refresh, str):
            force_refresh = force_refresh.strip().lower() in {"1", "true", "yes", "y"}
        else:
            force_refresh = bool(force_refresh)

        try:
            max_age = float(max_age_seconds) if max_age_seconds is not None else self._status_cache_ttl_seconds
        except (TypeError, ValueError):
            max_age = self._status_cache_ttl_seconds
        max_age = max(1.0, min(max_age, 300.0))

        if not force_refresh and self._is_status_cache_fresh(max_age):
            return [dict(item) for item in self._status_cache_items]

        self._append_log("INFO", "status", f"Refreshing status for {len(self.games)} game(s)...")
        library = []
        for game in self.games:
            status = self._get_game_status(game)
            library.append(self._build_library_item(game, status))
        self._status_cache_items = [dict(item) for item in library]
        self._status_cache_at = time.monotonic()
        self._append_log("INFO", "status", "Status refresh complete.")
        return library

    def pick_game_exe(self):
        window = self._get_window()
        if not window:
            self._append_log("ERROR", "library", "File picker unavailable: no active window.")
            return ""

        file_dialog = getattr(webview, "FileDialog", None)
        open_dialog = file_dialog.OPEN if file_dialog else webview.OPEN_DIALOG

        try:
            selected = window.create_file_dialog(
                open_dialog,
                allow_multiple=False,
                file_types=("Executable files (*.exe)", "All files (*.*)"),
            )
            if selected:
                selected_path = str(selected[0])
                self._append_log("INFO", "library", f"Selected EXE: {selected_path}")
                return selected_path
        except Exception as exc:
            self._append_log("ERROR", "library", f"Failed to open EXE picker: {exc}")

        return ""

    def pick_save_folder(self):
        window = self._get_window()
        if not window:
            self._append_log("ERROR", "library", "Folder picker unavailable: no active window.")
            return ""

        file_dialog = getattr(webview, "FileDialog", None)
        folder_dialog = file_dialog.FOLDER if file_dialog else webview.FOLDER_DIALOG

        try:
            selected = window.create_file_dialog(folder_dialog)
            if selected:
                selected_path = str(selected[0])
                self._append_log("INFO", "library", f"Selected save folder: {selected_path}")
                return selected_path
        except Exception as exc:
            self._append_log("ERROR", "library", f"Failed to open save-folder picker: {exc}")

        return ""
    

    def launch_game(self,game_name):
        self._append_log("INFO", "launch", f"Launch requested for {game_name}.")

        selected_game = next((g for g in self.games if g.name == game_name),None)

        if not selected_game or not self.rclone_manager.remote_name:
            self._append_log("ERROR", "launch", f"Cannot launch {game_name}: game or remote is not configured.")
            return {
                "status":"error",
                "message":"Game or Remote not configured."
            }
        
        engine = GameEngine(selected_game, self.rclone_manager, logger=self._append_log)
        engine.start()

        save_config(self.games,selected_game.name,self.rclone_manager)
        self._invalidate_status_cache("launch workflow completed")
        self._append_log("INFO", "launch", f"Launch workflow complete for {game_name}.")

        return {
            "status":"success",
            "message":f"{game_name} synced successfully"
        }
    
    def add_game(self, name, exe_path, save_path):
        name = (name or "").strip()
        exe_path = (exe_path or "").strip()
        save_path = (save_path or "").strip()

        if not exe_path or not save_path:
            self._append_log("ERROR", "library", "add_game rejected: exe_path and save_path are required.")
            return {
                "status": "error",
                "message": "Game EXE path and save folder path are required.",
            }

        exe_candidate = Path(exe_path)
        save_candidate = Path(save_path)
        if not exe_candidate.exists() or not exe_candidate.is_file():
            self._append_log("ERROR", "library", f"add_game rejected: EXE does not exist ({exe_path}).")
            return {
                "status": "error",
                "message": "Game EXE path is invalid or does not exist.",
            }

        if not save_candidate.exists() or not save_candidate.is_dir():
            self._append_log("ERROR", "library", f"add_game rejected: save folder does not exist ({save_path}).")
            return {
                "status": "error",
                "message": "Save folder path is invalid or does not exist.",
            }

        new_game = Game()
        new_game.exe_path = exe_candidate
        new_game.save_path = save_candidate
        new_game.name = name or new_game.exe_path.stem

        existing_game = next((g for g in self.games if g.name.lower() == new_game.name.lower()), None)
        if existing_game:
            existing_game.exe_path = new_game.exe_path
            existing_game.save_path = new_game.save_path
            active_name = existing_game.name
            action_text = "Updated"
        else:
            self.games.append(new_game)
            active_name = new_game.name
            action_text = "Added"

        save_config(self.games, active_name, self.rclone_manager)
        self._invalidate_status_cache("library changed")
        self._append_log("INFO", "library", f"{action_text} game: {active_name}")
        return {
            "status": "success",
            "message": f"{active_name} {action_text.lower()} in library.",
        }
    
    


