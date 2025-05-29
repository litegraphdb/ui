import { LabelMetadata } from 'litegraphdb/dist/types/types';

export type LabelGroupWithGraph = {
  [GraphGUID: string]: LabelType[];
};

export type LabelType = LabelMetadata;
