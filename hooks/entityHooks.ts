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
} from '@/lib/sdk/litegraph.service';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { RootState } from '@/lib/store/store';
import { useEffect } from 'react';

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
  const tenantOptions = transformToOptions(tenantsList);
  return { tenantsList: tenantsList || [], tenantOptions };
};

export const useSelectedTenant = () => {
  const selectedTenantRedux = useAppSelector((state: RootState) => state.liteGraph.tenant);
  return selectedTenantRedux;
};

export const useGraphs = (doNotFetch: boolean = false) => {
  const graphsList = useAppSelector((state: RootState) => state.graphsList.graphs);
  const { fetchGraphs, isLoading, error } = useGetGraphs();
  const fetchGraphsList = async () => {
    await fetchGraphs(true);
  };

  useEffect(() => {
    // Fetch the list of graphs on mount
    if (graphsList === null && !doNotFetch) {
      fetchGraphsList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graphsList, doNotFetch]);
  const graphOptions = transformToOptions(graphsList);
  return { graphsList: graphsList || [], fetchGraphsList, isLoading, error, graphOptions };
};

export const useNodes = (graphId: string) => {
  const nodesList = useAppSelector((state: RootState) => state.nodesList.allNodes);
  const { fetchNodes, isLoading, error } = useGetNodesList();

  const fetchNodesList = async () => {
    await fetchNodes(graphId, true);
  };
  useEffect(() => {
    if (nodesList === null && graphId) {
      fetchNodesList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodesList, graphId]);

  const nodeOptions = transformToOptions(nodesList);

  return { nodesList: nodesList || [], fetchNodesList, isLoading, error, nodeOptions };
};

export const useEdges = (graphId: string) => {
  const edgesList = useAppSelector((state: RootState) => state.edgesList.allEdges);
  const { fetchEdges, isLoading, error } = useGetEdgesList();

  const fetchEdgesList = async () => {
    await fetchEdges(graphId, true);
  };

  useEffect(() => {
    if (edgesList === null && graphId) {
      fetchEdgesList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [edgesList, graphId]);

  const edgeOptions = transformToOptions(edgesList);

  return { edgesList: edgesList || [], fetchEdgesList, isLoading, error, edgeOptions };
};

export const useNodeAndEdge = (graphId: string) => {
  const {
    nodesList,
    fetchNodesList,
    isLoading: isNodesLoading,
    error: nodesError,
    nodeOptions,
  } = useNodes(graphId);
  const {
    edgesList,
    fetchEdgesList,
    isLoading: isEdgesLoading,
    error: edgesError,
    edgeOptions,
  } = useEdges(graphId);

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

export const useTags = (graphId: string) => {
  const dispatch = useAppDispatch();
  const tagsList = useAppSelector((state: RootState) => state.tagsList.allTags);
  const { fetchTags, isLoading, error } = useGetTagsList();

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

export const useVectors = (graphId: string) => {
  const vectorsList = useAppSelector((state: RootState) => state.vectorsList.allVectors);
  const { fetchVectors, isLoading, error } = useGetVectorsList();

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

export const useLabels = (graphId: string) => {
  const labelsList = useAppSelector((state: RootState) => state.labelsList.allLabels);
  const { fetchLabels, isLoading, error } = useGetLabelsList();

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

export const useCredentials = () => {
  const credentialsList = useAppSelector(
    (state: RootState) => state.credentialsList.allCredentials
  );
  const tenant = useAppSelector((state: RootState) => state.liteGraph.tenant);
  const { fetchCredentials, isLoading, error } = useGetCredentialsList();

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

export const useUsers = () => {
  const usersList = useAppSelector((state: RootState) => state.usersList.allUsers);
  const tenant = useAppSelector((state: RootState) => state.liteGraph.tenant);
  const { fetchUsers, isLoading, error } = useGetUsersList();

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

export const useTenants = () => {
  const tenantsList = useAppSelector((state: RootState) => state.tenantsList.tenantsList);
  const tenant = useAppSelector((state: RootState) => state.liteGraph.tenant);
  const { fetchTenants, isLoading, error } = useGetTenantsList();

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
