import React from "react"
import { Link } from "react-router-dom"
import "../../styles/globals.css"
import "./NavBar.css"
import { useAuth } from "../../hooks/useAuth"

const NavBar = () => {
	const { isAuthenticated, logout, user } = useAuth()

	return (
		<>
			<nav className="navbar">
				<Link to="/">Home</Link>
				<Link to="/about">About</Link>

				{isAuthenticated ? (
					<>
						<Link to="/profile">Profile</Link>
						<Link to="/feedback">Feedback</Link>
						<Link to="/todo">Todo</Link>
						<span className="user-welcome">Welcome, {user?.username}!</span>
						<button onClick={logout} className="logout-btn">
							Logout
						</button>
					</>
				) : (
					<>
						<Link to="/sign_up">Sign Up</Link>
						<Link to="/sign_in">Sign In</Link>
					</>
				)}
			</nav>
		</>
	)
}

export default NavBar
