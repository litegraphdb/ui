import { ActionReducerMapBuilder, createReducer } from '@reduxjs/toolkit';
import { EdgeGroupWithGraph, EdgeType } from './types';
import {
  clearEdges,
  createEdge,
  deleteEdge,
  edgeLists,
  updateEdge,
  updateEdgeGroupWithGraph,
} from './actions';

export type EdgeStore = {
  allEdges: EdgeType[] | null;
  edges: EdgeGroupWithGraph[];
};

export const initialState: EdgeStore = {
  allEdges: null,
  edges: [],
};

const edgeReducer = createReducer(
  initialState,
  (builder: ActionReducerMapBuilder<typeof initialState>) => {
    // Store all edges
    builder.addCase(
      edgeLists,
      (state: typeof initialState, action: ReturnType<typeof edgeLists>) => {
        state.allEdges = action.payload;
      }
    );
    builder.addCase(
      clearEdges,
      (state: typeof initialState, action: ReturnType<typeof clearEdges>) => {
        state.allEdges = null;
        state.edges = [];
      }
    );
    // Create edge
    builder.addCase(
      createEdge,
      (state: typeof initialState, action: ReturnType<typeof createEdge>) => {
        state.allEdges = state.allEdges ? [...state.allEdges, action.payload] : [action.payload];
      }
    );
    // Update edge
    builder.addCase(
      updateEdge,
      (state: typeof initialState, action: ReturnType<typeof updateEdge>) => {
        const updatedEdge = action.payload;
        state.allEdges = state.allEdges
          ? state.allEdges.map((edge) => (edge.GUID === updatedEdge.GUID ? updatedEdge : edge))
          : null;
      }
    );
    // Delete edge
    builder.addCase(
      deleteEdge,
      (state: typeof initialState, action: ReturnType<typeof deleteEdge>) => {
        state.allEdges = state.allEdges
          ? state.allEdges.filter((edge: EdgeType) => edge.GUID !== action.payload.GUID)
          : null;
      }
    );
    // Update or add a edge Group with graph
    builder.addCase(
      updateEdgeGroupWithGraph,
      (state: typeof initialState, action: ReturnType<typeof updateEdgeGroupWithGraph>) => {
        const { edgeId, edgeData } = action.payload;
        const GraphGUID = edgeData.GraphGUID;

        // Find the GraphGUID in the array
        const existingGraph = state.edges.find((group: EdgeGroupWithGraph) => group[GraphGUID]);

        if (existingGraph) {
          const existingEdgeIndex = existingGraph[GraphGUID].findIndex(
            (edge: EdgeType) => edge.GUID === edgeId
          );
          if (existingEdgeIndex !== -1) {
            // Update existing edge in the graphGUID group
            existingGraph[GraphGUID][existingEdgeIndex] = edgeData;
          } else {
            // Add the new edge to the graphGUID group
            existingGraph[GraphGUID].push(edgeData);
          }
        } else {
          // Create a new graphGUID group and add the edge
          state.edges.push({ [GraphGUID]: [edgeData] });
        }
      }
    );
  }
);

export default edgeReducer;
