'use client';

import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import Graph from 'graphology';
import { parseGexf } from '@/lib/graph/parser';
import { useLoadGraph, useRegisterEvents, useSigma } from '@react-sigma/core';
import { GraphEdgeTooltip, GraphNodeTooltip } from './types';

interface GraphLoaderProps {
  gexfContent: string;
  setTooltip: Dispatch<SetStateAction<GraphNodeTooltip>>;
  setEdgeTooltip: Dispatch<SetStateAction<GraphEdgeTooltip>>;
}

const GraphLoader = ({ gexfContent, setTooltip, setEdgeTooltip }: GraphLoaderProps) => {
  const loadGraph = useLoadGraph();
  const sigma = useSigma();
  const animationFrameRef = useRef<number>();
  const registerEvents = useRegisterEvents();
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [draggedEdge, setDraggedEdge] = useState<string | null>(null);

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
    // Create graph with multi-edge support
    const graph = new Graph({ multi: true, allowSelfLoops: true });
    const { nodes, edges } = parseGexf(gexfContent);

    // Add nodes with circle shape
    nodes.forEach((node) => {
      graph.addNode(node.id, {
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 15,
        label: node.label,
        color:
          node.type === 'server'
            ? '#ec5148'
            : node.type === 'router'
              ? '#4488cc'
              : node.type === 'client'
                ? '#45b7d1'
                : '#666666',
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
          color: '#999',
          type: 'arrow',
        }
        // { generateId: () => edge.id }
      );
    });

    loadGraph(graph);

    // Custom force-directed layout
    function applyForces() {
      const k = 0.01; // Spring constant
      const repulsion = 1000;
      const centerForce = 0.01;

      graph.forEachNode((nodeId) => {
        let fx = 0,
          fy = 0;
        const node = graph.getNodeAttributes(nodeId);

        if (node.isDragging) {
          return;
        }

        // Center force
        fx += (500 - node.x) * centerForce;
        fy += (300 - node.y) * centerForce;

        // Node repulsion
        graph.forEachNode((otherId) => {
          if (nodeId === otherId) return;

          const other = graph.getNodeAttributes(otherId);
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = repulsion / (dist * dist);

          fx += (dx / dist) * force;
          fy += (dy / dist) * force;
        });

        // Edge attraction
        graph.forEachEdge(nodeId, (edgeId, attrs, source, target) => {
          const other = graph.getNodeAttributes(source === nodeId ? target : source);
          const dx = other.x - node.x;
          const dy = other.y - node.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          fx += dx * k;
          fy += dy * k;
        });

        // Update velocities and positions
        node.vx = (node.vx + fx) * 0.9;
        node.vy = (node.vy + fy) * 0.9;

        node.x += node.vx;
        node.y += node.vy;

        // Keep nodes within bounds
        node.x = Math.max(0, Math.min(1000, node.x));
        node.y = Math.max(0, Math.min(600, node.y));

        graph.updateNodeAttributes(nodeId, (n) => ({
          ...n,
          x: node.x,
          y: node.y,
          vx: node.vx,
          vy: node.vy,
        }));
      });

      animationFrameRef.current = requestAnimationFrame(applyForces);
    }

    applyForces();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      sigma.removeAllListeners();
      graph.clear();
    };
  }, [gexfContent, loadGraph, sigma]);

  useEffect(() => {
    // Register the events
    registerEvents({
      downNode: (e) => {
        setDraggedNode(e.node);
        sigma.getGraph().setNodeAttribute(e.node, 'highlighted', true);
      },
      // On mouse move, if the drag mode is enabled, we change the position of the draggedNode
      mousemovebody: (e) => {
        if (draggedNode) {
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
        const { x, y } = event.event; // Screen coordinates of the pointer event
        const node = event.node; // Node ID
        // const graph = event.event.graph;
        // const nodeAttributes = graph.getNodeAttributes(node); // Fetch node attributes

        setTooltip({
          visible: true,
          nodeId: node,
          x: x + 180, // Adjust to position tooltip slightly offset from the cursor
          y: y + 200,
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
        const { x, y } = event.event;
        const edgeId = event.edge;
        // const graph = sigma.getGraph();
        // const edgeAttributes = graph.getEdgeAttributes(edgeId);

        setEdgeTooltip({
          visible: true,
          edgeId,
          x: x + 180,
          y: y + 180,
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
  }, [registerEvents, sigma, draggedNode, draggedEdge, gexfContent]);

  return null;
};

export default GraphLoader;
