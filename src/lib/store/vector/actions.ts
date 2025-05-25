import { createAction } from '@reduxjs/toolkit';
import { VectorType } from './types';

export const TagActions = {
  VECTOR_LISTS: 'VECTOR_LISTS',
  CLEAR_VECTORS: 'CLEAR_VECTOR',
  CREATE_VECTOR: 'CREATE_VECTOR',
  UPDATE_VECTOR: 'UPDATE_VECTOR',
  DELETE_VECTOR: 'DELETE_VECTOR',
  UPDATE_VECTOR_WITH_GROUP: 'UPDATE_VECTOR_WITH_GROUP',
};

export const vectorLists = createAction<VectorType[]>(TagActions.VECTOR_LISTS);
export const clearVectors = createAction(TagActions.CLEAR_VECTORS);
export const createVector = createAction<VectorType>(TagActions.CREATE_VECTOR);
export const updateVector = createAction<VectorType>(TagActions.UPDATE_VECTOR);
export const deleteVector = createAction<{ GUID: string }>(TagActions.DELETE_VECTOR);
export const updateVectorGroupWithGraph = createAction<{ vectorId: string; vectorData: VectorType }>(
  TagActions.UPDATE_VECTOR_WITH_GROUP
);
