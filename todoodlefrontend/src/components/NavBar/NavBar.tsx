import React from 'react'
import { Link } from 'react-router-dom';
import '../../styles/globals.css'
import './NavBar.css'

const NavBar = () => {
    return (
        <>
            <nav className="navbar">
                <Link to="/">Home</Link>
                <Link to="/about">About</Link>
                <Link to="/sign_up">Sign Up</Link>
                <Link to="/sign_in">Sign In</Link>
                <Link to="/feedback">Feedback</Link>
            </nav>
        </>
    )
}

export default NavBar