import { Link } from "react-router-dom"
import "../../styles/globals.css"
import "../../styles/utilities.css"
import "./SignUpSuccessPage.css"
import NavBar from "../../components/NavBar/NavBar"

const SignUpSuccessPage = () => {
  return (
    <div className="success-page-container">
      <NavBar />
      <div className="success-content">
        <div className="success-card">
          <div className="success-header">
            <h1 className="success-title">Account Created Successfully!</h1>
            <p className="success-subtitle">
              Welcome to ToDoodle! Your account has been created and you're ready to start organizing your tasks.
            </p>
          </div>

          <div className="success-details">
            <div className="detail-item">
              <span className="detail-icon">🎉</span>
              <span className="detail-text">Your account is now active</span>
            </div>
            <div className="detail-item">
              <span className="detail-icon">📝</span>
              <span className="detail-text">Ready to create your first todo</span>
            </div>
            <div className="detail-item">
              <span className="detail-icon">🚀</span>
              <span className="detail-text">Start boosting your productivity</span>
            </div>
          </div>

          <div className="success-actions">
            <Link to="/sign_in" className="btn-primary success-btn">
              Continue to Sign In
            </Link>
            <Link to="/" className="btn-secondary success-btn-secondary">
              Back to Home
            </Link>
          </div>

          <div className="success-footer">
            <p className="footer-text">
              Need help getting started? Check out our <Link to="/about" className="link-primary">About page</Link> to learn more about ToDoodle's features.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUpSuccessPage