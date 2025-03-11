import { ActionReducerMapBuilder, createReducer } from '@reduxjs/toolkit';
import { VectorGroupWithGraph, VectorType } from './types';
import {
  clearVectors,
  createVector,
  deleteVector,
  vectorLists,
  updateVector,
  updateVectorGroupWithGraph,
} from './actions';

export type VectorStore = {
  allVectors: VectorType[] | null;
  vectors: VectorGroupWithGraph[];
};

export const initialState: VectorStore = {
  allVectors: null,
  vectors: [],
};

const vectorReducer = createReducer(
  initialState,
  (builder: ActionReducerMapBuilder<typeof initialState>) => {
    // Store all vectors
    builder
      .addCase(vectorLists, (state, action) => {
        state.allVectors = action.payload;
      })
      .addCase(clearVectors, (state) => {
        state.allVectors = null;
        state.vectors = [];
      })
      .addCase(createVector, (state, action) => {
        if (state.allVectors) {
          state.allVectors.push(action.payload);
        }
      })
      .addCase(updateVector, (state, action) => {
        const updatedVector = action.payload;
        if (state.allVectors) {
          state.allVectors = state.allVectors.map((vector) =>
            vector.GUID === updatedVector.GUID ? updatedVector : vector
          );
        }
      })
      .addCase(deleteVector, (state, action) => {
        if (state.allVectors) {
          state.allVectors = state.allVectors.filter((vector) => vector.GUID !== action.payload.GUID);
        }
      })
      .addCase(updateVectorGroupWithGraph, (state, action) => {
        const { vectorId, vectorData } = action.payload;
        const GraphGUID = vectorData.GraphGUID;

        // Find the GraphGUID in the array
        const existingGraph = state.vectors.find((group) => group[GraphGUID]);

        if (existingGraph) {
          const existingVectorIndex = existingGraph[GraphGUID].findIndex((vector) => vector.GUID === vectorId);
          if (existingVectorIndex !== -1) {
                // Update existing vector in the graphGUID group
            existingGraph[GraphGUID][existingVectorIndex] = vectorData;
          } else {
            // Add the new vector to the graphGUID group
            existingGraph[GraphGUID].push(vectorData);
          }
        } else {
            // Create a new graphGUID group and add the vector
          state.vectors.push({ [GraphGUID]: [vectorData] });
        }
      });
  }
);

export default vectorReducer;
