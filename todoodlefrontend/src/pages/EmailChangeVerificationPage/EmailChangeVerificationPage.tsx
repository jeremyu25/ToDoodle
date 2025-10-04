import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { authApi } from '../../services/api'
import NavBar from '../../components/NavBar/NavBar'
import '../../styles/globals.css'
import '../../styles/utilities.css'
import './EmailChangeVerificationPage.css'

const EmailChangeVerificationPage = () => {
  const verificationAttempted = useRef(false)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const verifyEmailChange = async () => {
      const token = searchParams.get('token')
      
      if (!token) {
        setError('Invalid verification link. No token provided.')
        setLoading(false)
        return
      }

      try {
        await authApi.verifyEmailChange(token)
        
        setSuccess(true)
        setError('')
        
      } catch (error) {
        console.error('Email change verification failed:', error)
        setError(error instanceof Error ? error.message : 'Failed to verify email change')
        setSuccess(false)
      } finally {
        setLoading(false)
      }
    }

    if (verificationAttempted.current) {
        return
    }
    verificationAttempted.current = true
    verifyEmailChange()
  }, [searchParams, navigate])

  return (
    <div className="email-change-verification-page">
      <NavBar />
      <div className="verification-container">
        <div className="verification-content">
          {loading && (
            <div className="verification-status loading">
              <div className="spinner large"></div>
              <h2>Verifying Email Change</h2>
              <p>Please wait while we verify your new email address...</p>
            </div>
          )}

          {success && (
            <div className="verification-status success">
              <div className="success-icon">✓</div>
              <h2>Email Changed Successfully!</h2>
              <p>Your email address has been updated successfully.</p>
              <p>A notification has been sent to your previous email address.</p>
              <button 
                className="continue-button"
                onClick={() => navigate('/profile')}
              >
                Continue to Profile
              </button>
            </div>
          )}

          {error && (
            <div className="verification-status error">
              <div className="error-icon">✗</div>
              <h2>Email Change Failed</h2>
              <p className="error-message">{error}</p>
              <div className="error-actions">
                <button 
                  className="retry-button"
                  onClick={() => navigate('/profile')}
                >
                  Go to Profile
                </button>
                <button 
                  className="home-button"
                  onClick={() => navigate('/todo')}
                >
                  Go to Home
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EmailChangeVerificationPage