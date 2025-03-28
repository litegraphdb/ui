'use client';
import { Form, Select } from 'antd';
import LitegraphModal from '@/components/base/modal/Modal';
import LitegraphFormItem from '@/components/base/form/FormItem';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import LitegraphInput from '@/components/base/input/Input';
import { JsonEditor } from 'jsoneditor-react';
import { v4 } from 'uuid';
import { useCreateEdge, useUpdateEdgeById } from '@/lib/sdk/litegraph.service';
import { useAppDispatch } from '@/lib/store/hooks';
import { validationRules } from './constant';
import { EdgeType } from '@/lib/store/edge/types';
import { createEdge, updateEdge } from '@/lib/store/edge/actions';
import LitegraphSelect from '@/components/base/select/Select';
import toast from 'react-hot-toast';
import { useNodes, useGraphs } from '@/hooks/entityHooks';
import LabelInput from '@/components/inputs/label-input/LabelInput';
import VectorsInput from '@/components/inputs/vectors-input.tsx/VectorsInput';
import TagsInput from '@/components/inputs/tags-input/TagsInput';
import { convertVectorsToAPIRecord } from '@/components/inputs/vectors-input.tsx/utils';
import { convertTagsToRecord } from '@/components/inputs/tags-input/utils';

const initialValues = {
  graphName: '',
  Name: '',
  cost: 0,
  data: {},
  labels: [],
  tags: [],
  vectors: [],
};

interface AddEditEdgeProps {
  isAddEditEdgeVisible: boolean;
  setIsAddEditEdgeVisible: Dispatch<SetStateAction<boolean>>;
  edge: EdgeType | null;
  selectedGraph: string;
  onEdgeUpdated?: () => Promise<void>;
  fromNodeGUID?: string;
}

const AddEditEdge = ({
  isAddEditEdgeVisible,
  setIsAddEditEdgeVisible,
  edge,
  selectedGraph,
  onEdgeUpdated,
  fromNodeGUID,
}: AddEditEdgeProps) => {
  const dispatch = useAppDispatch();
  const [form] = Form.useForm();
  const [uniqueKey, setUniqueKey] = useState(v4());
  const [formValid, setFormValid] = useState(false);
  const { nodeOptions, isLoading: isNodesLoading } = useNodes(selectedGraph);
  const { createEdges, isLoading: isCreateLoading } = useCreateEdge();
  const { updateEdgeById, isLoading: isUpdateLoading } = useUpdateEdgeById();
  const { graphsList } = useGraphs();

  // Add form validation watcher
  const [formValues, setFormValues] = useState({});
  useEffect(() => {
    form
      .validateFields({ validateOnly: true })
      .then(() => setFormValid(true))
      .catch(() => setFormValid(false));
  }, [formValues, form]);

  useEffect(() => {
    if (edge) {
      form.resetFields();
      form.setFieldsValue({
        name: edge.Name,
        from: edge.From,
        to: edge.To,
        cost: edge.Cost,
        data: edge.Data,
        labels: edge.Labels,
        tags: Object.entries(edge.Tags || {}).map(([key, value]) => ({
          key,
          value,
        })),
        vectors: edge.Vectors,
      });
      setUniqueKey(v4());
    } else {
      form.resetFields();
      fromNodeGUID && form.setFieldsValue({ from: fromNodeGUID, data: {} });
      setUniqueKey(v4());
    }
    const data = graphsList?.find((graph) => graph.GUID === selectedGraph);
    data && form.setFieldValue('graphName', data.Name);

    // Trigger initial validation
    form
      .validateFields({ validateOnly: true })
      .then(() => setFormValid(true))
      .catch(() => setFormValid(false));
  }, [edge, selectedGraph, fromNodeGUID, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const tags: Record<string, string> = convertTagsToRecord(values.tags);
      if (edge) {
        // Edit edge
        const data = {
          GUID: edge.GUID,
          GraphGUID: edge.GraphGUID,
          CreatedUtc: edge.CreatedUtc,
          Name: values.name,
          From: values.from,
          To: values.to,
          Cost: values.cost,
          Data: values.data,
          Labels: values.labels || [],
          Tags: tags,
          Vectors: convertVectorsToAPIRecord(values.vectors),
        };
        const res = await updateEdgeById(data);
        if (res) {
          dispatch(updateEdge(res));
          toast.success('Update Edge successfully');
          setIsAddEditEdgeVisible(false);
          onEdgeUpdated && (await onEdgeUpdated());
        } else {
          throw new Error('Failed to update edge - no response received');
        }
      } else {
        // Add edge
        const data = {
          GUID: v4(),
          GraphGUID: selectedGraph,
          Name: values.name,
          From: values.from,
          To: values.to,
          Cost: values.cost,
          Data: values.data,
          Labels: values.labels || [],
          Tags: tags,
          Vectors: convertVectorsToAPIRecord(values.vectors),
        };
        const res = await createEdges(data);
        if (res) {
          dispatch(createEdge(res));
          toast.success('Add Edge successfully');
          setIsAddEditEdgeVisible(false);
          onEdgeUpdated && (await onEdgeUpdated());
        } else {
          throw new Error('Failed to create edge - no response received');
        }
      }
    } catch (error: unknown) {
      console.error('Error submitting form:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to update edge: ${errorMessage}`);
    }
  };

  return (
    <LitegraphModal
      title={edge ? 'Edit Edge' : 'Create Edge'}
      okText={edge ? 'Update' : 'Create'}
      open={isAddEditEdgeVisible}
      onOk={handleSubmit}
      loading={isNodesLoading}
      confirmLoading={isCreateLoading || isUpdateLoading}
      onCancel={() => setIsAddEditEdgeVisible(false)}
      width={800}
      okButtonProps={{ disabled: !formValid }}
    >
      <Form
        initialValues={{ ...initialValues, from: edge?.From || fromNodeGUID || '' }}
        form={form}
        layout="vertical"
        labelCol={{ xs: 5, md: 5, lg: 4 }}
        wrapperCol={{ span: 24 }}
        onValuesChange={(_, allValues) => setFormValues(allValues)}
      >
        <LitegraphFormItem label="Graph Name" name="graphName">
          <LitegraphInput readOnly disabled />
        </LitegraphFormItem>
        <LitegraphFormItem label="Name" name="name" rules={validationRules.Name}>
          <LitegraphInput placeholder="Enter edge name" data-testid="edge-name-input" />
        </LitegraphFormItem>
        <LitegraphFormItem label="From Node" name="from" rules={validationRules.From}>
          <LitegraphSelect
            placeholder="Select from node"
            options={nodeOptions}
            loading={isNodesLoading}
          />
        </LitegraphFormItem>
        <LitegraphFormItem label="To Node" name="to" rules={validationRules.To}>
          <LitegraphSelect
            placeholder="Select to node"
            options={nodeOptions}
            loading={isNodesLoading}
          />
        </LitegraphFormItem>
        <LitegraphFormItem label="Cost" name="cost" rules={validationRules.Cost}>
          <LitegraphInput
            placeholder="Enter edge cost"
            type="number"
            onChange={(e) => {
              const value = parseFloat(e.target.value);
              form.setFieldsValue({ cost: isNaN(value) ? 0 : value });
            }}
          />
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
        <LitegraphFormItem label="Data" name="data">
          <JsonEditor
            key={uniqueKey}
            value={form.getFieldValue('data') || {}}
            onChange={(json: any) => form.setFieldsValue({ data: json })}
            mode="code"
            enableSort={false}
            enableTransform={false}
            data-testid="edge-data-input"
          />
        </LitegraphFormItem>
      </Form>
    </LitegraphModal>
  );
};

export default AddEditEdge;
