import { EdgeType } from '@/lib/store/edge/types';
import { NodeType } from '@/lib/store/node/types';

// Utility to find the name by GUID
export const getNodeNameByGUID = (guid: string, nodesList: NodeType[]) => {
  if (!guid) return 'N/A';
  const node = nodesList.find((n: NodeType) => n.GUID === guid);
  return node ? node.name : guid;
};

export const transformEdgeDataForTable = (edgesList: EdgeType[], nodesList: NodeType[]) => {
  return (
    edgesList?.map((data: EdgeType) => {
      return {
        ...data,
        fromName: getNodeNameByGUID(data.from, nodesList),
        toName: getNodeNameByGUID(data.to, nodesList),
        key: data.GUID,
      } as EdgeType;
    }) || []
  );
};
