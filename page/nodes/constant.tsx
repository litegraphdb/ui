import React from 'react';
import { MoreOutlined } from '@ant-design/icons';
import { Button, Dropdown, TableProps } from 'antd';
import { NodeType } from '@/lib/store/node/types';
import { formatDateTime } from '@/utils/dateUtils';
import { pluralize } from '@/utils/stringUtils';

export const tableColumns = (
  handleEdit: (record: NodeType) => void,
  handleDelete: (record: NodeType) => void
): TableProps<NodeType>['columns'] => [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    width: 250,
    sorter: (a: NodeType, b: NodeType) => a.name.localeCompare(b.name),
    render: (name: string) => (
      <div>
        <div>{name}</div>
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
    title: 'Labels',
    dataIndex: 'labels',
    key: 'Labels',
    width: 150,
    render: (label: string[]) => (
      <div>
        <div>{label?.length ? label?.join(', ') : 'N/A'}</div>
      </div>
    ),
  },
  {
    title: 'Tags',
    dataIndex: 'tags' as keyof NodeType,
    key: 'tags',
    width: 250,
    render: (tags: any) => (
      <div>
        <div>{JSON.stringify(tags || {})}</div>
      </div>
    ),
  },
  {
    title: 'Vectors',
    dataIndex: 'Vectors',
    key: 'Vectors',
    width: 250,
    responsive: ['md'],
    render: (_: any, record: NodeType) => (
      <div>{pluralize(record?.vectors?.length || 0, 'vector')}</div>
    ),
  },
  {
    title: 'Created UTC',
    dataIndex: 'createdUtc',
    key: 'createdUtc',
    width: 250,
    responsive: ['md'],
    sorter: (a: NodeType, b: NodeType) =>
      new Date(a.createdUtc).getTime() - new Date(b.createdUtc).getTime(),
    render: (createdUtc: string) => (
      <div>
        <div>{formatDateTime(createdUtc)}</div>
      </div>
    ),
  },

  {
    title: 'Actions',
    key: 'actions',
    render: (_: any, record: NodeType) => {
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
            role="node-action-menu"
          />
        </Dropdown>
      );
    },
  },
];
