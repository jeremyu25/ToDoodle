import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import HomePage from './pages/HomePage/HomePage'
import AboutPage from './pages/AboutPage/AboutPage'
import UserSignUpPage from './pages/UserSignUpPage/UserSignUpPage'
import UserSignInPage from './pages/UserSignInPage/UserSignInPage'
import FeedBackPage from './pages/FeedBackPage/FeedBackPage'
import UserProfilePage from './pages/UserProfilePage/UserProfilePage'
import TodoPage from './pages/TodoPage/TodoPage'
import EmailVerificationPage from './pages/EmailVerificationPage/EmailVerificationPage'
import EmailChangeVerificationPage from './pages/EmailChangeVerificationPage/EmailChangeVerificationPage'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'
import { useAuthStore } from './stores/authStore'

function App() {
  const checkAuthStatus = useAuthStore(state => state.checkAuthStatus)

  useEffect(() => {
    checkAuthStatus()
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/sign_up" element={<UserSignUpPage />} />
        <Route path="/sign_in" element={<UserSignInPage />} />
        <Route path="/verify-email" element={<EmailVerificationPage />} />
        <Route path="/verify-email-change" element={<EmailChangeVerificationPage />} />
        <Route 
          path="/feedback" 
          element={
            <ProtectedRoute>
              <FeedBackPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <UserProfilePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/todo" 
          element={
            <ProtectedRoute>
              <TodoPage />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
