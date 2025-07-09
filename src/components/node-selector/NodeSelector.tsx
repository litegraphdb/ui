import React, { useState, useEffect, useCallback } from 'react';
import { Form } from 'antd';
import { debounce } from 'lodash';
import useFormInstance from 'antd/es/form/hooks/useFormInstance';
import { Node } from 'litegraphdb/dist/types/types';
import { useSearchNodesMutation, useGetNodeByIdQuery } from '@/lib/store/slice/slice';
import { useSelectedGraph } from '@/hooks/entityHooks';
import { skipToken } from '@reduxjs/toolkit/query';
import { Rule } from 'antd/es/form';
import { useWatch } from 'antd/es/form/Form';
import LitegraphSelect from '../base/select/Select';

type NodeSelectorProps = {
  name: string; // form field name
  className?: string;
  readonly?: boolean;
  label?: string;
  required?: boolean;
  rules?: Rule[];
};

const NodeSelector: React.FC<NodeSelectorProps> = ({
  name,
  className,
  readonly,
  label,
  required,
  rules,
}) => {
  const selectedGraph = useSelectedGraph();
  const [searchNodes] = useSearchNodesMutation();
  const form = useFormInstance();
  const [options, setOptions] = useState<Node[]>([]);
  const [fetching, setFetching] = useState(false);
  const formValue = useWatch(name, form);
  // Get current GUID from form value
  const currentGUID = formValue;
  // Check if node already exists in options
  const nodeExists = !!options.find((opt) => opt.GUID === currentGUID);

  // Query node by ID only if needed
  const {
    data: nodeData,
    isFetching: isFetchingNode,
    isLoading: isLoadingNode,
  } = useGetNodeByIdQuery(
    !nodeExists && currentGUID && selectedGraph
      ? { graphId: selectedGraph, nodeId: currentGUID }
      : skipToken
  );
  const isNodeLoading = isFetchingNode || isLoadingNode;

  // Add fetched node to options if not already present
  useEffect(() => {
    if (nodeData) {
      setOptions((prev) => {
        if (prev.find((opt) => opt.GUID === nodeData.GUID)) {
          return prev;
        }
        return [...prev, nodeData];
      });
    }
  }, [nodeData]);

  const loadNodes = useCallback(
    debounce(async (value: string) => {
      setFetching(true);
      try {
        const response = await searchNodes({
          GraphGUID: selectedGraph,
          Name: value,
          Ordering: 'CreatedDescending',
        });
        setOptions(response?.data?.Nodes || []);
      } catch (err) {
        console.error('Failed to fetch nodes', err);
        setOptions([]);
      } finally {
        setFetching(false);
      }
    }, 500),
    [searchNodes, selectedGraph]
  );

  const handleSearch = (value: string) => {
    if (value) {
      loadNodes(value);
    } else {
      setOptions([]);
    }
  };

  return (
    <Form.Item name={name} className={className} label={label} required={required} rules={rules}>
      <LitegraphSelect
        showSearch
        loading={isNodeLoading || fetching}
        placeholder="Search and select node"
        filterOption={false}
        onSearch={handleSearch}
        notFoundContent={fetching || isNodeLoading ? 'Loading...' : 'No nodes found'}
        options={options.map((node) => ({
          label: node.Name,
          value: node.GUID,
          node,
        }))}
        onChange={(value) => {
          form.setFieldValue(name, value);
        }}
        readonly={readonly}
        variant={readonly ? 'borderless' : 'outlined'}
      />
    </Form.Item>
  );
};

export default NodeSelector;
