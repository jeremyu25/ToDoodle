import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { Status, Task } from '../types/types'

type SortOption = 'title' | 'status' | 'folder' | 'createdAt' | 'priority'
type SortDirection = 'asc' | 'desc'

interface FiltersState {
  // Filter states
  filterStatus: Status | "ALL"
  filterFolder: string | "ALL"
  searchTerm: string
  
  // Sort states
  sortBy: SortOption
  sortDirection: SortDirection
  
  // Actions
  setFilterStatus: (status: Status | "ALL") => void
  setFilterFolder: (folderId: string | "ALL") => void
  setSearchTerm: (term: string) => void
  setSortBy: (option: SortOption) => void
  setSortDirection: (direction: SortDirection) => void
  toggleSortDirection: () => void
  handleSort: (option: SortOption) => void
  
  // Utility functions
  filterTasks: (tasks: Task[]) => Task[]
  sortTasks: (tasks: Task[]) => Task[]
  getFilteredAndSortedTasks: (tasks: Task[]) => Task[]
  
  // Reset filters
  resetFilters: () => void
}

export const useFiltersStore = create<FiltersState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        filterStatus: "ALL",
        filterFolder: "ALL",
        searchTerm: "",
        sortBy: 'createdAt',
        sortDirection: 'desc',

        // Filter actions
        setFilterStatus: (status: Status | "ALL") => {
          set({ filterStatus: status })
        },

        setFilterFolder: (folderId: string | "ALL") => {
          set({ filterFolder: folderId })
        },

        setSearchTerm: (term: string) => {
          set({ searchTerm: term })
        },

        // Sort actions
        setSortBy: (option: SortOption) => {
          set({ sortBy: option })
        },

        setSortDirection: (direction: SortDirection) => {
          set({ sortDirection: direction })
        },

        toggleSortDirection: () => {
          set(state => ({
            sortDirection: state.sortDirection === 'asc' ? 'desc' : 'asc'
          }))
        },

        handleSort: (option: SortOption) => {
          const { sortBy, sortDirection } = get()
          
          if (sortBy === option) {
            // Toggle direction if same option
            set({ sortDirection: sortDirection === 'asc' ? 'desc' : 'asc' })
          } else {
            // Set new option with ascending direction
            set({ sortBy: option, sortDirection: 'asc' })
          }
        },

        // Utility functions
        filterTasks: (tasks: Task[]) => {
          const { filterStatus, filterFolder, searchTerm } = get()
          
          return tasks.filter((task) => {
            const matchesStatus = filterStatus === "ALL" || task.status === filterStatus
            const matchesFolder = filterFolder === "ALL" || task.folderId === filterFolder
            const matchesSearch = searchTerm === "" || 
              task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
              task.description.toLowerCase().includes(searchTerm.toLowerCase())
            
            return matchesStatus && matchesFolder && matchesSearch
          })
        },

        sortTasks: (tasks: Task[]) => {
          const { sortBy, sortDirection } = get()
          
          return [...tasks].sort((a, b) => {
            let aValue: any
            let bValue: any

            switch (sortBy) {
              case 'title':
                aValue = a.title.toLowerCase()
                bValue = b.title.toLowerCase()
                break
              case 'status':
                aValue = a.status
                bValue = b.status
                break
              case 'folder':
                aValue = a.folder?.name || 'No Folder'
                bValue = b.folder?.name || 'No Folder'
                break
              case 'createdAt':
                aValue = a.createdAt
                bValue = b.createdAt
                break
              case 'priority':
                // Custom priority: IN_PROGRESS > NOT_STARTED > COMPLETED
                const priorityOrder = { 'IN_PROGRESS': 3, 'NOT_STARTED': 2, 'COMPLETED': 1 }
                aValue = priorityOrder[a.status]
                bValue = priorityOrder[b.status]
                break
              default:
                return 0
            }

            if (aValue < bValue) {
              return sortDirection === 'asc' ? -1 : 1
            }
            if (aValue > bValue) {
              return sortDirection === 'asc' ? 1 : -1
            }
            return 0
          })
        },

        getFilteredAndSortedTasks: (tasks: Task[]) => {
          const { filterTasks, sortTasks } = get()
          const filtered = filterTasks(tasks)
          return sortTasks(filtered)
        },

        // Reset filters
        resetFilters: () => {
          set({
            filterStatus: "ALL",
            filterFolder: "ALL",
            searchTerm: "",
            sortBy: 'createdAt',
            sortDirection: 'desc'
          })
        }
      }),
      {
        name: 'filters-store',
        // Only persist filter preferences, not search term
        partialize: (state) => ({
          filterStatus: state.filterStatus,
          filterFolder: state.filterFolder,
          sortBy: state.sortBy,
          sortDirection: state.sortDirection
        })
      }
    ),
    { name: 'filters-store' }
  )
)