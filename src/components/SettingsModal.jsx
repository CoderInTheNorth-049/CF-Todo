import { useState, useEffect, memo } from 'react'
import { Modal, Input, Button, Space, Typography, Tag, App, Alert } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useDispatch, useSelector } from 'react-redux'
import { setStatusOptions } from '../store/settingsSlice'
import { resetAllStatuses } from '../store/problemsSlice'

const { Text, Paragraph } = Typography

const SettingsModal = memo(({ open, onClose }) => {
  const dispatch = useDispatch()
  const { message, modal } = App.useApp()
  const currentStatuses = useSelector(state => state.settings.statusOptions)
  const username = useSelector(state => state.settings.username)
  const problems = useSelector(state => state.problems.problems)

  const [statuses, setStatuses] = useState([...currentStatuses])
  const [inputValue, setInputValue] = useState('')

  // Reset local state when modal opens
  useEffect(() => {
    if (open) {
      setStatuses([...currentStatuses])
      setInputValue('')
    }
  }, [open, currentStatuses])

  const handleAddStatus = () => {
    if (!inputValue.trim()) {
      message.warning('Please enter a status name')
      return
    }

    if (statuses.includes(inputValue.trim())) {
      message.warning('This status already exists')
      return
    }

    setStatuses([...statuses, inputValue.trim()])
    setInputValue('')
  }

  const handleRemoveStatus = statusToRemove => {
    setStatuses(prevStatuses => prevStatuses.filter(s => s !== statusToRemove))
  }

  const hasChanges = () => {
    if (statuses.length !== currentStatuses.length) {
      return true
    }
    return statuses.some((status, index) => status !== currentStatuses[index])
  }

  const handleSave = () => {
    if (!hasChanges()) {
      message.info('No changes detected')
      onClose()
      return
    }

    if (statuses.length === 0) {
      message.error('You must have at least one status option')
      return
    }

    // Show destructive warning
    modal.confirm({
      title: '⚠️ Warning: Destructive Action',
      content: (
        <div>
          <Paragraph>
            Changing status definitions will{' '}
            <Text strong type="danger">
              invalidate the status of ALL problems
            </Text>{' '}
            currently in your table.
          </Paragraph>
          <Paragraph type="secondary">
            All problem statuses will be reset to null, and you'll need to
            reassign them using the bulk update tool.
          </Paragraph>
          <Paragraph strong>Are you sure you want to proceed?</Paragraph>
        </div>
      ),
      okText: 'Yes, Proceed',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => {
        dispatch(setStatusOptions(statuses))
        dispatch(resetAllStatuses())

        // Save to localStorage
        try {
          const state = {
            problems,
            settings: {
              statusOptions: statuses,
              username,
            },
          }
          localStorage.setItem('cf_todo_state', JSON.stringify(state))
        } catch (error) {
          console.error('Failed to save to localStorage:', error)
        }

        message.success(
          'Status options updated. All problem statuses have been reset.'
        )
        onClose()
      },
    })
  }

  return (
    <Modal
      title="Settings - Manage Status Options"
      open={open}
      onOk={handleSave}
      onCancel={onClose}
      width={600}
      okText="Save Changes"
      cancelText="Cancel"
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Alert
          message="Status Options"
          description="These are the options available in the Status dropdown for each problem. Be careful when modifying them!"
          type="info"
          showIcon
        />

        <div>
          <Text strong>Current Status Options:</Text>
          <div style={{ marginTop: '10px', marginBottom: '15px' }}>
            {statuses.map(status => (
              <Tag
                key={status}
                closable
                onClose={() => handleRemoveStatus(status)}
                color="blue"
                style={{
                  marginBottom: '8px',
                  padding: '4px 8px',
                  fontSize: '14px',
                }}
              >
                {status}
              </Tag>
            ))}
            {statuses.length === 0 && (
              <Text type="secondary">No status options defined</Text>
            )}
          </div>
        </div>

        <div>
          <Text strong>Add New Status:</Text>
          <Space style={{ marginTop: '10px', width: '100%' }}>
            <Input
              placeholder="e.g., need revision, skipped"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onPressEnter={handleAddStatus}
              style={{ width: '350px' }}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddStatus}
            >
              Add
            </Button>
          </Space>
        </div>

        {hasChanges() && (
          <Alert
            message="Unsaved Changes"
            description="You have made changes to the status options. Click 'Save Changes' to apply them."
            type="warning"
            showIcon
          />
        )}
      </Space>
    </Modal>
  )
})

SettingsModal.displayName = 'SettingsModal'

export default SettingsModal
