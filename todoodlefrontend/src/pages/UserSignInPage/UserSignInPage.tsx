import React from "react"
import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import "../../styles/globals.css"
import "../../styles/utilities.css"
import "./UserSignInPage.css"
import { authApi } from "../../services/api"
import NavBar from "../../components/NavBar/NavBar"
import logo from "../../assets/virtual-learning-background-with-design-space.png"
import { useAuthStore } from "../../stores/authStore"
import { FaEye, FaEyeSlash } from "react-icons/fa"

const UserSignInPage = () => {
	const navigate = useNavigate()
	const { login } = useAuthStore()
	const [identifier, setIdentifier] = useState("")
	const [password, setPassword] = useState("")
	const [showPassword, setShowPassword] = useState(false)
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

	const identifierIsInvalid = (identifier: string): string[] => {
		const identifierErrors: string[] = []
		if (identifier.length < 3) {
			identifierErrors.push("Username/Email must be at least 3 characters long")
		}
		if (identifier.length > 100) {
			identifierErrors.push("Username/Email must be less than 100 characters long")
		}
		return identifierErrors
	}

	const hasValidationErrors = (): boolean => {
		const identifierErrors = identifierIsInvalid(identifier)
		const passwordErrors = passwordIsInvalid(password)

		return identifierErrors.length > 0 || passwordErrors.length > 0
	}

	const isFormValidForSubmission = (): boolean => {
		return identifier.length > 0 && password.length > 0 && !hasValidationErrors()
	}

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setErrors([])
		setIsSubmitting(true)

		// Determine if identifier is email or username
		try {
			const data = await authApi.signIn(identifier, password)
			
			console.log(data)
			if (data.status === 'success') {
				login(data.data.user)
				navigate("/todo")
			} else {
				setErrors([data.message || "Login failed"])
			}
		} catch (error) {
			setErrors([error instanceof Error ? error.message : "Login failed"])
			console.error("Error:", error)
		} finally {
			setIsSubmitting(false)
		}
	}

	const loginWithGooglePopup = async () => {
		if (isSubmitting) return
		setIsSubmitting(true)
		setErrors([])

		try {
			const popup = window.open(
				`${import.meta.env.VITE_BACKEND_URL}/api/v1/auth/google`, 
				"googleAuth", 
				"width=500,height=600,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,directories=no,status=no"
			)

			if (!popup) {
				throw new Error("Popup blocked! Please allow popups for this site.")
			}

			// Listen for messages from the popup
			const messageListener = async (evt: any) => {
				// Only accept messages with the expected structure to ensure security
				if (!evt.data || typeof evt.data !== 'object') return
				if (!evt.data.type || (evt.data.type !== 'oauth-success' && evt.data.type !== 'oauth-error')) return

				if (evt.data?.type === "oauth-success") {
					// Handle successful OAuth login
					if (evt.data.user) {
						login(evt.data.user)
						navigate("/todo")
					}

					// Clean up
					window.removeEventListener("message", messageListener)
					popup.close()
				} else if (evt.data?.type === "oauth-error") {
					// Handle OAuth error
					setErrors([evt.data.message || "Failed to sign in with Google"])
					window.removeEventListener("message", messageListener)
					popup.close()
				}
			}

			window.addEventListener("message", messageListener)

			// Check if popup was closed manually
			const checkClosed = setInterval(() => {
				if (popup.closed) {
					clearInterval(checkClosed)
					window.removeEventListener("message", messageListener)
					setIsSubmitting(false)
				}
			}, 1000)

			// Timeout after 5 minutes
			setTimeout(() => {
				if (!popup.closed) {
					popup.close()
					clearInterval(checkClosed)
					window.removeEventListener("message", messageListener)
					setIsSubmitting(false)
				}
			}, 300000) // 5 minutes
		} catch (error: any) {
			console.error("Google sign-in error:", error)
			setErrors([error.message || "Failed to sign in with Google"])
		} finally {
			setIsSubmitting(false)
		}
	}

	const GoogleButton = () => {
		return (
			<button type="button" className="google-button" onClick={loginWithGooglePopup} disabled={isSubmitting}>
				<img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google Logo" className="google-logo" width={20} height={20} />
				Continue with Google
			</button>
		)
	}

	return (
		<div className="signin-page-container">
			<NavBar />
			<div className="signin-container">
				<div className="signin-left-panel">
					<div className="signin-form-container">
						<div className="form-header">
							<h2 className="form-title">Sign into your Account</h2>
							<p className="form-subtitle">Ready to tackle your tasks?</p>
						</div>

						<form className="signin-form" onSubmit={handleSubmit}>
							<div className="form-group">
								<label htmlFor="identifier" className="form-label">
									Username or Email
								</label>
								<input
									id="identifier"
									type="text"
									placeholder="Enter your username or email"
									value={identifier}
									onChange={(e) => setIdentifier(e.target.value)}
									className={`form-input ${identifier.length > 0 && identifierIsInvalid(identifier).length > 0 ? "input-error" : ""}`}
									required
								/>
								{identifier.length > 0 && identifierIsInvalid(identifier).length > 0 && (
									<div className="input-error-message">
										{identifierIsInvalid(identifier).map((error, index) => (
											<span key={index} className="error-dot">
												• {error}
											</span>
										))}
									</div>
								)}
							</div>

							<div className="form-group">
								<label htmlFor="password" className="form-label">
									Password
								</label>
								<div className="password-input-container">
									<input
										id="password"
										type={showPassword ? "text" : "password"}
										placeholder="Enter your password"
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										className={`form-input ${password.length > 0 && passwordIsInvalid(password).length > 0 ? "input-error" : ""}`}
										required
									/>
									{showPassword ? (
										<FaEye className="eye-icon" onClick={() => setShowPassword(!showPassword)} />
									) : (
										<FaEyeSlash className="eye-icon" onClick={() => setShowPassword(!showPassword)} />
									)}
								</div>
								{password.length > 0 && passwordIsInvalid(password).length > 0 && (
									<div className="input-error-message">
										{passwordIsInvalid(password).map((error, index) => (
											<span key={index} className="error-dot">
												• {error}
											</span>
										))}
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
								className={`submit-button ${isSubmitting ? "submitting" : ""} ${
									!isFormValidForSubmission() && !isSubmitting ? "validation-error" : ""
								}`}
								disabled={isSubmitting || !isFormValidForSubmission()}
							>
								{isSubmitting ? (
									<>
										<span className="spinner"></span>
										Logging into your Account...
									</>
								) : (
									"Login"
								)}
							</button>
							<GoogleButton />
						</form>

						<div className="form-footer">
							<p className="login-link">
								Don't have an account?{" "}
								<Link to="/sign_up" className="link-primary">
									Sign Up
								</Link>
							</p>
						</div>
					</div>
				</div>

				<div className="signin-right-panel">
					<div className="welcome-content">
						<h1 className="welcome-title">Welcome to ToDoodle!</h1>
						<p className="welcome-subtitle">Your organized workspace awaits. Let's turn those tasks into accomplishments.</p>
						<div className="feature-list">
							<div className="feature-item">
								<span className="feature-icon">✨</span>
								<span>Organize tasks efficiently</span>
							</div>
							<div className="feature-item">
								<span className="feature-icon">🎯</span>
								<span>Stay focused on goals</span>
							</div>
							<div className="feature-item">
								<span className="feature-icon">🚀</span>
								<span>Get more done today</span>
							</div>
						</div>
					</div>
					<div className="logo-container">
						<img src={logo} alt="ToDoodle Logo" className="signin-logo" />
					</div>
				</div>
			</div>
		</div>
	)
}

export default UserSignInPage
