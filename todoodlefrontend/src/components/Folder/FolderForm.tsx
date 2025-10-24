import { useState } from "react"
import { useTodoStore } from "../../stores/toDoStore"
import { useUIStore } from "../../stores/uiStore"
import "./FolderForm.css"

const FolderForm = () => {
	const { createFolder } = useTodoStore()
	const { setShowFolderForm } = useUIStore()
	const [folderName, setFolderName] = useState("")

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		const normalized = folderName.trim().toLowerCase()
		if (!folderName.trim()) return
		if (normalized === 'default') {
			alert('You cannot create another folder named "Default".')
			return
		}
		await createFolder(folderName.trim())
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
