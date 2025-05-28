'use client';
import React, { useState } from 'react';
import { PlusSquareOutlined } from '@ant-design/icons';
import PageContainer from '@/components/base/pageContainer/PageContainer';
import LitegraphButton from '@/components/base/button/Button';
import LitegraphTable from '@/components/base/table/Table';
import { useBackups } from '@/hooks/entityHooks';
import FallBack from '@/components/base/fallback/FallBack';
import { tableColumns } from './constant';
import { BackupType } from '@/lib/store/backup/types';
import { ViewBackup } from './components/ViewBackup';
import DeleteBackup from './components/DeleteBackup';
import AddEditBackup from './components/AddEditBackup';

const mockBackupData: BackupType[] = [
  {
    GUID: '1',
    Filename: 'my-backup.db',
    CreatedUtc: '2021-01-01',
    LastUpdateUtc: '2021-01-01',
  },
  {
    GUID: '2',
    Filename: 'my-backup-2.db',
    CreatedUtc: '2021-01-02',
    LastUpdateUtc: '2021-01-02',
  },
];

const BackupPage = () => {
  const [isViewBackupVisible, setIsViewBackupVisible] = useState(false);
  const [isDeleteBackupVisible, setIsDeleteBackupVisible] = useState(false);
  const [isAddEditBackupVisible, setIsAddEditBackupVisible] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<BackupType | null>(null);
  const { backupsList, fetchBackupsList, isLoading, error } = useBackups();
  const handleCreateBackup = () => {
    setSelectedBackup(null);
    setIsAddEditBackupVisible(true);
  };

  const handleViewBackup = (backup: BackupType) => {
    setSelectedBackup(backup);
    setIsViewBackupVisible(true);
  };

  const handleDeleteBackup = (backup: BackupType) => {
    setSelectedBackup(backup);
    setIsDeleteBackupVisible(true);
  };

  return (
    <PageContainer
      id="backups"
      pageTitle="Backups"
      pageTitleRightContent={
        <LitegraphButton
          type="link"
          icon={<PlusSquareOutlined />}
          onClick={handleCreateBackup}
          weight={500}
        >
          Create Backup
        </LitegraphButton>
      }
    >
      {/* {error ? (
        <FallBack retry={fetchBackupsList}>Something went wrong.</FallBack>
      ) : ( */}
      <LitegraphTable
        loading={isLoading}
        columns={tableColumns(handleViewBackup, handleDeleteBackup)}
        //   dataSource={backupsList}
        dataSource={mockBackupData}
        rowKey={'GUID'}
      />
      {/* )} */}

      {isViewBackupVisible && (
        <ViewBackup
          isViewBackupVisible={isViewBackupVisible}
          setIsViewBackupVisible={setIsViewBackupVisible}
          backup={selectedBackup || null}
        />
      )}

      {isAddEditBackupVisible && (
        <AddEditBackup
          isAddEditBackupVisible={isAddEditBackupVisible}
          setIsAddEditBackupVisible={setIsAddEditBackupVisible}
          backup={selectedBackup || null}
        />
      )}

      {isDeleteBackupVisible && selectedBackup && (
        <DeleteBackup
          title={`Are you sure you want to delete "${selectedBackup.Filename}" backup?`}
          paragraphText={'This action will delete backup.'}
          isDeleteModelVisible={isDeleteBackupVisible}
          setIsDeleteModelVisible={setIsDeleteBackupVisible}
          selectedBackup={selectedBackup}
          setSelectedBackup={setSelectedBackup}
          onBackupDeleted={fetchBackupsList}
        />
      )}
    </PageContainer>
  );
};

export default BackupPage;
