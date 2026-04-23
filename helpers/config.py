import json
from pathlib import Path

CONFIG_PATH = Path(__file__).resolve().parents[1] / "ggit_config.json"


def load_config():
    if not CONFIG_PATH.exists():
        return {}

    try:
        return json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {}


def _normalize_game_entry(entry):
    return {
        "name": entry.get("name", ""),
        "exe_path": entry.get("exe_path", ""),
        "save_path": entry.get("save_path", ""),
    }


def get_saved_state(config):
    
    games = []

    for item in config.get("games", []):
        games.append(_normalize_game_entry(item))

    if not games:
        legacy = config.get("game", {})
        if legacy.get("name") or legacy.get("exe_path") or legacy.get("save_path"):
            games.append(_normalize_game_entry(legacy))

    active_game_name = config.get("active_game_name", "")
    if not active_game_name and games:
        active_game_name = games[0]["name"]

    remote_name = config.get("rclone", {}).get("remote_name", "ggit_mega")

    return {
        "games": games,
        "active_game_name": active_game_name,
        "remote_name": remote_name,
    }


def save_config(games, active_game_name, rclone_manager):
    config = {
        "games": [
            {
                "name": game.name,
                "exe_path": str(game.exe_path) if game.exe_path else "",
                "save_path": str(game.save_path) if game.save_path else "",
            }
            for game in games
        ],
        "active_game_name": active_game_name,
        "rclone": {
            "remote_name": rclone_manager.remote_name,
        },
    }
    CONFIG_PATH.write_text(json.dumps(config, indent=2), encoding="utf-8")
