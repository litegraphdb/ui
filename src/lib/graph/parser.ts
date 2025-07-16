import { DOMParser } from '@xmldom/xmldom';
import type { NodeData, EdgeData } from './types';
import { Edge, Node } from 'litegraphdb/dist/types/types';

export function parseGexf(gexfContent: string) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(gexfContent, 'text/xml');

  const parsedNodes: NodeData[] = [];
  const parsedEdges: EdgeData[] = [];

  // Parse nodes
  const nodeElements = xmlDoc.getElementsByTagName('node');
  for (let i = 0; i < nodeElements.length; i++) {
    const node = nodeElements[i];
    const nodeId = node.getAttribute('id') || '';
    const label = node.getAttribute('label') || nodeId;

    let type = 'server';
    const attvalues = node.getElementsByTagName('attvalue');
    for (let j = 0; j < attvalues.length; j++) {
      const attvalue = attvalues[j];
      if (attvalue.getAttribute('for') === 'type') {
        type = attvalue.getAttribute('value') || type;
        break;
      }
    }

    parsedNodes.push({
      id: nodeId,
      label,
      type,
      x: Math.random() * 800,
      y: Math.random() * 600,
      z: 0,
      vx: 0,
      vy: 0,
      isDragging: false,
    });
  }

  // Parse edges
  const edgeElements = xmlDoc.getElementsByTagName('edge');
  for (let i = 0; i < edgeElements.length; i++) {
    const edge = edgeElements[i];
    const edgeId = edge.getAttribute('id') || `e${i}`;
    const source = edge.getAttribute('source') || '';
    const target = edge.getAttribute('target') || '';

    let cost = 1;
    let data = '';
    const attvalues = edge.getElementsByTagName('attvalue');
    for (let j = 0; j < attvalues.length; j++) {
      const attvalue = attvalues[j];
      if (attvalue.getAttribute('for') === 'cost') {
        cost = Number(attvalue.getAttribute('value')) || cost;
      } else if (attvalue.getAttribute('for') === 'data') {
        data = attvalue.getAttribute('value') || '';
      }
    }

    const sourceNode = parsedNodes.find((n) => n.id === source);
    const targetNode = parsedNodes.find((n) => n.id === target);

    parsedEdges.push({
      id: edgeId,
      source,
      target,
      cost,
      data,
      sourceX: sourceNode?.x || 0,
      sourceY: sourceNode?.y || 0,
      targetX: targetNode?.x || 0,
      targetY: targetNode?.y || 0,
    });
  }

  return { nodes: parsedNodes, edges: parsedEdges };
}

// Function to build the adjacency list based on dependencies
export const buildAdjacencyList = (nodes: Node[], dependencies: { from: string; to: string }[]) => {
  const adjList: Record<string, string[]> = {};

  // Initialize adjacency list with empty arrays for each node
  nodes.forEach((node) => {
    adjList[node.GUID] = [];
  });

  // Add dependencies to the adjacency list
  dependencies.forEach((dependency) => {
    adjList[dependency.from].push(dependency.to);
  });

  return adjList;
};

// Topological Sort using Kahn's Algorithm
export const topologicalSortKahn = (adjList: Record<string, string[]>): string[] => {
  const inDegree: Record<string, number> = {}; // In-degree for each node
  const queue: string[] = []; // Queue for nodes with in-degree 0
  const topologicalOrder: string[] = [];

  // Initialize in-degree of all nodes to 0
  Object.keys(adjList).forEach((node) => {
    inDegree[node] = 0; // Initially, no incoming edges
  });

  // Calculate the in-degree for each node based on adjList
  Object.keys(adjList).forEach((node) => {
    adjList[node].forEach((neighbor) => {
      inDegree[neighbor]++;
    });
  });

  // Add nodes with in-degree 0 to the queue
  Object.keys(inDegree).forEach((node) => {
    if (inDegree[node] === 0) {
      queue.push(node);
    }
  });

  // Process nodes in the queue
  while (queue.length > 0) {
    const node = queue.shift()!;
    topologicalOrder.push(node);

    adjList[node].forEach((neighbor) => {
      inDegree[neighbor]--;
      if (inDegree[neighbor] === 0) {
        queue.push(neighbor);
      }
    });
  }

  // Check if there was a cycle (not all nodes were processed)
  if (topologicalOrder.length !== Object.keys(adjList).length) {
    throw new Error('The graph has a cycle and cannot be topologically sorted');
  }

  return topologicalOrder;
};

// Parse nodes and assign positions based on topological sort and calculated depths
export function parseNode(
  nodes: Node[],
  totalNodes: number, // current graph instance
  adjList: Record<string, string[]>, // adjacency list (node dependencies)
  topologicalOrder: string[], // topological sort order of node GUIDs
  centerX = 5000, // Center X position (where the topological order starts)
  centerY = 5000, // Base Y position (used for vertical stacking)
  centerZ = 5000, // Base Z position (used for depth stacking)
  horizontalSpacing = 1000, // Spacing between nodes in the x-direction
  verticalSpacing = 10000, // Base spacing between layers in the y-direction
  depthSpacing = 1000 // Spacing between layers in the z-direction
): NodeData[] {
  const existingNodeCount = totalNodes;

  // Create a map of node GUID to its index in the topological order
  const nodeIndexMap = topologicalOrder.reduce(
    (acc, nodeId, index) => {
      acc[nodeId] = index;
      return acc;
    },
    {} as Record<string, number>
  );

  // 1. Initialize depth for each node and calculate the depths
  const nodeDepthMap: Record<string, number> = {};
  const visited = new Set<string>(); // To prevent cycles

  // Function to calculate the depth of each node (how far from the root)
  function calculateDepth(node: string): number {
    if (visited.has(node)) return nodeDepthMap[node]; // Return pre-calculated depth

    visited.add(node);

    let maxDepth = 0;
    adjList[node]?.forEach((dependency) => {
      maxDepth = Math.max(maxDepth, calculateDepth(dependency));
    });

    // The depth of this node is 1 more than its deepest dependency
    nodeDepthMap[node] = maxDepth + 1;
    return nodeDepthMap[node];
  }

  // Calculate depths for all nodes
  topologicalOrder.forEach((node) => {
    if (!nodeDepthMap[node]) {
      calculateDepth(node);
    }
  });

  // 2. Assign x, y, z positions based on topological order and calculated depths
  return nodes.map((node, i) => {
    const globalIndex = existingNodeCount + i;

    // Get the topological position of the node in the sorted list
    const sortedIndex = nodeIndexMap[node.GUID] ?? i; // Fallback to 'i' if the node is not in the topological order

    // Position nodes along the x-axis based on the sorted order
    const x = centerX + sortedIndex * horizontalSpacing;

    // Calculate y-position using node depth and vertical spacing
    const depth = nodeDepthMap[node.GUID] ?? 0; // Depth of the current node
    const y = centerY + depth * verticalSpacing;

    // Calculate z-position based on depth and a new spacing
    const z = centerZ + depth * depthSpacing;

    return {
      id: node.GUID,
      label: node.Name,
      type: 'server',
      x,
      y,
      z, // Add the z-axis position for 3D visualization
      vx: 0,
      vy: 0,
      isDragging: false,
    };
  });
}

export function parseEdge(edges: Edge[]): EdgeData[] {
  return edges.map((edge) => ({
    id: edge.GUID,
    source: edge.From,
    target: edge.To,
    cost: edge.Cost || 0,
    label: edge.Name,
    data: '',
    sourceX: 0,
    sourceY: 0,
    targetX: 0,
    targetY: 0,
  }));
}
