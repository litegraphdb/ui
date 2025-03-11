import { createAction } from '@reduxjs/toolkit';
import { EdgeType } from './types';

export const EdgeActions = {
  EDGE_LISTS: 'EDGE_LISTS',
  CLEAR_EDGES: 'CLEAR_EDGES',
  CREATE_EDGE: 'CREATE_EDGE',
  UPDATE_EDGE: 'UPDATE_EDGE',
  DELETE_EDGE: 'DELETE_EDGE',
  UPDATE_EDGE_WITH_GROUP: 'UPDATE_EDGE_WITH_GROUP',
};

export const edgeLists = createAction<EdgeType[]>(EdgeActions.EDGE_LISTS);
export const clearEdges = createAction(EdgeActions.CLEAR_EDGES);
export const createEdge = createAction<EdgeType>(EdgeActions.CREATE_EDGE);
export const updateEdge = createAction<EdgeType>(EdgeActions.UPDATE_EDGE);
export const deleteEdge = createAction<{ GUID: string }>(EdgeActions.DELETE_EDGE);
export const updateEdgeGroupWithGraph = createAction<{ edgeId: string; edgeData: EdgeType }>(
  EdgeActions.UPDATE_EDGE_WITH_GROUP
);
