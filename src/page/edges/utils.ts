import { EdgeType } from '@/types/types';
import { NodeType } from '@/types/types';

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

export const getNodeGUIDsByEdgeList = (edgesList: EdgeType[]) => {
  const fromGUIDs = edgesList.map((edge) => edge.From).filter((guid) => guid !== '');
  const toGUIDs = edgesList.map((edge) => edge.To).filter((guid) => guid !== '');
  return Array.from(new Set([...fromGUIDs, ...toGUIDs]));
};
