import { useState } from "react"
import "./FolderForm.css"

interface FolderFormProps {
	onCreateFolder: (folderName: string) => void
	onCancel: () => void
}

const FolderForm = ({ onCreateFolder, onCancel }: FolderFormProps) => {
	const [folderName, setFolderName] = useState("")

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		if (folderName.trim()) {
			onCreateFolder(folderName.trim())
			setFolderName("")
		}
	}

	const handleCancel = () => {
		setFolderName("")
		onCancel()
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
