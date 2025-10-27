import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../services/api';

interface User {
  id: string;
  username: string;
  email: string;
  // Add other user properties as needed
}

interface AuthMethod {
  provider: string;
  provider_user_id: string;
  provider_account_email?: string;
}

interface AuthState {
  user: User | null;
  authMethods: AuthMethod[] | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  checkAuthStatus: () => Promise<void>;
  refreshUserData: () => Promise<void>;
  hasLocalAuth: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      authMethods: null,
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
          set({ user: null, authMethods: null, isAuthenticated: false, isLoading: false });
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      hasLocalAuth: () => {
        const { authMethods } = get();
        return authMethods?.some(method => method.provider === 'local') ?? false;
      },

      checkAuthStatus: async () => {
        try {
          set({ isLoading: true });
          const currentState = get();

          try {
            const verifyData = await authApi.verifyUser();
            const verifiedUser = verifyData?.data?.user;

            if (verifiedUser) {
              if (currentState.user) {
                set({ isAuthenticated: true, isLoading: false });
              }
              else {
                await get().refreshUserData();
              }
              return;
            }
          } catch (err) {
            console.log('Error verifying auth with server:', err);
          }

          set({ user: null, authMethods: null, isAuthenticated: false, isLoading: false });
        } catch (error) {
          console.error('Auth check failed:', error);
          set({ user: null, authMethods: null, isAuthenticated: false, isLoading: false });
        }
      },

      refreshUserData: async () => {
        try {
          // Use the authApi instead of direct fetch for consistency
          const userData = await authApi.getCurrentUser();
          console.log('Fetched user data:', userData);
          
          // Also fetch auth methods
          const authMethodsData = await authApi.getUserAuthMethods();
          console.log('Fetched auth methods:', authMethodsData);
          
          if (userData.data?.user) {
            set({ 
              user: userData.data.user,
              authMethods: authMethodsData.authMethods || [],
              isAuthenticated: true, 
              isLoading: false 
            });
          } else if (userData.user) {
            set({ 
              user: userData.user,
              authMethods: authMethodsData.authMethods || [],
              isAuthenticated: true, 
              isLoading: false 
            });
          }
        } catch (error) {
          console.error('Error refreshing user data:', error);
          set({ user: null, authMethods: null, isAuthenticated: false, isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        authMethods: state.authMethods,
        isAuthenticated: state.isAuthenticated,
        isLoading: false
      }),
      onRehydrateStorage: () => (state) => {
        console.log('Store rehydrated from localStorage:', state);
        // Ensure authMethods is initialized if not present
        if (state && !state.authMethods) {
          state.authMethods = null;
        }
        // After rehydration, we'll check auth status in checkAuthStatus
      },
    }
  )
);
