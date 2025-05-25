'use client';
import { useEffect, useState } from 'react';
import { Form } from 'antd';
import { useCreateLabel, useUpdateLabelById } from '@/lib/sdk/litegraph.service';
import { LabelType } from '@/lib/store/label/types';
import LitegraphModal from '@/components/base/modal/Modal';
import LitegraphFormItem from '@/components/base/form/FormItem';
import LitegraphInput from '@/components/base/input/Input';
import LitegraphSelect from '@/components/base/select/Select';
import { useAppDispatch } from '@/lib/store/hooks';
import { createLabel, updateLabel } from '@/lib/store/label/actions';
import toast from 'react-hot-toast';
import { v4 } from 'uuid';
import { useNodeAndEdge } from '@/hooks/entityHooks';

interface AddEditLabelProps {
  isAddEditLabelVisible: boolean;
  setIsAddEditLabelVisible: (visible: boolean) => void;
  label: LabelType | null;
  selectedGraph: string;
  onLabelUpdated?: () => Promise<void>;
}

const AddEditLabel = ({
  isAddEditLabelVisible,
  setIsAddEditLabelVisible,
  label,
  selectedGraph,
  onLabelUpdated,
}: AddEditLabelProps) => {
  const dispatch = useAppDispatch();
  const [form] = Form.useForm();
  const [formValid, setFormValid] = useState(false);
  const { createLabels, isLoading: isCreateLoading } = useCreateLabel();
  const { updateLabelById, isLoading: isUpdateLoading } = useUpdateLabelById();
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
    if (label) {
      form.setFieldsValue({
        Label: label.Label,
        NodeGUID: label.NodeGUID,
        EdgeGUID: label.EdgeGUID,
      });
    } else {
      form.resetFields();
    }
  }, [label, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (label) {
        // Update existing label
        const updatedLabel = {
          GUID: label.GUID,
          GraphGUID: label.GraphGUID,
          TenantGUID: label.TenantGUID || '00000000-0000-0000-0000-000000000000',
          CreatedUtc: label.CreatedUtc,
          Label: values.Label,
          NodeGUID: values.NodeGUID || label.NodeGUID,
          EdgeGUID: values.EdgeGUID || label.EdgeGUID,
          LastUpdateUtc: new Date().toISOString(),
        };

        if (!updatedLabel.GUID) {
          throw new Error('Label GUID is missing');
        }

        const res = await updateLabelById(updatedLabel);

        if (res) {
          dispatch(updateLabel(res));
          toast.success('Label updated successfully');
          setIsAddEditLabelVisible(false);
          form.resetFields();
          onLabelUpdated && (await onLabelUpdated());
        } else {
          toast.error('Failed to update label - no response received');
        }
      } else {
        // Create new label
        const newLabel = {
          ...values,
          GUID: v4(),
          GraphGUID: selectedGraph,
          TenantGUID: '00000000-0000-0000-0000-000000000000',
          CreatedUtc: new Date().toISOString(),
          LastUpdateUtc: new Date().toISOString(),
        };
        const res = await createLabels(newLabel);
        if (res) {
          dispatch(createLabel(newLabel));
          toast.success('Label created successfully');
          setIsAddEditLabelVisible(false);
          form.resetFields();
          onLabelUpdated && (await onLabelUpdated());
        }
      }
    } catch (error: unknown) {
      console.error('Failed to submit:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to update label: ${errorMessage}`);
    }
  };

  return (
    <LitegraphModal
      title={label ? 'Edit Label' : 'Create Label'}
      open={isAddEditLabelVisible}
      onOk={handleSubmit}
      onCancel={() => {
        setIsAddEditLabelVisible(false);
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
          label="Label"
          name="Label"
          rules={[{ required: true, message: 'Please input Label label!' }]}
        >
          <LitegraphInput placeholder="Enter label label" />
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

export default AddEditLabel;
