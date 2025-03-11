import { ActionReducerMapBuilder, createReducer } from '@reduxjs/toolkit';
import { LabelType, LabelGroupWithGraph } from './types';
import {
  clearLabels,
  createLabel,
  deleteLabel,
  labelLists,
  updateLabel,
  updateLabelGroupWithGraph,
} from './actions';

export type LabelStore = {
  allLabels: LabelType[] | null;
  labels: LabelGroupWithGraph[];
};

export const initialState: LabelStore = {
  allLabels: null,
  labels: [],
};

const labelReducer = createReducer(
  initialState,
  (builder: ActionReducerMapBuilder<typeof initialState>) => {
    builder
      .addCase(labelLists, (state, action) => {
        state.allLabels = action.payload;
      })
      .addCase(clearLabels, (state) => {
        state.allLabels = null;
        state.labels = [];
      })
      .addCase(createLabel, (state, action) => {
        if (state.allLabels) {
          state.allLabels.push(action.payload);
        }
      })
      .addCase(updateLabel, (state, action) => {
        const updatedLabel = action.payload;
        if (state.allLabels) {
          state.allLabels = state.allLabels.map((label) =>
            label.GUID === updatedLabel.GUID ? updatedLabel : label
          );
        }
      })
      .addCase(deleteLabel, (state, action) => {
        if (state.allLabels) {
          state.allLabels = state.allLabels.filter((label) => label.GUID !== action.payload.GUID);
        }
      })
      .addCase(updateLabelGroupWithGraph, (state, action) => {
        const { labelId, labelData } = action.payload;
        const GraphGUID = labelData.GraphGUID;

        // Find the GraphGUID in the array
        const existingGraph = state.labels.find((group) => group[GraphGUID]);

        if (existingGraph) {
          const existingLabelIndex = existingGraph[GraphGUID].findIndex(
            (label) => label.GUID === labelId
          );
          if (existingLabelIndex !== -1) {
            // Update existing label in the graphGUID group
            existingGraph[GraphGUID][existingLabelIndex] = labelData;
          } else {
            // Add the new label to the graphGUID group
            existingGraph[GraphGUID].push(labelData);
          }
        } else {
          // Create a new graphGUID group and add the label
          state.labels.push({ [GraphGUID]: [labelData] });
        }
      });
  }
);

export default labelReducer;
