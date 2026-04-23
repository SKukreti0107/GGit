import hashlib
from pathlib import Path

def get_folder_hash(folder_path):

    sha256_hash = hashlib.sha256()
    # Sort files to ensure the hash is consistent every time
    for file_path in sorted(Path(folder_path).rglob('*')):
        if file_path.is_file():
            # Hash the file path and the file content to detect renames or edits
            sha256_hash.update(str(file_path.relative_to(folder_path)).encode())
            with open(file_path, "rb") as f:
                for byte_block in iter(lambda: f.read(4096), b""):
                    sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()