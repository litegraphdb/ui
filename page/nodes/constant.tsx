import React from 'react';
import { MoreOutlined } from '@ant-design/icons';
import { Button, Dropdown, TableProps } from 'antd';
import { NodeType } from '@/lib/store/node/types';
import { formatDateTime } from '@/utils/dateUtils';
import { pluralize } from '@/utils/stringUtils';
import { isNumber } from 'lodash';
import { NONE, NOT_AVAILABLE } from '@/constants/uiLabels';

export const tableColumns = (
  handleEdit: (record: NodeType) => void,
  handleDelete: (record: NodeType) => void,
  hasScoreOrDistance: boolean
): TableProps<NodeType>['columns'] => [
  {
    title: 'Name',
    dataIndex: 'Name' as keyof NodeType,
    key: 'Name',
    width: 250,
    sorter: (a: NodeType, b: NodeType) => a.Name.localeCompare(b.Name),
    render: (name: string) => (
      <div>
        <div>{name}</div>
      </div>
    ),
  },
  {
    title: 'GUID',
    dataIndex: 'GUID' as keyof NodeType,
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
    dataIndex: 'Labels' as keyof NodeType,
    key: 'Labels',
    width: 150,
    render: (label: string[]) => (
      <div>
        <div>{label?.length ? label?.join(', ') : NOT_AVAILABLE}</div>
      </div>
    ),
  },
  {
    title: 'Tags',
    dataIndex: 'Tags' as keyof NodeType,
    key: 'Tags',
    width: 250,
    render: (tags: any) => (
      <div>
        <div>{Object.keys(tags || {}).length > 0 ? JSON.stringify(tags) : NONE}</div>
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
      <div>{record?.Vectors?.length > 0 ? pluralize(record?.Vectors?.length, 'vector') : NONE}</div>
    ),
  },
  {
    title: 'Created UTC',
    dataIndex: 'CreatedUtc',
    key: 'CreatedUtc',
    width: 250,
    responsive: ['md'],
    sorter: (a: NodeType, b: NodeType) =>
      new Date(a.CreatedUtc).getTime() - new Date(b.CreatedUtc).getTime(),
    render: (CreatedUtc: string) => (
      <div>
        <div>{formatDateTime(CreatedUtc)}</div>
      </div>
    ),
  },
  ...(hasScoreOrDistance
    ? [
        {
          title: 'Score',
          dataIndex: 'Score' as keyof NodeType,
          key: 'Score',
          width: 150,
          render: (score: number) => (
            <div>
              <div>{isNumber(score) ? score : 'N/A'}</div>
            </div>
          ),
        },
        {
          title: 'Distance',
          dataIndex: 'Distance' as keyof NodeType,
          key: 'Distance',
          width: 150,
          render: (distance: number) => (
            <div>
              <div>{isNumber(distance) ? distance : 'N/A'}</div>
            </div>
          ),
        },
      ]
    : []),
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
