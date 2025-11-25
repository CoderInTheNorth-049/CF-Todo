import { useState } from 'react'
import { Input, Button, Typography, Card, App } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import { useDispatch } from 'react-redux'
import { setUsername } from '../store/settingsSlice'

const { Title, Paragraph } = Typography

const Onboarding = ({ onComplete }) => {
  const [handle, setHandle] = useState('')
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch()
  const { message } = App.useApp()

  const handleSubmit = () => {
    if (!handle.trim()) {
      message.error('Please enter a valid Codeforces handle')
      return
    }

    setLoading(true)

    // Save to localStorage and Redux
    localStorage.setItem('codeforces_username', handle.trim())
    dispatch(setUsername(handle.trim()))

    setTimeout(() => {
      message.success('Username saved successfully!')
      onComplete()
    }, 500)
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
      }}
    >
      <Card
        style={{
          maxWidth: '500px',
          width: '100%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <Title level={2}>Welcome to CF Spaced Repetition! 🚀</Title>
          <Paragraph type="secondary">
            Track and master competitive programming problems with a spaced
            repetition approach.
          </Paragraph>
        </div>

        <div>
          <Paragraph strong>Enter your Codeforces handle:</Paragraph>
          <Input
            size="large"
            placeholder="e.g., tourist, Errichto"
            prefix={<UserOutlined />}
            value={handle}
            onChange={e => setHandle(e.target.value)}
            onPressEnter={handleSubmit}
            style={{ marginBottom: '20px' }}
          />

          <Button
            type="primary"
            size="large"
            block
            loading={loading}
            onClick={handleSubmit}
          >
            Get Started
          </Button>

          <Paragraph
            type="secondary"
            style={{ marginTop: '15px', fontSize: '12px', textAlign: 'center' }}
          >
            Your handle will be used to filter out already solved problems from
            contests.
          </Paragraph>
        </div>
      </Card>
    </div>
  )
}

export default Onboarding
