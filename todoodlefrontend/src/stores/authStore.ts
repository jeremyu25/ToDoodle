import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Helper function to get cookie value by name
const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

// Helper function to decode JWT token (without verification)
const decodeJWT = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

// Helper function to check if JWT token is expired
const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = decodeJWT(token);
    if (!decoded || !decoded.exp) return true;
    
    // exp is in seconds, Date.now() is in milliseconds
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

interface User {
  id: string;
  username: string;
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
  isTokenValid: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      login: (userData: User) => {
        set({ user: userData, isAuthenticated: true });
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
        
        // Clear the cookie by setting it to expire in the past
        document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      checkAuthStatus: async () => {
        try {
          set({ isLoading: true });
          
          // Check if we have a valid JWT token in cookies
          const token = getCookie('access_token');
          
          if (token && !isTokenExpired(token)) {
            // Token exists and is not expired, check if we have user data stored
            try {
              const decodedToken = decodeJWT(token);
              if (decodedToken && decodedToken.id) {
                const storedUser = localStorage.getItem('auth-storage');
                if (storedUser) {
                  const parsed = JSON.parse(storedUser);
                  if (parsed.state?.user) {
                    set({ 
                      user: parsed.state.user, 
                      isAuthenticated: true, 
                      isLoading: false 
                    });
                    return;
                  }
                }
              }
            } catch (error) {
              console.log('Invalid token, clearing auth state');
            }
          } else if (token && isTokenExpired(token)) {
            // Token is expired, clear it
            document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          }
          
          // No valid token or user data
          set({ user: null, isAuthenticated: false, isLoading: false });
        } catch (error) {
          console.error('Auth check failed:', error);
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      isTokenValid: () => {
        const token = getCookie('access_token');
        return token ? !isTokenExpired(token) : false;
      },
    }),
    {
      name: 'auth-storage', // unique name for localStorage key
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }), // only persist these fields
    }
  )
);
