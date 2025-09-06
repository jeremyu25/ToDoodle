import type { Task, Status } from "../../types/types"
import "./TodoStats.css"

interface TodoStatsProps {
	tasks: Task[]
	getStatusCount: (status: Status) => number
}

const TodoStats = ({ tasks, getStatusCount }: TodoStatsProps) => {
	return (
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
	)
}

export default TodoStats
