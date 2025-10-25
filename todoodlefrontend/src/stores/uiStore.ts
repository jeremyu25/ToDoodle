import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { Task, Folder } from '../types/types'
import { normalizeHexColor } from '../utils/dataTransformers'

interface UIState {
  // Modal states
  isModalOpen: boolean
  selectedTask: Task | null
  
  // Form states
  showForm: boolean
  showFolderForm: boolean
  
  // Folder editing states
  editingFolder: Folder | null
  editFolderName: string
  editFolderColor: string
  editFolderDescription: string
  
  // Actions
  // Modal actions
  openTaskModal: (task: Task) => void
  closeTaskModal: () => void
  updateSelectedTask: (task: Task) => void
  
  // Form actions
  toggleTaskForm: () => void
  setShowTaskForm: (show: boolean) => void
  toggleFolderForm: () => void
  setShowFolderForm: (show: boolean) => void
  
  // Folder editing actions
  startEditingFolder: (folder: Folder) => void
  updateEditFolderName: (name: string) => void
  updateEditFolderColor: (color: string) => void
  updateEditFolderDescription: (description: string) => void
  cancelEditingFolder: () => void
  
  // Reset all UI state
  resetUI: () => void
}

export const useUIStore = create<UIState>()(
  devtools(
    (set) => ({
      // Initial state
      isModalOpen: false,
      selectedTask: null,
      showForm: false,
      showFolderForm: false,
      editingFolder: null,
      editFolderName: "",
      editFolderColor: "",

      // Modal actions
      openTaskModal: (task: Task) => {
        set({ 
          selectedTask: task, 
          isModalOpen: true 
        })
      },

      closeTaskModal: () => {
        set({ 
          isModalOpen: false, 
          selectedTask: null 
        })
      },

      updateSelectedTask: (task: Task) => {
        set(state => ({
          selectedTask: state.selectedTask?.id === task.id ? task : state.selectedTask
        }))
      },

      // Form actions
      toggleTaskForm: () => {
        set(state => ({ 
          showForm: !state.showForm 
        }))
      },

      setShowTaskForm: (show: boolean) => {
        set({ showForm: show })
      },

      toggleFolderForm: () => {
        set(state => ({ 
          showFolderForm: !state.showFolderForm 
        }))
      },

      setShowFolderForm: (show: boolean) => {
        set({ showFolderForm: show })
      },

      // Folder editing actions
      startEditingFolder: (folder: Folder) => {
        set({ 
          editingFolder: folder,
          editFolderName: folder.name,
          editFolderColor: normalizeHexColor(folder.color) || '#A8BBA0',
          editFolderDescription: folder.description || ''
        })
      },

      updateEditFolderName: (name: string) => {
        set({ editFolderName: name })
      },

      updateEditFolderColor: (color: string) => {
        set({ editFolderColor: color })
      },

      updateEditFolderDescription: (description: string) => {
        set({ editFolderDescription: description })
      },

      cancelEditingFolder: () => {
        set({ 
          editingFolder: null,
          editFolderName: "",
          editFolderColor: "",
          editFolderDescription: ""
        })
      },

      // Reset all UI state
      resetUI: () => {
        set({
          isModalOpen: false,
          selectedTask: null,
          showForm: false,
          showFolderForm: false,
          editingFolder: null,
          editFolderName: "",
          editFolderColor: ""
        })
      }
    }),
    { name: 'ui-store' }
  )
)