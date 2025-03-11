'use client';
import { useEffect, useRef, useState } from 'react';
import { Form } from 'antd';
import { useCreateVector, useUpdateVectorById } from '@/lib/sdk/litegraph.service';
import { VectorType } from '@/lib/store/vector/types';
import LitegraphModal from '@/components/base/modal/Modal';
import LitegraphFormItem from '@/components/base/form/FormItem';
import LitegraphInput from '@/components/base/input/Input';
import LitegraphSelect from '@/components/base/select/Select';
import { useAppDispatch } from '@/lib/store/hooks';
import { createVector, updateVector } from '@/lib/store/vector/actions';
import toast from 'react-hot-toast';
import { v4 } from 'uuid';
import { useNodeAndEdge } from '@/hooks/entityHooks';
import { JsonEditor } from 'jsoneditor-react';

interface AddEditVectorProps {
  isAddEditVectorVisible: boolean;
  setIsAddEditVectorVisible: (visible: boolean) => void;
  vector: VectorType | null;
  selectedGraph: string;
  onVectorUpdated?: () => Promise<void>;
}

const AddEditVector = ({
  isAddEditVectorVisible,
  setIsAddEditVectorVisible,
  vector,
  selectedGraph,
  onVectorUpdated,
}: AddEditVectorProps) => {
  const dispatch = useAppDispatch();
  const [form] = Form.useForm();
  const [formValid, setFormValid] = useState(false);
  const { createVectors, isLoading: isCreateLoading } = useCreateVector();
  const { updateVectorById, isLoading: isUpdateLoading } = useUpdateVectorById();
  const { nodeOptions, edgeOptions } = useNodeAndEdge(selectedGraph);
  const [uniqueKey, setUniqueKey] = useState(v4());
  // Add form validation watcher
  const [formValues, setFormValues] = useState({});
  useEffect(() => {
    form
      .validateFields({ validateOnly: true })
      .then(() => setFormValid(true))
      .catch(() => setFormValid(false));
  }, [formValues, form]);

  useEffect(() => {
    if (vector) {
      console.log('vector', vector);
      form.setFieldsValue({
        Model: vector.Model,
        Dimensionality: vector.Dimensionality,
        Content: vector.Content,
        Vectors: vector.Vectors,
        NodeGUID: vector.NodeGUID,
        EdgeGUID: vector.EdgeGUID,
      });
      setUniqueKey(v4());
    } else {
      form.resetFields();
      setUniqueKey(v4());
    }
  }, [vector, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Parse vectors - handle both string and array cases
      const vectorsArray = Array.isArray(values.Vectors)
        ? values.Vectors
        : values.Vectors.split(',').map((num: string) => parseFloat(num.trim()));

      if (vector) {
        // Update existing vector
        const vectorToUpdate = {
          GUID: vector.GUID,
          GraphGUID: selectedGraph,
          Model: values.Model,
          Dimensionality: Number(values.Dimensionality),
          Content: values.Content,
          Vectors: vectorsArray.map((v: number) => Number(v)),
          NodeGUID: values.NodeGUID === undefined ? null : values.NodeGUID,
          EdgeGUID: values.EdgeGUID === undefined ? null : values.EdgeGUID,
          LastUpdateUtc: new Date().toISOString(),
        };

        const res = await updateVectorById(vectorToUpdate);

        if (res) {
          dispatch(updateVector(res));
          toast.success('Vector updated successfully');
          setIsAddEditVectorVisible(false);
          form.resetFields();
          onVectorUpdated && (await onVectorUpdated());
        } else {
          throw new Error('Failed to update vector - no response received');
        }
      } else {
        // Create new vector
        const newVector = {
          GUID: v4(),
          GraphGUID: selectedGraph,
          TenantGUID: '00000000-0000-0000-0000-000000000000',
          Model: values.Model,
          Dimensionality: Number(values.Dimensionality),
          Content: values.Content,
          Vectors: vectorsArray.map((v: number) => Number(v)),
          NodeGUID: values.NodeGUID || null,
          EdgeGUID: values.EdgeGUID || null,
          CreatedUtc: new Date().toISOString(),
          LastUpdateUtc: new Date().toISOString(),
        };

        const res = await createVectors(newVector);
        if (res) {
          dispatch(createVector(res));
          toast.success('Vector created successfully');
          setIsAddEditVectorVisible(false);
          form.resetFields();
          onVectorUpdated && (await onVectorUpdated());
        } else {
          throw new Error('Failed to create vector - no response received');
        }
      }
    } catch (error: unknown) {
      console.error('Failed to submit:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to update vector: ${errorMessage}`);
    }
  };

  return (
    <LitegraphModal
      title={vector ? 'Edit Vector' : 'Create Vector'}
      open={isAddEditVectorVisible}
      onOk={handleSubmit}
      onCancel={() => {
        setIsAddEditVectorVisible(false);
        form.resetFields();
      }}
      confirmLoading={isCreateLoading || isUpdateLoading}
      okButtonProps={{ disabled: !formValid }}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          Vectors: [0.1, 0.2, 0.3],
        }}
        onValuesChange={(_, allValues) => setFormValues(allValues)}
      >
        <LitegraphFormItem
          label="Model"
          name="Model"
          rules={[{ required: true, message: 'Please input Model!' }]}
        >
          <LitegraphInput placeholder="Enter Model" />
        </LitegraphFormItem>
        <LitegraphFormItem
          label="Dimensionality"
          name="Dimensionality"
          rules={[{ required: true, message: 'Please input Dimensionality!' }]}
        >
          <LitegraphInput type="number" placeholder="Enter Dimensionality" />
        </LitegraphFormItem>
        <LitegraphFormItem
          label="Content"
          name="Content"
          rules={[{ required: true, message: 'Please input Content!' }]}
        >
          <LitegraphInput placeholder="Enter Content" />
        </LitegraphFormItem>
        <LitegraphFormItem
          label="Vectors"
          name="Vectors"
          rules={[{ required: true, message: 'Please input Vectors!' }]}
        >
          <JsonEditor
            key={uniqueKey}
            value={form.getFieldValue('Vectors') || []}
            onChange={(json: any) => {
              form.setFieldsValue({ Vectors: json });
            }}
            mode="code"
            enableSort={false}
            enableTransform={false}
            data-testid="graph-data-input"
          />
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

export default AddEditVector;
