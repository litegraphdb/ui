'use client';

import LitegraphModal from '@/components/base/modal/Modal';
import LitegraphParagraph from '@/components/base/typograpghy/Paragraph';
import toast from 'react-hot-toast';
import { globalToastId } from '@/constants/config';
import { useDeleteBackupMutation } from '@/lib/store/slice/slice';
import { BackupMetaData } from 'litegraphdb/dist/types/types';

interface DeleteBackupProps {
  title: string;
  paragraphText: string;
  isDeleteModelVisible: boolean;
  setIsDeleteModelVisible: (visible: boolean) => void;
  selectedBackup: BackupMetaData | null | undefined;
  setSelectedBackup: (backup: BackupMetaData | null) => void;

  onBackupDeleted?: () => Promise<void>;
}

const DeleteBackup = ({
  title,
  paragraphText,
  isDeleteModelVisible,
  setIsDeleteModelVisible,
  selectedBackup,
  setSelectedBackup,

  onBackupDeleted,
}: DeleteBackupProps) => {
  const [deleteBackupByFilename, { isLoading }] = useDeleteBackupMutation();

  const handleDelete = async () => {
    if (selectedBackup) {
      const res = await deleteBackupByFilename(selectedBackup.Filename);

      if (res) {
        toast.success('Backup deleted successfully', { id: globalToastId });
        setIsDeleteModelVisible(false);
        setSelectedBackup(null);

        onBackupDeleted && onBackupDeleted();
      }
    }
  };

  return (
    <LitegraphModal
      title={title}
      centered
      open={isDeleteModelVisible}
      onOk={handleDelete}
      onCancel={() => {
        setIsDeleteModelVisible(false);
        setSelectedBackup(null);
      }}
      confirmLoading={isLoading}
      okText="Delete"
      okButtonProps={{ danger: true }}
    >
      <LitegraphParagraph>{paragraphText}</LitegraphParagraph>
    </LitegraphModal>
  );
};

export default DeleteBackup;
