import { NodeType } from '@/lib/store/node/types';
import TagMetaData from 'litegraphdb/types/models/TagMetaData';
import { getNodeNameByGUID } from '../edges/utils';
import { EdgeType } from '@/lib/store/edge/types';

// Utility to find the name by GUID
export const getEdgeNameByGUID = (guid: string, edgesList: EdgeType[]) => {
  if (!guid) return 'N/A';
  const edge = edgesList.find((n: EdgeType) => n.GUID === guid);
  return edge ? edge.name : guid;
};

export const transformTagsDataForTable = (
  tagsList: TagMetaData[],
  nodesList: NodeType[],
  edgesList: EdgeType[]
) => {
  return (
    tagsList?.map((data: TagMetaData) => {
      return {
        ...data,
        NodeName: getNodeNameByGUID(data.NodeGUID, nodesList),
        EdgeName: getEdgeNameByGUID(data.EdgeGUID, edgesList),
        key: data.GUID,
      } as TagMetaData;
    }) || []
  );
};
