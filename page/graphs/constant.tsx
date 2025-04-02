import React from 'react';
import { MoreOutlined } from '@ant-design/icons';
import { GraphData } from '@/lib/store/graph/types';
import { TableProps, Dropdown, Button, Menu } from 'antd';
import { formatDateTime } from '@/utils/dateUtils';
import { pluralize } from '@/utils/stringUtils';
import { isNumber } from 'lodash';
import { NONE, NOT_AVAILABLE } from '@/constants/uiLabels';

export const tableColumns = (
  handleEdit: (record: GraphData) => void,
  handleDelete: (record: GraphData) => void,
  handleExportGexf: (record: GraphData) => void,
  hasScoreOrDistance: boolean
): TableProps<GraphData>['columns'] => [
  {
    title: 'Name',
    dataIndex: 'Name',
    key: 'name',
    width: 350,
    responsive: ['sm'],
    sorter: (a: GraphData, b: GraphData) => a.Name.localeCompare(b.Name),
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
    dataIndex: 'Labels' as keyof GraphData,
    key: 'labels',
    width: 350,
    responsive: ['sm'],
    render: (labels: any) => (
      <div>
        <div>{Array.isArray(labels) && labels.length > 0 ? labels.join(', ') : NOT_AVAILABLE}</div>
      </div>
    ),
  },
  {
    title: 'Tags',
    dataIndex: 'Tags',
    key: 'tags',
    width: 350,
    responsive: ['sm'],
    render: (tags: any) => (
      <div>
        <div>{Object.keys(tags).length > 0 ? JSON.stringify(tags) : NONE}</div>
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
      <div>{record?.Vectors?.length > 0 ? pluralize(record?.Vectors?.length, 'vector') : NONE}</div>
    ),
  },
  {
    title: 'Created UTC',
    dataIndex: 'CreatedUtc',
    key: 'CreatedUtc',
    width: 350,
    responsive: ['sm'],
    sorter: (a: GraphData, b: GraphData) =>
      new Date(a.CreatedUtc).getTime() - new Date(b.CreatedUtc).getTime(),
    render: (CreatedUtc: string) => <div>{formatDateTime(CreatedUtc)}</div>,
  },
  ...(hasScoreOrDistance
    ? [
        {
          title: 'Score',
          dataIndex: 'Score',
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
          dataIndex: 'Distance',
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
