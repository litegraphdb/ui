import { NodeData } from '@/lib/graph/types';
import { nodeLightColorByType } from './constant';

export const getLegendsForNodes = (nodes: NodeData[]) => {
  const legends = new Set<string>([]);
  nodes.forEach((node) => {
    if (Object.keys(nodeLightColorByType).includes(node.type)) {
      legends.add(node.type);
    } else {
      legends.add('Unknown');
    }
  });
  return Array.from(legends);
};
