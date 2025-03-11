import React from 'react';
import { MoreOutlined } from '@ant-design/icons';
import { GraphData } from '@/lib/store/graph/types';
import { TableProps, Dropdown, Button, Menu } from 'antd';
import { formatDateTime } from '@/utils/dateUtils';
import { pluralize } from '@/utils/stringUtils';

export const tableColumns = (
  handleEdit: (record: GraphData) => void,
  handleDelete: (record: GraphData) => void,
  handleExportGexf: (record: GraphData) => void
): TableProps<GraphData>['columns'] => [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    width: 350,
    responsive: ['sm'],
    sorter: (a: GraphData, b: GraphData) => a.name.localeCompare(b.name),
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
    responsive: ['sm'],
    render: (GUID: string) => (
      <div>
        <div>{GUID}</div>
      </div>
    ),
  },
  {
    title: 'Labels',
    dataIndex: 'labels' as keyof GraphData,
    key: 'labels',
    width: 350,
    responsive: ['sm'],
    render: (labels: any) => (
      <div>
        <div>{Array.isArray(labels) ? labels.join(', ') : ''}</div>
      </div>
    ),
  },
  {
    title: 'Tags',
    dataIndex: 'tags',
    key: 'tags',
    width: 350,
    responsive: ['sm'],
    render: (tags: any) => (
      <div>
        <div>{JSON.stringify(tags)}</div>
      </div>
    ),
  },
  {
    title: 'Vectors',
    dataIndex: 'Vectors',
    key: 'Vectors',
    width: 150,
    responsive: ['sm'],
    render: (_: any, record: GraphData) => (
      <div>{pluralize(record?.vectors?.length || 0, 'vector')}</div>
    ),
  },
  {
    title: 'Created UTC',
    dataIndex: 'createdUtc',
    key: 'CreatedUtc',
    width: 350,
    responsive: ['sm'],
    sorter: (a: GraphData, b: GraphData) =>
      new Date(a.createdUtc).getTime() - new Date(b.createdUtc).getTime(),
    render: (CreatedUtc: string) => <div>{formatDateTime(CreatedUtc)}</div>,
  },

  {
    title: 'Actions',
    key: 'actions',
    responsive: ['sm'],
    render: (_: any, record: GraphData) => {
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
        {
          key: 'export',
          label: 'Export to GEXF',
          onClick: () => handleExportGexf(record),
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
