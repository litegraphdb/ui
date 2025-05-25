'use client';
import { useEffect, useState } from 'react';
import { Form } from 'antd';
import { useCreateTag, useUpdateTagById } from '@/lib/sdk/litegraph.service';
import { TagType } from '@/lib/store/tag/types';
import LitegraphModal from '@/components/base/modal/Modal';
import LitegraphFormItem from '@/components/base/form/FormItem';
import LitegraphInput from '@/components/base/input/Input';
import LitegraphSelect from '@/components/base/select/Select';
import { useAppDispatch } from '@/lib/store/hooks';
import { createTag, updateTag } from '@/lib/store/tag/actions';
import toast from 'react-hot-toast';
import { v4 } from 'uuid';
import { useNodeAndEdge } from '@/hooks/entityHooks';

interface AddEditTagProps {
  isAddEditTagVisible: boolean;
  setIsAddEditTagVisible: (visible: boolean) => void;
  tag: TagType | null;
  selectedGraph: string;
  onTagUpdated?: () => Promise<void>;
}

const AddEditTag = ({
  isAddEditTagVisible,
  setIsAddEditTagVisible,
  tag,
  selectedGraph,
  onTagUpdated,
}: AddEditTagProps) => {
  const dispatch = useAppDispatch();
  const [form] = Form.useForm();
  const [formValid, setFormValid] = useState(false);
  const { createTags, isLoading: isCreateLoading } = useCreateTag();
  const { updateTagById, isLoading: isUpdateLoading } = useUpdateTagById();
  const { nodeOptions, edgeOptions } = useNodeAndEdge(selectedGraph);

  // Add form validation watcher
  const [formValues, setFormValues] = useState({});
  useEffect(() => {
    form
      .validateFields({ validateOnly: true })
      .then(() => setFormValid(true))
      .catch(() => setFormValid(false));
  }, [formValues, form]);

  useEffect(() => {
    if (tag) {
      form.setFieldsValue({
        Key: tag.Key,
        Value: tag.Value,
        NodeGUID: tag.NodeGUID,
        EdgeGUID: tag.EdgeGUID,
      });
    } else {
      form.resetFields();
    }
  }, [tag, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (tag) {
        // Update existing tag
        const updatedTag = {
          GUID: tag.GUID,
          GraphGUID: tag.GraphGUID,
          TenantGUID: tag.TenantGUID || '00000000-0000-0000-0000-000000000000',
          CreatedUtc: tag.CreatedUtc,
          Key: values.Key,
          Value: values.Value,
          NodeGUID: values.NodeGUID || tag.NodeGUID,
          EdgeGUID: values.EdgeGUID || tag.EdgeGUID,
          LastUpdateUtc: new Date().toISOString(),
        };

        if (!updatedTag.GUID) {
          throw new Error('Tag GUID is missing');
        }

        const res = await updateTagById(updatedTag);

        if (res) {
          dispatch(updateTag(res));
          toast.success('Tag updated successfully');
          setIsAddEditTagVisible(false);
          form.resetFields();
          onTagUpdated && (await onTagUpdated());
        } else {
          toast.error('Failed to update tag - no response received');
        }
      } else {
        // Create new tag
        const newTag = {
          ...values,
          GUID: v4(),
          GraphGUID: selectedGraph,
          TenantGUID: '00000000-0000-0000-0000-000000000000',
          CreatedUtc: new Date().toISOString(),
          LastUpdateUtc: new Date().toISOString(),
        };
        const res = await createTags(newTag);
        if (res) {
          dispatch(createTag(newTag));
          toast.success('Tag created successfully');
          setIsAddEditTagVisible(false);
          form.resetFields();
          onTagUpdated && (await onTagUpdated());
        }
      }
    } catch (error: unknown) {
      console.error('Failed to submit:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to update tag: ${errorMessage}`);
    }
  };

  return (
    <LitegraphModal
      title={tag ? 'Edit Tag' : 'Create Tag'}
      open={isAddEditTagVisible}
      onOk={handleSubmit}
      onCancel={() => {
        setIsAddEditTagVisible(false);
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
          label="Key"
          name="Key"
          rules={[{ required: true, message: 'Please input tag key!' }]}
        >
          <LitegraphInput placeholder="Enter tag key" />
        </LitegraphFormItem>

        <LitegraphFormItem
          label="Value"
          name="Value"
          rules={[{ required: true, message: 'Please input tag value!' }]}
        >
          <LitegraphInput placeholder="Enter tag value" />
        </LitegraphFormItem>

        <LitegraphFormItem label="Node" name="NodeGUID">
          <LitegraphSelect placeholder="Select Node" options={nodeOptions} allowClear />
        </LitegraphFormItem>

        <LitegraphFormItem label="Edge" name="EdgeGUID">
          <LitegraphSelect placeholder="Select Edge" options={edgeOptions} allowClear />
        </LitegraphFormItem>
      </Form>
    </LitegraphModal>
  );
};

export default AddEditTag;
