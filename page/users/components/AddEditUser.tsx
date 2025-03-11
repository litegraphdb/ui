'use client';
import { useEffect, useState } from 'react';
import { Form, Switch, Select, Input } from 'antd';
import { useCreateUsers, useUpdateUsersById, useGetTenants } from '@/lib/sdk/litegraph.service';
import { UserType } from '@/lib/store/user/types';
import LitegraphModal from '@/components/base/modal/Modal';
import LitegraphFormItem from '@/components/base/form/FormItem';
import LitegraphInput from '@/components/base/input/Input';
import { useAppDispatch } from '@/lib/store/hooks';
import { createUser, updateUser } from '@/lib/store/user/actions';
import toast from 'react-hot-toast';
import { v4 } from 'uuid';

interface AddEditUserProps {
  isAddEditUserVisible: boolean;
  setIsAddEditUserVisible: (visible: boolean) => void;
  user: UserType | null;
  onUserUpdated?: () => Promise<void>;
}

const AddEditUser = ({
  isAddEditUserVisible,
  setIsAddEditUserVisible,
  user,
  onUserUpdated,
}: AddEditUserProps) => {
  const dispatch = useAppDispatch();
  const [form] = Form.useForm();
  const [formValid, setFormValid] = useState(false);
  const { createUsers: createUserService, isLoading: isCreateLoading } = useCreateUsers();
  const { updateUserById, isLoading: isUpdateLoading } = useUpdateUsersById();

  // Add form validation watcher
  const [formValues, setFormValues] = useState({});
  useEffect(() => {
    form
      .validateFields({ validateOnly: true })
      .then(() => setFormValid(true))
      .catch(() => setFormValid(false));
  }, [formValues, form]);

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        FirstName: user.FirstName,
        LastName: user.LastName,
        Email: user.Email,
        Password: user.Password,
        Active: user.Active,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ Active: true });
    }
  }, [user, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (user) {
        // Update existing user
        const updatedUser = {
          ...user,
          ...values,
          LastUpdateUtc: new Date().toISOString(),
        };

        const res = await updateUserById(updatedUser);

        if (res) {
          dispatch(updateUser(res)); // Use the response data instead of updatedUser
          toast.success('User updated successfully');
          setIsAddEditUserVisible(false);
          form.resetFields();
          onUserUpdated && onUserUpdated();
        } else {
          toast.error('Failed to update user - no response received');
        }
      } else {
        // Create new user
        const newUser = {
          ...values,
          GUID: v4(),
          CreatedUtc: new Date().toISOString(),
          LastUpdateUtc: new Date().toISOString(),
        };
        const res = await createUserService(newUser);
        if (res) {
          dispatch(createUser(newUser));
          toast.success('User created successfully');
          setIsAddEditUserVisible(false);
          form.resetFields();
          onUserUpdated && onUserUpdated();
        }
      }
    } catch (error: unknown) {
      console.error('Failed to submit:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to update user: ${errorMessage}`);
    }
  };

  return (
    <LitegraphModal
      title={user ? 'Edit User' : 'Create User'}
      open={isAddEditUserVisible}
      onOk={handleSubmit}
      onCancel={() => {
        setIsAddEditUserVisible(false);
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
          label="First Name"
          name="FirstName"
          rules={[{ required: true, message: 'Please input First Name!' }]}
        >
          <LitegraphInput placeholder="Enter First Name" />
        </LitegraphFormItem>

        <LitegraphFormItem
          label="Last Name"
          name="LastName"
          rules={[{ required: true, message: 'Please input Last Name!' }]}
        >
          <LitegraphInput placeholder="Enter Last Name" />
        </LitegraphFormItem>

        <LitegraphFormItem
          label="Email"
          name="Email"
          rules={[
            { required: true, message: 'Please input your email!' },
            { type: 'email', message: 'Please enter a valid email!' },
          ]}
        >
          <LitegraphInput placeholder="Email" size="large" autoComplete="off" />
        </LitegraphFormItem>

        <LitegraphFormItem
          label="Password"
          name="Password"
          rules={[{ required: true, message: 'Please input Password!' }]}
        >
          <Input.Password placeholder="Enter password" autoComplete="new-password" />
        </LitegraphFormItem>

        <LitegraphFormItem label="Active" name="Active" valuePropName="checked">
          <Switch />
        </LitegraphFormItem>
      </Form>
    </LitegraphModal>
  );
};

export default AddEditUser;
