'use client';
import { Form } from 'antd';
import LitegraphModal from '@/components/base/modal/Modal';
import LitegraphFormItem from '@/components/base/form/FormItem';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import LitegraphInput from '@/components/base/input/Input';
import { JsonEditor } from 'jsoneditor-react';
import { v4 } from 'uuid';
import { useCreateNode, useUpdateNodeById } from '@/lib/sdk/litegraph.service';
import { useAppDispatch } from '@/lib/store/hooks';
import { validationRules } from './constant';
import { NodeType } from '@/lib/store/node/types';
import { updateNode, createNode } from '@/lib/store/node/actions';
import toast from 'react-hot-toast';
import VectorsInput from '@/components/inputs/vectors-input.tsx/VectorsInput';
import LabelInput from '@/components/inputs/label-input/LabelInput';
import TagsInput from '@/components/inputs/tags-input/TagsInput';
import { convertTagsToRecord } from '@/components/inputs/tags-input/utils';
import { convertVectorsToAPIRecord } from '@/components/inputs/vectors-input.tsx/utils';
import { useGraphs } from '@/hooks/entityHooks';
import LitegraphFlex from '@/components/base/flex/Flex';
import { CopyOutlined } from '@ant-design/icons';
import { copyJsonToClipboard } from '@/utils/jsonCopyUtils';

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
  readonly?: boolean;
  onClose?: () => void;
}

const AddEditNode = ({
  isAddEditNodeVisible,
  setIsAddEditNodeVisible,
  node,
  selectedGraph,
  onNodeUpdated,
  readonly,
  onClose,
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
    setUniqueKey(v4());
  }, [readonly]);

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
          CreatedUtc: node.CreatedUtc,
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
        name: node.Name || '',
        data: node.Data || {},
        labels: node.Labels || [],
        tags: Object.entries(node.Tags || {}).map(([key, value]) => ({
          key,
          value,
        })),
        vectors: node.Vectors || [],
      });
      setUniqueKey(v4());
    } else {
      form.resetFields();
      setUniqueKey(v4());
    }
    const data = graphsList?.find((graph) => graph.GUID === selectedGraph);
    data?.Name && form.setFieldValue('graphName', data.Name);
  }, [node?.GUID, selectedGraph, graphsList?.length]);

  useEffect(() => {
    // Trigger initial validation
    form
      .validateFields({ validateOnly: true })
      .then(() => setFormValid(true))
      .catch(() => setFormValid(false));
  }, [form]);

  return (
    <LitegraphModal
      title={node ? `${readonly ? 'View' : 'Edit'} Node` : 'Create Node'}
      okText={node ? 'Update' : 'Create'}
      open={isAddEditNodeVisible}
      onOk={handleSubmit}
      confirmLoading={isCreateLoading || isUpdateLoading}
      onCancel={() => {
        setIsAddEditNodeVisible(false);
        onClose && onClose();
      }}
      width={800}
      cancelText={readonly ? 'Close' : 'Cancel'}
      okButtonProps={{
        disabled: !formValid,
        'data-testid': 'add-node-submit-button',
        hidden: readonly,
      }}
    >
      <Form
        initialValues={initialValues}
        form={form}
        layout="vertical"
        labelCol={{ xs: 5, md: 5, lg: 4 }}
        wrapperCol={{ span: 24 }}
        onValuesChange={(_, allValues) => setFormValues(allValues)}
        requiredMark={!readonly}
      >
        <LitegraphFlex gap={readonly ? 10 : 0} vertical={!readonly}>
          <LitegraphFormItem className="flex-1" label="Graph" name="graphName">
            <LitegraphInput readOnly variant="borderless" />
          </LitegraphFormItem>

          <LitegraphFormItem
            className="flex-1"
            label="Name"
            name="name"
            rules={validationRules.name}
          >
            <LitegraphInput
              placeholder="Enter node name"
              data-testid="node-name-input"
              readOnly={readonly}
              variant={readonly ? 'borderless' : 'outlined'}
            />
          </LitegraphFormItem>
        </LitegraphFlex>
        <LabelInput name="labels" readonly={readonly} />

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
            onChange={(json: any) => {
              form.setFieldsValue({ data: json });
            }}
            mode={readonly ? 'view' : 'code'}
            enableSort={false}
            enableTransform={false}
            mainMenuBar={!readonly}
            statusBar={!readonly}
            navigationBar={!readonly}
            data-testid="node-data-input"
          />
        </LitegraphFormItem>
      </Form>
    </LitegraphModal>
  );
};

export default AddEditNode;
