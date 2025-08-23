const API_BASE_URL = 'http://localhost:3001/api/v1';

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
  // Get all notes for a user
  getAllNotes: async (userId: string) => {
    const response = await fetch(`${API_BASE_URL}/note/all?user_id=${userId}`, {
      method: 'GET',
      ...getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get a single note by ID
  getNote: async (noteId: string) => {
    const response = await fetch(`${API_BASE_URL}/note?id=${noteId}`, {
      method: 'GET',
      ...getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Create a new note
  createNote: async (userId: string, folderId: string, title: string, content: string, status: string = 'not_started') => {
    const response = await fetch(`${API_BASE_URL}/note?user_id=${userId}&folder_id=${folderId}&title=${encodeURIComponent(title)}&content=${encodeURIComponent(content)}&status=${encodeURIComponent(status)}`, {
      method: 'POST',
      ...getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Update note content
  updateNoteContent: async (noteId: string, content: string) => {
    const response = await fetch(`${API_BASE_URL}/note/content?id=${noteId}&content=${encodeURIComponent(content)}`, {
      method: 'PUT',
      ...getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Update note status
  updateNoteStatus: async (noteId: string, status: string) => {
    const response = await fetch(`${API_BASE_URL}/note/status/?id=${noteId}&status=${encodeURIComponent(status)}`, {
      method: 'PUT',
      ...getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Update note title
  updateNoteTitle: async (noteId: string, title: string) => {
    const response = await fetch(`${API_BASE_URL}/note/title?id=${noteId}&title=${encodeURIComponent(title)}`, {
      method: 'PUT',
      ...getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Delete a note
  deleteNote: async (noteId: string) => {
    const response = await fetch(`${API_BASE_URL}/note?id=${noteId}`, {
      method: 'DELETE',
      ...getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Delete all notes for a user
  deleteAllNotes: async (userId: string) => {
    const response = await fetch(`${API_BASE_URL}/note/all?user_id=${userId}`, {
      method: 'DELETE',
      ...getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Folders API
export const foldersApi = {
  // Get all folders for a user
  getAllFolders: async (userId: string) => {
    const response = await fetch(`${API_BASE_URL}/folder/all?user_id=${userId}`, {
      method: 'GET',
      ...getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get a single folder by ID
  getFolder: async (folderId: string) => {
    const response = await fetch(`${API_BASE_URL}/folder?id=${folderId}`, {
      method: 'GET',
      ...getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Create a new folder
  createFolder: async (userId: string, name: string) => {
    const response = await fetch(`${API_BASE_URL}/folder?user_id=${userId}&name=${encodeURIComponent(name)}`, {
      method: 'POST',
      ...getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Update folder name
  updateFolder: async (folderId: string, name: string) => {
    const response = await fetch(`${API_BASE_URL}/folder?id=${folderId}&name=${encodeURIComponent(name)}`, {
      method: 'PUT',
      ...getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Delete a folder
  deleteFolder: async (folderId: string) => {
    const response = await fetch(`${API_BASE_URL}/folder?id=${folderId}`, {
      method: 'DELETE',
      ...getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Delete all folders for a user
  deleteAllFolders: async (userId: string) => {
    const response = await fetch(`${API_BASE_URL}/folder/all?user_id=${userId}`, {
      method: 'DELETE',
      ...getAuthHeaders(),
    });
    return handleResponse(response);
  },
};
