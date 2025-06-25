import { transformToOptions } from '@/lib/graph/utils';
import {
  useGetTenantsList,
  useGetUsersList,
  useGetCredentialsList,
  useGetEdgesList,
  useGetGraphs,
  useGetLabelsList,
  useGetNodesList,
  useGetTagsList,
  useGetVectorsList,
  useSearchGraphsByTLD,
  useSearchDataByVector,
  useSearchNodesByTLD,
  useSearchEdgesByTLD,
  useGetBackupsList,
} from '@/lib/sdk/litegraph.service';
import { EdgeType } from '@/lib/store/edge/types';
import { GraphData } from '@/lib/store/graph/types';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { NodeType } from '@/lib/store/node/types';
import { RootState } from '@/lib/store/store';
import {
  transformToEdgeData,
  transformToGraphData,
  transformToNodeData,
} from '@/utils/transformers';
import Graph from 'graphology';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { GraphEnumerateRequest } from '@/components/base/graph/types';
import { EnumerateRequest } from 'litegraphdb/dist/types/types';
import { useGetAllNodesQuery, useGetAllEdgesQuery } from '@/lib/store/slice/slice';

export const useCurrentTenant = () => {
  const tenantFromRedux = useAppSelector((state: RootState) => state.liteGraph.tenant);
  return tenantFromRedux;
};

export const useSelectedGraph = () => {
  const selectedGraphRedux = useAppSelector((state: RootState) => state.liteGraph.selectedGraph);
  return selectedGraphRedux;
};

export const useGraphList = () => {
  const graphsList = useAppSelector((state: RootState) => state.graphsList.graphs);
  return graphsList || [];
};

export const useTenantList = () => {
  const tenantsList = useAppSelector((state: RootState) => state.tenants.tenantsList);
  const tenantOptions = tenantsList ? transformToOptions(tenantsList) : [];
  return { tenantsList: tenantsList || [], tenantOptions };
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

export const useTags = (graphId: string, enumerateRequest?: EnumerateRequest) => {
  const dispatch = useAppDispatch();
  const tagsList = useAppSelector((state: RootState) => state.tagsList.allTags);
  const { fetchTags, isLoading, error } = useGetTagsList(enumerateRequest);

  const fetchTagsList = async () => {
    await fetchTags(graphId, true);
  };

  useEffect(() => {
    if (tagsList === null && graphId) {
      fetchTagsList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tagsList, graphId]);

  return { tagsList: tagsList || [], fetchTagsList, isLoading, error };
};

export const useVectors = (graphId: string, enumerateRequest?: EnumerateRequest) => {
  const vectorsList = useAppSelector((state: RootState) => state.vectorsList.allVectors);
  const { fetchVectors, isLoading, error } = useGetVectorsList(enumerateRequest);

  const fetchVectorsList = async () => {
    await fetchVectors(graphId, true);
  };

  useEffect(() => {
    if (vectorsList === null && graphId) {
      fetchVectorsList();
    }
  }, [vectorsList, graphId]);

  return { vectorsList: vectorsList || [], fetchVectorsList, isLoading, error };
};

export const useLabels = (graphId: string, enumerateRequest?: EnumerateRequest) => {
  const labelsList = useAppSelector((state: RootState) => state.labelsList.allLabels);
  const { fetchLabels, isLoading, error } = useGetLabelsList(enumerateRequest);

  const fetchLabelsList = async () => {
    await fetchLabels(graphId, true);
  };

  useEffect(() => {
    if (labelsList === null && graphId) {
      fetchLabelsList();
    }
  }, [labelsList, graphId]);
  const labelOptions = transformToOptions(labelsList, 'Label');

  return { labelsList: labelsList || [], fetchLabelsList, isLoading, error, labelOptions };
};

export const useCredentials = (enumerateRequest?: EnumerateRequest) => {
  const credentialsList = useAppSelector(
    (state: RootState) => state.credentialsList.allCredentials
  );
  const tenant = useAppSelector((state: RootState) => state.liteGraph.tenant);
  const { fetchCredentials, isLoading, error } = useGetCredentialsList(enumerateRequest);

  const fetchCredentialsList = async () => {
    await fetchCredentials();
  };
  useEffect(() => {
    if (credentialsList === null && tenant) {
      fetchCredentialsList();
    }
  }, [credentialsList, tenant]);

  return { credentialsList: credentialsList || [], fetchCredentialsList, isLoading, error };
};

export const useBackups = () => {
  const backupsList = useAppSelector((state: RootState) => state.backupsList.allBackups);
  const { fetchBackups, isLoading, error } = useGetBackupsList();

  const fetchBackupsList = async () => {
    await fetchBackups();
  };

  useEffect(() => {
    if (backupsList === null) {
      fetchBackupsList();
    }
  }, [backupsList]);

  return { backupsList: backupsList || [], fetchBackupsList, isLoading, error };
};

export const useUsers = (enumerateRequest?: EnumerateRequest) => {
  const usersList = useAppSelector((state: RootState) => state.usersList.allUsers);
  const tenant = useAppSelector((state: RootState) => state.liteGraph.tenant);
  const { fetchUsers, isLoading, error } = useGetUsersList(enumerateRequest);

  const fetchUsersList = async () => {
    await fetchUsers();
  };

  useEffect(() => {
    if (usersList === null && tenant) {
      fetchUsersList();
    }
  }, [usersList, tenant]);

  return { usersList: usersList || [], fetchUsersList, isLoading, error };
};

export const useTenants = (enumerateRequest?: EnumerateRequest) => {
  const tenantsList = useAppSelector((state: RootState) => state.tenantsList.tenantsList);
  const tenant = useAppSelector((state: RootState) => state.liteGraph.tenant);
  const { fetchTenants, isLoading, error } = useGetTenantsList(enumerateRequest);

  const fetchTenantsList = async () => {
    await fetchTenants();
  };

  useEffect(() => {
    if (tenantsList === null && tenant) {
      fetchTenantsList();
    }
  }, [tenantsList, tenant]);

  return { tenantsList: tenantsList || [], fetchTenantsList, isLoading, error };
};

export const useSearchGraphData = () => {
  const [searchResults, setSearchResults] = useState<GraphData[] | null>(null);
  const { searchGraphsByTLD, isLoading: isTLDLoading, error: tldError } = useSearchGraphsByTLD();
  const {
    searchByVector,
    isLoading: isVectorLoading,
    error: vectorError,
  } = useSearchDataByVector();
  const [lastSearchQuery, setLastSearchQuery] = useState<any>(null);

  async function searchGraph(query: any) {
    setLastSearchQuery(query);
    let data: any;
    if (query.Embeddings) {
      const data = await searchByVector(query);
      if (data) {
        setSearchResults(transformToGraphData(data));
        if (!data.length) {
          toast.error('No results found');
        }
      }
    } else {
      const data = await searchGraphsByTLD(query);
      if (data?.Graphs) {
        setSearchResults(data.Graphs);
        if (!data.Graphs.length) {
          toast.error('No results found');
        }
      }
    }
  }
  const refreshSearch = () => {
    if (lastSearchQuery) {
      searchGraph(lastSearchQuery);
    }
  };

  return {
    searchGraph,
    searchResults,
    isLoading: isVectorLoading || isTLDLoading,
    error: vectorError || tldError,
    setSearchResults,
    refreshSearch,
  };
};

export const useSearchNodeData = () => {
  const [searchResults, setSearchResults] = useState<NodeType[] | null>(null);
  const { searchNodesByTLD, isLoading: isTLDLoading, error: tldError } = useSearchNodesByTLD();
  const {
    searchByVector,
    isLoading: isVectorLoading,
    error: vectorError,
  } = useSearchDataByVector();
  const [lastSearchQuery, setLastSearchQuery] = useState<any>(null);

  async function searchNode(query: any) {
    setLastSearchQuery(query);
    let data: any;
    if (query.Embeddings) {
      const data = await searchByVector(query);
      if (data) {
        console.log(data);
        setSearchResults(transformToNodeData(data));
        if (!data.length) {
          toast.error('No results found');
        }
      }
    } else {
      const data = await searchNodesByTLD(query);
      if (data?.Nodes) {
        setSearchResults(data.Nodes);
        if (!data.Nodes.length) {
          toast.error('No results found');
        }
      }
    }
  }

  const refreshSearch = () => {
    if (lastSearchQuery) {
      searchNode(lastSearchQuery);
    }
  };

  return {
    searchNode,
    searchResults,
    isLoading: isVectorLoading || isTLDLoading,
    error: vectorError || tldError,
    setSearchResults,
    refreshSearch,
  };
};

export const useSearchEdgeData = () => {
  const [searchResults, setSearchResults] = useState<EdgeType[] | null>(null);
  const { searchEdgesByTLD, isLoading: isTLDLoading, error: tldError } = useSearchEdgesByTLD();
  const {
    searchByVector,
    isLoading: isVectorLoading,
    error: vectorError,
  } = useSearchDataByVector();
  const [lastSearchQuery, setLastSearchQuery] = useState<any>(null);

  async function searchEdge(query: any) {
    setLastSearchQuery(query);
    let data: any;
    if (query.Embeddings) {
      const data = await searchByVector(query);
      if (data) {
        console.log(data);
        setSearchResults(transformToEdgeData(data));
        if (!data.length) {
          toast.error('No results found');
        }
      }
    } else {
      const data = await searchEdgesByTLD(query);
      if (data?.Edges) {
        setSearchResults(data.Edges);
        if (!data.Edges.length) {
          toast.error('No results found');
        }
      }
    }
  }

  const refreshSearch = () => {
    if (lastSearchQuery) {
      searchEdge(lastSearchQuery);
    }
  };

  return {
    searchEdge,
    searchResults,
    isLoading: isVectorLoading || isTLDLoading,
    error: vectorError || tldError,
    setSearchResults,
    refreshSearch,
  };
};
