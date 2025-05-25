import { createAction } from '@reduxjs/toolkit';
import { NodeType } from './types';

export const NodeActions = {
  NODE_LISTS: 'NODE_LISTS',
  CLEAR_NODES: 'CLEAR_NODES',
  CREATE_NODE: 'CREATE_NODE',
  UPDATE_NODE: 'UPDATE_NODE',
  DELETE_NODE: 'DELETE_NODE',
  UPDATE_NODE_WITH_GRAPH: 'UPDATE_NODE_WITH_GRAPH',
};

export const nodeLists = createAction<NodeType[]>(NodeActions.NODE_LISTS);
export const clearNodes = createAction(NodeActions.CLEAR_NODES);
export const createNode = createAction<NodeType>(NodeActions.CREATE_NODE);
export const updateNode = createAction<NodeType>(NodeActions.UPDATE_NODE);
export const deleteNode = createAction<{ GUID: string }>(NodeActions.DELETE_NODE);
export const updateNodeGroupWithGraph = createAction<{ nodeId: string; nodeData: NodeType }>(
  NodeActions.UPDATE_NODE_WITH_GRAPH
);
