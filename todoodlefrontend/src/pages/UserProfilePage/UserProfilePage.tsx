import { useState, useEffect } from 'react'
import { FaEye, FaEyeSlash, FaUser, FaEnvelope, FaLock, FaTrash, FaEdit, FaSave, FaTimes, FaSync } from 'react-icons/fa'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { authApi } from '../../services/api'
import NavBar from '../../components/NavBar/NavBar'
import '../../styles/globals.css'
import '../../styles/utilities.css'
import './UserProfilePage.css'

// Custom hook for managing temporary messages
const useMessages = () => {
  const [errors, setErrors] = useState<string[]>([])
  const [success, setSuccess] = useState<string>('')

  useEffect(() => {
    if (success || errors.length > 0) {
      const timer = setTimeout(() => {
        setSuccess('')
        setErrors([])
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [success, errors.length])

  const showError = (error: string | string[]) => {
    setErrors(Array.isArray(error) ? error : [error])
    setSuccess('')
  }

  const showSuccess = (message: string) => {
    setSuccess(message)
    setErrors([])
  }

  const clearMessages = () => {
    setErrors([])
    setSuccess('')
  }

  return { errors, success, showError, showSuccess, clearMessages }
}

const UserProfilePage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout, refreshUserData, hasLocalAuth, authMethods } = useAuthStore()
  const { errors, success, showError, showSuccess, clearMessages } = useMessages()
  
  // Form states
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    addPassword: '',
    confirmAddPassword: ''
  })
  
  // UI states
  const [editMode, setEditMode] = useState({
    username: false,
    email: false,
    password: false,
    addPassword: false
  })
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    newAndConfirm: false
  })
  
  const [loading, setLoading] = useState({
    username: false,
    email: false,
    password: false,
    addPassword: false,
    delete: false,
    google: false, // Add specific OAuth providers as needed
  } as Record<string, boolean>)
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [pendingEmailChange, setPendingEmailChange] = useState<any>(null)

  // Check if user has local authentication (password)
  const userHasLocalAuth = hasLocalAuth()
  
  // Debug logging
  console.log('UserProfilePage - User has local auth:', userHasLocalAuth)

  // Initialize data and fetch user profile on mount
  useEffect(() => {
    const initializeData = async () => {
      if (!user) return

      // Set form data from user
      setFormData({
        username: user.username || '',
        email: user.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        addPassword: '',
        confirmAddPassword: ''
      })

      // Refresh user data to ensure we have the latest information
      console.log('Refreshing user data on profile page mount...')
      try {
        await refreshUserData()
        console.log('User data refreshed successfully')
      } catch (error) {
        console.error('Failed to refresh user data:', error)
      }

      // Check for pending email changes
      try {
        const response = await authApi.getPendingEmailChange()
        setPendingEmailChange(response.pendingChange)
      } catch (error) {
        setPendingEmailChange(null)
      }
    }

    initializeData()
  }, [user?.id])

  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        username: user.username || '',
        email: user.email || ''
      }))
    }
  }, [user?.username, user?.email])

  // Check if user is returning from email verification
  useEffect(() => {
    const state = location.state as { emailChanged?: boolean } | null
    if (state?.emailChanged) {
      showSuccess('Email address updated successfully!')
      // Clear the state to prevent showing the message again on refresh
      navigate('/profile', { replace: true, state: {} })
    }
  }, [location.state, showSuccess, navigate])

  // Validation functions
  const validateUsername = (username: string): string[] => {
    const errors = []
    if (username.length < 3) {
      errors.push("Username must be at least 3 characters long")
    }
    if (username.length > 100) {
      errors.push("Username must be less than 100 characters long")
    }
    if (!/^[a-zA-Z0-9]+$/.test(username)) {
      errors.push("Username must contain only letters and numbers")
    }
    if (username === user?.username) {
      errors.push("Username must be different from the current one")
    }
    return errors
  }

  const validateEmail = (email: string): string[] => {
    const errors = []
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push("Please enter a valid email address")
    }
    if (email.length > 100) {
      errors.push("Email must be less than 100 characters long")
    }
    if (email === user?.email) {
      errors.push("Email must be different from the current one")
    }
    return errors
  }

  const validatePassword = (password: string): string[] => {
    const errors = []
    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long")
    }
    if (password.length > 100) {
      errors.push("Password must be less than 100 characters long")
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter")
    }
    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter")
    }
    if (!/[0-9]/.test(password)) {
      errors.push("Password must contain at least one number")
    }
    if (!/[!@#$%^&*]/.test(password)) {
      errors.push("Password must contain at least one special character")
    }
    return errors
  }

  // Handler functions
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    clearMessages()
  }

  const toggleEditMode = (field: 'username' | 'email' | 'password' | 'addPassword') => {
    setEditMode(prev => ({ ...prev, [field]: !prev[field] }))
    clearMessages()
    
    // Reset form data when canceling
    if (editMode[field]) {
      if (field === 'username') {
        setFormData(prev => ({ ...prev, username: user?.username || '' }))
      }
      if (field === 'email') {
        setFormData(prev => ({ ...prev, email: user?.email || '' }))
      }
      if (field === 'password') {
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }))
      }
      if (field === 'addPassword') {
        setFormData(prev => ({
          ...prev,
          addPassword: '',
          confirmAddPassword: ''
        }))
      }
    }
  }

  const togglePasswordVisibility = (field: 'current' | 'newAndConfirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }))
  }

  // API calls
  const updateUsername = async () => {
    if (!user) {
      showError('User not found')
      return
    }

    const validationErrors = validateUsername(formData.username)
    if (validationErrors.length > 0) {
      showError(validationErrors)
      return
    }

    setLoading(prev => ({ ...prev, username: true }))
    try {
      await authApi.updateUsername(user.id, formData.username)
      
      showSuccess('Username updated successfully!')
      setEditMode(prev => ({ ...prev, username: false }))
      
      // Refresh user data from server to ensure we have the latest information
      await refreshUserData()
      
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to update username')
    } finally {
      setLoading(prev => ({ ...prev, username: false }))
    }
  }

  const updateEmail = async () => {
    if (!user) {
      showError('User not found')
      return
    }

    // Check if user has local auth before allowing email change
    if (!userHasLocalAuth) {
      showError('You must add a password to your account before changing your email address.')
      return
    }

    const validationErrors = validateEmail(formData.email)
    if (validationErrors.length > 0) {
      showError(validationErrors)
      return
    }

    setLoading(prev => ({ ...prev, email: true }))
    try {
      const response = await authApi.updateEmail(user.id, formData.email)
      
      showSuccess(response.message || 'Verification email sent to your new email address!')
      setEditMode(prev => ({ ...prev, email: false }))
      
      // Reset form data to current email
      setFormData(prev => ({ ...prev, email: user?.email || '' }))
      
      // Check for pending email change to update UI
      try {
        const pendingResponse = await authApi.getPendingEmailChange()
        setPendingEmailChange(pendingResponse.pendingChange)
      } catch (error) {
        // Ignore error if no pending change
      }
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to initiate email change')
    } finally {
      setLoading(prev => ({ ...prev, email: false }))
    }
  }

  const updatePassword = async () => {
    if (!user) {
      showError('User not found')
      return
    }

    const validationErrors = validatePassword(formData.newPassword)
    if (validationErrors.length > 0) {
      showError(validationErrors)
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      showError('Passwords do not match')
      return
    }

    if (!formData.currentPassword) {
      showError('Current password is required')
      return
    }

    setLoading(prev => ({ ...prev, password: true }))
    try {
      await authApi.updatePassword(user.id, formData.currentPassword, formData.newPassword)
      
      showSuccess('Password updated successfully!')
      setEditMode(prev => ({ ...prev, password: false }))
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }))
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to update password')
    } finally {
      setLoading(prev => ({ ...prev, password: false }))
    }
  }

  const addLocalPassword = async () => {
    if (!user) {
      showError('User not found')
      return
    }

    const validationErrors = validatePassword(formData.addPassword)
    if (validationErrors.length > 0) {
      showError(validationErrors)
      return
    }

    if (formData.addPassword !== formData.confirmAddPassword) {
      showError('Passwords do not match')
      return
    }

    setLoading(prev => ({ ...prev, addPassword: true }))
    try {
      await authApi.addLocalPassword(formData.addPassword)
      
      showSuccess('Password added successfully! You can now sign in with your username/email and password.')
      setEditMode(prev => ({ ...prev, addPassword: false }))
      setFormData(prev => ({
        ...prev,
        addPassword: '',
        confirmAddPassword: ''
      }))
      
      // Refresh user data to update auth methods
      await refreshUserData()
      
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to add password')
    } finally {
      setLoading(prev => ({ ...prev, addPassword: false }))
    }
  }

  const removeOAuthMethod = async (provider: string) => {
    if (!user) {
      showError('User not found')
      return
    }

    if (!authMethods) {
      showError('Unable to determine authentication methods')
      return
    }

    // Check if this is the only auth method
    if (authMethods.length <= 1) {
      showError('Cannot remove your only authentication method')
      return
    }

    // Confirm the action
    const confirmed = window.confirm(
      `Are you sure you want to remove ${provider} authentication? You will no longer be able to sign in using ${provider}.`
    )
    
    if (!confirmed) return

    setLoading(prev => ({ ...prev, [provider]: true }))
    try {
      await authApi.removeOAuthMethod(provider)
      
      showSuccess(`${provider} authentication removed successfully`)
      
      // Refresh user data to update auth methods
      await refreshUserData()
      
    } catch (error) {
      showError(error instanceof Error ? error.message : `Failed to remove ${provider} authentication`)
    } finally {
      setLoading(prev => ({ ...prev, [provider]: false }))
    }
  }

  const deleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      showError('Please type "DELETE" to confirm account deletion')
      return
    }

    if (!user) {
      showError('User not found')
      return
    }

    setLoading(prev => ({ ...prev, delete: true }))
    try {
      await authApi.deleteUser(user.id)
      logout()
      navigate('/')
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to delete account')
    } finally {
      setLoading(prev => ({ ...prev, delete: false }))
    }
  }

  const cancelEmailChange = async () => {
    setLoading(prev => ({ ...prev, email: true }))
    try {
      await authApi.cancelPendingEmailChange()
      setPendingEmailChange(null)
      showSuccess('Email change request cancelled successfully.')
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to cancel email change')
    } finally {
      setLoading(prev => ({ ...prev, email: false }))
    }
  }

  const handleRefreshData = async () => {
    try {
      setLoading(prev => ({ ...prev, username: true, email: true }))
      await refreshUserData()
      
      // Also refresh pending email changes
      try {
        const response = await authApi.getPendingEmailChange()
        setPendingEmailChange(response.pendingChange)
      } catch (error) {
        setPendingEmailChange(null)
      }
      
      showSuccess('Profile data refreshed successfully!')
    } catch (error) {
      showError('Failed to refresh profile data')
    } finally {
      setLoading(prev => ({ ...prev, username: false, email: false }))
    }
  }

  if (!user) {
    return (
      <div className="profile-page-container">
        <NavBar />
        <div className="profile-container">
          <div className="error-message">Please log in to view your profile.</div>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-page-container">
      <NavBar />
      <div className="profile-container">
        <div className="profile-content">
          <div className="profile-header">
            <div className="profile-avatar">
              <FaUser size={48} />
            </div>
            <div className="profile-info">
              <h1 className="profile-title">Account Settings</h1>
              <p className="profile-subtitle">Manage your account information and preferences</p>
            </div>
            <button
              className="refresh-button"
              onClick={handleRefreshData}
              disabled={Object.values(loading).some(Boolean)}
              title="Refresh profile data"
            >
              <FaSync />
            </button>
          </div>

          {/* Messages */}
          {success && (
            <div className="success-message">
              {success}
            </div>
          )}
          
          {errors.length > 0 && (
            <div className="error-messages">
              {errors.map((error, index) => (
                <div key={index} className="error-message">
                  {error}
                </div>
              ))}
            </div>
          )}

          <div className="profile-sections">

            <div className="profile-section">
              <div className="section-header">
                <div className="section-icon">
                  <FaUser />
                </div>
                <div className="section-info">
                  <h3 className="section-title">Username</h3>
                  <p className="section-description">Your unique username for the platform</p>
                </div>
                {!editMode.username && (
                  <button
                    className="edit-button"
                    onClick={() => toggleEditMode('username')}
                    disabled={Object.values(loading).some(Boolean)}
                  >
                    <FaEdit />
                  </button>
                )}
              </div>
              
              <div className="section-content">
                {editMode.username ? (
                  <div className="edit-form">
                    <div className="input-group">
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => handleInputChange('username', e.target.value)}
                        className={`form-input ${validateUsername(formData.username).length > 0 ? 'input-error' : ''}`}
                        placeholder="Enter new username"
                      />
                      {validateUsername(formData.username).length > 0 && (
                        <div className="input-error-message">
                          {validateUsername(formData.username).map((error, index) => (
                            <span key={index} className="error-dot">• {error}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="form-actions">
                      <button
                        className="save-button"
                        onClick={updateUsername}
                        disabled={loading.username || validateUsername(formData.username).length > 0}
                      >
                        {loading.username ? (
                          <>
                            <span className="spinner"></span>
                            Saving...
                          </>
                        ) : (
                          <>
                            <FaSave />
                            Save
                          </>
                        )}
                      </button>
                      <button
                        className="cancel-button"
                        onClick={() => toggleEditMode('username')}
                        disabled={loading.username}
                      >
                        <FaTimes />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="display-value">
                    {user.username || 'Loading...'}
                  </div>
                )}
              </div>
            </div>

            <div className="profile-section">
              <div className="section-header">
                <div className="section-icon">
                  <FaEnvelope />
                </div>
                <div className="section-info">
                  <h3 className="section-title">Email Address</h3>
                  <p className="section-description">
                    {!userHasLocalAuth 
                      ? "Your email address for notifications and login (requires password to change)"
                      : "Your email address for notifications and login"
                    }
                  </p>
                </div>
                {!editMode.email && !pendingEmailChange && userHasLocalAuth && (
                  <button
                    className="edit-button"
                    onClick={() => toggleEditMode('email')}
                    disabled={Object.values(loading).some(Boolean)}
                  >
                    <FaEdit />
                  </button>
                )}
              </div>
              
              <div className="section-content">
                {pendingEmailChange ? (
                  <div className="pending-email-change">
                    <div className="current-email">
                      <strong>Current:</strong> {user.email}
                    </div>
                    <div className="pending-email">
                      <strong>Pending:</strong> {pendingEmailChange.new_email}
                      <span className="pending-badge">Verification Required</span>
                    </div>
                    <div className="pending-info">
                      <p>A verification email has been sent to <strong>{pendingEmailChange.new_email}</strong>.</p>
                      <p>Please check your email and click the verification link to complete the change.</p>
                      <small>
                        Request expires: {new Date(pendingEmailChange.verification_expires).toLocaleString()}
                      </small>
                    </div>
                    <div className="pending-actions">
                      <button
                        className="cancel-button"
                        onClick={cancelEmailChange}
                        disabled={loading.email}
                      >
                        {loading.email ? (
                          <>
                            <span className="spinner"></span>
                            Cancelling...
                          </>
                        ) : (
                          <>
                            <FaTimes />
                            Cancel Request
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : editMode.email ? (
                  <div className="edit-form">
                    <div className="input-group">
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={`form-input ${validateEmail(formData.email).length > 0 ? 'input-error' : ''}`}
                        placeholder="Enter new email address"
                      />
                      {validateEmail(formData.email).length > 0 && (
                        <div className="input-error-message">
                          {validateEmail(formData.email).map((error, index) => (
                            <span key={index} className="error-dot">• {error}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="form-actions">
                      <button
                        className="save-button"
                        onClick={updateEmail}
                        disabled={loading.email || validateEmail(formData.email).length > 0}
                      >
                        {loading.email ? (
                          <>
                            <span className="spinner"></span>
                            Sending...
                          </>
                        ) : (
                          <>
                            <FaSave />
                            Send Verification
                          </>
                        )}
                      </button>
                      <button
                        className="cancel-button"
                        onClick={() => toggleEditMode('email')}
                        disabled={loading.email}
                      >
                        <FaTimes />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="display-value">
                    {user.email || 'Loading...'}
                    {!userHasLocalAuth && (
                      <div className="display-value-italic">
                        Add a password to enable email changes
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {userHasLocalAuth && (
              <div className="profile-section">
                <div className="section-header">
                  <div className="section-icon">
                    <FaLock />
                  </div>
                  <div className="section-info">
                    <h3 className="section-title">Password</h3>
                    <p className="section-description">Update your account password</p>
                  </div>
                  {!editMode.password && (
                    <button
                      className="edit-button"
                      onClick={() => toggleEditMode('password')}
                      disabled={Object.values(loading).some(Boolean)}
                    >
                      <FaEdit />
                    </button>
                  )}
                </div>
                
                <div className="section-content">
                  {editMode.password ? (
                    <div className="edit-form">
                      <div className="input-group">
                        <label className="form-label">Current Password</label>
                        <div className="password-input-container">
                          <input
                            type={showPasswords.current ? "text" : "password"}
                            value={formData.currentPassword}
                            onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                            className="form-input"
                            placeholder="Enter current password"
                          />
                          <button
                            type="button"
                            className="eye-icon"
                            onClick={() => togglePasswordVisibility('current')}
                          >
                            {showPasswords.current ? <FaEye /> : <FaEyeSlash />}
                          </button>
                        </div>
                      </div>

                      <div className="input-group">
                        <label className="form-label">New Password</label>
                        <div className="password-input-container">
                          <input
                            type={showPasswords.newAndConfirm ? "text" : "password"}
                            value={formData.newPassword}
                            onChange={(e) => handleInputChange('newPassword', e.target.value)}
                            className={`form-input ${validatePassword(formData.newPassword).length > 0 ? 'input-error' : ''}`}
                            placeholder="Enter new password"
                          />
                          <button
                            type="button"
                            className="eye-icon"
                            onClick={() => togglePasswordVisibility('newAndConfirm')}
                          >
                            {showPasswords.newAndConfirm ? <FaEye /> : <FaEyeSlash />}
                          </button>
                        </div>
                        {formData.newPassword && validatePassword(formData.newPassword).length > 0 && (
                          <div className="input-error-message">
                            {validatePassword(formData.newPassword).map((error, index) => (
                              <span key={index} className="error-dot">• {error}</span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="input-group">
                        <label className="form-label">Confirm New Password</label>
                        <div className="password-input-container">
                          <input
                            type={showPasswords.newAndConfirm ? "text" : "password"}
                            value={formData.confirmPassword}
                            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                            className={`form-input ${formData.confirmPassword && formData.newPassword !== formData.confirmPassword ? 'input-error' : ''}`}
                            placeholder="Confirm new password"
                          />
                          <button
                            type="button"
                            className="eye-icon"
                            onClick={() => togglePasswordVisibility('newAndConfirm')}
                          >
                            {showPasswords.newAndConfirm ? <FaEye /> : <FaEyeSlash />}
                          </button>
                        </div>
                        {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                          <div className="input-error-message">
                            <span className="error-dot">• Passwords do not match</span>
                          </div>
                        )}
                      </div>

                      <div className="form-actions">
                        <button
                          className="save-button"
                          onClick={updatePassword}
                          disabled={
                            loading.password ||
                            !formData.currentPassword ||
                            !formData.newPassword ||
                            !formData.confirmPassword ||
                            validatePassword(formData.newPassword).length > 0 ||
                            formData.newPassword !== formData.confirmPassword
                          }
                        >
                          {loading.password ? (
                            <>
                              <span className="spinner"></span>
                              Updating...
                            </>
                          ) : (
                            <>
                              <FaSave />
                              Update Password
                            </>
                          )}
                        </button>
                        <button
                          className="cancel-button"
                          onClick={() => toggleEditMode('password')}
                          disabled={loading.password}
                        >
                          <FaTimes />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="display-value">
                      ••••••••••••
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* OAuth Info Section - Only show for users without local authentication */}
            {!userHasLocalAuth && (
              <div className="profile-section">
                <div className="section-header">
                  <div className="section-icon">
                    <FaLock />
                  </div>
                  <div className="section-info">
                    <h3 className="section-title">Authentication</h3>
                    <p className="section-description">
                      {editMode.addPassword 
                        ? "Add a password to enable username/password login" 
                        : "You signed in using OAuth (Google). You can optionally add a password for traditional login."
                      }
                    </p>
                  </div>
                  {!editMode.addPassword && (
                    <button
                      className="edit-button"
                      onClick={() => toggleEditMode('addPassword')}
                      disabled={Object.values(loading).some(Boolean)}
                    >
                      <FaEdit />
                    </button>
                  )}
                </div>
                
                <div className="section-content">
                  {editMode.addPassword ? (
                    <div className="edit-form">
                      <div className="input-group">
                        <label className="form-label">New Password</label>
                        <div className="password-input-container">
                          <input
                            type={showPasswords.newAndConfirm ? "text" : "password"}
                            value={formData.addPassword}
                            onChange={(e) => handleInputChange('addPassword', e.target.value)}
                            className={`form-input ${validatePassword(formData.addPassword).length > 0 ? 'input-error' : ''}`}
                            placeholder="Enter password"
                          />
                          <button
                            type="button"
                            className="eye-icon"
                            onClick={() => togglePasswordVisibility('newAndConfirm')}
                          >
                            {showPasswords.newAndConfirm ? <FaEye /> : <FaEyeSlash />}
                          </button>
                        </div>
                        {formData.addPassword && validatePassword(formData.addPassword).length > 0 && (
                          <div className="input-error-message">
                            {validatePassword(formData.addPassword).map((error, index) => (
                              <span key={index} className="error-dot">• {error}</span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="input-group">
                        <label className="form-label">Confirm Password</label>
                        <div className="password-input-container">
                          <input
                            type={showPasswords.newAndConfirm ? "text" : "password"}
                            value={formData.confirmAddPassword}
                            onChange={(e) => handleInputChange('confirmAddPassword', e.target.value)}
                            className={`form-input ${formData.confirmAddPassword && formData.addPassword !== formData.confirmAddPassword ? 'input-error' : ''}`}
                            placeholder="Confirm password"
                          />
                          <button
                            type="button"
                            className="eye-icon"
                            onClick={() => togglePasswordVisibility('newAndConfirm')}
                          >
                            {showPasswords.newAndConfirm ? <FaEye /> : <FaEyeSlash />}
                          </button>
                        </div>
                        {formData.confirmAddPassword && formData.addPassword !== formData.confirmAddPassword && (
                          <div className="input-error-message">
                            <span className="error-dot">• Passwords do not match</span>
                          </div>
                        )}
                      </div>

                      <div className="form-actions">
                        <button
                          className="save-button"
                          onClick={addLocalPassword}
                          disabled={
                            loading.addPassword ||
                            !formData.addPassword ||
                            !formData.confirmAddPassword ||
                            validatePassword(formData.addPassword).length > 0 ||
                            formData.addPassword !== formData.confirmAddPassword
                          }
                        >
                          {loading.addPassword ? (
                            <>
                              <span className="spinner"></span>
                              Adding...
                            </>
                          ) : (
                            <>
                              <FaSave />
                              Add Password
                            </>
                          )}
                        </button>
                        <button
                          className="cancel-button"
                          onClick={() => toggleEditMode('addPassword')}
                          disabled={loading.addPassword}
                        >
                          <FaTimes />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="display-value">
                      No password
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Authentication Methods Management */}
            <div className="profile-section">
              <div className="section-header">
                <div className="section-icon">
                  <FaLock />
                </div>
                <div className="section-info">
                  <h3 className="section-title">Authentication Methods</h3>
                  <p className="section-description">Manage how you sign in to your account</p>
                </div>
              </div>
              
              <div className="section-content">
                <div className="auth-methods-list">
                  {authMethods?.map((method) => (
                    <div key={method.provider} className="auth-method-item" style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px',
                      border: '1px solid #e1e5e9',
                      borderRadius: '6px',
                      marginBottom: '8px'
                    }}>
                      <div className="auth-method-info">
                        <span className="auth-method-provider" style={{ fontWeight: 'bold' }}>
                          {method.provider === 'local' ? 'Password' : method.provider.charAt(0).toUpperCase() + method.provider.slice(1)}
                        </span>
                        <span style={{ color: '#666', fontSize: '14px', marginLeft: '8px' }}>
                          {method.provider === 'local' 
                            ? 'Username/Email and password'
                            : `OAuth via ${method.provider}`
                          }
                        </span>
                      </div>
                      {authMethods && authMethods.length > 1 && method.provider !== 'local' && (
                        <button
                          className="remove-auth-button"
                          onClick={() => removeOAuthMethod(method.provider)}
                          disabled={loading[method.provider as keyof typeof loading]}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          {loading[method.provider as keyof typeof loading] ? 'Removing...' : 'Remove'}
                        </button>
                      )}
                    </div>
                  ))}
                  
                  {(!authMethods || authMethods.length === 0) && (
                    <div style={{ color: '#666', fontStyle: 'italic' }}>
                      Loading authentication methods...
                    </div>
                  )}
                </div>
                
                <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    <strong>Security Note:</strong> When you change your email address, consider whether you want to keep OAuth methods 
                    that were originally linked to your old email address. You can remove them here for enhanced security.
                  </div>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="profile-section danger-section">
              <div className="section-header">
                <div className="section-icon danger">
                  <FaTrash />
                </div>
                <div className="section-info">
                  <h3 className="section-title danger">Danger Zone</h3>
                  <p className="section-description">Permanently delete your account and all associated data</p>
                </div>
              </div>
              
              <div className="section-content">
                {!showDeleteConfirm ? (
                  <button
                    className="delete-button"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={Object.values(loading).some(Boolean)}
                  >
                    <FaTrash />
                    Delete Account
                  </button>
                ) : (
                  <div className="delete-confirmation">
                    <div className="warning-message">
                      <strong>Warning:</strong> This action cannot be undone. All your todos, folders, and account data will be permanently deleted.
                    </div>
                    <div className="input-group">
                      <label className="form-label">Type "DELETE" to confirm:</label>
                      <input
                        type="text"
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        className="form-input"
                        placeholder="Type DELETE here"
                      />
                    </div>
                    <div className="form-actions">
                      <button
                        className="confirm-delete-button"
                        onClick={deleteAccount}
                        disabled={loading.delete || deleteConfirmText !== 'DELETE'}
                      >
                        {loading.delete ? (
                          <>
                            <span className="spinner"></span>
                            Deleting...
                          </>
                        ) : (
                          <>
                            <FaTrash />
                            Confirm Delete
                          </>
                        )}
                      </button>
                      <button
                        className="cancel-button"
                        onClick={() => {
                          setShowDeleteConfirm(false)
                          setDeleteConfirmText('')
                        }}
                        disabled={loading.delete}
                      >
                        <FaTimes />
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserProfilePage