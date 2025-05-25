import { ActionReducerMapBuilder, createReducer } from '@reduxjs/toolkit';
import {
  clearNodes,
  createNode,
  deleteNode,
  nodeLists,
  updateNode,
  updateNodeGroupWithGraph,
} from './actions';
import { NodeGroupWithGraph, NodeType } from './types';

export type NodeStore = {
  allNodes: NodeType[] | null;
  nodes: NodeGroupWithGraph[] | null;
};

export const initialState: NodeStore = {
  allNodes: null,
  nodes: null,
};

const nodeReducer = createReducer(
  initialState,
  (builder: ActionReducerMapBuilder<typeof initialState>) => {
    // Store all nodes
    builder.addCase(
      nodeLists,
      (state: typeof initialState, action: ReturnType<typeof nodeLists>) => {
        state.allNodes = action.payload;
      }
    ), // Store all nodes
      builder.addCase(
        clearNodes,
        (state: typeof initialState, action: ReturnType<typeof clearNodes>) => {
          state.allNodes = null;
          state.nodes = null;
        }
      ),
      // Create node
      builder.addCase(
        createNode,
        (state: typeof initialState, action: ReturnType<typeof createNode>) => {
          state.allNodes = state.allNodes ? [...state.allNodes, action.payload] : [action.payload];
        }
      ),
      // Update node
      builder.addCase(
        updateNode,
        (state: typeof initialState, action: ReturnType<typeof updateNode>) => {
          const updatedNode = action.payload;
          state.allNodes = state.allNodes
            ? state.allNodes.map((node) => (node.GUID === updatedNode.GUID ? updatedNode : node))
            : null;
        }
      ),
      // Delete node
      builder.addCase(
        deleteNode,
        (state: typeof initialState, action: ReturnType<typeof deleteNode>) => {
          state.allNodes = state.allNodes
            ? state.allNodes.filter((node: NodeType) => node.GUID !== action.payload.GUID)
            : null;
        }
      ),
      // Update or add a node Group with graph
      builder.addCase(
        updateNodeGroupWithGraph,
        (state: typeof initialState, action: ReturnType<typeof updateNodeGroupWithGraph>) => {
          const { nodeId, nodeData } = action.payload;
          const GraphGUID = nodeData.GraphGUID;

          // Find the GraphGUID in the array
          const existingGraph = state.nodes
            ? state.nodes.find((group: NodeGroupWithGraph) => group[GraphGUID])
            : null;

          if (existingGraph) {
            const existingNodeIndex = existingGraph[GraphGUID].findIndex(
              (node: NodeType) => node.GUID === nodeId
            );
            if (existingNodeIndex !== -1) {
              // Update existing node in the graphGUID group
              existingGraph[GraphGUID][existingNodeIndex] = nodeData;
            } else {
              // Add the new node to the graphGUID group
              existingGraph[GraphGUID].push(nodeData);
            }
          } else {
            // Create a new graphGUID group and add the node
            state.nodes = state.nodes
              ? [...state.nodes, { [GraphGUID]: [nodeData] }]
              : [{ [GraphGUID]: [nodeData] }];
          }
        }
      );
  }
);

export default nodeReducer;
