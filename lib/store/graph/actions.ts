import { createAction } from '@reduxjs/toolkit';
import { GraphData } from './types';

export const GraphActions = {
  GRAPH_LISTS: 'GRAPH_LISTS',
  CLEAR_GRAPH: 'CLEAR_GRAPH',
  CREATE_GRAPH: 'CREATE_GRAPH',
  UPDATE_GRAPH: 'UPDATE_GRAPH',
  DELETE_GRAPH: 'DELETE_GRAPH',
  GET_GEXF_OF_GRAPH_BY_ID: 'GET_GEXF_OF_GRAPH_BY_ID',
};

export const graphLists = createAction<GraphData[]>(GraphActions.GRAPH_LISTS);
export const clearGraphs = createAction(GraphActions.CLEAR_GRAPH);
export const createGraph = createAction<GraphData>(GraphActions.CREATE_GRAPH);
export const updateGraph = createAction<GraphData>(GraphActions.UPDATE_GRAPH);
export const deleteGraph = createAction<{ GUID: string }>(GraphActions.DELETE_GRAPH);
export const getGexfOgGraphByID = createAction<{ GUID: string; gexfContent: string }>(
  GraphActions.GET_GEXF_OF_GRAPH_BY_ID
);
