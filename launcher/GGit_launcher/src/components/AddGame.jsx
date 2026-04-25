import { useEffect, useState } from "react";

function inferGameNameFromExePath(exePath) {
	const normalized = exePath.replace(/\\/g, "/").trim();
	const fileName = normalized.split("/").pop() || "";
	return fileName.replace(/\.[^/.]+$/, "") || "New Game";
}

export default function AddGame({
	isOpen,
	isSubmitting = false,
	errorMessage = "",
	onClose,
	onSubmit,
}) {
	const [name, setName] = useState("");
	const [exePath, setExePath] = useState("");
	const [savePath, setSavePath] = useState("");
	const [localError, setLocalError] = useState("");
	const [isPickingExe, setIsPickingExe] = useState(false);
	const [isPickingSave, setIsPickingSave] = useState(false);

	useEffect(() => {
		if (!isOpen) {
			setName("");
			setExePath("");
			setSavePath("");
			setLocalError("");
		}
	}, [isOpen]);

	const handleExePathChange = (value) => {
		setExePath(value);
		if (!name.trim()) {
			setName(inferGameNameFromExePath(value));
		}
	};

	const handleSubmit = (event) => {
		event.preventDefault();
		setLocalError("");

		const trimmedName = name.trim() || inferGameNameFromExePath(exePath);
		const trimmedExePath = exePath.trim();
		const trimmedSavePath = savePath.trim();

		if (!trimmedExePath) {
			setLocalError("Game EXE path is required.");
			return;
		}

		if (!trimmedSavePath) {
			setLocalError("Save folder path is required.");
			return;
		}

		onSubmit({
			name: trimmedName,
			exePath: trimmedExePath,
			savePath: trimmedSavePath,
		});
	};

	const browseExePath = async () => {
		setLocalError("");
		const api = window.pywebview?.api;
		if (typeof api?.pick_game_exe !== "function") {
			setLocalError("File picker is only available in Python launcher mode.");
			return;
		}

		setIsPickingExe(true);
		try {
			const selected = await api.pick_game_exe();
			if (selected) {
				handleExePathChange(String(selected));
			}
		} catch (err) {
			setLocalError("Failed to open EXE picker.");
		} finally {
			setIsPickingExe(false);
		}
	};

	const browseSavePath = async () => {
		setLocalError("");
		const api = window.pywebview?.api;
		if (typeof api?.pick_save_folder !== "function") {
			setLocalError("Folder picker is only available in Python launcher mode.");
			return;
		}

		setIsPickingSave(true);
		try {
			const selected = await api.pick_save_folder();
			if (selected) {
				setSavePath(String(selected));
			}
		} catch (err) {
			setLocalError("Failed to open save-folder picker.");
		} finally {
			setIsPickingSave(false);
		}
	};

	if (!isOpen) {
		return null;
	}

	return (
		<div className="fixed inset-0 z-[70] flex items-center justify-center bg-background-dark/80 backdrop-blur-[2px] px-4">
			<form className="w-full max-w-[700px] border border-surface-border bg-surface p-6 shadow-[0_0_35px_rgba(0,0,0,0.4)]" onSubmit={handleSubmit}>
				<div className="mb-6 flex items-start justify-between gap-4 border-b border-surface-border pb-4">
					<div>
						<p className="font-mono text-xs uppercase tracking-[0.12em] text-primary">Library</p>
						<h3 className="font-display text-white text-2xl font-bold leading-tight">Add Game</h3>
						<p className="mt-1 font-body text-sm text-muted">Connect a game executable and its save directory for sync tracking.</p>
					</div>
					<button
						className="h-9 px-3 border border-surface-border font-body text-xs uppercase tracking-[0.06em] text-muted hover:text-white hover:border-primary transition-colors"
						disabled={isSubmitting}
						onClick={onClose}
						type="button"
					>
						Dismiss
					</button>
				</div>

				<div className="space-y-5">
					<div>
						<label className="mb-1.5 block font-body text-xs uppercase tracking-[0.1em] text-muted">Game Name</label>
						<input
							className="w-full border border-surface-border bg-[#0b101a] px-3 py-2.5 font-body text-sm text-white outline-none focus:border-primary"
							disabled={isSubmitting}
							onChange={(event) => setName(event.target.value)}
							placeholder="Cyberpunk 2077"
							type="text"
							value={name}
						/>
					</div>

					<div>
						<label className="mb-1.5 block font-body text-xs uppercase tracking-[0.1em] text-muted">Game EXE Path</label>
						<div className="flex items-center gap-2">
							<input
								className="w-full border border-surface-border bg-[#0b101a] px-3 py-2.5 font-mono text-xs text-white outline-none focus:border-primary"
								disabled={isSubmitting || isPickingExe}
								onChange={(event) => handleExePathChange(event.target.value)}
								placeholder="C:\\Games\\MyGame\\Game.exe"
								type="text"
								value={exePath}
							/>
							<button
								className="h-[38px] min-w-[98px] border border-surface-border px-3 font-body text-xs uppercase tracking-[0.05em] text-muted hover:text-white hover:border-primary transition-colors disabled:opacity-60"
								disabled={isSubmitting || isPickingExe}
								onClick={browseExePath}
								type="button"
							>
								{isPickingExe ? "Picking..." : "Browse"}
							</button>
						</div>
					</div>

					<div>
						<label className="mb-1.5 block font-body text-xs uppercase tracking-[0.1em] text-muted">Save Folder Path</label>
						<div className="flex items-center gap-2">
							<input
								className="w-full border border-surface-border bg-[#0b101a] px-3 py-2.5 font-mono text-xs text-white outline-none focus:border-primary"
								disabled={isSubmitting || isPickingSave}
								onChange={(event) => setSavePath(event.target.value)}
								placeholder="C:\\Users\\You\\Saved Games\\MyGame"
								type="text"
								value={savePath}
							/>
							<button
								className="h-[38px] min-w-[98px] border border-surface-border px-3 font-body text-xs uppercase tracking-[0.05em] text-muted hover:text-white hover:border-primary transition-colors disabled:opacity-60"
								disabled={isSubmitting || isPickingSave}
								onClick={browseSavePath}
								type="button"
							>
								{isPickingSave ? "Picking..." : "Browse"}
							</button>
						</div>
					</div>
				</div>

				{(localError || errorMessage) && (
					<div className="mt-5 border border-warning/40 bg-warning/10 px-3 py-2">
						<p className="font-body text-sm text-warning">{localError || errorMessage}</p>
					</div>
				)}

				<div className="mt-7 flex items-center justify-end gap-3 border-t border-surface-border pt-4">
					<button
						className="h-10 px-5 border border-surface-border font-body text-xs uppercase tracking-[0.06em] text-muted hover:text-white hover:border-primary transition-colors"
						disabled={isSubmitting}
						onClick={onClose}
						type="button"
					>
						Cancel
					</button>
					<button
						className="h-10 px-5 bg-primary text-white font-display font-bold uppercase tracking-[0.06em] hover:bg-[#d9442a] disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-[0_0_15px_rgba(240,79,51,0.2)]"
						disabled={isSubmitting}
						type="submit"
					>
						{isSubmitting ? "Adding..." : "Add Game"}
					</button>
				</div>
			</form>
		</div>
	);
}
