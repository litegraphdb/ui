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
import DeleteBackup from './components/DeleteBackup';
import AddEditBackup from './components/AddEditBackup';
import { downloadBase64File } from '@/utils/appUtils';
import { useGetBackupByFilename } from '@/lib/sdk/litegraph.service';
import { toast } from 'react-hot-toast';
import { globalToastId } from '@/constants/config';

const BackupPage = () => {
  const [isDeleteBackupVisible, setIsDeleteBackupVisible] = useState(false);
  const [isAddEditBackupVisible, setIsAddEditBackupVisible] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<BackupType | null>(null);
  const { backupsList, fetchBackupsList, isLoading, error } = useBackups();
  const { fetchBackupByFilename, isLoading: isDownloading } = useGetBackupByFilename();

  const handleCreateBackup = () => {
    setSelectedBackup(null);
    setIsAddEditBackupVisible(true);
  };

  const handleDeleteBackup = (backup: BackupType) => {
    setSelectedBackup(backup);
    setIsDeleteBackupVisible(true);
  };

  const handleDownload = async (backup: BackupType) => {
    if (!backup.Filename) {
      toast.error('Missing backup filename', { id: globalToastId });
      return;
    }
    const data = await fetchBackupByFilename(backup.Filename);
    if (data && data.Data) {
      downloadBase64File(data.Data, backup.Filename);
    } else {
      toast.error('Unable to download backup', { id: globalToastId });
    }
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
      {error ? (
        <FallBack retry={fetchBackupsList}>Something went wrong.</FallBack>
      ) : (
        <LitegraphTable
          loading={isLoading}
          columns={tableColumns(handleDeleteBackup, handleDownload, isDownloading)}
          dataSource={backupsList}
          rowKey={'GUID'}
        />
      )}

      {isAddEditBackupVisible && (
        <AddEditBackup
          isAddEditBackupVisible={isAddEditBackupVisible}
          setIsAddEditBackupVisible={setIsAddEditBackupVisible}
          backup={selectedBackup || null}
          onBackupUpdated={fetchBackupsList}
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
