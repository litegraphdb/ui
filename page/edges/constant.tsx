import React from 'react';
import { MoreOutlined } from '@ant-design/icons';
import { Button, Dropdown, TableProps } from 'antd';
import { EdgeType } from '@/lib/store/edge/types';
import { formatDateTime } from '@/utils/dateUtils';
import { pluralize } from '@/utils/stringUtils';

export const tableColumns = (
  handleEdit: (record: EdgeType) => void,
  handleDelete: (record: EdgeType) => void
): TableProps<EdgeType>['columns'] => [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    width: 250,
    sorter: (a: EdgeType, b: EdgeType) => a.name.localeCompare(b.name),
    render: (Name: string) => (
      <div>
        <div>{Name}</div>
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
    title: 'From',
    dataIndex: 'fromName',
    key: 'fromName',
    width: 250,
    responsive: ['md'],
    render: (FromName: string) => (
      <div>
        <div>{FromName}</div>
      </div>
    ),
  },
  {
    title: 'To',
    dataIndex: 'toName',
    key: 'toName',
    width: 250,
    responsive: ['md'],
    render: (ToName: string) => (
      <div>
        <div>{ToName}</div>
      </div>
    ),
  },
  {
    title: 'Cost',
    dataIndex: 'cost',
    key: 'cost',
    width: 150,
    sorter: (a: EdgeType, b: EdgeType) => a.cost - b.cost,
    render: (cost: number) => (
      <div>
        <div>{cost}</div>
      </div>
    ),
  },
  {
    title: 'Labels',
    dataIndex: 'labels',
    key: 'labels',
    width: 150,
    render: (labels: string[]) => (
      <div>
        <div>{labels?.length ? labels?.join(', ') : 'N/A'}</div>
      </div>
    ),
  },
  {
    title: 'Tags',
    dataIndex: 'tags',
    key: 'tags',
    width: 150,
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
    width: 150,
    responsive: ['md'],
    render: (_: any, record: EdgeType) => (
      <div>{pluralize(record?.vectors?.length || 0, 'vector')}</div>
    ),
  },
  {
    title: 'Created UTC',
    dataIndex: 'createdUtc',
    key: 'CreatedUtc',
    width: 250,
    responsive: ['md'],
    sorter: (a: EdgeType, b: EdgeType) =>
      new Date(a.createdUtc).getTime() - new Date(b.createdUtc).getTime(),
    render: (CreatedUtc: string) => <div>{formatDateTime(CreatedUtc)}</div>,
  },
  {
    title: 'Actions',
    key: 'actions',
    render: (_: any, record: EdgeType) => {
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
          <Button type="text" icon={<MoreOutlined style={{ fontSize: '20px' }} />} />
        </Dropdown>
      );
    },
  },
];
