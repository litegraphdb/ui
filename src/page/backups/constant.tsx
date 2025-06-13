import { BackupType } from '@/lib/store/backup/types';
import {
  DeleteOutlined,
  DownloadOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import { formatDateTime } from '@/utils/dateUtils';
import { Button, Dropdown, MenuProps, TableProps } from 'antd';
import { formatBytes } from '@/utils/appUtils';
import { useState } from 'react';
import { LoaderIcon } from 'react-hot-toast';
import { onNameFilter } from '@/constants/table';
import { FilterDropdownProps } from 'antd/es/table/interface';
import TableSearch from '@/components/table-search/TableSearch';

const Sha256ToggleCell: React.FC<{ hash: string }> = ({ hash }) => {
  const [visible, setVisible] = useState<Boolean>(false);

  const masked = '••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••';

  const toggleVisibility = () => setVisible((v) => !v);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'monospace' }}>
      <span>{visible ? hash : masked}</span>
      {visible ? (
        <EyeInvisibleOutlined
          style={{ cursor: 'pointer' }}
          onClick={toggleVisibility}
          title="Hide SHA256"
        />
      ) : (
        <EyeOutlined style={{ cursor: 'pointer' }} onClick={toggleVisibility} title="Show SHA256" />
      )}
    </div>
  );
};

export default Sha256ToggleCell;

export const tableColumns = (
  handleDelete: (backup: BackupType) => void,
  handleDownload: (backup: BackupType) => void,
  isDownloading: boolean
): TableProps<BackupType>['columns'] => [
  {
    title: 'Filename',
    dataIndex: 'Filename',
    key: 'Filename',
    width: 200,
    responsive: ['md'],
    filterDropdown: (props: FilterDropdownProps) => (
      <TableSearch {...props} placeholder="Search Filename" />
    ),
    sorter: (a: BackupType, b: BackupType) => a.Filename.localeCompare(b.Filename),
    onFilter: (value, record) => onNameFilter(value, record.Filename),
    render: (Filename: string) => <div>{Filename}</div>,
  },
  {
    title: 'Size',
    dataIndex: 'Length',
    key: 'Length',
    width: 200,
    responsive: ['md'],
    render: (Length: number) => <div>{formatBytes(Length)}</div>,
  },
  {
    title: 'SHA256',
    dataIndex: 'SHA256Hash',
    key: 'SHA256Hash',
    width: 200,
    responsive: ['md'],
    render: (hash: string) => <Sha256ToggleCell hash={hash} />,
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
      const items: MenuProps['items'] = [
        {
          key: 'download',
          label: 'Download',
          onClick: () => handleDownload(record),
          icon: isDownloading ? <LoaderIcon /> : <DownloadOutlined />,
        },
        {
          key: 'delete',
          label: 'Delete',
          onClick: () => handleDelete(record),
          icon: <DeleteOutlined />,
        },
      ];
      return (
        <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
          <Button
            type="text"
            icon={<MoreOutlined style={{ fontSize: '20px' }} />}
            role="backup-action-menu"
            style={{ fontSize: '16px' }}
          />
        </Dropdown>
      );
    },
  },
];
