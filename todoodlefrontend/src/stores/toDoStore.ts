import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { Task, Folder, Status } from '../types/types'
import { notesApi, foldersApi } from '../services/api'
import { noteToTask, taskToNote, addDefaultColors, normalizeHexColor } from '../utils/dataTransformers'
import { useUIStore } from './uiStore'

interface TodoState {
  // Data
  tasks: Task[]
  folders: Folder[]
  isLoading: boolean
  error: string | null

  // Actions
  loadData: (userId: string) => Promise<void>
  
  // Task actions
  addTask: (newTask: Omit<Task, "id" | "createdAt">) => Promise<void>
  updateTask: (updatedTask: Task, userId: string) => Promise<void>
  updateTaskStatus: (id: string, newStatus: Status, userId: string) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  
  // Folder actions
  createFolder: (folderName: string, description?: string, color?: string) => Promise<void>
  updateFolder: (folderId: string, folderName: string) => Promise<void>
  updateFolderColor: (folderId: string, color: string) => Promise<void>
  updateFolderDescription: (folderId: string, description: string) => Promise<void>
  deleteFolder: (folderId: string) => Promise<void>
  
  // Utility functions
  getStatusCount: (status: Status) => number
  getFolderCount: (folderId: string) => number
  
  // State management
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

export const useTodoStore = create<TodoState>()(
  devtools(
    (set, get) => ({
      // Initial state
      tasks: [],
      folders: [],
      isLoading: false,
      error: null,

      // Load data from backend
      loadData: async (userId: string) => {
        if (!userId) return

        try {
          set({ isLoading: true, error: null })

          // Load folders first
          const foldersResponse = await foldersApi.getAllFolders()
          const backendFolders = foldersResponse.data.folderdata || []
          const foldersWithColors = addDefaultColors(backendFolders)

          // Load notes/tasks
          const notesResponse = await notesApi.getAllNotes()
          const backendNotes = notesResponse.data.notedata || []
          const tasksFromNotes = backendNotes.map((note: any) => 
            noteToTask(note, foldersWithColors)
          )

          set({ 
            folders: foldersWithColors, 
            tasks: tasksFromNotes, 
            isLoading: false 
          })
        } catch (err) {
          console.error('Error loading data:', err)
          set({ 
            error: err instanceof Error ? err.message : 'Failed to load data',
            isLoading: false 
          })
        }
      },

      // Task actions
      addTask: async (newTask: Omit<Task, "id" | "createdAt">) => {
        try {
          set({ isLoading: true })
          const response = await notesApi.createNote(
            newTask.folderId || '',
            newTask.title,
            newTask.description,
            newTask.status?.toLowerCase() || 'not_started'
          )

          const createdNote = response.data
          const createdTask = noteToTask(createdNote, get().folders)

          set(state => ({ 
            tasks: [...state.tasks, createdTask],
            isLoading: false
          }))
        } catch (err) {
          console.error('Error creating task:', err)
          set({ 
            error: err instanceof Error ? err.message : 'Failed to create task',
            isLoading: false
          })
        }
      },

      updateTask: async (updatedTask: Task, userId: string) => {
        try {
          set({ isLoading: true })
          const { tasks } = get()
          const originalTask = tasks.find(t => t.id === updatedTask.id)
          if (!originalTask) return

          const noteData = taskToNote(updatedTask, userId)

          // Update title if changed
          if (updatedTask.title !== originalTask.title) {
            await notesApi.updateNoteTitle(updatedTask.id, updatedTask.title)
          }

          // Update content if changed
          if (updatedTask.description !== originalTask.description) {
            await notesApi.updateNoteContent(updatedTask.id, noteData.content)
          }

          // Update status if changed
          if (updatedTask.status !== originalTask.status) {
            await notesApi.updateNoteStatus(updatedTask.id, noteData.status)
          }

          set(state => ({
            tasks: state.tasks.map(task => 
              task.id === updatedTask.id ? updatedTask : task
            ),
            isLoading: false
          }))
          useUIStore.getState().updateSelectedTask(updatedTask)
        } catch (err) {
          console.error('Error updating task:', err)
          set({ 
            error: err instanceof Error ? err.message : 'Failed to update task',
            isLoading: false
          })
        }
      },

      updateTaskStatus: async (id: string, newStatus: Status, userId: string) => {
        try {
          set({ isLoading: true })
          const { tasks } = get()
          const task = tasks.find(t => t.id === id)
          if (!task) return

          const updatedTask = { ...task, status: newStatus }
          const noteData = taskToNote(updatedTask, userId)

          await notesApi.updateNoteStatus(id, noteData.status)
          
          set(state => ({
            tasks: state.tasks.map(task => 
              task.id === id ? updatedTask : task
            ),
            isLoading: false
          }))
          useUIStore.getState().updateSelectedTask(updatedTask)
        } catch (err) {
          console.error('Error updating task status:', err)
          set({ 
            error: err instanceof Error ? err.message : 'Failed to update task status',
            isLoading: false
          })
        }
      },

      deleteTask: async (id: string) => {
        try {
          set({ isLoading: true })
          await notesApi.deleteNote(id)
          
          set(state => ({
            tasks: state.tasks.filter(task => task.id !== id),
            isLoading: false
          }))
        } catch (err) {
          console.error('Error deleting task:', err)
          set({ 
            error: err instanceof Error ? err.message : 'Failed to delete task',
            isLoading: false
          })
        }
      },

      // Folder actions
      createFolder: async (folderName: string, description?: string, color?: string) => {
        if (!folderName.trim()) return

        try {
          set({ isLoading: true })
          const normalizedColor = normalizeHexColor(color) // Will be null if invalid/empty
          const response = await foldersApi.createFolder(folderName.trim(), description, normalizedColor || undefined)
          const createdFolder = response.data
          const folderWithColor = addDefaultColors([createdFolder])[0]

          set(state => ({
            folders: [...state.folders, folderWithColor],
            isLoading: false
          }))
        } catch (err) {
          console.error('Error creating folder:', err)
          set({ 
            error: err instanceof Error ? err.message : 'Failed to create folder',
            isLoading: false
          })
        }
      },

      updateFolder: async (folderId: string, folderName: string) => {
        if (!folderName.trim()) return

        try {
          set({ isLoading: true })
          await foldersApi.updateFolderName(folderId, folderName.trim())

          set(state => ({
            folders: state.folders.map(folder =>
              folder.id === folderId
                ? { ...folder, name: folderName.trim() }
                : folder
            ),
            // Keep task.folder in sync when a folder is renamed
            tasks: state.tasks.map(task =>
              task.folderId === folderId && task.folder
                ? { ...task, folder: { ...task.folder, name: folderName.trim() } }
                : task
            ),
            isLoading: false
          }))
        } catch (err) {
          console.error('Error updating folder:', err)
          set({ 
            error: err instanceof Error ? err.message : 'Failed to update folder',
            isLoading: false
          })
        }
      },

      deleteFolder: async (folderId: string) => {
        try {
          set({ isLoading: true })
          await foldersApi.deleteFolder(folderId)

          set(state => ({
            folders: state.folders.filter(f => f.id !== folderId),
            isLoading: false
          }))
        } catch (err) {
          console.error('Error deleting folder:', err)
          set({ 
            error: err instanceof Error ? err.message : 'Failed to delete folder',
            isLoading: false
          })
        }
      },

      updateFolderColor: async (folderId: string, color: string) => {
        try {
          set({ isLoading: true })
          const normalizedColor = normalizeHexColor(color)
          await foldersApi.updateFolderColor(folderId, normalizedColor)

          set(state => ({
            folders: state.folders.map(folder =>
              folder.id === folderId ? { ...folder, color: normalizedColor || folder.color } : folder
            ),
            // Update tasks that reference this folder so their displayed badge color updates immediately
            tasks: state.tasks.map(task =>
              task.folderId === folderId && task.folder
                ? { ...task, folder: { ...task.folder, color: normalizedColor || task.folder.color } }
                : task
            ),
            isLoading: false
          }))
        } catch (err) {
          console.error('Error updating folder color:', err)
          set({ 
            error: err instanceof Error ? err.message : 'Failed to update folder color',
            isLoading: false
          })
        }
      },

      updateFolderDescription: async (folderId: string, description: string) => {
        try {
          set({ isLoading: true })
          await foldersApi.updateFolderDescription(folderId, description)

          set(state => ({
            folders: state.folders.map(folder =>
              folder.id === folderId ? { ...folder, description } : folder
            ),
            // Keep task.folder description in sync
            tasks: state.tasks.map(task =>
              task.folderId === folderId && task.folder
                ? { ...task, folder: { ...task.folder, description } }
                : task
            ),
            isLoading: false
          }))
        } catch (err) {
          console.error('Error updating folder description:', err)
          set({ 
            error: err instanceof Error ? err.message : 'Failed to update folder description',
            isLoading: false
          })
        }
      },

      // Utility functions
      getStatusCount: (status: Status) => {
        const { tasks } = get()
        return tasks.filter(task => task.status === status).length
      },

      getFolderCount: (folderId: string) => {
        const { tasks } = get()
        return tasks.filter(task => task.folderId === folderId).length
      },

      // State management
      setLoading: (loading: boolean) => set({ isLoading: loading }),
      setError: (error: string | null) => set({ error }),
      clearError: () => set({ error: null })
    }),
    { name: 'todo-store' }
  )
)