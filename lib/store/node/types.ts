import Node from 'litegraphdb/types/models/Node';

export type NodeGroupWithGraph = {
  [GraphGUID: string]: NodeType[];
};

export type NodeType = Node;

// export type NodeTypeWithLabels = NodeType & {
//   labels?: string[];
//   tags?: string[];
// };
