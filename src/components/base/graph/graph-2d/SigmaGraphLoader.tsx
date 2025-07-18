'use client';

import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import Graph from 'graphology';
import { useLoadGraph, useRegisterEvents, useSigma } from '@react-sigma/core';
import { GraphEdgeTooltip, GraphNodeTooltip } from '../types';
import { calculateTooltipPosition } from '@/utils/appUtils';
import { EdgeData, NodeData } from '@/lib/graph/types';
import { LightGraphTheme } from '@/theme/theme';
import { useAppContext } from '@/hooks/appHooks';
import { ThemeEnum } from '@/types/types';

interface GraphLoaderProps {
  gexfContent: string;
  setTooltip: Dispatch<SetStateAction<GraphNodeTooltip>>;
  setEdgeTooltip: Dispatch<SetStateAction<GraphEdgeTooltip>>;
  nodeTooltip: GraphNodeTooltip;
  edgeTooltip: GraphEdgeTooltip;
  nodes: NodeData[];
  edges: EdgeData[];
}

const GraphLoader = ({
  gexfContent,
  setTooltip,
  setEdgeTooltip,
  nodeTooltip,
  edgeTooltip,
  nodes,
  edges,
}: GraphLoaderProps) => {
  const { theme } = useAppContext();
  const loadGraph = useLoadGraph();
  const sigma = useSigma();
  const graph = new Graph({ multi: true, allowSelfLoops: true });
  const animationFrameRef = useRef<number>();
  const registerEvents = useRegisterEvents();
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [draggedEdge, setDraggedEdge] = useState<string | null>(null);

  const isDraggingRef = useRef(false);

  // Reset the tooltips while zoom in-zoom out
  useEffect(() => {
    const sigmaInstance = sigma.getCamera(); // Access the camera
    const handleCameraUpdate = () => {
      // Clear all tooltips when zoom or pan occurs
      setTooltip({ visible: false, nodeId: '', x: 0, y: 0 });
      setEdgeTooltip({ visible: false, edgeId: '', x: 0, y: 0 });
    };

    // Attach the event listener for camera updates
    sigmaInstance.on('updated', handleCameraUpdate);

    // Cleanup the event listener on unmount
    return () => {
      sigmaInstance.removeListener('updated', handleCameraUpdate);
    };
  }, [sigma]);

  useEffect(() => {
    // Add nodes with circle shape
    nodes.forEach((node) => {
      graph.addNode(node.id, {
        x: node.x,
        y: node.y,
        size: 15,
        label: node.label,
        color: theme === ThemeEnum.LIGHT ? LightGraphTheme.primary : LightGraphTheme.primaryLight,
        type: 'circle',
        vx: 0,
        vy: 0,
        isDragging: false,
      });
    });

    // Add edges with unique IDs
    edges.forEach((edge) => {
      graph.addEdgeWithKey(
        edge.id,
        edge.source,
        edge.target,
        {
          size: 3,
          label: `${edge.id}${edge.cost}`,
          color: '#aaa',
          type: 'arrow',
        }
        // { generateId: () => edge.id }
      );
    });

    loadGraph(graph);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      sigma.removeAllListeners();
      graph.clear();
    };
  }, [gexfContent, loadGraph, sigma, nodes?.length, edges?.length]);

  useEffect(() => {
    // Register the events
    registerEvents({
      downNode: (e) => {
        setDraggedNode(e.node);
        isDraggingRef.current = false;
        sigma.getGraph().setNodeAttribute(e.node, 'highlighted', true);
      },
      // On mouse move, if the drag mode is enabled, we change the position of the draggedNode
      mousemovebody: (e) => {
        if (nodeTooltip?.visible) {
          setTooltip({ visible: false, nodeId: '', x: 0, y: 0 });
        }
        if (edgeTooltip?.visible) {
          setEdgeTooltip({ visible: false, edgeId: '', x: 0, y: 0 });
        }
        if (draggedNode) {
          isDraggingRef.current = true;
          // Get new position of node
          const pos = sigma.viewportToGraph(e);
          sigma.getGraph().setNodeAttribute(draggedNode, 'x', pos.x);
          sigma.getGraph().setNodeAttribute(draggedNode, 'y', pos.y);

          // Prevent sigma to move camera:
          e.preventSigmaDefault();
          e.original.preventDefault();
          e.original.stopPropagation();
        }

        if (draggedEdge) {
          // Optionally handle edge dragging logic here
          e.preventSigmaDefault();
          e.original.preventDefault();
          e.original.stopPropagation();
        }
        return;
      },
      // On mouse up, we reset the autoscale and the dragging mode
      mouseup: () => {
        if (draggedNode) {
          setDraggedNode(null);
          sigma.getGraph().removeNodeAttribute(draggedNode, 'highlighted');
        }
        if (draggedEdge) {
          setDraggedEdge(null);
          sigma.getGraph().removeEdgeAttribute(draggedEdge, 'highlighted');
        }
      },
      // Disable the autoscale at the first down interaction
      mousedown: () => {
        if (!sigma.getCustomBBox()) sigma.setCustomBBox(sigma.getBBox());
      },
      clickNode: (event) => {
        if (isDraggingRef.current) {
          isDraggingRef.current = false; // Reset for next interaction
          return;
        }
        const { clientX: x, clientY: y } = event.event?.original || { clientX: 0, clientY: 0 }; // Screen coordinates of the pointer event
        const node = event.node; // Node ID
        // const graph = event.event.graph;
        // const nodeAttributes = graph.getNodeAttributes(node); // Fetch node attributes

        const { x: tooltipX, y: tooltipY } = calculateTooltipPosition(x, y);

        setTooltip({
          visible: true,
          nodeId: node,
          x: tooltipX,
          y: tooltipY,
        });

        // Clear edge tooltip
        setEdgeTooltip({ visible: false, edgeId: '', x: 0, y: 0 });
      },
      enterEdge: (event) => {
        const { edge } = event;
        sigma.getGraph().updateEdgeAttributes(edge, (attrs) => ({
          ...attrs,
          color: '#ff9900', // Highlight color for hover effect
          size: attrs.size * 2, // Optional: increase edge size
        }));

        sigma.refresh(); // Force re-render
      },
      clickEdge: (event) => {
        const { clientX: x, clientY: y } = event.event?.original || { clientX: 0, clientY: 0 }; // Screen coordinates of the pointer event
        const edgeId = event.edge;
        // const graph = sigma.getGraph();
        // const edgeAttributes = graph.getEdgeAttributes(edgeId);

        const { x: tooltipX, y: tooltipY } = calculateTooltipPosition(x, y);

        setEdgeTooltip({
          visible: true,
          edgeId,
          x: tooltipX,
          y: tooltipY,
        });

        // Clear node tooltip
        setTooltip({ visible: false, nodeId: '', x: 0, y: 0 });
      },
      leaveEdge: (event) => {
        const { edge } = event;

        sigma.getGraph().updateEdgeAttributes(edge, (attrs) => ({
          ...attrs,
          color: '#999',
          size: 5, // Reset to default size
        }));

        sigma.refresh(); // Force re-render
      },
      // leaveEdge: () => {
      //   setEdgeTooltip({ visible: false, content: '', x: 0, y: 0 });
      // },
      // leaveNode: () => {
      //   setTooltip({ visible: false, content: '', x: 0, y: 0 });
      // },
    });
  }, [registerEvents, sigma, draggedNode, draggedEdge, gexfContent, nodes?.length, edges?.length]);

  return null;
};

export default GraphLoader;
