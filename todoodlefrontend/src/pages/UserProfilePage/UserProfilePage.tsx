import { useState, useEffect } from 'react'
import { FaEye, FaEyeSlash, FaUser, FaEnvelope, FaLock, FaTrash, FaEdit, FaSave, FaTimes } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { authApi } from '../../services/api'
import NavBar from '../../components/NavBar/NavBar'
import '../../styles/globals.css'
import '../../styles/utilities.css'
import './UserProfilePage.css'

const UserProfilePage = () => {
  const navigate = useNavigate()
  const { user, logout, login } = useAuthStore()
  
  // Form states
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  // UI states
  const [editMode, setEditMode] = useState({
    username: false,
    email: false,
    password: false
  })
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    newAndConfirm: false
  })
  
  const [loading, setLoading] = useState({
    username: false,
    email: false,
    password: false,
    delete: false
  })
  
  const [errors, setErrors] = useState<string[]>([])
  const [success, setSuccess] = useState<string>('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  // Store original values for comparison
  const [originalValues, setOriginalValues] = useState({
    username: '',
    email: ''
  })

  // Initialize form data with user info
  useEffect(() => {
    if (user) {
      const username = user.username || ''
      const email = user.email || ''
      
      setFormData(prev => ({
        ...prev,
        username,
        email
      }))
      
      setOriginalValues({
        username,
        email
      })
    }
  }, [user])

  // TODO: think about replacing this with toastify
  // Clear messages after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 5000)
      return () => clearTimeout(timer)
    }
  }, [success])

  useEffect(() => {
    if (errors.length > 0) {
      const timer = setTimeout(() => setErrors([]), 5000)
      return () => clearTimeout(timer)
    }
  }, [errors])

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
    if (username === originalValues.username) {
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
    if (email === originalValues.email) {
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
    setErrors([])
  }

  const toggleEditMode = (field: 'username' | 'email' | 'password') => {
    setEditMode(prev => ({ ...prev, [field]: !prev[field] }))
    setErrors([])
    setSuccess('')
    
    // Reset form data when canceling
    if (editMode[field]) {
      if (field === 'username') {
        setFormData(prev => ({ ...prev, username: originalValues.username }))
      }
      if (field === 'email') {
        setFormData(prev => ({ ...prev, email: originalValues.email }))
      }
      if (field === 'password') {
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }))
      }
    }
  }

  const togglePasswordVisibility = (field: 'current' | 'newAndConfirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }))
  }

  // API calls (placeholder functions - need backend implementation)
  const updateUsername = async () => {
    if (!user) {
      setErrors(['User not found'])
      return
    }

    const validationErrors = validateUsername(formData.username)
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    setLoading(prev => ({ ...prev, username: true }))
    try {
      await authApi.updateUsername(user.id, formData.username)
      
      setSuccess('Username updated successfully!')
      setEditMode(prev => ({ ...prev, username: false }))
      
      // Update original values and user in store with new username
      setOriginalValues(prev => ({ ...prev, username: formData.username }))
      login({ ...user, username: formData.username })
    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'Failed to update username'])
    } finally {
      setLoading(prev => ({ ...prev, username: false }))
    }
  }

  const updateEmail = async () => {
    if (!user) {
      setErrors(['User not found'])
      return
    }

    const validationErrors = validateEmail(formData.email)
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    setLoading(prev => ({ ...prev, email: true }))
    try {
      await authApi.updateEmail(user.id, formData.email)
      
      setSuccess('Email updated successfully! Please verify your new email address.')
      setEditMode(prev => ({ ...prev, email: false }))
      
      // Update original values and user in store with new email
      setOriginalValues(prev => ({ ...prev, email: formData.email }))
      login({ ...user, email: formData.email })
    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'Failed to update email'])
    } finally {
      setLoading(prev => ({ ...prev, email: false }))
    }
  }

  const updatePassword = async () => {
    if (!user) {
      setErrors(['User not found'])
      return
    }

    const validationErrors = validatePassword(formData.newPassword)
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setErrors(['Passwords do not match'])
      return
    }

    if (!formData.currentPassword) {
      setErrors(['Current password is required'])
      return
    }

    setLoading(prev => ({ ...prev, password: true }))
    try {
      await authApi.updatePassword(user.id, formData.currentPassword, formData.newPassword)
      
      setSuccess('Password updated successfully!')
      setEditMode(prev => ({ ...prev, password: false }))
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }))
    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'Failed to update password'])
    } finally {
      setLoading(prev => ({ ...prev, password: false }))
    }
  }

  const deleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      setErrors(['Please type "DELETE" to confirm account deletion'])
      return
    }

    if (!user) {
      setErrors(['User not found'])
      return
    }

    setLoading(prev => ({ ...prev, delete: true }))
    try {
      await authApi.deleteUser(user.id)
      logout()
      navigate('/')
    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'Failed to delete account'])
    } finally {
      setLoading(prev => ({ ...prev, delete: false }))
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
          </div>

          {/* TODO: find a better placement */}
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
                    {user.username}
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
                  <p className="section-description">Your email address for notifications and login</p>
                </div>
                {!editMode.email && (
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
                {editMode.email ? (
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
                    {user.email}
                  </div>
                )}
              </div>
            </div>

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