import LabelMetadata from 'litegraphdb/types/models/LabelMetadata';

export type LabelGroupWithGraph = {
  [GraphGUID: string]: LabelType[];
};

export type LabelType = LabelMetadata;
