import React from 'react';
import { MoreOutlined } from '@ant-design/icons';
import { Button, Dropdown, TableProps } from 'antd';
import { VectorType } from '@/lib/store/vector/types';
import LitegraphTooltip from '@/components/base/tooltip/Tooltip';
import { formatDateTime } from '@/utils/dateUtils';

export const tableColumns = (
  handleEdit: (record: VectorType) => void,
  handleDelete: (record: VectorType) => void
): TableProps<VectorType>['columns'] => [
  {
    title: 'Model',
    dataIndex: 'Model',
    sorter: (a: VectorType, b: VectorType) => a.Model.localeCompare(b.Model),
    key: 'Model',
    width: 250,
    responsive: ['md'],
    render: (Model: string) => (
      <div>
        <div>{Model}</div>
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
    // sorter: (a: VectorType, b: VectorType) => a.NodeName.localeCompare(b.NodeName),
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
    // sorter: (a: VectorType, b: VectorType) => a.EdgeName.localeCompare(b.EdgeName),
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
    title: 'Dimensionality',
    dataIndex: 'Dimensionality',
    sorter: (a: VectorType, b: VectorType) => a.Dimensionality - b.Dimensionality,
    key: 'Dimensionality',
    width: 200,
    responsive: ['md'],
    render: (Dimensionality: number) => (
      <div>
        <div>{Dimensionality}</div>
      </div>
    ),
  },
  {
    title: 'Content',
    dataIndex: 'Content',
    sorter: (a: VectorType, b: VectorType) => a.Content.localeCompare(b.Content),
    key: 'Content',
    width: 200,
    responsive: ['md'],
    render: (Content: string) => (
      <div>
        <div>{Content}</div>
      </div>
    ),
  },
  {
    title: 'Vectors',
    dataIndex: 'Vectors',
    sorter: (a: VectorType, b: VectorType) => a.Vectors.length - b.Vectors.length,
    key: 'Vectors',
    width: 200,
    responsive: ['md'],
    render: (_: any, record: VectorType) => (
      <LitegraphTooltip title={record.Vectors.join(', ')}>
        <div>{record.Vectors.length} vectors</div>
      </LitegraphTooltip>
    ),
  },
  {
    title: 'Created UTC',
    dataIndex: 'CreatedUtc',
    sorter: (a: VectorType, b: VectorType) =>
      new Date(a.CreatedUtc).getTime() - new Date(b.CreatedUtc).getTime(),
    key: 'CreatedUtc',
    width: 200,
    responsive: ['md'],
    render: (CreatedUtc: string) => <div>{formatDateTime(CreatedUtc)}</div>,
  },
  {
    title: 'Actions',
    key: 'actions',
    render: (_: any, record: VectorType) => {
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
            role="vector-action-menu"
            style={{ fontSize: '16px' }}
          />
        </Dropdown>
      );
    },
  },
];
