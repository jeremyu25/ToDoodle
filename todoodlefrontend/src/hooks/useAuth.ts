import { useAuthStore } from '../stores/authStore';

// Custom hook that provides a cleaner interface to the auth store
export const useAuth = () => {
  const store = useAuthStore();
  
  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    login: store.login,
    logout: store.logout,
    checkAuthStatus: store.checkAuthStatus
  };
};
