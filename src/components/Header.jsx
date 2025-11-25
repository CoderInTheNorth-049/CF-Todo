import { useState, useEffect, memo } from 'react'
import { Input, Button, Space, Typography, App } from 'antd'
import {
  LinkOutlined,
  PlusOutlined,
  SaveOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { useDispatch, useSelector } from 'react-redux'
import { addProblem, addProblems } from '../store/problemsSlice'
import { useCodeforcesProblems } from '../hooks/useCodeforcesProblems'

const { Text } = Typography

const Header = memo(({ onSettingsClick }) => {
  const [url, setUrl] = useState('')
  const [shouldFetch, setShouldFetch] = useState(false)
  const dispatch = useDispatch()
  const { message } = App.useApp()
  const username = useSelector(state => state.settings.username)
  const problems = useSelector(state => state.problems.problems)
  const statusOptions = useSelector(state => state.settings.statusOptions)

  const { data, isLoading, error, isSuccess } = useCodeforcesProblems(
    url,
    username,
    shouldFetch
  )

  useEffect(() => {
    if (isSuccess && data && shouldFetch) {
      if (data.length === 0) {
        message.info(
          'No unsolved problems found or all problems are already solved!'
        )
      } else {
        dispatch(addProblems(data))
        message.success(`Added ${data.length} problem(s) successfully!`)
      }
      setUrl('')
      setShouldFetch(false)
    }
  }, [isSuccess, data, shouldFetch, dispatch, message])

  useEffect(() => {
    if (error && shouldFetch) {
      message.error(error.message || 'Failed to fetch problems')
      setShouldFetch(false)
    }
  }, [error, shouldFetch, message])

  const handleUrlChange = e => {
    const newUrl = e.target.value
    setUrl(newUrl)

    // Auto-trigger fetch when URL is pasted
    if (newUrl.includes('codeforces.com') && !isLoading && !shouldFetch) {
      setShouldFetch(true)
    }
  }

  const handleManualAdd = () => {
    dispatch(
      addProblem({
        name: 'New Problem',
        url: 'https://codeforces.com/',
        rating: 0,
        tags: [],
      })
    )
    message.success('Added blank problem. Click edit icon to fill details.')
  }

  const handleSyncToLocalStorage = () => {
    try {
      const state = {
        problems,
        settings: {
          statusOptions,
          username,
        },
      }
      localStorage.setItem('cf_todo_state', JSON.stringify(state))
      message.success('Successfully synced to Local Storage!')
    } catch (error) {
      message.error('Failed to sync to Local Storage: ' + error.message)
    }
  }

  return (
    <div
      style={{
        padding: '20px',
        background: '#fff',
        borderBottom: '1px solid #f0f0f0',
      }}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <div>
            <Text strong style={{ fontSize: '18px' }}>
              CF Spaced Repetition Tracker
            </Text>
            <Text type="secondary" style={{ marginLeft: '15px' }}>
              User: <Text code>{username}</Text>
            </Text>
          </div>

          <Space>
            <Button icon={<SaveOutlined />} onClick={handleSyncToLocalStorage}>
              Sync to Local Storage
            </Button>
            <Button icon={<SettingOutlined />} onClick={onSettingsClick}>
              Settings
            </Button>
          </Space>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
          }}
        >
          <Input
            placeholder="Paste Codeforces contest or problem URL here..."
            prefix={<LinkOutlined />}
            value={url}
            onChange={handleUrlChange}
            loading={isLoading}
            style={{ flex: 1, minWidth: '300px' }}
            size="large"
          />

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleManualAdd}
            size="large"
          >
            Add Manually
          </Button>
        </div>

        {isLoading && (
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Fetching problems from Codeforces...
          </Text>
        )}
      </Space>
    </div>
  )
})

Header.displayName = 'Header'

export default Header
