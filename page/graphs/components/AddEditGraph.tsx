'use client';
import { Form, Select } from 'antd';
import { GraphData } from '@/lib/store/graph/types';
import LitegraphModal from '@/components/base/modal/Modal';
import LitegraphFormItem from '@/components/base/form/FormItem';
import { useEffect, useState } from 'react';
import LitegraphInput from '@/components/base/input/Input';
import { validationRules } from './constant';
import { JsonEditor } from 'jsoneditor-react';
import { v4 } from 'uuid';
import { useCreateGraph, useUpdateGraphById } from '@/lib/sdk/litegraph.service';
import { createGraph, updateGraph } from '@/lib/store/graph/actions';
import { useAppDispatch } from '@/lib/store/hooks';
import toast from 'react-hot-toast';
import { useLabels, useTags, useSelectedGraph } from '@/hooks/entityHooks';
import LabelInput from '@/components/inputs/label-input/LabelInput';
import TagsInput from '@/components/inputs/tags-input/TagsInput';
import VectorsInput from '@/components/inputs/vectors-input.tsx/VectorsInput';
import { convertTagsToRecord } from '@/components/inputs/tags-input/utils';
import { convertVectorsToAPIRecord } from '@/components/inputs/vectors-input.tsx/utils';

const initialValues = {
  name: '',
  data: {},
  tags: [],
  labels: [],
  vectors: [],
};

interface AddEditGraphProps {
  isAddEditGraphVisible: boolean;
  setIsAddEditGraphVisible: (open: boolean) => void;
  graph: GraphData | null;
  onDone?: () => void;
}

//trigger initial validation

const AddEditGraph = ({
  isAddEditGraphVisible,
  setIsAddEditGraphVisible,
  graph,
  onDone,
}: AddEditGraphProps) => {
  const dispatch = useAppDispatch();
  const [form] = Form.useForm();
  const [formValid, setFormValid] = useState(false);

  const { createGraphs, isLoading: isCreateLoading } = useCreateGraph();
  const { updateGraphById, isLoading: isUpdateLoading } = useUpdateGraphById();

  const [uniqueKey, setUniqueKey] = useState(v4());

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
      if (graph) {
        // Edit Graph
        console.log('graph', graph);
        const data = {
          GUID: graph.GUID,
          Name: values.name,
          Data: values.data || {},
          Labels: values.labels || [],
          Tags: tags,
          Vectors: convertVectorsToAPIRecord(values.vectors),
        };
        console.log('data', data);
        const res = await updateGraphById(data);
        if (res) {
          dispatch(updateGraph(res));
          toast.success('Update Graph successfully');
          setIsAddEditGraphVisible(false);
          onDone?.();
        } else {
          throw new Error('Failed to update graph - no response received');
        }
      } else {
        // Add Graph
        const data = {
          GUID: v4(),
          Name: values.name,
          Data: values.data || {},
          Labels: values.labels || [],
          Tags: tags,
          Vectors: convertVectorsToAPIRecord(values.vectors),
        };
        console.log('data', data);
        const res = await createGraphs(data);
        if (res) {
          dispatch(createGraph(res));
          toast.success('Add Graph successfully');
          setIsAddEditGraphVisible(false);
          onDone?.();
        } else {
          throw new Error('Failed to create graph - no response received');
        }
      }
    } catch (error: unknown) {
      console.error('Error submitting form:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to update graph: ${errorMessage}`);
    }
    // Trigger initial validation
    form
      .validateFields({ validateOnly: true })
      .then(() => setFormValid(true))
      .catch(() => setFormValid(false));
  };

  useEffect(() => {
    if (graph) {
      // Ensure form values are updated when editing
      form.setFieldsValue({
        name: graph.name || '',
        data: graph.data || {},
        labels: graph.labels || [],
        tags: Object.entries(graph.tags || {}).map(([key, value]) => ({
          key,
          value,
        })),
        vectors: graph.vectors || [],
      });
      setUniqueKey(v4());
    } else {
      form.resetFields();
      setUniqueKey(v4());
    }

    // Trigger initial validation
    form
      .validateFields({ validateOnly: true })
      .then(() => setFormValid(true))
      .catch(() => setFormValid(false));
  }, [form, graph]);

  return (
    <LitegraphModal
      title={graph ? 'Edit Graph' : 'Create Graph'}
      okText={graph ? 'Update' : 'Create'}
      open={isAddEditGraphVisible}
      onOk={handleSubmit}
      confirmLoading={isCreateLoading || isUpdateLoading}
      onCancel={() => setIsAddEditGraphVisible(false)}
      width={800}
      okButtonProps={{ disabled: !formValid }}
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
        <LitegraphFormItem label="Name" name="name" rules={validationRules.name}>
          <LitegraphInput placeholder="Enter graph name" data-testid="graph-name-input" />
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
            onChange={(json: any) => {
              form.setFieldsValue({ data: json });
            }}
            mode="code"
            enableSort={false}
            enableTransform={false}
            data-testid="graph-data-input"
          />
        </LitegraphFormItem>
      </Form>
    </LitegraphModal>
  );
};

export default AddEditGraph;
