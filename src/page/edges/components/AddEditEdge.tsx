'use client';
import { Form } from 'antd';
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
import LabelInput from '@/components/inputs/label-input/LabelInput';
import VectorsInput from '@/components/inputs/vectors-input.tsx/VectorsInput';
import TagsInput from '@/components/inputs/tags-input/TagsInput';
import { convertVectorsToAPIRecord } from '@/components/inputs/vectors-input.tsx/utils';
import { convertTagsToRecord } from '@/components/inputs/tags-input/utils';
import LitegraphFlex from '@/components/base/flex/Flex';
import { copyJsonToClipboard } from '@/utils/jsonCopyUtils';
import { CopyOutlined } from '@ant-design/icons';
import {
  useCreateEdgeMutation,
  useGetAllGraphsQuery,
  useGetAllNodesQuery,
  useUpdateEdgeMutation,
} from '@/lib/store/slice/slice';
import { transformToOptions } from '@/lib/graph/utils';
import { Edge, EdgeCreateRequest } from 'litegraphdb/dist/types/types';

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
  readonly?: boolean;
  onClose?: () => void;
}

const AddEditEdge = ({
  isAddEditEdgeVisible,
  setIsAddEditEdgeVisible,
  edge,
  selectedGraph,
  onEdgeUpdated,
  fromNodeGUID,
  onClose,
  readonly,
}: AddEditEdgeProps) => {
  const dispatch = useAppDispatch();
  const [form] = Form.useForm();
  const [uniqueKey, setUniqueKey] = useState(v4());
  const [formValid, setFormValid] = useState(false);
  const { data: nodesList, isLoading: isNodesLoading } = useGetAllNodesQuery({
    graphId: selectedGraph,
  });
  const nodeOptions = transformToOptions(nodesList);
  const [createEdges, { isLoading: isCreateLoading }] = useCreateEdgeMutation();
  const [updateEdgeById, { isLoading: isUpdateLoading }] = useUpdateEdgeMutation();
  const { data: graphsList } = useGetAllGraphsQuery();

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
        const data: Edge = {
          TenantGUID: edge.TenantGUID,
          LastUpdateUtc: edge.LastUpdateUtc,
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
          toast.success('Update Edge successfully');
          setIsAddEditEdgeVisible(false);
          onEdgeUpdated && (await onEdgeUpdated());
        } else {
          throw new Error('Failed to update edge - no response received');
        }
      } else {
        // Add edge
        const data: EdgeCreateRequest = {
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
      onCancel={() => {
        setIsAddEditEdgeVisible(false);
        onClose && onClose();
      }}
      width={800}
      okButtonProps={{ disabled: !formValid }}
    >
      <Form
        initialValues={{ ...initialValues, from: edge?.From || fromNodeGUID || '' }}
        form={form}
        layout="vertical"
        wrapperCol={{ span: 24 }}
        onValuesChange={(_, allValues) => setFormValues(allValues)}
        requiredMark={!readonly}
      >
        <LitegraphFlex vertical={!readonly} gap={readonly ? 10 : 0}>
          <LitegraphFormItem className="flex-1" label="Graph" name="graphName">
            <LitegraphInput readOnly variant="borderless" />
          </LitegraphFormItem>
          <LitegraphFormItem
            className="flex-1"
            label="Name"
            name="name"
            rules={validationRules.Name}
          >
            <LitegraphInput
              placeholder="Enter edge name"
              data-testid="edge-name-input"
              variant={readonly ? 'borderless' : 'outlined'}
            />
          </LitegraphFormItem>
        </LitegraphFlex>
        <LitegraphFlex gap={10}>
          <LitegraphFormItem
            className="flex-1"
            label="From Node"
            name="from"
            rules={validationRules.From}
          >
            <LitegraphSelect
              readonly={readonly}
              placeholder="Select from node"
              options={nodeOptions}
              loading={isNodesLoading}
              variant={readonly ? 'borderless' : 'outlined'}
            />
          </LitegraphFormItem>
          <LitegraphFormItem
            className="flex-1"
            label="To Node"
            name="to"
            rules={validationRules.To}
          >
            <LitegraphSelect
              readonly={readonly}
              placeholder="Select to node"
              options={nodeOptions}
              loading={isNodesLoading}
              variant={readonly ? 'borderless' : 'outlined'}
            />
          </LitegraphFormItem>
        </LitegraphFlex>
        <LitegraphFlex gap={10}>
          <LitegraphFormItem
            className="flex-1"
            label="Cost"
            name="cost"
            rules={validationRules.Cost}
          >
            <LitegraphInput
              readOnly={readonly}
              variant={readonly ? 'borderless' : 'outlined'}
              placeholder="Enter edge cost"
              type="number"
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                form.setFieldsValue({ cost: isNaN(value) ? 0 : value });
              }}
            />
          </LitegraphFormItem>
          <LabelInput name="labels" className="flex-1" readonly={readonly} />
        </LitegraphFlex>
        <Form.Item label="Tags">
          <TagsInput name="tags" readonly={readonly} />
        </Form.Item>
        <Form.Item label="Vectors">
          <VectorsInput name="vectors" readonly={readonly} />
        </Form.Item>
        <LitegraphFormItem
          name="data"
          label={
            <LitegraphFlex align="center" gap={8}>
              <span>Data</span>
              {readonly && (
                <CopyOutlined
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    const data = form.getFieldValue('data') || {};
                    copyJsonToClipboard(data, 'Data');
                  }}
                />
              )}
            </LitegraphFlex>
          }
        >
          <JsonEditor
            key={uniqueKey}
            value={form.getFieldValue('data') || {}}
            onChange={(json: any) => form.setFieldsValue({ data: json })}
            mode={readonly ? 'view' : 'code'}
            enableSort={false}
            enableTransform={false}
            mainMenuBar={!readonly} // Hide the menu bar
            statusBar={!readonly} // Hide the status bar
            navigationBar={!readonly} // Hide the navigation bar
            data-testid="edge-data-input"
          />
        </LitegraphFormItem>
      </Form>
    </LitegraphModal>
  );
};

export default AddEditEdge;
