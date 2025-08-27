import React from "react"
import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import "../../styles/globals.css"
import "../Page.css"
import NavBar from "../../components/NavBar/NavBar"
import logo from "../../assets/virtual-learning-background-with-design-space.png"

const UserSignUpPage = () => {
  const navigate = useNavigate()
	const [username, setUsername] = useState("")
	const [password, setPassword] = useState("")
	const [confirmPassword, setConfirmPassword] = useState("")
	const [errors, setErrors] = useState<string[]>([])
	const [isSubmitting, setIsSubmitting] = useState(false)

	const passwordIsInvalid = (password: string): string[] => {
		const passwordErrors = []
		if (password.length < 8) {
			passwordErrors.push("Password must be at least 8 characters long")
		}
		if (password.length > 100) {
			passwordErrors.push("Password must be less than 100 characters long")
		}
		if (!/[A-Z]/.test(password)) {
			passwordErrors.push("Password must contain at least one uppercase letter")
		}
		if (!/[a-z]/.test(password)) {
			passwordErrors.push("Password must contain at least one lowercase letter")
		}
		if (!/[0-9]/.test(password)) {
			passwordErrors.push("Password must contain at least one number")
		}
		if (!/[!@#$%^&*]/.test(password)) {
			passwordErrors.push("Password must contain at least one special character")
		}
		return passwordErrors
	}

	const usernameIsInvalid = (username: string): string[] => {
		const usernameErrors = []
		if (username.length < 3) {
			usernameErrors.push("Username must be at least 3 characters long")
		}
		if (username.length > 100) {
			usernameErrors.push("Username must be less than 100 characters long")
		}
		if (!/^[a-zA-Z0-9]+$/.test(username)) {
			usernameErrors.push("Username must contain only letters and numbers")
		}
		return usernameErrors
	}

	const hasValidationErrors = (): boolean => {
		const usernameErrors = usernameIsInvalid(username)
		const passwordErrors = passwordIsInvalid(password)
		const confirmPasswordErrors = password !== confirmPassword ? ["Passwords do not match"] : []
		
		return usernameErrors.length > 0 || passwordErrors.length > 0 || confirmPasswordErrors.length > 0
	}

	const isFormValidForSubmission = (): boolean => {
		return username.length > 0 && password.length > 0 && confirmPassword.length > 0 && !hasValidationErrors()
	}

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setErrors([])
		setIsSubmitting(true)

    fetch("http://localhost:3001/api/v1/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: 'include',
      body: JSON.stringify({ username, password }),
    })
      .then(response => response.json())
      .then(data => {
        console.log(data)
      })
      .catch(error => {
        setErrors([...errors, error.message])
        console.error("Error:", error)
      })
      .finally(() => {
        setIsSubmitting(false)
      })

      navigate("/sign_in")
	}

	return (
		<>
			<NavBar />
			<div className="signup-container">
				<div className="signup-left-panel">
					<div className="welcome-content">
						<h1 className="welcome-title">Welcome to ToDoodle!</h1>
						<p className="welcome-subtitle">Join 2 users who are already organizing their life with our esteemed todo app.</p>
						<div className="feature-list">
							<div className="feature-item">
								<span className="feature-icon">✨</span>
								<span>Smart task organization</span>
							</div>
							<div className="feature-item">
								<span className="feature-icon">🎯</span>
								<span>Track your progress</span>
							</div>
							<div className="feature-item">
								<span className="feature-icon">🚀</span>
								<span>Boost productivity</span>
							</div>
						</div>
					</div>
					<div className="logo-container">
						<img src={logo} alt="ToDoodle Logo" className="signup-logo" />
					</div>
				</div>
				
				<div className="signup-right-panel">
					<div className="signup-form-container">
						<div className="form-header">
							<h2 className="form-title">Create Your Account</h2>
							<p className="form-subtitle">Start your journey to better organization today</p>
						</div>
						
						<form className="signup-form" onSubmit={handleSubmit}>
							<div className="form-group">
								<label htmlFor="username" className="form-label">Username</label>
								<input
									id="username"
									type="text"
									placeholder="Enter your username"
									value={username}
									onChange={(e) => setUsername(e.target.value)}
									className={`form-input ${username.length > 0 && usernameIsInvalid(username).length > 0 ? 'input-error' : ''}`}
									required
								/>
								{username.length > 0 && usernameIsInvalid(username).length > 0 && (
									<div className="input-error-message">
										{usernameIsInvalid(username).map((error, index) => (
											<span key={index} className="error-dot">• {error}</span>
										))}
									</div>
								)}
							</div>

							<div className="form-group">
								<label htmlFor="password" className="form-label">Password</label>
								<input
									id="password"
									type="password"
									placeholder="Create a strong password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className={`form-input ${password.length > 0 && passwordIsInvalid(password).length > 0 ? 'input-error' : ''}`}
									required
								/>
								{password.length > 0 && passwordIsInvalid(password).length > 0 && (
									<div className="input-error-message">
										{passwordIsInvalid(password).map((error, index) => (
											<span key={index} className="error-dot">• {error}</span>
										))}
									</div>
								)}
							</div>

							<div className="form-group">
								<label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
								<input
									id="confirmPassword"
									type="password"
									placeholder="Confirm your password"
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									className={`form-input ${confirmPassword.length > 0 && password !== confirmPassword ? 'input-error' : ''}`}
									required
								/>
								{confirmPassword.length > 0 && password !== confirmPassword && (
									<div className="input-error-message">
										<span className="error-dot">• Passwords do not match</span>
									</div>
								)}
							</div>

							{errors.length > 0 && (
								<div className="form-errors">
									{errors.map((error, index) => (
										<div key={index} className="error-message">
											{error}
										</div>
									))}
								</div>
							)}

							<button 
								type="submit" 
								className={`submit-button ${isSubmitting ? 'submitting' : ''} ${!isFormValidForSubmission() && !isSubmitting ? 'validation-error' : ''}`}
								disabled={isSubmitting || !isFormValidForSubmission()}
							>
								{isSubmitting ? (
									<>
										<span className="spinner"></span>
										Creating Account...
									</>
								) : (
									'Create Account'
								)}
							</button>
						</form>

						<div className="form-footer">
							<p className="login-link">
								Already have an account? <Link to="/sign_in" className="link-primary">Sign In</Link>
							</p>
						</div>
					</div>
				</div>
			</div>
		</>
	)
}

export default UserSignUpPage
