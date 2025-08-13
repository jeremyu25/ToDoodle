import React, { useState, useEffect } from "react"
import { useAuth } from "../hooks/useAuth"
import NavBar from "../components/NavBar/NavBar"
import TodoForm from "../components/Todo/TodoForm"
import TaskModal from "../components/Todo/TaskModal"
import type { Task, Status, Folder } from "../components/Todo/types"
import "./Page.css"

type SortOption = 'title' | 'status' | 'folder' | 'createdAt' | 'priority';
type SortDirection = 'asc' | 'desc';

const TodoPage = () => {
	const { user, isAuthenticated } = useAuth()
	const [tasks, setTasks] = useState<Task[]>([])
	const [folders, setFolders] = useState<Folder[]>([])
	const [showForm, setShowForm] = useState<boolean>(false)
	const [filterStatus, setFilterStatus] = useState<Status | "ALL">("ALL")
	const [filterFolder, setFilterFolder] = useState<number | "ALL">("ALL")
	const [searchTerm, setSearchTerm] = useState<string>("")
	const [selectedTask, setSelectedTask] = useState<Task | null>(null)
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [sortBy, setSortBy] = useState<SortOption>('createdAt')
	const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

	useEffect(() => {
		const mockFolders: Folder[] = [
			{ id: 1, name: "Work", color: "#A8BBA0", description: "Work-related tasks" },
			{ id: 2, name: "Personal", color: "#C2B6A6", description: "Personal tasks" },
			{ id: 3, name: "Learning", color: "#e2b64f", description: "Learning and study tasks" },
			{ id: 4, name: "Health", color: "#D98A7B", description: "Health and fitness tasks" },
		]

		const mockTasks: Task[] = [
			{
				id: 1,
				title: "Complete project proposal",
				description: "Write and submit the project proposal document",
				status: "IN_PROGRESS",
				folderId: 1,
				folder: mockFolders[0],
				createdAt: new Date('2024-01-15T10:00:00'),
			},
			{
				id: 2,
				title: "Review code changes",
				description: "Go through the recent pull requests and provide feedback",
				status: "NOT_STARTED",
				folderId: 1,
				folder: mockFolders[0],
				createdAt: new Date('2024-01-16T14:30:00'),
			},
			{
				id: 3,
				title: "Update documentation",
				description: "Update the API documentation with new endpoints",
				status: "COMPLETED",
				folderId: 1,
				folder: mockFolders[0],
				createdAt: new Date('2024-01-14T09:15:00'),
			},
			{
				id: 4,
				title: "Plan team meeting",
				description: "Schedule and prepare agenda for next week's team meeting",
				status: "NOT_STARTED",
				folderId: 1,
				folder: mockFolders[0],
				createdAt: new Date('2024-01-17T11:45:00'),
			},
			{
				id: 5,
				title: "Read React documentation",
				description: "Study new React 18 features and hooks",
				status: "IN_PROGRESS",
				folderId: 3,
				folder: mockFolders[2],
				createdAt: new Date('2024-01-13T16:20:00'),
			},
			{
				id: 6,
				title: "Go for a run",
				description: "30-minute cardio session in the park",
				status: "NOT_STARTED",
				folderId: 4,
				folder: mockFolders[3],
				createdAt: new Date('2024-01-18T07:00:00'),
			},
		]
		setFolders(mockFolders)
		setTasks(mockTasks)
	}, [])

	const handleAddTask = (newTask: Omit<Task, "id" | "createdAt">) => {
		const task: Task = {
			...newTask,
			id: Date.now(), // Simple ID generation - replace with backend ID
			createdAt: new Date(),
		}
		setTasks([...tasks, task])
		setShowForm(false)
	}

	const handleDeleteTask = (id: number) => {
		setTasks(tasks.filter((task) => task.id !== id))
	}

	const handleUpdateTaskStatus = (id: number, newStatus: Status) => {
		setTasks(tasks.map((task) => (task.id === id ? { ...task, status: newStatus } : task)))
	}

	const handleUpdateTask = (updatedTask: Task) => {
		setTasks(tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)))
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

	const getFolderCount = (folderId: number) => {
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

				<div className="todo-stats">
					<div className="stat-card">
						<span className="stat-number">{tasks.length}</span>
						<span className="stat-label">Total Tasks</span>
					</div>
					<div className="stat-card">
						<span className="stat-number">{getStatusCount("NOT_STARTED")}</span>
						<span className="stat-label">To Do</span>
					</div>
					<div className="stat-card">
						<span className="stat-number">{getStatusCount("IN_PROGRESS")}</span>
						<span className="stat-label">In Progress</span>
					</div>
					<div className="stat-card">
						<span className="stat-number">{getStatusCount("COMPLETED")}</span>
						<span className="stat-label">Completed</span>
					</div>
				</div>

				<div className="folders-overview">
					<h3>Folders</h3>
					<div className="folders-grid">
						{folders.map((folder) => (
							<div 
								key={folder.id} 
								className={`folder-card ${filterFolder === folder.id ? 'selected' : ''}`} 
								onClick={() => setFilterFolder(folder.id)}
							>
								<div className="folder-color" style={{ backgroundColor: folder.color || '#A8BBA0' }}></div>
								<div className="folder-info">
									<span className="folder-name">{folder.name}</span>
									<span className="folder-count">{getFolderCount(folder.id)} tasks</span>
								</div>
							</div>
						))}
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
						<select value={filterFolder} onChange={(e) => setFilterFolder(e.target.value === "ALL" ? "ALL" : Number(e.target.value))} className="filter-select">
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
