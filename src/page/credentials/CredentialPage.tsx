'use client';
import React, { useState } from 'react';
import { PlusSquareOutlined } from '@ant-design/icons';
import PageContainer from '@/components/base/pageContainer/PageContainer';
import LitegraphButton from '@/components/base/button/Button';
import LitegraphTable from '@/components/base/table/Table';
import { CredentialType } from '@/lib/store/credential/types';
import AddEditCredential from './components/AddEditCredential';
import DeleteCredential from './components/DeleteCredential';

import { tableColumns } from './constant';
import FallBack from '@/components/base/fallback/FallBack';
import { useCredentials, useUsers } from '@/hooks/entityHooks';

const CredentialPage = () => {
  const [selectedCredential, setSelectedCredential] = useState<CredentialType | null>(null);
  const [isAddEditCredentialVisible, setIsAddEditCredentialVisible] = useState<boolean>(false);
  const [isDeleteModelVisible, setIsDeleteModelVisible] = useState<boolean>(false);
  const { usersList, isLoading: isUsersLoading } = useUsers();

  const {
    credentialsList,
    fetchCredentialsList,
    isLoading: isCredentialsLoading,
    error,
  } = useCredentials();

  const credentialsListWithUsers = credentialsList.map((credential) => {
    const user = usersList.find((user) => user.GUID === credential.UserGUID);
    return {
      ...credential,
      userName: user ? `${user.FirstName} ${user.LastName}` : 'N/A',
    };
  });

  const handleCreateCredential = () => {
    setSelectedCredential(null);
    setIsAddEditCredentialVisible(true);
  };

  const handleEditCredential = (data: CredentialType) => {
    setSelectedCredential(data);
    setIsAddEditCredentialVisible(true);
  };

  const handleDeleteCredential = (data: CredentialType) => {
    setSelectedCredential(data);
    setIsDeleteModelVisible(true);
  };

  return (
    <PageContainer
      id="credentials"
      pageTitle="Credentials"
      pageTitleRightContent={
        <LitegraphButton
          type="link"
          icon={<PlusSquareOutlined />}
          onClick={handleCreateCredential}
          weight={500}
        >
          Create Credential
        </LitegraphButton>
      }
    >
      {error ? (
        <FallBack retry={fetchCredentialsList}>Something went wrong.</FallBack>
      ) : (
        <LitegraphTable
          loading={isCredentialsLoading || isUsersLoading}
          columns={tableColumns(handleEditCredential, handleDeleteCredential)}
          dataSource={credentialsListWithUsers}
          rowKey={'GUID'}
        />
      )}

      {isAddEditCredentialVisible && (
        <AddEditCredential
          isAddEditCredentialVisible={isAddEditCredentialVisible}
          setIsAddEditCredentialVisible={setIsAddEditCredentialVisible}
          credential={selectedCredential || null}
          onCredentialUpdated={fetchCredentialsList}
        />
      )}

      {isDeleteModelVisible && selectedCredential && (
        <DeleteCredential
          title={`Are you sure you want to delete "${selectedCredential.Name}" credential?`}
          paragraphText={'This action will delete credential.'}
          isDeleteModelVisible={isDeleteModelVisible}
          setIsDeleteModelVisible={setIsDeleteModelVisible}
          selectedCredential={selectedCredential}
          setSelectedCredential={setSelectedCredential}
          onCredentialDeleted={fetchCredentialsList}
        />
      )}
    </PageContainer>
  );
};

export default CredentialPage;
