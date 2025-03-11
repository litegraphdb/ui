'use client';
import { useDeleteCredentialsById } from '@/lib/sdk/litegraph.service';
import { CredentialType } from '@/lib/store/credential/types';
import LitegraphModal from '@/components/base/modal/Modal';
import LitegraphParagraph from '@/components/base/typograpghy/Paragraph';
import { useAppDispatch } from '@/lib/store/hooks';
import { deleteCredential } from '@/lib/store/credential/actions';
import toast from 'react-hot-toast';

interface DeleteCredentialProps {
  title: string;
  paragraphText: string;
  isDeleteModelVisible: boolean;
  setIsDeleteModelVisible: (visible: boolean) => void;
  selectedCredential: CredentialType | null | undefined;
  setSelectedCredential: (credential: CredentialType | null) => void;

  onCredentialDeleted?: () => Promise<void>;
}

const DeleteCredential = ({
  title,
  paragraphText,
  isDeleteModelVisible,
  setIsDeleteModelVisible,
  selectedCredential,
  setSelectedCredential,

  onCredentialDeleted,
}: DeleteCredentialProps) => {
  const dispatch = useAppDispatch();
  const { deleteCredentialById, isLoading } = useDeleteCredentialsById();

  const handleDelete = async () => {
    if (selectedCredential) {
      const res = await deleteCredentialById(selectedCredential.GUID);
      if (res) {
        dispatch(deleteCredential({ GUID: selectedCredential.GUID }));
        toast.success('Credential deleted successfully');
        setIsDeleteModelVisible(false);
        setSelectedCredential(null);

        onCredentialDeleted && onCredentialDeleted();
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
        setSelectedCredential(null);
      }}
      confirmLoading={isLoading}
      okText="Delete"
      okButtonProps={{ danger: true }}
    >
      <LitegraphParagraph>{paragraphText}</LitegraphParagraph>
    </LitegraphModal>
  );
};

export default DeleteCredential;
