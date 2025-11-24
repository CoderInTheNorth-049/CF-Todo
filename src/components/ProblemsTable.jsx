import { useState, memo, useCallback } from 'react';
import { Table, Tag, Input, InputNumber, Select, Button, Space, App } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { updateProblem, deleteProblem } from '../store/problemsSlice';

// Memoized components for better performance
const ProblemNameView = memo(({ name, url }) => (
  <a href={url} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 500 }}>
    {name || 'Untitled Problem'}
  </a>
));
ProblemNameView.displayName = 'ProblemNameView';

const ProblemNameEdit = memo(({ name, url, onChange }) => (
  <Space direction="vertical" style={{ width: '100%' }}>
    <Input
      placeholder="Display Name"
      value={name}
      onChange={(e) => onChange('name', e.target.value)}
      size="small"
    />
    <Input
      placeholder="Problem URL"
      value={url}
      onChange={(e) => onChange('url', e.target.value)}
      size="small"
    />
  </Space>
));
ProblemNameEdit.displayName = 'ProblemNameEdit';

const RatingView = memo(({ rating }) => (
  <span style={{ color: rating === 0 ? '#999' : '#000' }}>
    {rating === 0 ? 'Unrated' : rating}
  </span>
));
RatingView.displayName = 'RatingView';

const RatingEdit = memo(({ rating, onChange }) => (
  <InputNumber
    value={rating}
    onChange={(value) => onChange('rating', value || 0)}
    min={0}
    max={5000}
    style={{ width: '100%' }}
    size="small"
  />
));
RatingEdit.displayName = 'RatingEdit';

const TagsView = memo(({ tags }) => {
  if (!tags || tags.length === 0) {
    return <Tag color="default">no tags for now</Tag>;
  }
  return (
    <>
      {tags.map((tag, index) => (
        <Tag key={index} color="blue" style={{ marginBottom: '4px' }}>
          {tag}
        </Tag>
      ))}
    </>
  );
});
TagsView.displayName = 'TagsView';

const TagsEdit = memo(({ tags, onChange }) => {
  const [inputValue, setInputValue] = useState('');
  const [pendingTags, setPendingTags] = useState([...tags]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.shiftKey) {
      // Shift+Enter: Add to pending tags
      e.preventDefault();
      if (inputValue.trim() && !pendingTags.includes(inputValue.trim())) {
        setPendingTags([...pendingTags, inputValue.trim()]);
        setInputValue('');
      }
    } else if (e.key === 'Enter' && !e.shiftKey) {
      // Enter: Save all pending tags
      e.preventDefault();
      onChange('tags', pendingTags);
    }
  };

  const removeTag = (tagToRemove) => {
    setPendingTags(pendingTags.filter(tag => tag !== tagToRemove));
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Input
        placeholder="Type tag, Shift+Enter to add, Enter to save"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        size="small"
      />
      <div>
        {pendingTags.map((tag, index) => (
          <Tag
            key={index}
            closable
            onClose={() => removeTag(tag)}
            color="blue"
            style={{ marginBottom: '4px' }}
          >
            {tag}
          </Tag>
        ))}
      </div>
    </Space>
  );
});
TagsEdit.displayName = 'TagsEdit';

const ProblemsTable = memo(({ onNotesClick }) => {
  const [editingRowId, setEditingRowId] = useState(null);
  const [editData, setEditData] = useState({});
  const dispatch = useDispatch();
  const { message } = App.useApp();
  
  const problems = useSelector(state => state.problems.problems);
  const statusOptions = useSelector(state => state.settings.statusOptions);

  const handleEdit = useCallback((record) => {
    setEditingRowId(record.id);
    setEditData({ ...record });
  }, []);

  const handleSave = useCallback((id) => {
    dispatch(updateProblem({ id, updates: editData }));
    setEditingRowId(null);
    setEditData({});
    message.success('Problem updated successfully!');
  }, [editData, dispatch, message]);

  const handleCancel = useCallback(() => {
    setEditingRowId(null);
    setEditData({});
  }, []);

  const handleDelete = useCallback((id) => {
    dispatch(deleteProblem(id));
    message.success('Problem deleted successfully!');
  }, [dispatch, message]);

  const handleStatusChange = useCallback((id, status) => {
    dispatch(updateProblem({ id, updates: { status } }));
  }, [dispatch]);

  const handleEditDataChange = useCallback((field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  }, []);

  const columns = [
    {
      title: 'Problem Name',
      key: 'name',
      width: '30%',
      render: (_, record) => {
        const isEditing = editingRowId === record.id;
        return isEditing ? (
          <ProblemNameEdit
            name={editData.name}
            url={editData.url}
            onChange={handleEditDataChange}
          />
        ) : (
          <ProblemNameView name={record.name} url={record.url} />
        );
      },
    },
    {
      title: 'Rating',
      key: 'rating',
      width: '10%',
      render: (_, record) => {
        const isEditing = editingRowId === record.id;
        return isEditing ? (
          <RatingEdit rating={editData.rating} onChange={handleEditDataChange} />
        ) : (
          <RatingView rating={record.rating} />
        );
      },
    },
    {
      title: 'Tags',
      key: 'tags',
      width: '25%',
      render: (_, record) => {
        const isEditing = editingRowId === record.id;
        return isEditing ? (
          <TagsEdit tags={editData.tags} onChange={handleEditDataChange} />
        ) : (
          <TagsView tags={record.tags} />
        );
      },
    },
    {
      title: 'Status',
      key: 'status',
      width: '15%',
      render: (_, record) => (
        <Select
          value={record.status}
          onChange={(value) => handleStatusChange(record.id, value)}
          style={{ width: '100%' }}
          placeholder="Select status"
          size="small"
        >
          {statusOptions.map(option => (
            <Select.Option key={option} value={option}>
              {option}
            </Select.Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '20%',
      render: (_, record) => {
        const isEditing = editingRowId === record.id;
        return (
          <Space size="small">
            <Button
              type="text"
              icon={<FileTextOutlined />}
              onClick={() => onNotesClick(record)}
              title="Edit Notes"
            />
            
            {isEditing ? (
              <>
                <Button
                  type="text"
                  icon={<CheckOutlined />}
                  onClick={() => handleSave(record.id)}
                  style={{ color: '#52c41a' }}
                  title="Save"
                />
                <Button
                  type="text"
                  icon={<CloseOutlined />}
                  onClick={handleCancel}
                  danger
                  title="Cancel"
                />
              </>
            ) : (
              <>
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => handleEdit(record)}
                  title="Edit"
                />
                <Button
                  type="text"
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete(record.id)}
                  danger
                  title="Delete"
                />
              </>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <Table
        columns={columns}
        dataSource={problems}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} problems`,
        }}
        bordered
        size="small"
      />
    </div>
  );
});

ProblemsTable.displayName = 'ProblemsTable';

export default ProblemsTable;
