import { Modal, App } from 'antd'
import { lazy, Suspense, useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { updateProblem } from '../store/problemsSlice'

// Code-split the markdown editor - it will be loaded only when needed
const MDEditor = lazy(() => import('@uiw/react-md-editor'))

const NotesModal = ({ open, onClose, problem }) => {
  const dispatch = useDispatch()
  const { message } = App.useApp()

  const [localNotes, setLocalNotes] = useState('')

  // Reset local state when modal opens or problem changes
  useEffect(() => {
    if (open && problem) {
      setLocalNotes(problem.notes || '')
    }
  }, [open, problem])

  const handleOk = () => {
    if (problem) {
      dispatch(
        updateProblem({
          id: problem.id,
          updates: { notes: localNotes },
        })
      )

      message.success('Notes saved successfully!')
      onClose()
    }
  }

  const handleCancel = () => {
    // Local state will be reset by useEffect when modal reopens
    onClose()
  }

  return (
    <Modal
      title={`Notes: ${problem?.name || 'Problem'}`}
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      width={900}
      okText="Save Notes"
      cancelText="Cancel"
      styles={{
        body: {
          maxHeight: '70vh',
          overflowY: 'auto',
        },
      }}
    >
      <Suspense
        fallback={
          <div style={{ padding: '20px', textAlign: 'center' }}>
            Loading editor...
          </div>
        }
      >
        <div data-color-mode="light">
          <MDEditor
            value={localNotes}
            onChange={value => setLocalNotes(value || '')}
            height={500}
            preview="edit"
            toolbarCommands={[
              'bold',
              'italic',
              'strikethrough',
              'hr',
              'title',
              'divider',
              'link',
              'quote',
              'code',
              'codeBlock',
              'divider',
              'unorderedListCommand',
              'orderedListCommand',
              'checkedListCommand',
              'divider',
              'table',
              'divider',
              'help',
            ]}
          />
        </div>
      </Suspense>
    </Modal>
  )
}

export default NotesModal
