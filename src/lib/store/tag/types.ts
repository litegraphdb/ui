import { TagMetaData } from 'litegraphdb/dist/types/types';

export type TagGroupWithGraph = {
  [GraphGUID: string]: TagType[];
};

export type TagType = TagMetaData & {
  NodeName?: string;
  EdgeName?: string;
  key?: string;
};
