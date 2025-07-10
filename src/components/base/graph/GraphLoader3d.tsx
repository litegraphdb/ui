'use client';

import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { GraphData, LinkObject, NodeObject } from 'react-force-graph-3d';
import { GraphEdgeTooltip, GraphNodeTooltip } from './types';
import { NodeType, ThemeEnum } from '@/types/types';
import { EdgeData, NodeData } from '@/lib/graph/types';
import { darkTheme, LightGraphTheme, primaryTheme } from '@/theme/theme';
import { calculateTooltipPosition } from '@/utils/appUtils';
import { useAppContext } from '@/hooks/appHooks';
// Dynamically load to avoid SSR issues with Three.js
const ForceGraph3D = dynamic(() => import('react-force-graph-3d'), { ssr: false });

export default function GraphLoader3d({
  nodes,
  edges,
  setTooltip,
  setEdgeTooltip,
  className,
}: {
  nodes: NodeData[];
  edges: EdgeData[];
  className?: string;
  setTooltip: Dispatch<SetStateAction<GraphNodeTooltip>>;
  setEdgeTooltip: Dispatch<SetStateAction<GraphEdgeTooltip>>;
}) {
  const { theme } = useAppContext();
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

  const handleNodeClick = (node: NodeObject<NodeType>, event: any) => {
    setEdgeTooltip({ visible: false, edgeId: '', x: 0, y: 0 });

    const { x: tooltipX, y: tooltipY } = calculateTooltipPosition(event.clientX, event.clientY);
    setTooltip({
      visible: true,
      nodeId: node.id as string,
      x: tooltipX,
      y: tooltipY,
    });
  };

  const handleLinkClick = (link: LinkObject<NodeData, EdgeData>, event: any) => {
    setTooltip({ visible: false, nodeId: '', x: 0, y: 0 });
    const { x: tooltipX, y: tooltipY } = calculateTooltipPosition(event.clientX, event.clientY);
    setEdgeTooltip({
      visible: true,
      edgeId: link.id,
      x: tooltipX,
      y: tooltipY,
    });
  };

  return (
    <div className={className} style={{ height: '600px' }}>
      <ForceGraph3D
        graphData={graphData}
        nodeAutoColorBy="type"
        nodeLabel="name"
        linkLabel="name"
        nodeOpacity={1}
        backgroundColor={theme === ThemeEnum.LIGHT ? '#fff' : darkTheme.token?.colorBgBase}
        nodeColor={(node) => {
          return theme === ThemeEnum.LIGHT ? LightGraphTheme.primary : LightGraphTheme.primaryLight;
        }}
        linkColor={(link) => {
          return theme === ThemeEnum.LIGHT ? '#000' : '#fff';
        }}
        showNavInfo
        linkWidth={1}
        onNodeClick={(node, event) => handleNodeClick(node as NodeObject<NodeType>, event)}
        onLinkClick={(link, event) =>
          handleLinkClick(link as LinkObject<NodeData, EdgeData>, event)
        }
      />
    </div>
  );
}
