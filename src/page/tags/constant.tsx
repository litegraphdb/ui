import React from 'react';
import { MoreOutlined } from '@ant-design/icons';
import { Button, Dropdown, TableProps } from 'antd';
import { TagType } from '@/lib/store/tag/types';
import { formatDateTime } from '@/utils/dateUtils';

export const tableColumns = (
  handleEdit: (record: TagType) => void,
  handleDelete: (record: TagType) => void
): TableProps<TagType>['columns'] => [
  {
    title: 'Key',
    dataIndex: 'Key',
    key: 'Key',
    width: 200,
    responsive: ['md'],
    sorter: (a: TagType, b: TagType) => a.Key.localeCompare(b.Key),
    render: (key: string) => (
      <div>
        <div>{key}</div>
      </div>
    ),
  },
  {
    title: 'Value',
    dataIndex: 'Value',
    sorter: (a: TagType, b: TagType) => a.Value.localeCompare(b.Value),
    key: 'Value',
    width: 200,
    responsive: ['md'],
    render: (value: string) => (
      <div>
        <div>{value}</div>
      </div>
    ),
  },
  {
    title: 'GUID',
    dataIndex: 'GUID',
    key: 'GUID',
    width: 350,
    responsive: ['md'],
    render: (GUID: string) => (
      <div>
        <div>{GUID}</div>
      </div>
    ),
  },
  {
    title: 'Node',
    dataIndex: 'NodeName',
    // sorter: (a: TagType, b: TagType) => a.NodeName.localeCompare(b.NodeName),
    key: 'NodeName',
    width: 200,
    responsive: ['md'],
    render: (NodeGUID: string) => (
      <div>
        <div>{NodeGUID}</div>
      </div>
    ),
  },
  {
    title: 'Edge',
    dataIndex: 'EdgeName',
    // sorter: (a: TagType, b: TagType) => a.EdgeName.localeCompare(b.EdgeName),
    key: 'EdgeName',
    width: 200,
    responsive: ['md'],
    render: (EdgeName: string) => (
      <div>
        <div>{EdgeName}</div>
      </div>
    ),
  },
  {
    title: 'Created UTC',
    dataIndex: 'CreatedUtc',
    sorter: (a: TagType, b: TagType) =>
      new Date(a.CreatedUtc).getTime() - new Date(b.CreatedUtc).getTime(),
    key: 'CreatedUtc',
    width: 200,
    responsive: ['md'],
    render: (CreatedUtc: string) => <div>{formatDateTime(CreatedUtc)}</div>,
  },
  {
    title: 'Actions',
    key: 'actions',
    render: (_: any, record: TagType) => {
      const items = [
        {
          key: 'edit',
          label: 'Edit',
          onClick: () => handleEdit(record),
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
            role="tag-action-menu"
          />
        </Dropdown>
      );
    },
  },
];
