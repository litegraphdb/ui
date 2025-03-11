import { ActionReducerMapBuilder, createReducer } from '@reduxjs/toolkit';
import { TagGroupWithGraph, TagType } from './types';
import {
  clearTags,
  createTag,
  deleteTag,
  tagLists,
  updateTag,
  updateTagGroupWithGraph,
} from './actions';

export type TagStore = {
  allTags: TagType[] | null;
  tags: TagGroupWithGraph[];
};

export const initialState: TagStore = {
  allTags: null,
  tags: [],
};

const tagReducer = createReducer(
  initialState,
  (builder: ActionReducerMapBuilder<typeof initialState>) => {
    // Store all tags
    builder
      .addCase(tagLists, (state, action) => {
        state.allTags = action.payload;
      })
      .addCase(clearTags, (state) => {
        state.allTags = null;
        state.tags = [];
      })
      .addCase(createTag, (state, action) => {
        if (state.allTags) {
          state.allTags.push(action.payload);
        }
      })
      .addCase(updateTag, (state, action) => {
        const updatedTag = action.payload;
        if (state.allTags) {
          state.allTags = state.allTags.map((tag) =>
            tag.GUID === updatedTag.GUID ? updatedTag : tag
          );
        }
      })
      .addCase(deleteTag, (state, action) => {
        if (state.allTags) {
          state.allTags = state.allTags.filter((tag) => tag.GUID !== action.payload.GUID);
        }
      })
      .addCase(updateTagGroupWithGraph, (state, action) => {
        const { tagId, tagData } = action.payload;
        const GraphGUID = tagData.GraphGUID;

        // Find the GraphGUID in the array
        const existingGraph = state.tags.find((group) => group[GraphGUID]);

        if (existingGraph) {
          const existingTagIndex = existingGraph[GraphGUID].findIndex((tag) => tag.GUID === tagId);
          if (existingTagIndex !== -1) {
            // Update existing tag in the graphGUID group
            existingGraph[GraphGUID][existingTagIndex] = tagData;
          } else {
            // Add the new tag to the graphGUID group
            existingGraph[GraphGUID].push(tagData);
          }
        } else {
          // Create a new graphGUID group and add the tag
          state.tags.push({ [GraphGUID]: [tagData] });
        }
      });
  }
);

export default tagReducer;
