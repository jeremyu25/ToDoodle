import { useState } from "react";
import { Link } from "react-router-dom"
import "../../styles/globals.css"
import "./NavBar.css"
import { useAuth } from "../../hooks/useAuth"
import logo from '../../assets/todoodle_image_no_bg.png';


const NavBar = () => {
	const { isAuthenticated, logout, user } = useAuth()
	// For mobile / narrow screen
	const [menuOpen, setMenuOpen] = useState(false)
	const handleMenuToggle = () => setMenuOpen((open) => !open)
	const handleLinkClick = () => setMenuOpen(false)

	return (
		<nav className="navbar">
			<div className="navbar-logo">
				<img src={logo} alt="ToDoodle Logo" />
			</div>
			<button className="navbar-menu-btn" onClick={handleMenuToggle} aria-label="Toggle menu">
				<span className="navbar-menu-icon">&#9776;</span>
			</button>
			<div className={`navbar-links${menuOpen ? " open" : ""}`}>
				<Link to="/" onClick={handleLinkClick}>Home</Link>
				<Link to="/about" onClick={handleLinkClick}>About</Link>
				{isAuthenticated ? (
					<>
						<Link to="/profile" onClick={handleLinkClick}>Profile</Link>
						<Link to="/todo" onClick={handleLinkClick}>Todo</Link>
					</>
				) : (
					<>
						<Link to="/sign_up" onClick={handleLinkClick}>Sign Up</Link>
						<Link to="/sign_in" onClick={handleLinkClick}>Sign In</Link>
					</>
				)}
			</div>
			<div className="navbar-user">
				{isAuthenticated && (
					<span className="user-welcome">Welcome, {user?.username}!</span>
				)}
				{isAuthenticated && (
					<button onClick={logout} className="logout-btn">
						Logout
					</button>
				)}
			</div>
		</nav>
	)
}

export default NavBar
