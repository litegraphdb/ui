import React from 'react';
import { MoreOutlined } from '@ant-design/icons';
import { Button, Dropdown, TableProps } from 'antd';
import { LabelType } from '@/lib/store/label/types';
import { formatDateTime } from '@/utils/dateUtils';

export const tableColumns = (
  handleEdit: (record: LabelType) => void,
  handleDelete: (record: LabelType) => void
): TableProps<LabelType>['columns'] => [
  {
    title: 'Label',
    dataIndex: 'Label',
    key: 'Label',
    width: 250,
    sorter: (a: LabelType, b: LabelType) => a.Label.localeCompare(b.Label),
    render: (key: string) => (
      <div>
        <div>{key}</div>
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
    key: 'NodeName',
    width: 200,
    responsive: ['md'],
    // sorter: (a: LabelType, b: LabelType) => a.NodeName.localeCompare(b.NodeName),
    render: (NodeName: string) => (
      <div>
        <div>{NodeName}</div>
      </div>
    ),
  },
  {
    title: 'Edge',
    dataIndex: 'EdgeName',
    key: 'EdgeName',
    width: 200,
    responsive: ['md'],
    // sorter: (a: LabelType, b: LabelType) => a.EdgeName.localeCompare(b.EdgeName),
    render: (EdgeName: string) => (
      <div>
        <div>{EdgeName}</div>
      </div>
    ),
  },
  {
    title: 'Created UTC',
    dataIndex: 'CreatedUtc',
    key: 'CreatedUtc',
    width: 200,
    responsive: ['md'],
    sorter: (a: LabelType, b: LabelType) =>
      new Date(a.CreatedUtc).getTime() - new Date(b.CreatedUtc).getTime(),
    render: (CreatedUtc: string) => <div>{formatDateTime(CreatedUtc)}</div>,
  },
  {
    title: 'Actions',
    key: 'actions',
    render: (_: any, record: LabelType) => {
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
            role="label-action-menu"
            type="text"
            icon={<MoreOutlined style={{ fontSize: '20px' }} />}
            style={{ fontSize: '16px' }}
          />
        </Dropdown>
      );
    },
  },
];
