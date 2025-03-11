'use client';
import { useDeleteUsersById } from '@/lib/sdk/litegraph.service';
import { UserType } from '@/lib/store/user/types';
import LitegraphModal from '@/components/base/modal/Modal';
import LitegraphParagraph from '@/components/base/typograpghy/Paragraph';
import { useAppDispatch } from '@/lib/store/hooks';
import { deleteUser } from '@/lib/store/user/actions';
import toast from 'react-hot-toast';

interface DeleteUserProps {
  title: string;
  paragraphText: string;
  isDeleteModelVisible: boolean;
  setIsDeleteModelVisible: (visible: boolean) => void;
  selectedUser: UserType | null | undefined;
  setSelectedUser: (user: UserType | null) => void;

  onUserDeleted?: () => Promise<void>;
}

const DeleteUser = ({
  title,
  paragraphText,
  isDeleteModelVisible,
  setIsDeleteModelVisible,
  selectedUser,
  setSelectedUser,

  onUserDeleted,
}: DeleteUserProps) => {
  const dispatch = useAppDispatch();
  const { deleteUserById, isLoading } = useDeleteUsersById();

  const handleDelete = async () => {
    if (selectedUser) {
      const res = await deleteUserById(selectedUser.GUID);
      if (res) {
        dispatch(deleteUser({ GUID: selectedUser.GUID }));
        toast.success('User deleted successfully');
        setIsDeleteModelVisible(false);
        setSelectedUser(null);

        onUserDeleted && onUserDeleted();
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
        setSelectedUser(null);
      }}
      confirmLoading={isLoading}
      okText="Delete"
      okButtonProps={{ danger: true }}
    >
      <LitegraphParagraph>{paragraphText}</LitegraphParagraph>
    </LitegraphModal>
  );
};

export default DeleteUser;
