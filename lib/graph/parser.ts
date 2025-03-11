import { DOMParser } from '@xmldom/xmldom';
import type { NodeData, EdgeData } from './types';

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
