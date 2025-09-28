import { useState } from 'react';
import { Link } from "react-router-dom"
import { authApi } from '../../services/api';
import NavBar from "../../components/NavBar/NavBar"
import "../../styles/globals.css"
import "../../styles/utilities.css"
import "./EmailSentPage.css"

type EmailSentPageProps = {
  email: string;
};

const EmailSentPageProps: React.FC<EmailSentPageProps> = ({email}) => {
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  const handleResendEmail = async () => {
    if (!email) {
      setResendMessage('No email address found. Please try signing up again.');
      return;
    }

    setIsResending(true);
    setResendMessage('');

    try {
      await authApi.resendVerification(email);
      setResendMessage('Verification email sent successfully! Please check your inbox.');
    } catch (error) {
      setResendMessage(error instanceof Error ? error.message : 'Failed to resend verification email');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="email-sent-page-container">
      <NavBar />
      <div className="email-sent-content">
        <div className="email-sent-card">
          <div className="email-sent-header">
            <h1 className="email-sent-title">Check Your Email! <span className="email-icon">📧</span></h1>
            <p className="email-sent-subtitle">
              We've sent a verification link to {email ? <strong>{email}</strong> : 'your email address'}
            </p>
          </div>

          <div className="email-sent-details">
            <div className="detail-item">
              <span className="detail-icon">✉️</span>
              <div className="detail-content">
                <strong>Check your inbox</strong>
                <p>Look for an email from ToDoodle with your verification link</p>
              </div>
            </div>
            <div className="detail-item">
              <span className="detail-icon">🕒</span>
              <div className="detail-content">
                <strong>Act quickly</strong>
                <p>The verification link expires in 10 minutes</p>
              </div>
            </div>
            <div className="detail-item">
              <span className="detail-icon">📂</span>
              <div className="detail-content">
                <strong>Check your spam folder</strong>
                <p>Sometimes emails end up there by mistake</p>
              </div>
            </div>
          </div>

          <div className="email-sent-actions">
            <button 
              onClick={handleResendEmail}
              disabled={isResending || !email}
              className="btn-primary resend-btn-email"
            >
              {isResending ? 'Sending...' : 'Resend Verification Email'}
            </button>
            
            {resendMessage && (
              <div className={`resend-message ${resendMessage.includes('successfully') ? 'success' : 'error'}`}>
                {resendMessage}
              </div>
            )}
            
            <div className="secondary-actions">
              <Link to="/sign_in" className="btn-secondary">
                Already verified? Sign In
              </Link>
              <Link to="/sign_up" className="btn-secondary">
                Use Different Email
              </Link>
            </div>
          </div>

          <div className="email-sent-footer">
            <p className="footer-text">
              Didn't receive the email? Make sure {email} is correct and check your spam folder.
              If you continue having issues, try signing up again or <Link to="/feedback" className="link-primary">contact support</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmailSentPageProps