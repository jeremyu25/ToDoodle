import { useState } from "react"
import { useTodoStore } from "../../stores/toDoStore"
import { useUIStore } from "../../stores/uiStore"
import "./FolderForm.css"

const FolderForm = () => {
	const { createFolder } = useTodoStore()
	const { setShowFolderForm } = useUIStore()
	const [folderName, setFolderName] = useState("")
	const [folderColor, setFolderColor] = useState<string>("#A8BBA0")

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		const normalized = folderName.trim().toLowerCase()
		if (!folderName.trim()) return
		if (normalized === 'default') {
			alert('You cannot create another folder named "Default".')
			return
		}
		await createFolder(folderName.trim(), folderColor)
		setFolderName("")
		setShowFolderForm(false)
	}

	const handleCancel = () => {
		setFolderName("")
		setShowFolderForm(false)
	}

	return (
		<div className="folder-form">
			<form onSubmit={handleSubmit}>
				<input
					type="text"
					placeholder="Enter folder name"
					value={folderName}
					onChange={(e) => setFolderName(e.target.value)}
					className="folder-input"
					autoFocus
				/>
				<div className="folder-color-row">
				  <label htmlFor="folder-color">Color</label>
				  <input
					id="folder-color"
					type="color"
					value={folderColor}
					onChange={(e) => setFolderColor(e.target.value)}
					className="folder-color-input"
				  />
				</div>
				<div className="folder-form-buttons">
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
			</form>
		</div>
	)
}

export default FolderForm
