'use client';
import { useEffect, useState } from 'react';
import { Form, Switch, Select } from 'antd';
import {
  useCreateCredentials,
  useUpdateCredentialsById,
  useGetUsersList,
} from '@/lib/sdk/litegraph.service';
import { CredentialType } from '@/lib/store/credential/types';
import LitegraphModal from '@/components/base/modal/Modal';
import LitegraphFormItem from '@/components/base/form/FormItem';
import LitegraphInput from '@/components/base/input/Input';
import { useAppDispatch } from '@/lib/store/hooks';
import { createCredential, updateCredential } from '@/lib/store/credential/actions';
import toast from 'react-hot-toast';

import { v4 } from 'uuid';
import { useUsers } from '@/hooks/entityHooks';
import { formatDateTime } from '@/utils/dateUtils';

interface AddEditCredentialProps {
  isAddEditCredentialVisible: boolean;
  setIsAddEditCredentialVisible: (visible: boolean) => void;
  credential: CredentialType | null;
  onCredentialUpdated?: () => Promise<void>;
}

const AddEditCredential = ({
  isAddEditCredentialVisible,
  setIsAddEditCredentialVisible,
  credential,
  onCredentialUpdated,
}: AddEditCredentialProps) => {
  const dispatch = useAppDispatch();
  const [form] = Form.useForm();
  const [formValid, setFormValid] = useState(false);
  const { createCredentials: createCredentialService, isLoading: isCreateLoading } =
    useCreateCredentials();
  const { updateCredentialById, isLoading: isUpdateLoading } = useUpdateCredentialsById();
  const { usersList, isLoading: isUsersLoading } = useUsers();
  const userOptions = usersList.map((user) => ({ label: user.FirstName, value: user.GUID }));

  // Add form validation watcher
  const [formValues, setFormValues] = useState({});
  useEffect(() => {
    form
      .validateFields({ validateOnly: true })
      .then(() => setFormValid(true))
      .catch(() => setFormValid(false));
  }, [formValues, form]);

  useEffect(() => {
    if (credential) {
      form.setFieldsValue({
        UserGUID: credential.UserGUID,
        Name: credential.Name,
        BearerToken: credential.BearerToken,
        Active: credential.Active,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ Active: true });
    }
  }, [credential, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (credential) {
        // Update existing credential
        const updatedCredential = {
          ...credential,
          ...values,
          LastUpdateUtc: new Date().toISOString(),
        };

        const res = await updateCredentialById(updatedCredential);

        if (res) {
          dispatch(updateCredential(res)); // Use the response data instead of updatedCredential
          toast.success('Credential updated successfully');
          setIsAddEditCredentialVisible(false);
          form.resetFields();
          onCredentialUpdated && onCredentialUpdated();
        } else {
          toast.error('Failed to update credential - no response received');
        }
      } else {
        // Create new credential
        const newCredential = {
          ...values,
          GUID: v4(),
          TenantGUID: '00000000-0000-0000-0000-000000000000',
          CreatedUtc: new Date().toISOString(),
          LastUpdateUtc: new Date().toISOString(),
          CreatedAt: formatDateTime(new Date().toISOString()), // Set CreatedAt field using formatDateTime
        };
        const res = await createCredentialService(newCredential);
        if (res) {
          dispatch(createCredential(newCredential));
          toast.success('Credential created successfully');
          setIsAddEditCredentialVisible(false);
          form.resetFields();
          onCredentialUpdated && onCredentialUpdated();
        }
      }
    } catch (error: unknown) {
      console.error('Failed to submit:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to update credential: ${errorMessage}`);
    }
  };

  return (
    <LitegraphModal
      title={credential ? 'Edit Credential' : 'Create Credential'}
      open={isAddEditCredentialVisible}
      onOk={handleSubmit}
      onCancel={() => {
        setIsAddEditCredentialVisible(false);
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
          label="User GUID"
          name="UserGUID"
          rules={[{ required: true, message: 'Please select user GUID!' }]}
        >
          <Select
            placeholder="Select user GUID"
            options={userOptions}
            loading={isUsersLoading}
            disabled={!!credential}
          />
        </LitegraphFormItem>

        <LitegraphFormItem
          label="Name"
          name="Name"
          rules={[{ required: true, message: 'Please input name!' }]}
        >
          <LitegraphInput placeholder="Enter name" data-testid="name-input" />
        </LitegraphFormItem>

        <LitegraphFormItem
          label="Bearer Token"
          name="BearerToken"
          rules={[{ required: true, message: 'Please input bearer token!' }]}
        >
          <LitegraphInput placeholder="Enter bearer token" disabled={!!credential} />
        </LitegraphFormItem>

        <LitegraphFormItem label="Active" name="Active" valuePropName="checked">
          <Switch data-testid="active-switch" />
        </LitegraphFormItem>
      </Form>
    </LitegraphModal>
  );
};

export default AddEditCredential;
