import { transformToOptions } from '@/lib/graph/utils';

import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { RootState } from '@/lib/store/store';
import {
  useGetAllNodesQuery,
  useGetAllEdgesQuery,
  useEnumerateAndSearchNodeQuery,
  useEnumerateAndSearchEdgeQuery,
} from '@/lib/store/slice/slice';
import { useEffect, useState } from 'react';
import { Edge, EnumerateResponse, Node } from 'litegraphdb/dist/types/types';
import { parseEdge, parseNode } from '@/lib/graph/parser';
import { EdgeData, NodeData } from '@/lib/graph/types';
import { SliceTags } from '@/lib/store/slice/types';
import sdkSlice from '@/lib/store/rtk/rtkSdkInstance';

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
  const [nodes, setNodes] = useState<NodeData[]>([]);
  const [continuationToken, setContinuationToken] = useState<string | undefined>(undefined);
  const {
    data: nodesList,
    refetch: fetchNodesList,
    isLoading,
    isFetching,
    isError: isNodesError,
  } = useEnumerateAndSearchNodeQuery(
    {
      graphId,
      request: { MaxResults: 50, ContinuationToken: continuationToken },
    },
    { skip: !graphId }
  );
  const isLoadingOrFetching = isLoading || isFetching;
  useEffect(() => {
    setLoading(true);
    if (nodesList?.Objects?.length) {
      const uniqueNodes = parseNode(
        nodesList.Objects,
        firstResult ? firstResult.TotalRecords : nodesList.TotalRecords
      ).filter((node) => !nodes.some((n) => n.id === node.id));
      const updatedNodes = [...nodes, ...uniqueNodes];
      setNodes(updatedNodes);
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
    setNodes([]);
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
  const [edges, setEdges] = useState<EdgeData[]>([]);
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
      const uniqueEdges = parseEdge(edgesList.Objects).filter(
        (edge) => !edges.some((e) => e.id === edge.id)
      );
      const updatedEdges = [...edges, ...uniqueEdges];
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

export const useLazyLoadEdgesAndNodes = (graphId: string) => {
  const [doNotFetchEdgesOnRender, setDoNotFetchEdgesOnRender] = useState(true);
  const {
    nodes,
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
  } = useLazyLoadEdges(graphId, () => setDoNotFetchEdgesOnRender(true), doNotFetchEdgesOnRender);

  // useEffect(() => {
  //   dispatch(sdkSlice.util.invalidateTags([SliceTags.RESET] as any));
  // }, [graphId]);

  return {
    nodes,
    edges,
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
  };
};
