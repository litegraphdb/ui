import { transformToOptions } from '@/lib/graph/utils';

import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { RootState } from '@/lib/store/store';
import {
  useGetAllNodesQuery,
  useGetAllEdgesQuery,
  useEnumerateAndSearchNodeQuery,
  useEnumerateAndSearchEdgeQuery,
} from '@/lib/store/slice/slice';
import { useEffect, useRef, useState } from 'react';
import { Edge, EnumerateResponse, Node } from 'litegraphdb/dist/types/types';
import {
  buildAdjacencyList,
  topologicalSortKahn,
  parseEdge,
  parseNode,
  renderTree,
  parseCircularNode,
  parseCircularNodeDeterministic,
} from '@/lib/graph/parser';
import { EdgeData, NodeData } from '@/lib/graph/types';

export const useCurrentTenant = () => {
  const tenantFromRedux = useAppSelector((state: RootState) => state.liteGraph.tenant);
  return tenantFromRedux;
};

export const useSelectedGraph = () => {
  const selectedGraphRedux = useAppSelector((state: RootState) => state.liteGraph.selectedGraph);
  return selectedGraphRedux;
};

export const useSelectedTenant = () => {
  const selectedTenantRedux = useAppSelector((state: RootState) => state.liteGraph.tenant);
  return selectedTenantRedux;
};

export const useNodeAndEdge = (graphId: string) => {
  const {
    data: nodesList,
    refetch: fetchNodesList,
    isLoading: isNodesLoading,
    error: nodesError,
  } = useGetAllNodesQuery({ graphId });
  const nodeOptions = transformToOptions(nodesList);
  const {
    data: edgesList,
    refetch: fetchEdgesList,
    isLoading: isEdgesLoading,
    error: edgesError,
  } = useGetAllEdgesQuery({ graphId });
  const edgeOptions = transformToOptions(edgesList);

  const fetchNodesAndEdges = async () => {
    await Promise.all([fetchNodesList(), fetchEdgesList()]);
  };

  return {
    nodesList,
    edgesList,
    fetchNodesAndEdges,
    isLoading: isNodesLoading || isEdgesLoading,
    error: nodesError || edgesError,
    edgesError,
    nodesError,
    nodeOptions,
    edgeOptions,
  };
};

export const useLazyLoadNodes = (graphId: string, onDataLoaded?: () => void) => {
  const [loading, setLoading] = useState(false);
  const [firstResult, setFirstResult] = useState<EnumerateResponse<Node> | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [processedNodes, setProcessedNodes] = useState<NodeData[]>([]);
  const [continuationToken, setContinuationToken] = useState<string | undefined>(undefined);
  const isFirstRender = useRef(true);
  const {
    data: nodesList,
    refetch: fetchNodesList,
    isLoading,
    isFetching,
    isError: isNodesError,
  } = useEnumerateAndSearchNodeQuery(
    {
      graphId,
      request: { MaxResults: 50, ContinuationToken: continuationToken, IncludeSubordinates: true },
    },
    { skip: !graphId }
  );
  const isLoadingOrFetching = isLoading || isFetching;

  useEffect(() => {
    setLoading(true);
    if (nodesList?.Objects?.length) {
      const updatedNodes = [...nodes, ...nodesList.Objects];
      setNodes(updatedNodes);

      // Only process new nodes to avoid shuffling existing ones
      const newNodes = nodesList.Objects;
      const newProcessedNodes = parseCircularNodeDeterministic(newNodes);

      // Merge with existing processed nodes, preserving their positions
      setProcessedNodes((prevProcessedNodes) => {
        const existingNodeIds = new Set(prevProcessedNodes.map((node) => node.id));
        const newNodesToAdd = newProcessedNodes.filter((node) => !existingNodeIds.has(node.id));
        return [...prevProcessedNodes, ...newNodesToAdd];
      });
    } else {
      setLoading(false);
    }
    if (!firstResult && nodesList) {
      setLoading(false);
      setFirstResult(nodesList);
    }
    if (nodesList?.ContinuationToken) {
      setContinuationToken(nodesList.ContinuationToken);
    }
    if (nodesList?.RecordsRemaining === 0) {
      setLoading(false);
      onDataLoaded?.();
    }
  }, [nodesList]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false; // skip the first run
      return;
    }

    setNodes([]);
    setProcessedNodes([]);
    setFirstResult(null);
    setContinuationToken(undefined);
    try {
      fetchNodesList();
    } catch (error) {
      console.error(error);
    }
  }, [graphId]);

  return {
    nodes,
    processedNodes,
    refetchNodes: fetchNodesList,
    firstResult,
    isNodesError,
    isNodesLoading: isLoadingOrFetching || loading,
  };
};

export const useLazyLoadEdges = (
  graphId: string,
  onDataLoaded?: () => void,
  doNotFetchOnRender?: boolean
) => {
  const [loading, setLoading] = useState(false);
  const [firstResult, setFirstResult] = useState<EnumerateResponse<Edge> | null>(null);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [continuationToken, setContinuationToken] = useState<string | undefined>(undefined);
  const {
    data: edgesList,
    refetch: fetchEdgesList,
    isLoading: isEdgesLoading,
    isFetching: isEdgesFetching,
    isError: isEdgesError,
  } = useEnumerateAndSearchEdgeQuery(
    {
      graphId,
      request: { MaxResults: 50, ContinuationToken: continuationToken },
    },
    { skip: doNotFetchOnRender || !graphId }
  );
  const isEdgesLoadingOrFetching = isEdgesLoading || isEdgesFetching;
  useEffect(() => {
    setLoading(true);
    if (edgesList?.Objects?.length) {
      const updatedEdges = [...edges, ...edgesList.Objects];
      setEdges(updatedEdges);
    } else {
      setLoading(false);
    }
    if (!firstResult && edgesList) {
      setFirstResult(edgesList);
    }
    if (edgesList?.ContinuationToken) {
      setContinuationToken(edgesList.ContinuationToken);
    }
    if (edgesList?.RecordsRemaining === 0) {
      onDataLoaded?.();
      setLoading(false);
    }
  }, [edgesList]);

  useEffect(() => {
    setEdges([]);
    setFirstResult(null);
    setContinuationToken(undefined);
    try {
      fetchEdgesList();
    } catch (error) {
      console.error(error);
    }
  }, [graphId]);

  return {
    edges,
    isEdgesLoading: isEdgesLoadingOrFetching || loading,
    refetchEdges: fetchEdgesList,
    firstResult,
    isEdgesError,
  };
};

export const useLazyLoadEdgesAndNodes = (graphId: string, showGraphHorizontal: boolean) => {
  const [nodesForGraph, setNodesForGraph] = useState<NodeData[]>([]);
  const [edgesForGraph, setEdgesForGraph] = useState<EdgeData[]>([]);
  const [doNotFetchEdgesOnRender, setDoNotFetchEdgesOnRender] = useState(true);
  const [edgesFetched, setEdgesFetched] = useState(false);

  const {
    nodes,
    processedNodes,
    isNodesLoading,
    refetchNodes,
    firstResult: nodesFirstResult,
    isNodesError,
  } = useLazyLoadNodes(graphId, () => setDoNotFetchEdgesOnRender(false));

  const dispatch = useAppDispatch();
  const {
    edges,
    isEdgesLoading,
    refetchEdges,
    firstResult: edgesFirstResult,
    isEdgesError,
  } = useLazyLoadEdges(
    graphId,
    () => {
      setDoNotFetchEdgesOnRender(true);
      setEdgesFetched(true);
    },
    doNotFetchEdgesOnRender
  );

  useEffect(() => {
    if (!nodes.length) return;

    if (!edgesFetched || isEdgesLoading) {
      // Use processed circular nodes while edges are still loading
      setNodesForGraph(processedNodes);
      setEdgesForGraph([]); // No edges while loading
    } else {
      // Use topological layout once edges are fetched
      const adjList = buildAdjacencyList(
        nodes,
        edges.map((edge) => ({ from: edge.From, to: edge.To }))
      );
      console.log(adjList);
      const topologicalOrder = topologicalSortKahn(adjList);
      console.log(topologicalOrder);
      const uniqueNodes = parseNode(
        nodes,
        nodes.length,
        adjList,
        topologicalOrder,
        showGraphHorizontal
      );
      setNodesForGraph(uniqueNodes);
      const nodeIds = uniqueNodes.map((node) => node.id);
      setEdgesForGraph(
        parseEdge(
          edges?.filter((edge) => nodeIds.includes(edge.From) && nodeIds.includes(edge.To)) || []
        )
      );
    }
  }, [nodes, processedNodes, edges, showGraphHorizontal, edgesFetched, isEdgesLoading]);

  // Reset edgesFetched when graphId changes
  useEffect(() => {
    setEdgesFetched(false);
  }, [graphId]);

  return {
    nodes: nodesForGraph,
    edges: edgesForGraph,
    rawEdges: edges, // Add raw edges for progress bar
    isNodesLoading,
    isEdgesLoading,
    isLoading: isNodesLoading || isEdgesLoading,
    refetch: () => {
      refetchNodes();
      refetchEdges();
    },
    nodesFirstResult,
    edgesFirstResult,
    isNodesError,
    isEdgesError,
    refetchNodes,
    refetchEdges,
    isError: isNodesError || isEdgesError,
    edgesFetched, // Expose this state for debugging or other uses
  };
};
