'use client';
import React, { useState } from 'react';
import { PlusSquareOutlined } from '@ant-design/icons';
import PageContainer from '@/components/base/pageContainer/PageContainer';
import LitegraphButton from '@/components/base/button/Button';
import LitegraphTable from '@/components/base/table/Table';
import { UserType } from '@/lib/store/user/types';
import AddEditUser from './components/AddEditUser';
import DeleteUser from './components/DeleteUser';
import { useGetUsersList } from '@/lib/sdk/litegraph.service';
import { tableColumns } from './constant';
import FallBack from '@/components/base/fallback/FallBack';
import { Space, Button } from 'antd';
import { useUsers } from '@/hooks/entityHooks';

const UserPage = () => {
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [isAddEditUserVisible, setIsAddEditUserVisible] = useState<boolean>(false);
  const [isDeleteModelVisible, setIsDeleteModelVisible] = useState<boolean>(false);

  const { usersList, fetchUsersList, isLoading: isUsersLoading, error } = useUsers();

  const handleCreateUser = () => {
    setSelectedUser(null);
    setIsAddEditUserVisible(true);
  };

  const handleEditUser = (data: UserType) => {
    setSelectedUser(data);
    setIsAddEditUserVisible(true);
  };

  const handleDeleteUser = (data: UserType) => {
    setSelectedUser(data);
    setIsDeleteModelVisible(true);
  };

  return (
    <PageContainer
      id="users"
      pageTitle="Users"
      pageTitleRightContent={
        <LitegraphButton
          type="link"
          icon={<PlusSquareOutlined />}
          onClick={handleCreateUser}
          weight={500}
        >
          Create User
        </LitegraphButton>
      }
    >
      {error ? (
        <FallBack retry={fetchUsersList}>Something went wrong.</FallBack>
      ) : (
        <LitegraphTable
          loading={isUsersLoading}
          columns={tableColumns(handleEditUser, handleDeleteUser)}
          dataSource={usersList}
          rowKey={'GUID'}
        />
      )}

      {isAddEditUserVisible && (
        <AddEditUser
          isAddEditUserVisible={isAddEditUserVisible}
          setIsAddEditUserVisible={setIsAddEditUserVisible}
          user={selectedUser || null}
          onUserUpdated={fetchUsersList}
        />
      )}

      {isDeleteModelVisible && selectedUser && (
        <DeleteUser
          title={`Are you sure you want to delete "${selectedUser.FirstName}" user?`}
          paragraphText={'This action will delete user.'}
          isDeleteModelVisible={isDeleteModelVisible}
          setIsDeleteModelVisible={setIsDeleteModelVisible}
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
          onUserDeleted={fetchUsersList}
        />
      )}
    </PageContainer>
  );
};

export default UserPage;
