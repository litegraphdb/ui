'use client';
import { useDeleteTenantsById } from '@/lib/sdk/litegraph.service';
import { TenantType } from '@/lib/store/tenants/types';
import LitegraphModal from '@/components/base/modal/Modal';
import LitegraphParagraph from '@/components/base/typograpghy/Paragraph';
import { useAppDispatch } from '@/lib/store/hooks';
import { deleteTenant } from '@/lib/store/tenants/actions';
import toast from 'react-hot-toast';

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
  const dispatch = useAppDispatch();
  const { deleteTenantById, isLoading } = useDeleteTenantsById();

  const handleDelete = async () => {
    if (selectedTenant) {
      const res = await deleteTenantById(selectedTenant.GUID);
      if (res) {
        dispatch(deleteTenant({ GUID: selectedTenant.GUID }));
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
