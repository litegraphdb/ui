import React from 'react';
import { Button, Dropdown, TableProps } from 'antd';
import { CheckCircleFilled, CloseCircleFilled, MoreOutlined } from '@ant-design/icons';
import { TenantType } from '@/lib/store/tenants/types';
import { formatDateTime } from '@/utils/dateUtils';

export const tableColumns = (
  handleEdit: (tenant: TenantType) => void,
  handleDelete: (tenant: TenantType) => void
): TableProps<TenantType>['columns'] => [
  {
    title: 'GUID',
    dataIndex: 'GUID',
    key: 'GUID',
    width: 450,
    responsive: ['md'],
    render: (GUID: string) => <div>{GUID}</div>,
  },
  {
    title: 'Name',
    dataIndex: 'Name',
    key: 'Name',
    width: 350,
    responsive: ['md'],
    sorter: (a: TenantType, b: TenantType) => a.Name.localeCompare(b.Name),
    render: (Name: string) => <div>{Name}</div>,
  },

  {
    title: 'Active',
    dataIndex: 'Active',
    key: 'Active',
    width: 100,
    responsive: ['md'],
    sorter: (a: TenantType, b: TenantType) => Number(b.Active) - Number(a.Active),
    render: (active: boolean) =>
      active ? (
        <CheckCircleFilled style={{ color: 'green' }} />
      ) : (
        <CloseCircleFilled style={{ color: 'red' }} />
      ),
  },
  {
    title: 'Created UTC',
    dataIndex: 'CreatedUtc',
    sorter: (a: TenantType, b: TenantType) =>
      new Date(a.CreatedUtc).getTime() - new Date(b.CreatedUtc).getTime(),
    key: 'CreatedUtc',
    width: 200,
    responsive: ['md'],
    render: (CreatedUtc: string) => <div>{formatDateTime(CreatedUtc)}</div>,
  },
  {
    title: 'Actions',
    key: 'actions',
    width: 100,
    render: (_: any, record: TenantType) => {
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
            role="tenant-action-menu"
            icon={<MoreOutlined style={{ fontSize: '20px' }} />}
            style={{ fontSize: '16px' }}
          />
        </Dropdown>
      );
    },
  },
];
