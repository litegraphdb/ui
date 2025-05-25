import { EdgeType } from '@/lib/store/edge/types';
import { GraphData } from '@/lib/store/graph/types';
import { NodeType } from '@/lib/store/node/types';
import { VectorSearchResult } from 'litegraphdb/types/models/VectorSearchResult';

export const transformToGraphData = (data: VectorSearchResult[]) => {
  const graphData: GraphData[] = [];
  data.forEach((item: VectorSearchResult) => {
    if (item.Graph) {
      graphData.push(item.Graph);
    }
  });
  return graphData;
};

export const transformToNodeData = (data: VectorSearchResult[]) => {
  const nodeData: NodeType[] = [];
  data.forEach((item: VectorSearchResult) => {
    if (item.Node) {
      nodeData.push({
        ...item.Node,
        Score: item.Score,
        Distance: item.Distance,
      });
    }
  });
  return nodeData;
};

export const transformToEdgeData = (data: VectorSearchResult[]) => {
  const edgeData: EdgeType[] = [];
  data.forEach((item: VectorSearchResult) => {
    if (item.Edge) {
      edgeData.push(item.Edge);
    }
  });
  return edgeData;
};
