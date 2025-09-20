import "../../styles/globals.css"
import "../../styles/utilities.css"
import "./TodoPage.css"
import { useEffect } from "react"
import { useAuthStore } from "../../stores/authStore"
import NavBar from "../../components/NavBar/NavBar"
import TodoForm from "../../components/Todo/TodoForm"
import TaskModal from "../../components/Todo/TaskModal"
import TodoStats from "../../components/Todo/TodoStats"
import type { Status } from "../../types/types"
import { Statuses, StatusLabels } from "../../types/types"
import FolderItem from "../../components/Folder/FolderItem"
import FolderForm from "../../components/Folder/FolderForm"
import LoadingContainer from "../../components/LoadingContainer/LoadingContainer"
import ErrorContainer from "../../components/ErrorContainer/ErrorContainer"
import { useTodoStore } from "../../stores/toDoStore"
import { useUIStore } from "../../stores/uiStore"
import { useFiltersStore } from "../../stores/filtersStore"

const TodoPage = () => {
	const { user, isAuthenticated } = useAuthStore()
	
	// Zustand stores
	const { 
		tasks, 
		folders, 
		isLoading, 
		error,
		loadData,
		updateTaskStatus,
		getStatusCount
	} = useTodoStore()
	
	const {
		showForm,
		showFolderForm,
		openTaskModal,
		toggleTaskForm,
		toggleFolderForm
	} = useUIStore()
	
	const {
		filterStatus,
		filterFolder,
		searchTerm,
		sortBy,
		sortDirection,
		setFilterStatus,
		setFilterFolder,
		setSearchTerm,
		handleSort,
		getFilteredAndSortedTasks
	} = useFiltersStore()

	// Load data from backend
	useEffect(() => {
		if (user?.id) {
			loadData(user.id)
		}
	}, [user?.id, loadData])

	// Handler for task status update (only one we need in parent)
	const handleUpdateTaskStatus = async (id: string, newStatus: Status) => {
		if (!user?.id) return
		await updateTaskStatus(id, newStatus, user.id)
	}

	// Handler for task click
	const handleTaskClick = (task: import('../../types/types').Task) => {
		openTaskModal(task)
	}

	// Get filtered and sorted tasks
	const sortedTasks = getFilteredAndSortedTasks(tasks)

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
					error ? (
						<ErrorContainer error_name={error} />
					) : (
						<>
							<TodoStats tasks={tasks} getStatusCount={getStatusCount} />
							<div className="folders-overview">
								<div className="folders-header">
									<h3>Folders</h3>
									<button
										onClick={() => toggleFolderForm()}
										className="add-folder-btn"
									>
										{showFolderForm ? "Cancel" : "+ Add Folder"}
									</button>
								</div>

								{
									showFolderForm && (
										<FolderForm />
									)
								}

								<div className="folders-grid">
									{
										folders.map((folder) => (
											<FolderItem 
												folder={folder} 
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
										{
											Statuses.map((status) => (
												<option key={status} value={status}>{StatusLabels[status]}</option>
											))
										}
									</select>
									<select value={filterFolder} onChange={(e) => setFilterFolder(e.target.value)} className="filter-select">
										<option value="ALL">All Folders</option>
										{
											folders.map((folder) => (
												<option key={folder.id} value={folder.id}>{folder.name}</option>
											))
										}
									</select>
								</div>
								<button onClick={() => toggleTaskForm()} className="add-task-btn">
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
											onClick={() => handleSort(option.value as any)}
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
									<TodoForm />
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
														{
															Statuses.map((status) => (
																<option key={status} value={status}>
																	{StatusLabels[status]}
																</option>
															))
														}
														</select>
													</div>
												</div>
											</div>
										))}
									</div>
								)}
							</div>
						</>
					)
				}
			</div>

			{/* Loading overlay - always rendered but only visible when isLoading is true */}
			<LoadingContainer name="tasks" isLoading={isLoading} />
			<TaskModal />
		</>
	)
}

export default TodoPage
