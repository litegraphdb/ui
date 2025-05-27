import { Edge } from 'litegraphdb/dist/types/types';

export type EdgeGroupWithGraph = {
  [GraphGUID: string]: EdgeType[];
};

export type EdgeType = Edge & {
  Distance?: number;
  Score?: number;
  FromName?: string;
  ToName?: string;
};
