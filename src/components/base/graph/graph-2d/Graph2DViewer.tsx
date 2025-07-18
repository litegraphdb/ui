import { SigmaContainer } from '@react-sigma/core';
import { MultiDirectedGraph } from 'graphology';
import React, { Dispatch, SetStateAction, useEffect, useRef } from 'react';
import SigmaGraphLoader from './SigmaGraphLoader';
import { GraphEdgeTooltip, GraphNodeTooltip } from '../types';
import { EdgeData, NodeData } from '@/lib/graph/types';
import { uuid } from '@/utils/stringUtils';

interface Graph2DViewerProps {
  show3d: boolean;
  selectedGraphRedux: string;
  nodes: NodeData[];
  edges: EdgeData[];
  gexfContent: string;
  setTooltip: Dispatch<SetStateAction<GraphNodeTooltip>>;
  setEdgeTooltip: Dispatch<SetStateAction<GraphEdgeTooltip>>;
  nodeTooltip: GraphNodeTooltip;
  edgeTooltip: GraphEdgeTooltip;
}
const Graph2DViewer = ({
  show3d,
  selectedGraphRedux,
  nodes,
  edges,
  gexfContent,
  setTooltip,
  setEdgeTooltip,
  nodeTooltip,
  edgeTooltip,
}: Graph2DViewerProps) => {
  const refId = useRef<string>(uuid());
  useEffect(() => {
    refId.current = uuid();
    console.log('nodes on graph 2d viewer', { nodes, edges });
  }, [nodes, edges]);
  return (
    <SigmaContainer
      className={show3d ? 'd-none' : ''}
      key={refId.current} // Force re-render when the context changes
      style={{ height: '100%' }}
      settings={{
        enableEdgeHoverEvents: true, // Explicitly enable edge hover events
        enableEdgeClickEvents: true, // Enable click events for edges
        defaultNodeColor: '#999',
        defaultEdgeColor: '#999',
        labelSize: 14,
        labelWeight: 'bold',
        renderEdgeLabels: true,
        renderLabels: false,
        edgeLabelSize: 12,
        minCameraRatio: 0.1,
        maxCameraRatio: 10,
        nodeReducer: (node, data) => ({
          ...data,
          highlighted: data.highlighted,
          size: data.highlighted ? 12 : 7,
          color: data.highlighted ? '#ff9900' : data.color,
        }),
        edgeReducer: (edge, data) => ({
          ...data,
          size: data.size * (data.highlighted ? 1.2 : 0.7),
          color: data.highlighted ? '#ff9900' : data.color,
          label: data.highlighted ? data.label : undefined,
        }),
      }}
      graph={MultiDirectedGraph}
    >
      <SigmaGraphLoader
        gexfContent={''}
        setTooltip={setTooltip}
        setEdgeTooltip={setEdgeTooltip}
        nodeTooltip={nodeTooltip}
        edgeTooltip={edgeTooltip}
        nodes={nodes}
        edges={edges}
      />
    </SigmaContainer>
  );
};

export default Graph2DViewer;
