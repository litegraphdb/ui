'use client';

import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { GraphData, LinkObject, NodeObject } from 'react-force-graph-3d';
import { GraphEdgeTooltip, GraphNodeTooltip } from './types';
import { NodeType } from '@/types/types';
import { EdgeData, NodeData } from '@/lib/graph/types';
import { LightGraphTheme } from '@/theme/theme';
// Dynamically load to avoid SSR issues with Three.js
const ForceGraph3D = dynamic(() => import('react-force-graph-3d'), { ssr: false });

export default function GraphLoader3d({
  nodes,
  edges,
  setTooltip,
  setEdgeTooltip,
}: {
  nodes: NodeData[];
  edges: EdgeData[];
  setTooltip: Dispatch<SetStateAction<GraphNodeTooltip>>;
  setEdgeTooltip: Dispatch<SetStateAction<GraphEdgeTooltip>>;
}) {
  const [graphData, setGraphData] = useState<GraphData>({
    nodes: [],
    links: [],
  });

  useEffect(() => {
    // Map your nodes and edges to 3D-force-graph format
    const mappedNodes = nodes.map((n) => ({
      id: n.id,
      name: n.label,
      type: n.type,
      x: n.x,
      y: n.y,
    }));

    const mappedLinks = edges.map((e) => ({
      source: e.source,
      target: e.target,
      id: e.id,
      cost: e.cost,
      name: e.label,
    }));

    setGraphData({
      nodes: mappedNodes,
      links: mappedLinks,
    });
  }, [nodes, edges]);

  const handleNodeClick = (node: NodeObject<NodeType>) => {
    console.log('Node clicked:', node);
    setTooltip({
      visible: true,
      nodeId: node.id as string,
      x: node.x as number,
      y: node.y as number,
    });
  };

  const handleLinkClick = (link: LinkObject<NodeData, EdgeData>) => {
    console.log('Edge clicked:', link);
    setEdgeTooltip({
      visible: true,
      edgeId: link.id,
      x: link.x as number,
      y: link.y as number,
    });
  };

  return (
    <div style={{ height: '600px' }}>
      <ForceGraph3D
        graphData={graphData}
        nodeAutoColorBy="type"
        nodeLabel="name"
        linkLabel="name"
        backgroundColor="#fff"
        nodeColor={(node) => {
          return LightGraphTheme.primary;
        }}
        linkColor={(link) => {
          return '#000';
        }}
        showNavInfo
        linkWidth={1}
        onNodeClick={(node) => handleNodeClick(node as NodeObject<NodeType>)}
        onLinkClick={(link) => handleLinkClick(link as LinkObject<NodeData, EdgeData>)}
      />
    </div>
  );
}
