import { EdgeType } from '@/lib/store/edge/types';
import { NodeType } from '@/lib/store/node/types';

// Utility to find the name by GUID
export const getNodeNameByGUID = (guid: string, nodesList: NodeType[]) => {
  if (!guid) return 'N/A';
  const node = nodesList.find((n: NodeType) => n.GUID === guid);
  return node ? node.Name : guid;
};

export const transformEdgeDataForTable = (edgesList: EdgeType[], nodesList: NodeType[]) => {
  return (
    edgesList?.map((data: EdgeType) => {
      return {
        ...data,
        FromName: getNodeNameByGUID(data.From, nodesList),
        ToName: getNodeNameByGUID(data.To, nodesList),
        key: data.GUID,
      } as EdgeType;
    }) || []
  );
};
