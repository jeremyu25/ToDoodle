import { useRef, useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { authApi } from "../../services/api"
import { useAuthStore } from "../../stores/authStore"
import LoadingContainer from "../../components/LoadingContainer/LoadingContainer"
import "./EmailVerificationPage.css"

const EmailVerificationPage = () => {
    const verificationAttempted = useRef(false)
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const { login } = useAuthStore()
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
    const [message, setMessage] = useState("")
    const [isResending, setIsResending] = useState(false)
    const [email, setEmail] = useState("")
    const [emailError, setEmailError] = useState("")

    useEffect(() => {
        const token = searchParams.get("token")

        if (!token) {
            setStatus("error")
            setMessage("No verification token provided.")
            return
        }
        // Remove the token from the address bar immediately so it isn't exposed in browser history
        try {
            window.history.replaceState(null, '', window.location.pathname)
        }
        catch (e) { }
        // needed due to checkAuthStatus in authStore.ts causing re-renders
        if (verificationAttempted.current) {
            return
        }
        verificationAttempted.current = true
        verifyEmail(token)
    }, [])

    const verifyEmail = async (token: string) => {
        try {
            console.log("Attempting to verify token:", token)
            const response = await authApi.verifyEmail(token)
            login(response.user)
            setStatus("success")
            setMessage("Email verified successfully! You are now signed in.")
        }
        catch (error) {
            console.error("Email verification error:", error)
            setStatus("error")
            setMessage(error instanceof Error ? error.message : "Email verification failed")
        }
    }

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newEmail = e.target.value
        const errors = newEmail.trim() === "" ? "" : emailIsInvalid(newEmail)
        setEmailError(errors)
        setEmail(newEmail)
    }

    const handleResendVerification = async () => {
        if (!email.trim()) {
            alert("Please enter your email address")
            return
        }

        const validationError = emailIsInvalid(email)
        if (validationError !== "") {
            alert("Please fix the email validation errors before proceeding")
            return
        }

        setIsResending(true)
        try {
            await authApi.resendVerification(email)
            alert("Verification email sent! Please check your inbox.")
        } catch (error) {
            alert(error instanceof Error ? error.message : "Failed to resend verification email")
        } finally {
            setIsResending(false)
        }
    }

    if (status === "loading") {
        return (
            <LoadingContainer name="email verification" isLoading={true} />
        )
    }

    const emailIsInvalid = (email: string): string => {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return "Please enter a valid email address"
        }
        if (email.length > 100) {
            return "Email must be less than 100 characters long"
        }
        return ""
    }

    return (
        <div className="email-verification-page">
            <div className="email-verification-content">
                <div className="verification-container">
                    <div className={`verification-status ${status}`}>
                        {status === "success" ? (
                            <div className="success-content">
                                <h2>Email Verified!</h2>
                                <p>{message}</p>
                                <button
                                    onClick={() => navigate("/todo")}
                                    className="get-started-btn"
                                >
                                    Click here to get started
                                </button>
                            </div>
                        ) : (
                            <div className="error-content">
                                <h2>Verification Failed</h2>
                                <p>{message}</p>

                                <div className="resend-section">
                                    <h3>Need a new verification link?</h3>
                                    <div className="resend-form">
                                        <input
                                            type="email"
                                            placeholder="Enter your email address"
                                            value={email}
                                            onChange={handleEmailChange}
                                            className={`email-input ${email.length > 0 && emailError !== "" ? 'input-error' : ''}`}
                                        />
                                        <button
                                            onClick={handleResendVerification}
                                            disabled={isResending || email.length === 0 || emailError !== ""}
                                            className="btn-primary resend-btn"
                                        >
                                            {isResending ? "Sending..." : "Resend Verification"}
                                        </button>
                                    </div>
                                    {emailError !== "" && (
                                        <div className="email-error-message">
                                            • {emailError}
                                        </div>
                                    )}
                                </div>
                                <div className="navigation-links">
                                    <button onClick={() => navigate("/sign_in")} className="link-btn">
                                        Go to Sign In
                                    </button>
                                    <button onClick={() => navigate("/sign_up")} className="link-btn">
                                        Create New Account
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EmailVerificationPage