'use client';
import { TenantType } from '@/lib/store/tenants/types';
import LitegraphModal from '@/components/base/modal/Modal';
import LitegraphParagraph from '@/components/base/typograpghy/Paragraph';
import toast from 'react-hot-toast';
import { useDeleteTenantMutation } from '@/lib/store/slice/slice';

interface DeleteTenantProps {
  title: string;
  paragraphText: string;
  isDeleteModelVisible: boolean;
  setIsDeleteModelVisible: (visible: boolean) => void;
  selectedTenant: TenantType | null | undefined;
  setSelectedTenant: (tenant: TenantType | null) => void;

  onTenantDeleted?: () => Promise<void>;
}

const DeleteTenant = ({
  title,
  paragraphText,
  isDeleteModelVisible,
  setIsDeleteModelVisible,
  selectedTenant,
  setSelectedTenant,

  onTenantDeleted,
}: DeleteTenantProps) => {
  const [deleteTenantById, { isLoading }] = useDeleteTenantMutation();

  const handleDelete = async () => {
    if (selectedTenant) {
      const res = await deleteTenantById(selectedTenant.GUID);
      if (res) {
        toast.success('Tenant deleted successfully');
        setIsDeleteModelVisible(false);
        setSelectedTenant(null);
        onTenantDeleted && onTenantDeleted();
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
        setSelectedTenant(null);
      }}
      confirmLoading={isLoading}
      okText="Delete"
      okButtonProps={{ danger: true }}
    >
      <LitegraphParagraph>{paragraphText}</LitegraphParagraph>
    </LitegraphModal>
  );
};

export default DeleteTenant;
