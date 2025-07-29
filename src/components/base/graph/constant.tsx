import { GraphEdgeTooltip, GraphNodeTooltip } from './types';

export const defaultNodeTooltip: GraphNodeTooltip = {
  visible: false,
  nodeId: '',
  x: 0,
  y: 0,
};

export const defaultEdgeTooltip: GraphEdgeTooltip = {
  visible: false,
  edgeId: '',
  x: 0,
  y: 0,
};

export const defaultNodeColor = '#aaaaaa';

export const nodeLightColorByType: Record<string, string> = {
  StoragePool: '#008f7a',
  BucketMetadata: '#008e9b',
  TenantMetadata: '#ff8066',
  VectorRepository: '#0081cf',
  Collection: '#c34a36',
  ObjectMetadata: '#845ec2',
  EmbeddingsDocument: '#d65db1',
  SourceDocument: '#ff6f91',
  Unknown: defaultNodeColor,
};
