import { createAction } from '@reduxjs/toolkit';
import { TagType } from './types';

export const TagActions = {
  TAG_LISTS: 'TAG_LISTS',
  CLEAR_TAGS: 'CLEAR_TAG',
  CREATE_TAG: 'CREATE_TAG',
  UPDATE_TAG: 'UPDATE_TAG',
  DELETE_TAG: 'DELETE_TAG',
  UPDATE_TAG_WITH_GROUP: 'UPDATE_TAG_WITH_GROUP',
};

export const tagLists = createAction<TagType[]>(TagActions.TAG_LISTS);
export const clearTags = createAction(TagActions.CLEAR_TAGS);
export const createTag = createAction<TagType>(TagActions.CREATE_TAG);
export const updateTag = createAction<TagType>(TagActions.UPDATE_TAG);
export const deleteTag = createAction<{ GUID: string }>(TagActions.DELETE_TAG);
export const updateTagGroupWithGraph = createAction<{ tagId: string; tagData: TagType }>(
  TagActions.UPDATE_TAG_WITH_GROUP
);
