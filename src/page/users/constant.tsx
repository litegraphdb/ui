import React from 'react';
import { Button, Dropdown, TableProps } from 'antd';
import { MoreOutlined, CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
import { UserType } from '@/lib/store/user/types';
import { formatDateTime } from '@/utils/dateUtils';
import { FilterDropdownProps } from 'antd/es/table/interface';
import TableSearch from '@/components/table-search/TableSearch';
import { onGUIDFilter, onNameFilter } from '@/constants/table';

export const tableColumns = (
  handleEdit: (user: UserType) => void,
  handleDelete: (user: UserType) => void
): TableProps<UserType>['columns'] => [
  {
    title: 'GUID',
    dataIndex: 'GUID',
    key: 'GUID',
    width: 350,
    filterDropdown: (props: FilterDropdownProps) => (
      <TableSearch {...props} placeholder="Search GUID" />
    ),
    onFilter: (value, record) => onGUIDFilter(value, record.GUID),
    responsive: ['md'],
    render: (GUID: string) => <div>{GUID}</div>,
  },
  {
    title: 'First Name',
    dataIndex: 'FirstName',
    key: 'FirstName',
    width: 200,
    filterDropdown: (props: FilterDropdownProps) => (
      <TableSearch {...props} placeholder="Search First Name" />
    ),
    onFilter: (value, record) => onNameFilter(value, record.FirstName),
    responsive: ['md'],
    sorter: (a: UserType, b: UserType) => a.FirstName.localeCompare(b.FirstName),
    render: (FirstName: string) => <div>{FirstName}</div>,
  },
  {
    title: 'Last Name',
    dataIndex: 'LastName',
    key: 'LastName',
    width: 200,
    filterDropdown: (props: FilterDropdownProps) => (
      <TableSearch {...props} placeholder="Search Last Name" />
    ),
    onFilter: (value, record) => onNameFilter(value, record.LastName),
    responsive: ['md'],
    sorter: (a: UserType, b: UserType) => a.LastName.localeCompare(b.LastName),
    render: (LastName: string) => <div>{LastName}</div>,
  },
  {
    title: 'Email',
    dataIndex: 'Email',
    key: 'Email',
    width: 200,
    filterDropdown: (props: FilterDropdownProps) => (
      <TableSearch {...props} placeholder="Search Email" />
    ),
    onFilter: (value, record) => onNameFilter(value, record.Email),
    responsive: ['md'],
    render: (Email: string) => <div>{Email}</div>,
  },
  {
    title: 'Password',
    dataIndex: 'Password',
    key: 'Password',
    width: 200,
    responsive: ['md'],
    render: (Password: string) => <div>{Password}</div>,
  },
  {
    title: 'Active',
    dataIndex: 'Active',
    key: 'Active',
    width: 100,
    responsive: ['md'],
    sorter: (a: UserType, b: UserType) => Number(b.Active) - Number(a.Active),
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
    sorter: (a: UserType, b: UserType) =>
      new Date(a.CreatedUtc).getTime() - new Date(b.CreatedUtc).getTime(),
    render: (CreatedUtc: string) => <div>{formatDateTime(CreatedUtc)}</div>,
  },
  {
    title: 'Actions',
    key: 'actions',
    width: 100,
    render: (_: any, record: UserType) => {
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
            role="user-action-menu"
            type="text"
            icon={<MoreOutlined style={{ fontSize: '20px' }} />}
            style={{ fontSize: '16px' }}
          />
        </Dropdown>
      );
    },
  },
];
