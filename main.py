# from pathlib import Path

# from helpers.config import get_saved_state, load_config, save_config
# from modules.core_engine import GameEngine
# from modules.game import Game
# from modules.rclone_manager import RcloneManager


# def print_menu():
#     print("\n--- GGit CLI ---")
#     print("1. Add new game")
#     print("2. List saved games")
#     print("3. Reconfigure saved game")
#     print("4. Configure MEGA remote")
#     print("5. Exit")
#     print("6. Launch game")


# def game_from_data(data):
#     game = Game()
#     game.name = data.get("name", "")

#     exe_path = data.get("exe_path", "")
#     save_path = data.get("save_path", "")
#     game.exe_path = Path(exe_path) if exe_path else None
#     game.save_path = Path(save_path) if save_path else None
#     return game


# def find_active_game(games, active_game_name):
#     for game in games:
#         if game.name == active_game_name:
#             return game
#     return games[0] if games else None


# def list_games(games, active_game_name):
#     if not games:
#         print("No games configured yet.")
#         return

#     print("Saved games:")
#     for index, game in enumerate(games, start=1):
#         marker = " (active)" if game.name == active_game_name else ""
#         print(f"{index}. {game.name}{marker}")


# def choose_game(games, prompt_text):
#     if not games:
#         print("No games available.")
#         return None

#     list_games(games, "")
#     user_input = input(prompt_text).strip()
#     if not user_input.isdigit():
#         print("Invalid selection.")
#         return None

#     game_index = int(user_input)
#     if game_index < 1 or game_index > len(games):
#         print("Invalid selection.")
#         return None

#     return games[game_index - 1]


# def main():
#     rclone_manager = RcloneManager()
#     saved_state = get_saved_state(load_config())
#     games = [game_from_data(item) for item in saved_state["games"]]

#     if saved_state["remote_name"]:
#         rclone_manager.remote_name = saved_state["remote_name"]

#     active_game_name = saved_state["active_game_name"]
#     active_game = find_active_game(games, active_game_name)
#     if active_game:
#         active_game_name = active_game.name

#     while True:
#         print_menu()
#         print(f"Current game: {active_game_name or 'not configured'}")
#         print(f"Current remote: {rclone_manager.remote_name or 'not configured'}")
#         choice = input("Choose an option [1-6]: ").strip()

#         if choice == "1":
#             new_game = Game()
#             new_game.configure()
#             if not new_game.exe_path or not new_game.save_path:
#                 continue

#             existing_names = {game.name.lower(): index for index, game in enumerate(games)}
#             normalized_name = new_game.name.lower()
#             if normalized_name in existing_names:
#                 games[existing_names[normalized_name]] = new_game
#                 print(f"Updated existing game entry: {new_game.name}")
#             else:
#                 games.append(new_game)
#                 print(f"Added game: {new_game.name}")

#             active_game_name = new_game.name
#             active_game = new_game
#             save_config(games, active_game_name, rclone_manager)
#         elif choice == "2":
#             list_games(games, active_game_name)
#         elif choice == "3":
#             selected_game = choose_game(games, "Select game number to reconfigure: ")
#             if selected_game:
#                 selected_game.configure()
#                 if selected_game.exe_path and selected_game.save_path:
#                     active_game_name = selected_game.name
#                     active_game = selected_game
#                     save_config(games, active_game_name, rclone_manager)
#         elif choice == "4":
#             if rclone_manager.configure():
#                 save_config(games, active_game_name, rclone_manager)
#         elif choice == "6":
#             selected_game = choose_game(games, "Select game number to launch: ")
#             if not selected_game:
#                 continue
#             if not selected_game.exe_path or not selected_game.save_path:
#                 print("Configure this game first.")
#                 continue
#             if not rclone_manager.rclone_exe:
#                 print("Rclone is not available.")
#                 continue
#             if not rclone_manager.remote_name:
#                 print("Configure the MEGA remote first.")
#                 continue
#             active_game_name = selected_game.name
#             active_game = selected_game
#             engine = GameEngine(selected_game, rclone_manager)
#             engine.start()
#             save_config(games, active_game_name, rclone_manager)
#         elif choice == "5":
#             break
#         else:
#             print("Invalid choice. Please select 1-6.")
from pathlib import Path
from launcher.bridge import GGitBridgeApi
import webview


def start_app():
    api = GGitBridgeApi()

    # Path to the built static files
    base_dir = Path(__file__).resolve().parent
    dist_index = base_dir / "launcher" / "GGit_launcher" / "dist" / "index.html"

    if not dist_index.exists():
        print(f"Warning: Build not found at {dist_index}")
        print("Falling back to dev server...")
        url = "http://localhost:5173/"
    else:
        url = str(dist_index)

    window = webview.create_window(
        "GGit Launcher",
        url=url,
        js_api=api,
        width=1000,
        height=700
    )
    webview.start(debug=False)


if __name__ == "__main__":
    # main()
    start_app()
