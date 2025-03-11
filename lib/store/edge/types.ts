import Edge from 'litegraphdb/types/models/Edge';

export type EdgeGroupWithGraph = {
  [GraphGUID: string]: EdgeType[];
};

export type EdgeType = Edge;
