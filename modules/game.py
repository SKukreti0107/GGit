from pathlib import Path

class Game:
    def __init__(self):
        self.name = ""
        self.exe_path = None
        self.save_path = None

    def configure(self):
        if self.add_game_exe_path():
            self.add_save_path()


    def add_game_exe_path(self):
        print("--- GGit: ADD GAME---")
        
        while(True):
            user_input = input("Enter the full path to the game EXE. Enter 'exit' to quit\n")
            if user_input == "exit":
                print("Aborting game configuration.")
                return False
            exe_path = Path(user_input.strip('"\'')).expanduser().resolve()

            if exe_path.exists() and exe_path.is_file():
                print(f"Successfully linked game at path: {exe_path}")
                self.exe_path = exe_path
                self.name = exe_path.stem
                return True
            else:
                print("Invalid path, did not find game EXE there. Please recheck.")
            
    def add_save_path(self):
        print("\n--- GGit: LINK SAVE FOLDER ---")
        
        while True:
            user_input = input("Enter the path to the game's SAVE folder (or 'exit'): ").strip()
            if user_input.lower() == "exit":
                print("Aborting save path configuration.")
                return
            
            save_path = Path(user_input.strip('"\'')).expanduser().resolve()

            if save_path.exists() and save_path.is_dir():
                print(f"Save folder linked: {save_path}")
                self.save_path = save_path
                return
            else:
                print(f"Error: '{save_path}' is not a valid directory.")
                print("Tip: Check PCGamingWiki if you're unsure where the saves are.")


if __name__== "__main__":
    game = Game()
    game.configure()