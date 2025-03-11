'use client';
import { Form } from 'antd';
import LitegraphModal from '@/components/base/modal/Modal';
import LitegraphFormItem from '@/components/base/form/FormItem';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import LitegraphInput from '@/components/base/input/Input';
import { JsonEditor } from 'jsoneditor-react';
import { v4 } from 'uuid';
import { useCreateNode, useUpdateNodeById } from '@/lib/sdk/litegraph.service';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { validationRules } from './constant';
import { NodeType } from '@/lib/store/node/types';
import { updateNode, createNode } from '@/lib/store/node/actions';
import { RootState } from '@/lib/store/store';
import toast from 'react-hot-toast';
import VectorsInput from '@/components/inputs/vectors-input.tsx/VectorsInput';
import LabelInput from '@/components/inputs/label-input/LabelInput';
import TagsInput from '@/components/inputs/tags-input/TagsInput';
import { convertTagsToRecord } from '@/components/inputs/tags-input/utils';
import { convertVectorsToAPIRecord } from '@/components/inputs/vectors-input.tsx/utils';
import { useGraphs } from '@/hooks/entityHooks';

const initialValues = {
  graphName: '',
  name: '',
  data: {},
  labels: [],
  tags: [],
  vectors: [],
};

interface AddEditNodeProps {
  isAddEditNodeVisible: boolean;
  setIsAddEditNodeVisible: Dispatch<SetStateAction<boolean>>;
  node: NodeType | null;
  selectedGraph: string;
  onNodeUpdated?: () => Promise<void>;
}

const AddEditNode = ({
  isAddEditNodeVisible,
  setIsAddEditNodeVisible,
  node,
  selectedGraph,
  onNodeUpdated,
}: AddEditNodeProps) => {
  const dispatch = useAppDispatch();
  const [form] = Form.useForm();
  const [formValid, setFormValid] = useState(false);
  const [uniqueKey, setUniqueKey] = useState(v4());

  const { graphsList } = useGraphs();

  const { createNodes, isLoading: isCreateLoading } = useCreateNode();
  const { updateNodeById, isLoading: isUpdateLoading } = useUpdateNodeById();

  // Add form validation watcher
  const [formValues, setFormValues] = useState({});
  useEffect(() => {
    form
      .validateFields({ validateOnly: true })
      .then(() => setFormValid(true))
      .catch(() => setFormValid(false));
  }, [formValues, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const tags: Record<string, string> = convertTagsToRecord(values.tags);
      if (node) {
        // Edit Node
        const data = {
          GUID: node.GUID,
          GraphGUID: node.GraphGUID,
          CreatedUtc: node.createdUtc,
          Name: values.name,
          Data: values.data,
          Labels: values.labels,
          Tags: tags,
          Vectors: convertVectorsToAPIRecord(values.vectors),
        };
        const res = await updateNodeById(data);
        if (res) {
          dispatch(updateNode(res));
          toast.success('Update Node successfully');
          setIsAddEditNodeVisible(false);
          onNodeUpdated && (await onNodeUpdated());
        } else {
          throw new Error('Failed to update node - no response received');
        }
      } else {
        // Add Node
        const data = {
          GUID: v4(),
          GraphGUID: selectedGraph,
          Name: values.name,
          Data: values.data,
          Labels: values.labels,
          Tags: tags,
          Vectors: convertVectorsToAPIRecord(values.vectors),
        };
        const res = await createNodes(data);
        if (res) {
          dispatch(createNode(res));
          toast.success('Add Node successfully');
          setIsAddEditNodeVisible(false);
          onNodeUpdated && (await onNodeUpdated());
        } else {
          throw new Error('Failed to create node - no response received');
        }
      }
    } catch (error: unknown) {
      console.error('Error submitting form:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to update node: ${errorMessage}`);
    }
  };

  useEffect(() => {
    if (node) {
      // Reset the form and set values for the new node
      form.resetFields();
      // Ensure form values are updated when editing
      form.setFieldsValue({
        name: node.name || '',
        data: node.data || {},
        labels: node.labels || [],
        tags: Object.entries(node.tags || {}).map(([key, value]) => ({
          key,
          value,
        })),
        vectors: node.vectors || [],
      });
      setUniqueKey(v4());
    } else {
      form.resetFields();
      setUniqueKey(v4());
    }
    const data = graphsList?.find((graph) => graph.GUID === selectedGraph);
    data && form.setFieldValue('graphName', data.name);

    // Trigger initial validation
    form
      .validateFields({ validateOnly: true })
      .then(() => setFormValid(true))
      .catch(() => setFormValid(false));
  }, [node, selectedGraph, graphsList, form]);

  return (
    <LitegraphModal
      title={node ? 'Edit Node' : 'Create Node'}
      okText={node ? 'Update' : 'Create'}
      open={isAddEditNodeVisible}
      onOk={handleSubmit}
      confirmLoading={isCreateLoading || isUpdateLoading}
      onCancel={() => setIsAddEditNodeVisible(false)}
      width={800}
      okButtonProps={{ disabled: !formValid, 'data-testid': 'add-node-submit-button' }}
    >
      <Form
        initialValues={initialValues}
        form={form}
        layout="vertical"
        labelCol={{ xs: 5, md: 5, lg: 4 }}
        wrapperCol={{ span: 24 }}
        onValuesChange={(_, allValues) => setFormValues(allValues)}
      >
        {/* Graph Name */}
        <LitegraphFormItem label="Graph Name" name="graphName">
          <LitegraphInput readOnly disabled />
        </LitegraphFormItem>

        {/* Node Name */}
        <LitegraphFormItem label="Name" name="name" rules={validationRules.name}>
          <LitegraphInput placeholder="Enter node name" data-testid="node-name-input" />
        </LitegraphFormItem>

        <Form.Item label="Labels">
          <LabelInput name="labels" />
        </Form.Item>
        <Form.Item label="Tags">
          <TagsInput name="tags" />
        </Form.Item>
        <Form.Item label="Vectors">
          <VectorsInput name="vectors" />
        </Form.Item>
        {/* The JsonEditor for Node Data */}
        <LitegraphFormItem label="Data" name="data">
          <JsonEditor
            key={uniqueKey}
            value={form.getFieldValue('data') || {}}
            onChange={(json: any) => {
              form.setFieldsValue({ data: json });
            }}
            enableSort={false}
            enableTransform={false}
            mode="code"
            data-testid="node-data-input"
          />
        </LitegraphFormItem>
      </Form>
    </LitegraphModal>
  );
};

export default AddEditNode;
