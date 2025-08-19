'use client';
import React, { useState } from 'react';
import { LoadingOutlined, PlusSquareOutlined, RedoOutlined } from '@ant-design/icons';
import PageContainer from '@/components/base/pageContainer/PageContainer';
import LitegraphButton from '@/components/base/button/Button';
import LitegraphTable from '@/components/base/table/Table';
import FallBack from '@/components/base/fallback/FallBack';
import { tableColumns } from './constant';
import DeleteBackup from './components/DeleteBackup';
import AddEditBackup from './components/AddEditBackup';
import { downloadBase64File } from '@/utils/appUtils';
import { toast } from 'react-hot-toast';
import { globalToastId } from '@/constants/config';
import { useReadAllBackupsQuery, useReadBackupMutation } from '@/lib/store/slice/slice';
import { BackupMetaData } from 'litegraphdb/dist/types/types';
import LitegraphFlex from '@/components/base/flex/Flex';
import LitegraphText from '@/components/base/typograpghy/Text';
import LitegraphTooltip from '@/components/base/tooltip/Tooltip';

const BackupPage = () => {
  const [isDeleteBackupVisible, setIsDeleteBackupVisible] = useState(false);
  const [isAddEditBackupVisible, setIsAddEditBackupVisible] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<BackupMetaData | null>(null);
  const {
    data: backupsList = [],
    refetch: fetchBackupsList,
    isLoading,
    isFetching,
    error,
  } = useReadAllBackupsQuery();
  const [fetchBackupByFilename, { isLoading: isDownloading }] = useReadBackupMutation();
  const isBackupsLoading = isLoading || isFetching;
  const handleCreateBackup = () => {
    setSelectedBackup(null);
    setIsAddEditBackupVisible(true);
  };

  const handleDeleteBackup = (backup: BackupMetaData) => {
    setSelectedBackup(backup);
    setIsDeleteBackupVisible(true);
  };

  const handleDownload = async (backup: BackupMetaData) => {
    if (!backup.Filename) {
      toast.error('Missing backup filename', { id: globalToastId });
      return;
    }
    const { data } = await fetchBackupByFilename(backup.Filename);
    if (data && data.Data) {
      downloadBase64File(data.Data, backup.Filename);
    } else {
      toast.error('Unable to download backup', { id: globalToastId });
    }
  };

  return (
    <PageContainer
      id="backups"
      pageTitle={
        <LitegraphFlex align="center" gap={10}>
          <LitegraphText>Backups</LitegraphText>
          {isBackupsLoading ? (
            <LoadingOutlined className="loading-icon" />
          ) : (
            <LitegraphTooltip title="Refresh Data" placement="right">
              <RedoOutlined className="cursor-pointer" onClick={fetchBackupsList} />
            </LitegraphTooltip>
          )}
        </LitegraphFlex>
      }
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
      {error && !isBackupsLoading ? (
        <FallBack retry={fetchBackupsList}>Something went wrong.</FallBack>
      ) : (
        <LitegraphTable
          loading={isBackupsLoading || isDownloading}
          columns={tableColumns(handleDeleteBackup, handleDownload, isDownloading)}
          dataSource={backupsList}
          rowKey={'Filename'}
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
        />
      )}
    </PageContainer>
  );
};

export default BackupPage;
