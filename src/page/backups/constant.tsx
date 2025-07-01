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
import { BackupMetaData } from 'litegraphdb/dist/types/types';
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
  handleDelete: (backup: BackupMetaData) => void,
  handleDownload: (backup: BackupMetaData) => void,
  isDownloading: boolean
): TableProps<BackupMetaData>['columns'] => [
  {
    title: 'Filename',
    dataIndex: 'Filename',
    key: 'Filename',
    width: 200,
    filterDropdown: (props: FilterDropdownProps) => (
      <TableSearch {...props} placeholder="Search Filename" />
    ),
    sorter: (a: BackupMetaData, b: BackupMetaData) => a.Filename.localeCompare(b.Filename),
    onFilter: (value, record) => onNameFilter(value, record.Filename),
    render: (Filename: string) => <div data-testid="backup-filename">{Filename}</div>,
  },
  {
    title: 'Size',
    dataIndex: 'Length',
    key: 'Length',
    width: 200,
    render: (Length: number) => <div>{formatBytes(Length)}</div>,
  },
  {
    title: 'SHA256',
    dataIndex: 'SHA256Hash',
    key: 'SHA256Hash',
    width: 200,
    render: (hash: string) => <Sha256ToggleCell hash={hash} />,
  },
  {
    title: 'Create UTC',
    dataIndex: 'CreatedUtc',
    key: 'CreatedUtc',
    width: 200,
    sorter: (a: BackupMetaData, b: BackupMetaData) =>
      new Date(a.CreatedUtc).getTime() - new Date(b.CreatedUtc).getTime(),
    render: (CreatedUtc: string) => <div>{formatDateTime(CreatedUtc)}</div>,
  },
  {
    title: 'Actions',
    key: 'actions',
    width: 100,
    render: (_: any, record: BackupMetaData) => {
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
