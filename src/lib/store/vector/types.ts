import type { VectorMetadata } from 'litegraphdb/types/models/VectorMetadata';

export type VectorGroupWithGraph = {
  [GraphGUID: string]: VectorType[];
};

export type VectorType = VectorMetadata;
