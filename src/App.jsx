import { useState, useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { App as AntApp, ConfigProvider } from 'antd'
import { store } from './store'
import { useDispatch, useSelector, Provider } from 'react-redux'
import { loadProblems } from './store/problemsSlice'
import { loadSettings } from './store/settingsSlice'
import Onboarding from './components/Onboarding'
import Header from './components/Header'
import ProblemsTable from './components/ProblemsTable'
import NotesModal from './components/NotesModal'
import SettingsModal from './components/SettingsModal'
import BulkUpdateBanner from './components/BulkUpdateBanner'
import './App.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

function AppContent() {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [notesModalOpen, setNotesModalOpen] = useState(false)
  const [selectedProblem, setSelectedProblem] = useState(null)
  const [initialized, setInitialized] = useState(false)

  const dispatch = useDispatch()
  const username = useSelector(state => state.settings.username)

  // Initialize app: load from localStorage
  useEffect(() => {
    const storedUsername = localStorage.getItem('codeforces_username')
    const storedState = localStorage.getItem('cf_todo_state')

    if (!storedUsername) {
      setShowOnboarding(true)
      setInitialized(true)
      return
    }

    if (storedState) {
      try {
        const state = JSON.parse(storedState)
        if (state.problems) {
          dispatch(loadProblems(state.problems))
        }
        if (state.settings) {
          dispatch(loadSettings(state.settings))
        }
      } catch (error) {
        console.error('Failed to load state from localStorage:', error)
      }
    } else {
      // Just load username
      dispatch(loadSettings({ username: storedUsername }))
    }

    setInitialized(true)
  }, [dispatch])

  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
  }

  const handleNotesClick = problem => {
    setSelectedProblem(problem)
    setNotesModalOpen(true)
  }

  const handleNotesClose = () => {
    setNotesModalOpen(false)
    setSelectedProblem(null)
  }

  if (!initialized) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        Loading...
      </div>
    )
  }

  if (showOnboarding || !username) {
    return <Onboarding onComplete={handleOnboardingComplete} />
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Header onSettingsClick={() => setSettingsOpen(true)} />
      <BulkUpdateBanner />
      <ProblemsTable onNotesClick={handleNotesClick} />

      <NotesModal
        open={notesModalOpen}
        onClose={handleNotesClose}
        problem={selectedProblem}
      />

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  )
}

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: '#1890ff',
            },
          }}
        >
          <AntApp>
            <AppContent />
          </AntApp>
        </ConfigProvider>
      </QueryClientProvider>
    </Provider>
  )
}

export default App
