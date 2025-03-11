import TagMetaData from 'litegraphdb/types/models/TagMetaData';

export type TagGroupWithGraph = {
  [GraphGUID: string]: TagType[];
};

export type TagType = TagMetaData;
