import "../../styles/globals.css"
import "../../styles/utilities.css"
import "./TodoPage.css"
import { useState, useEffect } from "react"
import { useAuth } from "../../hooks/useAuth"
import NavBar from "../../components/NavBar/NavBar"
import TodoForm from "../../components/Todo/TodoForm"
import TaskModal from "../../components/Todo/TaskModal"
import TodoStats from "../../components/Todo/TodoStats"
import type { Task, Status, Folder } from "../../components/Todo/types"
import { notesApi, foldersApi } from "../../services/api"
import { noteToTask, taskToNote, addDefaultColors } from "../../utils/dataTransformers"
import FolderItem from "../../components/Folder/FolderItem"
import FolderForm from "../../components/Folder/FolderForm"

type SortOption = 'title' | 'status' | 'folder' | 'createdAt' | 'priority'
type SortDirection = 'asc' | 'desc'

const TodoPage = () => {
	const { user, isAuthenticated } = useAuth()
	const [tasks, setTasks] = useState<Task[]>([])
	const [folders, setFolders] = useState<Folder[]>([])
	const [showForm, setShowForm] = useState<boolean>(false)
	const [filterStatus, setFilterStatus] = useState<Status | "ALL">("ALL")
	const [filterFolder, setFilterFolder] = useState<string | "ALL">("ALL")
	const [searchTerm, setSearchTerm] = useState<string>("")
	const [selectedTask, setSelectedTask] = useState<Task | null>(null)
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [sortBy, setSortBy] = useState<SortOption>('createdAt')
	const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [showFolderForm, setShowFolderForm] = useState(false)
	const [newFolderName, setNewFolderName] = useState("")
	const [editingFolder, setEditingFolder] = useState<Folder | null>(null)
	const [editFolderName, setEditFolderName] = useState("")

	// Load data from backend
	useEffect(() => {
		const loadData = async () => {
			if (!user?.id) return;

			try {
				setIsLoading(true);
				setError(null);

				// Load folders first
				const foldersResponse = await foldersApi.getAllFolders(user.id);
				const backendFolders = foldersResponse.data.folderdata || [];
				const foldersWithColors = addDefaultColors(backendFolders);
				setFolders(foldersWithColors);

				// Load notes/tasks
				const notesResponse = await notesApi.getAllNotes(user.id);
				const backendNotes = notesResponse.data.notedata || [];
				const tasksFromNotes = backendNotes.map((note: any) => noteToTask(note, foldersWithColors));
				setTasks(tasksFromNotes);

			} catch (err) {
				console.error('Error loading data:', err);
				setError(err instanceof Error ? err.message : 'Failed to load data');
			} finally {
				setIsLoading(false);
			}
		};

		loadData();
	}, [user?.id]);

	const handleAddTask = async (newTask: Omit<Task, "id" | "createdAt">) => {
		if (!user?.id) return;

		try {
			const response = await notesApi.createNote(
				user.id,
				newTask.folderId || '',
				newTask.title,
				newTask.description,
				newTask.status || 'not_started'
			);

			const createdNote = response.data.notedata;
			const createdTask = noteToTask(createdNote, folders);

			setTasks([...tasks, createdTask]);
			setShowForm(false);
		} catch (err) {
			console.error('Error creating task:', err);
			setError(err instanceof Error ? err.message : 'Failed to create task');
		}
	}

	const handleDeleteTask = async (id: string) => {
		try {
			await notesApi.deleteNote(id);
			setTasks(tasks.filter((task) => task.id !== id));
		} catch (err) {
			console.error('Error deleting task:', err);
			setError(err instanceof Error ? err.message : 'Failed to delete task');
		}
	}

	const handleUpdateTaskStatus = async (id: string, newStatus: Status) => {
		try {
			const task = tasks.find(t => t.id === id);
			if (!task) return;

			const updatedTask = { ...task, status: newStatus };
			const noteData = taskToNote(updatedTask, user!.id);

			await notesApi.updateNoteStatus(id, noteData.status);
			setTasks(tasks.map((task) => (task.id === id ? updatedTask : task)));
		} catch (err) {
			console.error('Error updating task status:', err);
			setError(err instanceof Error ? err.message : 'Failed to update task status');
		}
	}

	const handleUpdateTask = async (updatedTask: Task) => {
		try {
			const originalTask = tasks.find(t => t.id === updatedTask.id);
			if (!originalTask) return;
			const noteData = taskToNote(updatedTask, user!.id);

			// Update title if changed
			if (updatedTask.title !== originalTask.title) {
				await notesApi.updateNoteTitle(updatedTask.id, updatedTask.title);
			}

			// Update content if changed
			if (updatedTask.description !== originalTask.description) {
				await notesApi.updateNoteContent(updatedTask.id, noteData.content);
			}

			// Update status if changed
			if (updatedTask.status !== originalTask.status) {
				await notesApi.updateNoteStatus(updatedTask.id, noteData.status);
			}

			setTasks(tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)));
		} catch (err) {
			console.error('Error updating task:', err);
			setError(err instanceof Error ? err.message : 'Failed to update task');
		}
	}

	const handleCreateFolder = async () => {
		if (!user?.id || !newFolderName.trim()) return;

		try {
			const response = await foldersApi.createFolder(user.id, newFolderName.trim());
			const createdFolder = response.data.folderdata;
			const folderWithColor = addDefaultColors([createdFolder])[0];

			setFolders([...folders, folderWithColor]);
			setNewFolderName("");
			setShowFolderForm(false);
		} catch (err) {
			console.error('Error creating folder:', err);
			setError(err instanceof Error ? err.message : 'Failed to create folder');
		}
	}

	const handleUpdateFolder = async () => {
		if (!editingFolder || !editFolderName.trim()) return;

		try {
			const response = await foldersApi.updateFolder(editingFolder.id, editFolderName.trim());
			const updatedFolder = response.data.folderdata;

			setFolders(folders.map(folder =>
				folder.id === editingFolder.id
					? { ...folder, name: editFolderName.trim() }
					: folder
			));

			setEditingFolder(null);
			setEditFolderName("");
		} catch (err) {
			console.error('Error updating folder:', err);
			setError(err instanceof Error ? err.message : 'Failed to update folder');
		}
	}

	const handleDeleteFolder = async (folder: Folder) => {
		try {
			const response = await foldersApi.deleteFolder(folder.id);
			const deletedFolder = response.data.folderdata;

			setFolders(folders => folders.filter(f => f.id !== folder.id));
		} catch (err) {
			console.error('Error deleting folder:', err);
			setError(err instanceof Error ? err.message : 'Failed to delete folder');
		}
	}

	const handleEditFolder = (folder: Folder) => {
		setEditingFolder(folder);
		setEditFolderName(folder.name);
	}

	const handleCancelEdit = () => {
		setEditingFolder(null);
		setEditFolderName("");
	}

	const handleTaskClick = (task: Task) => {
		setSelectedTask(task)
		setIsModalOpen(true)
	}

	const handleCloseModal = () => {
		setIsModalOpen(false)
		setSelectedTask(null)
	}

	const handleSort = (option: SortOption) => {
		if (sortBy === option) {
			setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
		} else {
			setSortBy(option)
			setSortDirection('asc')
		}
	}

	const sortTasks = (tasksToSort: Task[]) => {
		return [...tasksToSort].sort((a, b) => {
			let aValue: any
			let bValue: any

			switch (sortBy) {
				case 'title':
					aValue = a.title.toLowerCase()
					bValue = b.title.toLowerCase()
					break
				case 'status':
					aValue = a.status
					bValue = b.status
					break
				case 'folder':
					aValue = a.folder?.name || 'No Folder'
					bValue = b.folder?.name || 'No Folder'
					break
				case 'createdAt':
					aValue = a.createdAt
					bValue = b.createdAt
					break
				case 'priority':
					// Custom priority: IN_PROGRESS > NOT_STARTED > COMPLETED
					const priorityOrder = { 'IN_PROGRESS': 3, 'NOT_STARTED': 2, 'COMPLETED': 1 }
					aValue = priorityOrder[a.status]
					bValue = priorityOrder[b.status]
					break
				default:
					return 0
			}

			if (aValue < bValue) {
				return sortDirection === 'asc' ? -1 : 1
			}
			if (aValue > bValue) {
				return sortDirection === 'asc' ? 1 : -1
			}
			return 0
		})
	}

	const filteredTasks = tasks.filter((task) => {
		const matchesStatus = filterStatus === "ALL" || task.status === filterStatus
		const matchesFolder = filterFolder === "ALL" || task.folderId === filterFolder
		const matchesSearch =
			task.title.toLowerCase().includes(searchTerm.toLowerCase()) || task.description.toLowerCase().includes(searchTerm.toLowerCase())
		return matchesStatus && matchesFolder && matchesSearch
	})

	const sortedTasks = sortTasks(filteredTasks)

	const getStatusCount = (status: Status) => {
		return tasks.filter((task) => task.status === status).length
	}

	const getFolderCount = (folderId: string) => {
		return tasks.filter((task) => task.folderId === folderId).length
	}

	const formatDate = (date: Date) => {
		return new Intl.DateTimeFormat('en-US', {
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		}).format(date)
	}

	if (!isAuthenticated) {
		return (
			<div className="page-container">
				<div className="auth-message">
					<h2>Please sign in to access your todos</h2>
					<p>You need to be authenticated to view and manage your todo list.</p>
				</div>
			</div>
		)
	}

	return (
		<>
			<NavBar />
			<div className="page-container">
				<div className="todo-header">
					<h1>Welcome back, {user?.username || "User"}! 👋</h1>
					<p>Let's get things done today</p>
				</div>
				{
					isLoading ? (
						<div className="loading-container">
							<div className="loading-spinner"></div>
							<p>Loading your tasks...</p>
						</div>
					) : error ? (
						<div className="error-container">
							<p className="error-message">Error: {error}</p>
							<button onClick={() => window.location.reload()} className="retry-btn">
								Retry
							</button>
						</div>
					) : (
						<>
							<TodoStats tasks={tasks} getStatusCount={getStatusCount} />
							<div className="folders-overview">
								<div className="folders-header">
									<h3>Folders</h3>
									<button
										onClick={() => setShowFolderForm(!showFolderForm)}
										className="add-folder-btn"
									>
										{showFolderForm ? "Cancel" : "+ Add Folder"}
									</button>
								</div>

								{
									showFolderForm && (
										<FolderForm
											onCreateFolder={handleCreateFolder}
											onCancel={() => setShowFolderForm(false)}
										/>
									)
								}

								<div className="folders-grid">
									{
										folders.map((folder) => (
											<FolderItem 
												folder={folder} 
												editingFolder={editingFolder} 
												editFolderName={editFolderName} 
												setEditFolderName={setEditFolderName} 
												handleUpdateFolder={handleUpdateFolder} 
												handleCancelEdit={handleCancelEdit} 
												handleEditFolder={handleEditFolder} 
												handleDeleteFolder={handleDeleteFolder} 
												getFolderCount={getFolderCount} 
												filterFolder={filterFolder} 
												setFilterFolder={setFilterFolder} 
												key={folder.id}
											/>
										))
									}
									<div
										className={`folder-card ${filterFolder === "ALL" ? 'selected' : ''}`}
										onClick={() => setFilterFolder("ALL")}
									>
									<div className="folder-color" style={{ backgroundColor: '#6D6D6D' }}></div>
										<div className="folder-info">
											<span className="folder-name">All Folders</span>
											<span className="folder-count">{tasks.length} tasks</span>
										</div>
									</div>
								</div>
							</div>

						<div className="todo-controls">
							<div className="search-filter">
								<input
									type="text"
									placeholder="Search tasks..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="search-input"
								/>
								<select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as Status | "ALL")} className="filter-select">
									<option value="ALL">All Statuses</option>
									<option value="NOT_STARTED">Not Started</option>
									<option value="IN_PROGRESS">In Progress</option>
									<option value="COMPLETED">Completed</option>
								</select>
								<select value={filterFolder} onChange={(e) => setFilterFolder(e.target.value)} className="filter-select">
									<option value="ALL">All Folders</option>
									{folders.map((folder) => (
										<option key={folder.id} value={folder.id}>{folder.name}</option>
									))}
								</select>
							</div>
							<button onClick={() => setShowForm(!showForm)} className="add-task-btn">
								{showForm ? "Cancel" : "+ Add New Task"}
							</button>
						</div>

						<div className="sorting-controls">
							<div className="sort-options">
								<span className="sort-label">Sort by:</span>
								{[
									{ value: 'createdAt', label: 'Date Created' },
									{ value: 'title', label: 'Title' },
									{ value: 'status', label: 'Status' },
									{ value: 'folder', label: 'Folder' },
									{ value: 'priority', label: 'Priority' }
								].map((option) => (
									<button
										key={option.value}
										onClick={() => handleSort(option.value as SortOption)}
										className={`sort-btn ${sortBy === option.value ? 'active' : ''}`}
									>
										{option.label}
										{sortBy === option.value && (
											<span className="sort-direction">
												{sortDirection === 'asc' ? '↑' : '↓'}
											</span>
										)}
									</button>
								))}
							</div>
						</div>

						{showForm && (
							<div className="form-container">
								<TodoForm onSubmit={handleAddTask} folders={folders} />
							</div>
						)}

						<div className="tasks-container">
							{sortedTasks.length === 0 ? (
								<div className="no-tasks">
									<p>
										No tasks found.{" "}
										{searchTerm || filterStatus !== "ALL" || filterFolder !== "ALL"
											? "Try adjusting your search or filters."
											: "Create your first task to get started!"}
									</p>
								</div>
							) : (
								<div className="compact-tasks-grid">
									{sortedTasks.map((task) => (
										<div
											key={task.id}
											className="compact-task-item"
											onClick={() => handleTaskClick(task)}
										>
											<div className="task-main-info">
												<div className="task-header">
													<h3 className="task-title">{task.title}</h3>
													{task.folder && (
														<span
															className="folder-badge"
															style={{ backgroundColor: task.folder.color || '#A8BBA0' }}
														>
															{task.folder.name}
														</span>
													)}
												</div>
												<p className="task-description">{task.description}</p>
												<div className="task-meta">
													<span className="task-date">Created: {formatDate(task.createdAt)}</span>
												</div>
											</div>
											<div className="task-status-section">
												<span className={`status-badge status-${task.status.toLowerCase().replace("_", "-")}`}>
													{task.status.replace("_", " ")}
												</span>
												<div className="quick-actions">
													<select
														value={task.status}
														onChange={(e) => {
															e.stopPropagation()
															handleUpdateTaskStatus(task.id, e.target.value as Status)
														}}
														className="quick-status-select"
														onClick={(e) => e.stopPropagation()}
													>
														<option value="NOT_STARTED">Not Started</option>
														<option value="IN_PROGRESS">In Progress</option>
														<option value="COMPLETED">Completed</option>
													</select>
												</div>
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					</>
				)}

			</div>

			<TaskModal
				task={selectedTask}
				isOpen={isModalOpen}
				onClose={handleCloseModal}
				onUpdate={handleUpdateTask}
				onDelete={handleDeleteTask}
				folders={folders}
			/>
		</>
	)
}

export default TodoPage
