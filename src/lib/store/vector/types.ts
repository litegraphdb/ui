import { VectorMetadata } from 'litegraphdb/dist/types/types';

export type VectorGroupWithGraph = {
  [GraphGUID: string]: VectorType[];
};

export type VectorType = VectorMetadata;
