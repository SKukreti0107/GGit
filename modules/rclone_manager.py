import subprocess
import shutil
from pathlib import Path

class RcloneManager:
    def __init__(self):
        self.remote_name = "ggit_mega"
        self.rclone_exe = self.get_rclone_executable_path()
        self.check_rclone_installed()

    def configure(self):
        return self.setup_mega_remote()

    def get_rclone_executable_path(self):
        """Returns the bundled rclone executable path when available."""
        project_root = Path(__file__).resolve().parents[1]
        bundled_exe = project_root / "rclone" / "rclone.exe"

        if bundled_exe.exists() and bundled_exe.is_file():
            return bundled_exe

        return shutil.which("rclone")

    def check_rclone_installed(self):
        """Checks if bundled or system Rclone is available."""
        if self.rclone_exe:
            print(f"Rclone detected at: {self.rclone_exe}")
            return True
        else:
            print("Error: Rclone not found.")
            print("Please place rclone.exe in the project rclone folder or add Rclone to your PATH: https://rclone.org/downloads/")
            return False

    def run_rclone(self, *args, capture_output=False, text=True, check=False):
        """Runs the bundled rclone executable when available."""
        if not self.rclone_exe:
            raise FileNotFoundError("Rclone executable was not found.")

        command = [str(self.rclone_exe), *args]
        return subprocess.run(command, capture_output=capture_output, text=text, check=check)

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