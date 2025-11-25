import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  problems: [], // Array of problem objects
  editingRowId: null, // ID of the row currently in edit mode
}

const problemsSlice = createSlice({
  name: 'problems',
  initialState,
  reducers: {
    // Add a single problem
    addProblem: (state, action) => {
      const newProblem = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: action.payload.name || '',
        url: action.payload.url || '',
        rating: action.payload.rating || 0,
        tags: action.payload.tags || [],
        status: null,
        notes: action.payload.notes || '',
        createdAt: new Date().toISOString(),
      }
      state.problems.push(newProblem)
    },

    // Add multiple problems (for contest fetching)
    addProblems: (state, action) => {
      const newProblems = action.payload.map(problem => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: problem.name || '',
        url: problem.url || '',
        rating: problem.rating || 0,
        tags: problem.tags || [],
        status: null,
        notes: '',
        createdAt: new Date().toISOString(),
      }))
      state.problems.push(...newProblems)
    },

    // Update a problem
    updateProblem: (state, action) => {
      const { id, updates } = action.payload
      const problemIndex = state.problems.findIndex(p => p.id === id)
      if (problemIndex !== -1) {
        state.problems[problemIndex] = {
          ...state.problems[problemIndex],
          ...updates,
        }
      }
    },

    // Delete a problem
    deleteProblem: (state, action) => {
      state.problems = state.problems.filter(p => p.id !== action.payload)
    },

    // Set editing row
    setEditingRow: (state, action) => {
      state.editingRowId = action.payload
    },

    // Update all problem statuses (for settings change)
    resetAllStatuses: state => {
      state.problems.forEach(problem => {
        problem.status = null
      })
    },

    // Bulk update status
    bulkUpdateStatus: (state, action) => {
      const newStatus = action.payload
      state.problems.forEach(problem => {
        problem.status = newStatus
      })
    },

    // Load problems from localStorage
    loadProblems: (state, action) => {
      state.problems = action.payload
    },

    // Clear all problems
    clearProblems: state => {
      state.problems = []
      state.editingRowId = null
    },
  },
})

export const {
  addProblem,
  addProblems,
  updateProblem,
  deleteProblem,
  setEditingRow,
  resetAllStatuses,
  bulkUpdateStatus,
  loadProblems,
  clearProblems,
} = problemsSlice.actions

export default problemsSlice.reducer
