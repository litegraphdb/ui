import Node from 'litegraphdb/types/models/Node';

export type NodeGroupWithGraph = {
  [GraphGUID: string]: NodeType[];
};

export type NodeType = Node & {
  Score?: number;
  Distance?: number;
};

// export type NodeTypeWithLabels = NodeType & {
//   labels?: string[];
//   tags?: string[];
// };
