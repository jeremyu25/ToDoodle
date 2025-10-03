import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../services/api';

interface User {
  id: string;
  username: string;
  email: string;
  // Add other user properties as needed
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  checkAuthStatus: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      login: (userData: User) => {
        set({ user: userData, isAuthenticated: true, isLoading: false });
      },

      logout: async () => {
        try {
          await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/auth/signout`, {
            method: 'POST',
            credentials: 'include',
          });
        }
        catch (error) {
          console.error('Error in logout:', error);
        }
        finally {
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      checkAuthStatus: async () => {
        try {
          set({ isLoading: true });
          
          const currentState = get();

          if (currentState.user && currentState.isAuthenticated) {
            try {
              const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/auth/verify`, {
                method: 'GET',
                credentials: 'include', // This will send the HttpOnly cookie
                headers: {
                  'Content-Type': 'application/json',
                }
              });
              
              if (response.ok) {
                set({ 
                  isAuthenticated: true, 
                  isLoading: false 
                });
                return;
              } else {
                console.log('User is not authenticated with the server');
              }
            } catch (error) {
              console.log('Error in checking auth with server');
            }
          }
          // No user data or server verification failed
          console.log('No valid authentication, clearing auth state');
          set({ user: null, isAuthenticated: false, isLoading: false });
        } catch (error) {
          console.error('Auth check failed:', error);
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      refreshUserData: async () => {
        try {
          // Use the authApi instead of direct fetch for consistency
          const userData = await authApi.getCurrentUser();
          console.log('Fetched user data:', userData);
          
          if (userData.user) {
            set({ 
              user: userData.user, 
              isAuthenticated: true, 
              isLoading: false 
            });
          } else if (userData.id) {
            // If the response structure is different
            set({ 
              user: userData, 
              isAuthenticated: true, 
              isLoading: false 
            });
          }
        } catch (error) {
          console.error('Error refreshing user data:', error);
          // Try fallback to verify endpoint if getCurrentUser fails
          try {
            const verifyResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/auth/verify`, {
              method: 'GET',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
              }
            });
            
            if (verifyResponse.ok) {
              const verifyData = await verifyResponse.json();
              console.log('Verify endpoint data:', verifyData);
              if (verifyData.user) {
                set({ 
                  user: verifyData.user, 
                  isAuthenticated: true, 
                  isLoading: false 
                });
              }
            }
          } catch (fallbackError) {
            console.error('Fallback verify endpoint also failed:', fallbackError);
          }
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated,
        isLoading: false
      }),
      onRehydrateStorage: () => (state) => {
        console.log('Store rehydrated from localStorage:', state);
        // After rehydration, we'll check auth status in checkAuthStatus
      },
    }
  )
);
