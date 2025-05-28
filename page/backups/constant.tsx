import { BackupType } from '@/lib/store/backup/types';
import { MoreOutlined } from '@ant-design/icons';
import { formatDateTime } from '@/utils/dateUtils';
import { Button, Dropdown, TableProps } from 'antd';

export const tableColumns = (
  handleView: (backup: BackupType) => void,
  handleDelete: (backup: BackupType) => void
): TableProps<BackupType>['columns'] => [
  {
    title: 'GUID',
    dataIndex: 'GUID',
    key: 'GUID',
    width: 200,
    responsive: ['md'],
    render: (GUID: string) => <div>{GUID}</div>,
  },
  {
    title: 'Filename',
    dataIndex: 'Filename',
    key: 'Filename',
    width: 200,
    responsive: ['md'],
    render: (Filename: string) => <div>{Filename}</div>,
  },
  {
    title: 'Create UTC',
    dataIndex: 'CreatedUtc',
    key: 'CreatedUtc',
    width: 200,
    responsive: ['md'],
    sorter: (a: BackupType, b: BackupType) =>
      new Date(a.CreatedUtc).getTime() - new Date(b.CreatedUtc).getTime(),
    render: (CreatedUtc: string) => <div>{formatDateTime(CreatedUtc)}</div>,
  },
  {
    title: 'Actions',
    key: 'actions',
    width: 100,
    render: (_: any, record: BackupType) => {
      const items = [
        {
          key: 'view',
          label: 'View',
          onClick: () => handleView(record),
        },
        {
          key: 'delete',
          label: 'Delete',
          onClick: () => handleDelete(record),
        },
      ];
      return (
        <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
          <Button
            type="text"
            icon={<MoreOutlined style={{ fontSize: '20px' }} />}
            role="credential-action-menu"
            style={{ fontSize: '16px' }}
          />
        </Dropdown>
      );
    },
  },
];
