'use client';
import React from 'react';
import { Descriptions, Typography } from 'antd';
import { BackupType } from '@/lib/store/backup/types';
import { formatDateTime } from '@/utils/dateUtils';
import LitegraphModal from '@/components/base/modal/Modal';

const { Text } = Typography;

interface ViewBackupProps {
  isViewBackupVisible: boolean;
  setIsViewBackupVisible: (visible: boolean) => void;
  backup: BackupType | null;
}

export const ViewBackup: React.FC<ViewBackupProps> = ({
  isViewBackupVisible,
  setIsViewBackupVisible,
  backup,
}) => {
  const handleClose = () => {
    setIsViewBackupVisible(false);
  };

  if (!backup) return null;

  return (
    <LitegraphModal
      title="Backup Details"
      open={isViewBackupVisible}
      onCancel={handleClose}
      footer={null}
      width={800}
    >
      <Descriptions bordered column={2}>
        <Descriptions.Item label="Filename" span={2}>
          <Text strong>{backup.Filename}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="GUID">
          <Text copyable>{backup.GUID}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="Created">{formatDateTime(backup.CreatedUtc)}</Descriptions.Item>
      </Descriptions>
    </LitegraphModal>
  );
};
