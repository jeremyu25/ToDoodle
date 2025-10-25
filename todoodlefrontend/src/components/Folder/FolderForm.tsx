import { useState } from "react"
import { useTodoStore } from "../../stores/toDoStore"
import { useUIStore } from "../../stores/uiStore"
import "./FolderForm.css"

const FolderForm = () => {
	const { createFolder } = useTodoStore()
	const { setShowFolderForm } = useUIStore()
	const [folderName, setFolderName] = useState("")
	const [folderColor, setFolderColor] = useState<string>("#A8BBA0")
 	const [folderDescription, setFolderDescription] = useState<string>("")

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		const normalized = folderName.trim().toLowerCase()
		if (!folderName.trim()) return
		if (normalized === 'default') {
			alert('You cannot create another folder named "Default".')
			return
		}
		await createFolder(folderName.trim(), folderDescription.trim() || undefined, folderColor)
		setFolderName("")
		setFolderDescription("")
		setShowFolderForm(false)
	}

	const handleCancel = () => {
		setFolderName("")
		setShowFolderForm(false)
	}

	return (
		<div className="folder-form">
			<form onSubmit={handleSubmit}>
				<div className="folder-form-content">
					<input
						type="text"
						placeholder="Enter folder name"
						value={folderName}
						onChange={(e) => setFolderName(e.target.value)}
						className="folder-input"
						autoFocus
					/>
					<textarea
						id="folder-desc"
						placeholder="Optional description"
						value={folderDescription}
						onChange={(e) => setFolderDescription(e.target.value)}
						className="folder-desc-input"
					/>
					<div className="folder-form-buttons">
						<input
							id="folder-color"
							type="color"
							value={folderColor}
							onChange={(e) => setFolderColor(e.target.value)}
							className="folder-color-input"
						/>
						<button
							type="submit"
							className="create-folder-btn"
							disabled={!folderName.trim()}
						>
							Create
						</button>
						<button
							type="button"
							onClick={handleCancel}
							className="cancel-folder-btn"
						>
							Cancel
						</button>
					</div>
				</div>
			</form>
		</div>
	)
}

export default FolderForm
