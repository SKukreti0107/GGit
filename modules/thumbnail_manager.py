import os
import requests
from pathlib import Path
from dotenv import load_dotenv

class ThumbnailManager:
    def __init__(self):
        self.project_root = Path(__file__).resolve().parents[1]
        self.cache_dir = self.project_root / "assets" / "thumbnails"
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        
        # Ensure .env is loaded
        load_dotenv(self.project_root / ".env")
        self.api_key = os.getenv("RAWG_API")
        
    def get_thumbnail(self, game_name):
        """Fetches game thumbnail from RAWG and caches it locally."""
        if not self.api_key:
            print("Warning: RAWG_API key not found in .env")
            return ""

        # Sanitize game name for use as a filename
        safe_name = "".join([c for c in game_name if c.isalnum() or c in (' ', '_')]).rstrip()
        safe_name = safe_name.replace(" ", "_").lower()
        thumb_filename = f"{safe_name}.jpg"
        thumb_path = self.cache_dir / thumb_filename
        
        # Absolute path for the bridge to handle
        full_path = str(thumb_path.resolve())

        if thumb_path.exists():
            return full_path

        # Fetch from RAWG API
        print(f"Fetching poster for: {game_name}...")
        search_url = f"https://api.rawg.io/api/games?key={self.api_key}&search={game_name}"
        
        try:
            response = requests.get(search_url, timeout=10).json()
            if response.get('results'):
                # Return the 'background_image' from the first search result
                image_url = response['results'][0].get('background_image')
                if image_url:
                    img_data = requests.get(image_url, timeout=10).content
                    with open(thumb_path, 'wb') as f:
                        f.write(img_data)
                    print(f"Cached poster to: {full_path}")
                    return full_path
        except Exception as e:
            print(f"Error fetching thumbnail from RAWG: {e}")
            
        return "" # Fallback will be handled by the UI
