import { ActionReducerMapBuilder, createReducer } from '@reduxjs/toolkit';
import {
  clearGraphs,
  createGraph,
  deleteGraph,
  getGexfOgGraphByID,
  graphLists,
  updateGraph,
} from './actions';
import { GraphData } from './types';

export type GraphStore = {
  graphs: GraphData[] | null;
};

export const initialState: GraphStore = {
  graphs: null,
};

const graphReducer = createReducer(
  initialState,
  (builder: ActionReducerMapBuilder<typeof initialState>) => {
    // Store all graph
    builder.addCase(
      graphLists,
      (state: typeof initialState, action: ReturnType<typeof graphLists>) => {
        state.graphs = action.payload;
      }
    ),
      // clear all graph
      builder.addCase(
        clearGraphs,
        (state: typeof initialState, action: ReturnType<typeof clearGraphs>) => {
          state.graphs = [];
        }
      ),
      // Create graph
      builder.addCase(
        createGraph,
        (state: typeof initialState, action: ReturnType<typeof createGraph>) => {
          state.graphs = state.graphs ? [...state.graphs, action.payload] : [action.payload];
        }
      ),
      // Update graph
      builder.addCase(
        updateGraph,
        (state: typeof initialState, action: ReturnType<typeof updateGraph>) => {
          const updatedGraph = action.payload;
          state.graphs = state.graphs
            ? state.graphs.map((graph) => (graph.GUID === updatedGraph.GUID ? updatedGraph : graph))
            : [];
        }
      ),
      // Delete graph
      builder.addCase(
        deleteGraph,
        (state: typeof initialState, action: ReturnType<typeof deleteGraph>) => {
          state.graphs = state.graphs
            ? state.graphs.filter((graph) => graph.GUID !== action.payload.GUID)
            : [];
        }
      ),
      // Update graph with gexfContext
      builder.addCase(getGexfOgGraphByID, (state, action) => {
        // Map over the array and update only the matching graph
        const updatedState = state.graphs
          ? state.graphs.map(
              (graph) =>
                graph.GUID === action.payload.GUID
                  ? { ...graph, gexfContent: action.payload.gexfContent } // Update the matching graph
                  : graph // Leave other graphs unchanged
            )
          : [];
        state.graphs = updatedState;
      });
  }
);

export default graphReducer;
