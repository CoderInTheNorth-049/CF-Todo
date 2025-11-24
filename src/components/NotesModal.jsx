import { Modal } from 'antd';
import { lazy, Suspense } from 'react';
import { useDispatch } from 'react-redux';
import { updateProblem } from '../store/problemsSlice';

// Code-split the markdown editor - it will be loaded only when needed
const MDEditor = lazy(() => import('@uiw/react-md-editor'));

const NotesModal = ({ open, onClose, problem }) => {
  const dispatch = useDispatch();

  const handleSave = (newNotes) => {
    if (problem) {
      dispatch(updateProblem({
        id: problem.id,
        updates: { notes: newNotes },
      }));
    }
  };

  return (
    <Modal
      title={`Notes: ${problem?.name || 'Problem'}`}
      open={open}
      onCancel={onClose}
      width={800}
      footer={null}
      destroyOnClose
    >
      <Suspense fallback={<div style={{ padding: '20px', textAlign: 'center' }}>Loading editor...</div>}>
        <div data-color-mode="light">
          <MDEditor
            value={problem?.notes || ''}
            onChange={handleSave}
            height={400}
            preview="edit"
          />
        </div>
      </Suspense>
    </Modal>
  );
};

export default NotesModal;
