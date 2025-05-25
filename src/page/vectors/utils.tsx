import { NodeType } from '@/lib/store/node/types';
import { getNodeNameByGUID } from '../edges/utils';
import { EdgeType } from '@/lib/store/edge/types';
import { getEdgeNameByGUID } from '../tags/utils';
import { VectorMetadata } from 'litegraphdb/types/models/VectorMetadata';

type VectorDisplayData = {
  GUID: string;
  TenantGUID: string;
  GraphGUID: string;
  NodeGUID: string;
  EdgeGUID: string;
  Model: string;
  Dimensionality: number;
  Content: string;
  Vectors: number[];
  CreatedUtc: string;
  LastUpdateUtc: string;
  NodeName: string;
  EdgeName: string;
  key: string;
  vectorString: string;
  vectorCount: number;
};

export const transformVectorsDataForTable = (
  vectorsList: VectorMetadata[],
  nodesList: NodeType[],
  edgesList: EdgeType[]
): VectorDisplayData[] => {
  return (
    vectorsList?.map((data) => ({
      ...data,
      NodeName: getNodeNameByGUID(data.NodeGUID, nodesList),
      EdgeName: getEdgeNameByGUID(data.EdgeGUID, edgesList),
      key: data.GUID,
      vectorString: Array.isArray(data.Vectors) ? data.Vectors.join(', ') : '',
      vectorCount: Array.isArray(data.Vectors) ? data.Vectors.length : 0,
    })) || []
  );
};
