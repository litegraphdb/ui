'use client';
import { useEffect, useState } from 'react';
import { Form, Switch, Select } from 'antd';
import { useCreateTenants, useUpdateTenantsById, useGetTenants } from '@/lib/sdk/litegraph.service';
import { TenantType } from '@/lib/store/tenants/types';
import LitegraphModal from '@/components/base/modal/Modal';
import LitegraphFormItem from '@/components/base/form/FormItem';
import LitegraphInput from '@/components/base/input/Input';
import { useAppDispatch } from '@/lib/store/hooks';
import { createTenant, updateTenant } from '@/lib/store/tenants/actions';
import toast from 'react-hot-toast';
import { v4 } from 'uuid';

interface AddEditTenantProps {
  isAddEditTenantVisible: boolean;
  setIsAddEditTenantVisible: (visible: boolean) => void;
  tenant: TenantType | null;
  onTenantUpdated?: () => Promise<void>;
}

const AddEditTenant = ({
  isAddEditTenantVisible,
  setIsAddEditTenantVisible,
  tenant,
  onTenantUpdated,
}: AddEditTenantProps) => {
  const dispatch = useAppDispatch();
  const [form] = Form.useForm();
  const [formValid, setFormValid] = useState(false);
  const { createTenants: createTenantService, isLoading: isCreateLoading } = useCreateTenants();
  const { updateTenantById, isLoading: isUpdateLoading } = useUpdateTenantsById();

  // Add form validation watcher
  const [formValues, setFormValues] = useState({});
  useEffect(() => {
    form
      .validateFields({ validateOnly: true })
      .then(() => setFormValid(true))
      .catch(() => setFormValid(false));
  }, [formValues, form]);

  useEffect(() => {
    if (tenant) {
      form.setFieldsValue({
        Name: tenant.Name,
        Active: tenant.Active,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ Active: true });
    }
  }, [tenant, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (tenant) {
        // Update existing tenant
        const updatedTenant = {
          ...tenant,
          ...values,
          LastUpdateUtc: new Date().toISOString(),
        };

        const res = await updateTenantById(updatedTenant);

        if (res) {
          dispatch(updateTenant(res)); // Use the response data instead of updatedTenant
          toast.success('Tenant updated successfully');
          setIsAddEditTenantVisible(false);
          form.resetFields();
          onTenantUpdated && onTenantUpdated();
        } else {
          toast.error('Failed to update tenant - no response received');
        }
      } else {
        // Create new tenant
        const newTenant = {
          ...values,
          GUID: v4(),
          CreatedUtc: new Date().toISOString(),
          LastUpdateUtc: new Date().toISOString(),
        };
        const res = await createTenantService(newTenant);
        if (res) {
          dispatch(createTenant(newTenant));
          toast.success('Tenant created successfully');
          setIsAddEditTenantVisible(false);
          form.resetFields();
          onTenantUpdated && onTenantUpdated();
        }
      }
    } catch (error: unknown) {}
  };

  return (
    <LitegraphModal
      title={tenant ? 'Edit Tenant' : 'Create Tenant'}
      open={isAddEditTenantVisible}
      onOk={handleSubmit}
      onCancel={() => {
        setIsAddEditTenantVisible(false);
        form.resetFields();
      }}
      confirmLoading={isCreateLoading || isUpdateLoading}
      okButtonProps={{ disabled: !formValid }}
    >
      <Form
        form={form}
        layout="vertical"
        onValuesChange={(_, allValues) => setFormValues(allValues)}
      >
        <LitegraphFormItem
          label="Name"
          name="Name"
          rules={[{ required: true, message: 'Please input Name!' }]}
        >
          <LitegraphInput placeholder="Enter Name" />
        </LitegraphFormItem>

        <LitegraphFormItem label="Active" name="Active" valuePropName="checked">
          <Switch />
        </LitegraphFormItem>
      </Form>
    </LitegraphModal>
  );
};

export default AddEditTenant;
