## **GGit** — Git-Inspired Game Save Sync

 **GGit** is a specialized game launcher wrapper designed to protect your story-based game progress from local data loss or corruption.  By treating game saves like a Git repository, it ensures your "save states" are always synced and versioned in the cloud.

---

### **The "GGit" Workflow**
 The launcher acts as a wrapper for your game executables, managing the entire lifecycle of a gaming session:

* **The Pull:** Before the game launches, the engine checks the cloud for the latest saves. If the cloud version is newer, it automatically updates your local folder.
*  **The Watch:** GGit spawns the game process and pauses its execution, monitoring exactly when you finish playing.
*  **The Commit/Push:** Upon exiting the game, the tool calculates a **SHA-256 hash** of the save folder.  If changes are detected, it creates a timestamped snapshot and pushes it to the cloud.

---

### **Current Prototype Status**
 This project is currently in the **Rapid Prototyping** phase.

*  **Language:** Python 3.12+.
*  **Backend Engine:** **Rclone**, an open-source tool capable of syncing with over 40 cloud providers, with first-run integrated setup in the CLI.
*  **Change Detection:** Uses `hashlib` for folder integrity verification.

---

### **Cloud Storage: MEGA**
 For the prototype, GGit is optimized for **MEGA** (#38 in Rclone's provider list). 

*  **Storage:** 20GB of free space (exceeding Google Drive's 15GB), which is essential for storing multiple timestamped `.zip` snapshots.
*  **Security:** Offers **Zero-Knowledge Encryption**, ensuring saves are encrypted locally before they leave your PC.
*  **Speed:** Provides high bandwidth for fast "Push" operations of large binary save blobs.

>  **Note:** Users need a MEGA account,

---

### **Integrated Rclone Setup (Windows)**
 On first launch, GGit checks for `rclone.exe` in the project and in PATH.

* If Rclone is missing, the CLI prompts to install it automatically.
* GGit downloads `https://downloads.rclone.org/rclone-current-windows-amd64.zip`.
* It extracts `rclone.exe` and installs it in the project root.
* If you skip installation, cloud features remain unavailable until Rclone is installed.

---

### **Future Roadmap: The Move to Go**
 While the Python prototype is perfect for validating the "Pull -> Launch -> Watch -> Push" logic, the final version of GGit will be developed in **Go**.

*  **Performance:** Go's low RAM footprint and fast startup are ideal for a background game utility.
*  **Concurrency:** Using Goroutines will allow cloud pushes to happen seamlessly in the background without freezing the UI.
*  **Distribution:** Go compiles into a single, tiny `.exe`, making it much easier to share than bulky Python bundles.
*  **UI:** The final version will likely use **Wails**, allowing for a modern React/Vue frontend with a high-performance Go backend.