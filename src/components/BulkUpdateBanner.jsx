import { memo } from 'react';
import { Alert, Select, Button, Space } from 'antd';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { bulkUpdateStatus } from '../store/problemsSlice';
import { clearStatusChangeFlag } from '../store/settingsSlice';

const BulkUpdateBanner = memo(() => {
  const [selectedStatus, setSelectedStatus] = useState(null);
  const dispatch = useDispatch();
  const statusesChanged = useSelector(state => state.settings.statusesChanged);
  const statusOptions = useSelector(state => state.settings.statusOptions);

  if (!statusesChanged) {
    return null;
  }

  const handleApply = () => {
    if (!selectedStatus) {
      return;
    }
    dispatch(bulkUpdateStatus(selectedStatus));
    dispatch(clearStatusChangeFlag());
  };

  const handleDismiss = () => {
    dispatch(clearStatusChangeFlag());
  };

  return (
    <div style={{ padding: '20px', paddingBottom: '0' }}>
      <Alert
        message="Statuses Reset"
        description={
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              All problem statuses have been reset due to status option changes. 
              Select a new status for all problems or update them individually.
            </div>
            <Space style={{ marginTop: '10px' }}>
              <Select
                placeholder="Select new status for all"
                value={selectedStatus}
                onChange={setSelectedStatus}
                style={{ width: '250px' }}
              >
                {statusOptions.map(option => (
                  <Select.Option key={option} value={option}>
                    {option}
                  </Select.Option>
                ))}
              </Select>
              <Button type="primary" onClick={handleApply} disabled={!selectedStatus}>
                Apply to All
              </Button>
              <Button onClick={handleDismiss}>
                Dismiss
              </Button>
            </Space>
          </Space>
        }
        type="warning"
        showIcon
        closable={false}
      />
    </div>
  );
});

BulkUpdateBanner.displayName = 'BulkUpdateBanner';

export default BulkUpdateBanner;
