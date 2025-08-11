import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import './App.css'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import UserSignUpPage from './pages/UserSignUpPage'
import UserSignInPage from './pages/UserSignInPage'
import FeedBackPage from './pages/FeedBackPage'
import UserProfilePage from './pages/UserProfilePage'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'
import { useAuth } from './hooks/useAuth'

function App() {
  const { checkAuthStatus } = useAuth();

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/sign_up" element={<UserSignUpPage />} />
        <Route path="/sign_in" element={<UserSignInPage />} />
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
      </Routes>
    </BrowserRouter>
  )
}

export default App
