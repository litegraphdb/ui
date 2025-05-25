import React from 'react';
import { Button, Dropdown, TableProps } from 'antd';
import { MoreOutlined, CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
import { CredentialType } from '@/lib/store/credential/types';
import { formatDateTime } from '@/utils/dateUtils';

export const tableColumns = (
  handleEdit: (user: CredentialType) => void,
  handleDelete: (user: CredentialType) => void
): TableProps<CredentialType>['columns'] => [
  {
    title: 'GUID',
    dataIndex: 'GUID',
    key: 'GUID',
    width: 350,
    responsive: ['md'],
    render: (GUID: string) => <div>{GUID}</div>,
  },
  {
    title: 'User',
    dataIndex: 'userName',
    key: 'UserGUID',
    width: 250,
    responsive: ['md'],
    render: (UserGUID: string) => <div>{UserGUID}</div>,
  },
  {
    title: 'Name',
    dataIndex: 'Name',
    key: 'name',
    width: 200,
    responsive: ['md'],
    sorter: (a: CredentialType, b: CredentialType) => a.Name.localeCompare(b.Name),
    render: (name: string) => <div>{name}</div>,
  },
  {
    title: 'Bearer Token',
    dataIndex: 'BearerToken',
    key: 'BearerToken',
    width: 200,
    responsive: ['md'],
    render: (BearerToken: string) => <div>{BearerToken}</div>,
  },
  {
    title: 'Active',
    dataIndex: 'Active',
    key: 'Active',
    width: 100,
    responsive: ['md'],
    sorter: (a: CredentialType, b: CredentialType) => Number(b.Active) - Number(a.Active),
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
    key: 'CreatedUtc',
    width: 200,
    responsive: ['md'],
    sorter: (a: CredentialType, b: CredentialType) =>
      new Date(a.CreatedUtc).getTime() - new Date(b.CreatedUtc).getTime(),
    render: (CreatedUtc: string) => <div>{formatDateTime(CreatedUtc)}</div>,
  },
  {
    title: 'Actions',
    key: 'actions',
    width: 100,
    render: (_: any, record: CredentialType) => {
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
            role="credential-action-menu"
            style={{ fontSize: '16px' }}
          />
        </Dropdown>
      );
    },
  },
];
