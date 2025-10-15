import React from "react"
import { useState } from "react"
import type { Task } from "../../types/types"
import { useTodoStore } from "../../stores/toDoStore"
import { useUIStore } from "../../stores/uiStore"
import "./TodoForm.css"

const TodoForm = () => {
	const { folders, addTask } = useTodoStore()
	const { setShowTaskForm } = useUIStore()
	
	const [formData, setFormData] = useState<Omit<Task, 'id' | 'createdAt'>>({
		title: "",
		description: "",
		status: "NOT_STARTED",
		folderId: undefined,
	})

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		const { id, value } = e.target
		setFormData({
			...formData,
			[id]: id === 'folderId' ? (value === '' ? undefined : value) : value,
		})
	}

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (formData.title.trim() && formData.description.trim()) {
          await addTask(formData);
          // Reset form
          setFormData({
            title: "",
            description: "",
            status: "NOT_STARTED",
            folderId: undefined,
          });
          setShowTaskForm(false);
        }
    }

	return (
		<div className="todo-form">
			<form onSubmit={handleSubmit}>
				<div className="form-group">
					<label htmlFor="title">Title</label>
					<input 
						id="title" 
						type="text" 
						placeholder="Enter task title" 
						value={formData.title} 
						onChange={handleInputChange}
						required
					/>
				</div>
				<div className="form-group">
					<label htmlFor="description">Description</label>
					<input 
						id="description" 
						type="text" 
						placeholder="Enter task description" 
						value={formData.description} 
						onChange={handleInputChange}
						required
					/>
				</div>
				<div className="form-group">
					<label htmlFor="status">Status</label>
					<select id="status" value={formData.status} onChange={handleInputChange}>
						<option value="NOT_STARTED">Not Started</option>
						<option value="IN_PROGRESS">In Progress</option>
						<option value="COMPLETED">Completed</option>
					</select>
				</div>
				<div className="form-group">
					<label htmlFor="folderId">Folder</label>
					<select id="folderId" value={formData.folderId || ''} onChange={handleInputChange}>
						<option value="">No Folder</option>
						{folders.map((folder) => (
							<option key={folder.id} value={folder.id}>{folder.name}</option>
						))}
					</select>
				</div>
                <button type="submit" className="submit-btn">Add Task</button>
			</form>
		</div>
	)
}

export default TodoForm
