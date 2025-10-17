const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api/v1`;

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Helper function to get auth headers
const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  credentials: 'include' as RequestCredentials,
});

// Notes API
export const notesApi = {
  // Get all notes for a user (no userId needed since we use auth token)
  getAllNotes: async () => {
    const response = await fetch(`${API_BASE_URL}/note`, {
      method: 'GET',
      ...getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get a single note by ID
  getNote: async (noteId: string) => {
    const response = await fetch(`${API_BASE_URL}/note/${noteId}`, {
      method: 'GET',
      ...getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Create a new note
  createNote: async (folderId: string, title: string, content: string, status: string = 'not_started') => {
    const response = await fetch(`${API_BASE_URL}/note`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ folder_id: folderId, title, content, status }),
    });
    return handleResponse(response);
  },

  // Update note content
  updateNoteContent: async (noteId: string, content: string) => {
    const response = await fetch(`${API_BASE_URL}/note/${noteId}/content`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ content }),
    });
    return handleResponse(response);
  },

  // Update note status
  updateNoteStatus: async (noteId: string, status: string) => {
    const response = await fetch(`${API_BASE_URL}/note/${noteId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ status }),
    });
    return handleResponse(response);
  },

  // Update note title
  updateNoteTitle: async (noteId: string, title: string) => {
    const response = await fetch(`${API_BASE_URL}/note/${noteId}/title`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ title }),
    });
    return handleResponse(response);
  },

  // Delete a note
  deleteNote: async (noteId: string) => {
    const response = await fetch(`${API_BASE_URL}/note/${noteId}`, {
      method: 'DELETE',
      ...getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Delete all notes for a user
  deleteAllNotes: async () => {
    const response = await fetch(`${API_BASE_URL}/note`, {
      method: 'DELETE',
      ...getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Folders API
export const foldersApi = {
  // Get all folders for a user
  getAllFolders: async () => {
    const response = await fetch(`${API_BASE_URL}/folder`, {
      method: 'GET',
      ...getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get a single folder by ID
  getFolder: async (folderId: string) => {
    const response = await fetch(`${API_BASE_URL}/folder/${folderId}`, {
      method: 'GET',
      ...getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Create a new folder
  createFolder: async (name: string, description?: string) => {
    const response = await fetch(`${API_BASE_URL}/folder`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ name, description }),
    });
    return handleResponse(response);
  },

  // Update folder name
  updateFolderName: async (folderId: string, name: string) => {
    const response = await fetch(`${API_BASE_URL}/folder/${folderId}/name`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ name }),
    });
    return handleResponse(response);
  },

  // Update folder description
  updateFolderDescription: async (folderId: string, description: string) => {
    const response = await fetch(`${API_BASE_URL}/folder/${folderId}/description`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ description }),
    });
    return handleResponse(response);
  },

  // Delete a folder
  deleteFolder: async (folderId: string) => {
    const response = await fetch(`${API_BASE_URL}/folder/${folderId}`, {
      method: 'DELETE',
      ...getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Delete all folders for a user
  deleteAllFolders: async () => {
    const response = await fetch(`${API_BASE_URL}/folder`, {
      method: 'DELETE',
      ...getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Auth API
export const authApi = {
  // Sign up a new user
  signUp: async (username: string, email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ username, email, password }),
    });
    return handleResponse(response);
  },

  // Sign in user
  signIn: async (usernameOrEmail: string, password: string) => {
    const isEmail = usernameOrEmail.includes('@');
    const body = isEmail 
      ? { email: usernameOrEmail, password }
      : { username: usernameOrEmail, password };

    const response = await fetch(`${API_BASE_URL}/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(body),
    });
    return handleResponse(response);
  },

  // Sign out user
  signOut: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/signout`, {
      method: 'POST',
      credentials: 'include',
    });
    return handleResponse(response);
  },

  // Verify user session
  verifyUser: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      method: 'GET',
      credentials: 'include',
    });
    return handleResponse(response);
  },

  // Verify email with token
  verifyEmail: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/verify-email?token=${token}`, {
      method: 'GET',
      credentials: 'include',
    });
    return handleResponse(response);
  },

  // Resend verification email
  resendVerification: async (email: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email }),
    });
    return handleResponse(response);
  },

  // Delete user account
  deleteUser: async (userId: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/delete/${userId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    return handleResponse(response);
  },

  // Update username (placeholder - needs backend implementation)
  updateUsername: async (userId: string, username: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/update-username`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ userId, username }),
    });
    return handleResponse(response);
  },

  // Update email (placeholder - needs backend implementation)
  updateEmail: async (userId: string, email: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/update-email`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ userId, email }),
    });
    return handleResponse(response);
  },

  // Update password (placeholder - needs backend implementation)
  updatePassword: async (userId: string, currentPassword: string, newPassword: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/update-password`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ userId, currentPassword, newPassword }),
    });
    return handleResponse(response);
  },

  // Verify email change with token
  verifyEmailChange: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/verify-email-change?token=${token}`, {
      method: 'GET',
      credentials: 'include',
    });
    return handleResponse(response);
  },

  // Get pending email change
  getPendingEmailChange: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/pending-email-change`, {
      method: 'GET',
      credentials: 'include',
    });
    return handleResponse(response);
  },

  // Cancel pending email change
  cancelPendingEmailChange: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/pending-email-change`, {
      method: 'DELETE',
      credentials: 'include',
    });
    return handleResponse(response);
  },

  // Get current user data
  getCurrentUser: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/user`, {
      method: 'GET',
      credentials: 'include',
    });
    return handleResponse(response);
  },

  // Get user authentication methods
  getUserAuthMethods: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/user/auth-methods`, {
      method: 'GET',
      credentials: 'include',
    });
    return handleResponse(response);
  },

  // Add local password for OAuth users
  addLocalPassword: async (password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/add-local-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ password }),
    });
    return handleResponse(response);
  },

  // Remove OAuth authentication method
  removeOAuthMethod: async (provider: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/remove-oauth-method`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ provider }),
    });
    return handleResponse(response);
  },
};
