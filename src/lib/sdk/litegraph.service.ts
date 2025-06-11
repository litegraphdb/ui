import { LiteGraphSdk } from 'litegraphdb';
import { useState } from 'react';
import { useAppDispatch } from '../store/hooks';
import { graphLists } from '../store/graph/actions';
import { edgeLists } from '../store/edge/actions';
import { nodeLists, updateNodeGroupWithGraph } from '../store/node/actions';
import { tagLists, updateTagGroupWithGraph } from '../store/tag/actions';
import { labelLists, updateLabelGroupWithGraph } from '../store/label/actions';
import { vectorLists, updateVectorGroupWithGraph } from '../store/vector/actions';
import toast from 'react-hot-toast';
import { globalToastId, liteGraphInstanceURL } from '@/constants/config';
import { storeTenants } from '../store/tenants/actions';
import { TagType } from '../store/tag/types';
import { VectorType } from '../store/vector/types';
import { LabelType } from '../store/label/types';
import { credentialLists } from '../store/credential/actions';
import { userLists } from '../store/user/actions';
import { tenantLists } from '../store/tenants/actions';
import { storeUser } from '../store/litegraph/actions';
import { BackupMetaDataCreateRequest, LabelMetadata, Node } from 'litegraphdb/dist/types/types';
import { EnumerationOrderEnum } from 'litegraphdb/dist/types/enums/EnumerationOrderEnum';
import { backupLists } from '@/lib/store/backup/actions';
// Initialize the SDK once and reuse the instance

let sdk = new LiteGraphSdk(liteGraphInstanceURL);

export const setEndpoint = (endpoint: string) => {
  console.log('endpoint: ', endpoint);
  sdk.config.endpoint = endpoint;
};
export const setAccessToken = (accessToken: string) => {
  sdk.config.accessToken = accessToken;
};
export const setAccessKey = (accessKey: string) => {
  sdk.config.accessKey = accessKey;
};

export const setTenant = (tenantId: string) => {
  sdk.config.tenantGuid = tenantId;
};
// region Graph

// Fetch all graphs list
export const useGetGraphs = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const dispatch = useAppDispatch();

  const fetchGraphs = async (storeInRedux?: boolean) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await sdk.Graph.readAll();
      if (data && storeInRedux) {
        dispatch(graphLists(data as any));
      }
      setIsLoading(false);
      return data;
    } catch (err: any) {
      toast.error(err?.message ? err.message : 'Unable to fetch graphs.', { id: globalToastId });
      setIsLoading(false);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    }
  };
  return { fetchGraphs, isLoading, error };
};

// Fetch graph by id
export const useGetGraphById = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchGraphById = async (graphId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await sdk.Graph.read(graphId);
      setIsLoading(false);
      return data;
    } catch (err) {
      toast.error('Unable to fetch graph.', { id: globalToastId });
      setIsLoading(false);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    }
  };
  return { fetchGraphById, isLoading, error };
};

// Create graph
export const useCreateGraph = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const createGraphs = async (graph: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await sdk.Graph.create(graph);
      setIsLoading(false);
      return data;
    } catch (err) {
      toast.error('Unable to create graph.', { id: globalToastId });
      setIsLoading(false);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    }
  };
  return { createGraphs, isLoading, error };
};

// Update graph by id
export const useUpdateGraphById = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const updateGraphById = async (graph: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await sdk.Graph.update(graph);
      setIsLoading(false);
      return data;
    } catch (err) {
      toast.error('Unable to update graph.', { id: globalToastId });
      setIsLoading(false);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    }
  };
  return { updateGraphById, isLoading, error };
};

// Delete graph by id
export const useDeleteGraphById = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteGraphById = async (graphId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await sdk.Graph.delete(graphId, true);
      setIsLoading(false);
      return true;
    } catch (err) {
      toast.error('Unable to delete graph.', { id: globalToastId });
      setIsLoading(false);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    }
  };
  return { deleteGraphById, isLoading, error };
};

// Fetch gexfContent by graph id
export const useGetGexfByGraphId = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchGexfByGraphId = async (graphId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await sdk.Graph.exportGexf(graphId);
      setIsLoading(false);
      return data;
    } catch (err) {
      toast.error('Unable to fetch graph content.', { id: globalToastId });
      setIsLoading(false);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    }
  };
  return { fetchGexfByGraphId, isLoading, error };
};

// region Node

// Fetch all nodes list
export const useGetNodesList = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const dispatch = useAppDispatch();

  const fetchNodes = async (graphId: string, storeInRedux?: boolean) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await sdk.Node.readAll(graphId);
      setIsLoading(false);
      if (data && storeInRedux) {
        dispatch(nodeLists(data as any));
      }
      return data;
    } catch (err) {
      toast.error('Unable to fetch nodes', { id: globalToastId });
      setIsLoading(false);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    }
  };
  return { fetchNodes, isLoading, error };
};

// Create node
export const useCreateNode = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const createNodes = async (node: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await sdk.Node.create(node);
      setIsLoading(false);
      return data;
    } catch (err) {
      toast.error('Unable to create node.', { id: globalToastId });
      setIsLoading(false);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    }
  };
  return { createNodes, isLoading, error };
};

// Update node by id
export const useUpdateNodeById = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const updateNodeById = async (node: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await sdk.Node.update(node);
      setIsLoading(false);
      return data;
    } catch (err) {
      toast.error('Unable to update node.', { id: globalToastId });
      setIsLoading(false);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    }
  };
  return { updateNodeById, isLoading, error };
};

// Delete node by id
export const useDeleteNodeById = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteNodeById = async (graphGuid: string, nodeGuid: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await sdk.Node.delete(graphGuid, nodeGuid);
      setIsLoading(false);
      return true;
    } catch (err) {
      toast.error('Unable to delete node.', { id: globalToastId });
      setIsLoading(false);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    }
  };
  return { deleteNodeById, isLoading, error };
};

// Fetch node by graphId and nodeId
export const useGetNodeById = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const dispatch = useAppDispatch();

  const fetchNodeById = async (graphId: string, nodeId: string, storeInRedux?: boolean) => {
    setIsLoading(true);
    setError(null);
    try {
      const data: Node = await sdk.Node.read(graphId, nodeId);
      setIsLoading(false);
      if (data && storeInRedux) {
        dispatch(updateNodeGroupWithGraph({ nodeId: data.GUID, nodeData: data as any })); // Update Redux store
      }
      return data;
    } catch (err) {
      toast.error('Unable to fetch node.', { id: globalToastId });
      setIsLoading(false);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    }
  };
  return { fetchNodeById, isLoading, error };
};

// region Edge

// Fetch all edge list
export const useGetEdgesList = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const dispatch = useAppDispatch();
  const fetchEdges = async (graphId: string, storeInRedux?: boolean) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await sdk.Edge.readAll(graphId);
      if (data && storeInRedux) {
        dispatch(edgeLists(data as any));
      }
      setIsLoading(false);
      return data;
    } catch (err) {
      toast.error('Unable to fetch edges', { id: globalToastId });
      setIsLoading(false);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    }
  };
  return { fetchEdges, isLoading, error };
};

// Create edge
export const useCreateEdge = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const createEdges = async (edge: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await sdk.Edge.create(edge);
      setIsLoading(false);
      return data;
    } catch (err) {
      toast.error('Unable to create edge.', { id: globalToastId });
      setIsLoading(false);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    }
  };
  return { createEdges, isLoading, error };
};

// Update edge by id
export const useUpdateEdgeById = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const updateEdgeById = async (node: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await sdk.Edge.update(node);
      setIsLoading(false);
      return data;
    } catch (err) {
      toast.error('Unable to update edge.', { id: globalToastId });
      setIsLoading(false);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    }
  };
  return { updateEdgeById, isLoading, error };
};

// Delete edge by id
export const useDeleteEdgeById = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteEdgeById = async (graphGuid: string, edgeGuid: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await sdk.Edge.delete(graphGuid, edgeGuid);
      setIsLoading(false);
      return true;
    } catch (err) {
      toast.error('Unable to delete edge.', { id: globalToastId });
      setIsLoading(false);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    }
  };
  return { deleteEdgeById, isLoading, error };
};

// Fetch node by graphId and edgeId
export const useGetEdgeById = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchEdgeById = async (graphId: string, edgeId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await sdk.Edge.read(graphId, edgeId);
      setIsLoading(false);
      return data;
    } catch (err) {
      toast.error('Unable to fetch edge.', { id: globalToastId });
      setIsLoading(false);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    }
  };
  return { fetchEdgeById, isLoading, error };
};

//region Tags
// Fetch all tags list
export const useGetTagsList = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const dispatch = useAppDispatch();
  const fetchTags = async (graphId: string, storeInRedux?: boolean) => {
    setIsLoading(true);
    setError(null);
    try {
      const allTags = await sdk.Tag.readAll(); // Fetch all tags
      const filteredTags = allTags.filter((tag: TagType) => tag.GraphGUID === graphId); // Filter tags by graph ID
      if (filteredTags && storeInRedux) {
        dispatch(tagLists(filteredTags));
      }
      setIsLoading(false);
      return filteredTags;
    } catch (err: any) {
      if (err?.message) {
        toast.error(err?.message, { id: globalToastId });
      } else {
        toast.error('Unable to fetch tags', { id: globalToastId });
      }
      setIsLoading(false);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    }
  };
  return { fetchTags, isLoading, error };
};

// Create tag
export const useCreateTag = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const createTags = async (tag: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await sdk.Tag.create(tag);
      setIsLoading(false);
      return data;
    } catch (err: any) {
      if (err?.message) {
        toast.error(err?.message, { id: globalToastId });
      } else {
        toast.error('Unable to create tag.', { id: globalToastId });
      }
      setIsLoading(false);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    }
  };
  return { createTags, isLoading, error };
};

// Update tag by id
export const useUpdateTagById = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const updateTagById = async (tag: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await sdk.Tag.update(tag, tag.GUID);
      setIsLoading(false);
      return data;
    } catch (err) {
      console.error('Error updating tag:', JSON.stringify(err));
      toast.error('Unable to update tag.', { id: globalToastId });
      setIsLoading(false);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    }
  };
  return { updateTagById, isLoading, error };
};

// Delete tag by id
export const useDeleteTagById = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteTagById = async (tagGuid: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await sdk.Tag.delete(tagGuid);
      setIsLoading(false);
      return true;
    } catch (err) {
      toast.error('Unable to delete tag.', { id: globalToastId });
      setIsLoading(false);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    }
  };
  return { deleteTagById, isLoading, error };
};

// Fetch tag by ID
export const useGetTagById = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const dispatch = useAppDispatch();

  const fetchTagById = async (tagGuid: string, storeInRedux?: boolean) => {
    setIsLoading(true);
    setError(null);
    try {
      const data: TagType = await sdk.Tag.read(tagGuid);
      setIsLoading(false);
      if (data && storeInRedux) {
        dispatch(updateTagGroupWithGraph({ tagId: data.GUID, tagData: data }));
      }
      return data;
    } catch (err) {
      toast.error('Unable to fetch tag.', { id: globalToastId });
      setIsLoading(false);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    }
  };
  return { fetchTagById, isLoading, error };
};

//region Labels
// Fetch all labels list
export const useGetLabelsList = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const dispatch = useAppDispatch();
  const fetchLabels = async (graphId: string, storeInRedux?: boolean) => {
    setIsLoading(true);
    setError(null);
    try {
      const allLabels = await sdk.Label.readAll(); // Fetch all labels
      const filteredLabels = allLabels.filter((label: LabelType) => label.GraphGUID === graphId); // Filter labels by graph ID
      if (filteredLabels && storeInRedux) {
        dispatch(labelLists(filteredLabels));
      }
      setIsLoading(false);
      return filteredLabels;
    } catch (err) {
      console.error('Error fetching labels:', err); // Log the error
      toast.error('Unable to fetch labels', { id: globalToastId });
      setIsLoading(false);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    }
  };
  return { fetchLabels, isLoading, error };
};

// Create labels
export const useCreateLabel = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const createLabels = async (label: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await sdk.Label.create(label);
      setIsLoading(false);
      return data;
    } catch (err) {
      toast.error('Unable to create label.', { id: globalToastId });
      setIsLoading(false);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    }
  };
  return { createLabels, isLoading, error };
};

// Update label by id
export const useUpdateLabelById = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const updateLabelById = async (label: LabelMetadata) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await sdk.Label.update(label);
      setIsLoading(false);
      return data;
    } catch (err) {
      console.error('Error updating label:', JSON.stringify(err));
      toast.error('Unable to update label.', { id: globalToastId });
      setIsLoading(false);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    }
  };
  return { updateLabelById, isLoading, error };
};

// Delete label by id
export const useDeleteLabelById = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteLabelById = async (labelGuid: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await sdk.Label.delete(labelGuid);
      setIsLoading(false);
      return true;
    } catch (err) {
      toast.error('Unable to delete label.', { id: globalToastId });
      setIsLoading(false);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    }
  };
  return { deleteLabelById, isLoading, error };
};

// Fetch label by ID
export const useGetLabelById = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const dispatch = useAppDispatch();

  const fetchLabelById = async (labelGuid: string, storeInRedux?: boolean) => {
    setIsLoading(true);
    setError(null);
    try {
      const data: LabelType = await sdk.Label.read(labelGuid);
      setIsLoading(false);
      if (data && storeInRedux) {
        dispatch(updateLabelGroupWithGraph({ labelId: data.GUID, labelData: data }));
      }
      return data;
    } catch (err) {
      toast.error('Unable to fetch label.', { id: globalToastId });
      setIsLoading(false);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    }
  };
  return { fetchLabelById, isLoading, error };
};

//region Vectors

// Fetch all vectors list
export const useGetVectorsList = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const dispatch = useAppDispatch();
  const fetchVectors = async (graphId: string, storeInRedux?: boolean) => {
    setIsLoading(true);
    setError(null);
    try {
      const allVectors = await sdk.Vector.readAll(); // Fetch all vectors
      const filteredVectors = allVectors.filter(
        (vector: VectorType) => vector.GraphGUID === graphId
      ); // Filter vectors by graph ID
      if (filteredVectors && storeInRedux) {
        dispatch(vectorLists(filteredVectors));
      }
      setIsLoading(false);
      return filteredVectors;
    } catch (err) {
      toast.error('Unable to fetch vectors', { id: globalToastId });
      setIsLoading(false);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    }
  };
  return { fetchVectors, isLoading, error };
};

// Create vector
export const useCreateVector = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const createVectors = async (vector: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await sdk.Vector.create(vector);
      setIsLoading(false);
      return data;
    } catch (err) {
      toast.error('Unable to create vector.', { id: globalToastId });
      setIsLoading(false);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    }
  };
  return { createVectors, isLoading, error };
};

// Update vector by id
export const useUpdateVectorById = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const updateVectorById = async (vector: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await sdk.Vector.update(vector, vector.GUID);
      setIsLoading(false);
      return result;
    } catch (err) {
      console.error('Error updating vector:', JSON.stringify(err));
      toast.error('Unable to update vector.', { id: globalToastId });
      setIsLoading(false);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    }
  };
  return { updateVectorById, isLoading, error };
};

// Delete vector by id
export const useDeleteVectorById = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteVectorById = async (vectorGuid: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await sdk.Vector.delete(vectorGuid);
      setIsLoading(false);
      return true;
    } catch (err) {
      toast.error('Unable to delete vector.', { id: globalToastId });
      setIsLoading(false);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    }
  };
  return { deleteVectorById, isLoading, error };
};

// Fetch vector by ID
export const useGetVectorById = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const dispatch = useAppDispatch();

  const fetchVectorById = async (vectorGuid: string, storeInRedux?: boolean) => {
    setIsLoading(true);
    setError(null);
    try {
      const data: VectorType = await sdk.Vector.read(vectorGuid);
      setIsLoading(false);
      if (data && storeInRedux) {
        dispatch(updateVectorGroupWithGraph({ vectorId: data.GUID, vectorData: data }));
      }
      return data;
    } catch (err) {
      toast.error('Unable to fetch vector.', { id: globalToastId });
      setIsLoading(false);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    }
  };
  return { fetchVectorById, isLoading, error };
};

//region Credentials
// Fetch all credentials list
export const useGetCredentialsList = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const dispatch = useAppDispatch();

  const fetchCredentials = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await sdk.Credential.readAll();
      setIsLoading(false);
      if (data) {
        dispatch(credentialLists(data));
      }
      return data;
    } catch (err) {
      toast.error('Unable to fetch credentials.', { id: globalToastId });
      setIsLoading(false);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    }
  };

  return { fetchCredentials, isLoading, error };
};

// Create credentials
export const useCreateCredentials = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const createCredentials = async (credential: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await sdk.Credential.create(credential);
      setIsLoading(false);
      return data;
    } catch (err) {
      toast.error('Unable to create credential.', { id: globalToastId });
      setIsLoading(false);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    }
  };
  return { createCredentials, isLoading, error };
};

export const useGenerateToken = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const generateToken = async (email: string, password: string, tenantId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await sdk.Authentication.generateToken(email, password, tenantId);
      setIsLoading(false);
      return data;
    } catch (err: any) {
      toast.error(err?.message ? err.message : 'Unable to generate token.', { id: globalToastId });
      setIsLoading(false);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    }
  };
  return { generateToken, isLoading, error };
};

export const useGetTenants = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const dispatch = useAppDispatch();

  const getTenants = async (toastMessage?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await sdk.Tenant.readAll();
      setIsLoading(false);
      dispatch(storeTenants(data));
      return data;
    } catch (err) {
      toast.error(toastMessage || 'Unable to fetch tenants.', { id: globalToastId });
      setIsLoading(false);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    }
  };
  return { getTenants, isLoading, error };
};

export const useGetTenantsForEmail = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const dispatch = useAppDispatch();

  const getTenantsForEmail = async (email: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await sdk.Authentication.getTenantsForEmail(email);
      console.log('data: ', data);
      setIsLoading(false);
      dispatch(storeTenants(data));
      return data;
    } catch (err) {
      toast.error('Unable to fetch tenants for email.', { id: globalToastId });
      setIsLoading(false);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    }
  };
  return { getTenantsForEmail, isLoading, error };
};

export const useValidateConnectivity = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const validateConnectivity = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await sdk.validateConnectivity();
      setIsLoading(false);
      return data;
    } catch (err) {
      toast.error('Unable to validate connectivity.', { id: globalToastId });
      setIsLoading(false);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    }
  };
  return { validateConnectivity, isLoading, error };
};

// Update credentials by id
export const useUpdateCredentialsById = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const updateCredentialById = async (credential: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await sdk.Credential.update(credential, credential.GUID);
      setIsLoading(false);
      return data;
    } catch (err) {
      toast.error('Unable to update credential.', { id: globalToastId });
      setIsLoading(false);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    }
  };

  return { updateCredentialById, isLoading, error };
};

// Delete credentials by id
export const useDeleteCredentialsById = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteCredentialById = async (credentialGuid: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await sdk.Credential.delete(credentialGuid);
      setIsLoading(false);
      return true;
    } catch (err) {
      toast.error('Unable to delete credential.', { id: globalToastId });
      setIsLoading(false);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    }
  };

  return { deleteCredentialById, isLoading, error };
};

// Fetch credentials by id
export const useGetCredentialsById = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchCredentialById = async (credentialGuid: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await sdk.Credential.read(credentialGuid);
      setIsLoading(false);
      return data;
    } catch (err) {
      toast.error('Unable to fetch credential.', { id: globalToastId });
      setIsLoading(false);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    }
  };

  return { fetchCredentialById, isLoading, error };
};

// Fetch user
export const useGetUser = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const dispatch = useAppDispatch();

  const fetchUser = async (userId: string, storeInRedux?: boolean) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await sdk.User.read(userId);
      setIsLoading(false);
      if (data && storeInRedux) {
        dispatch(storeUser(data));
      }
      return data;
    } catch (err) {
      toast.error('Unable to fetch user.', { id: globalToastId });
      setIsLoading(false);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    }
  };

  return { fetchUser, isLoading, error };
};

export const useGetTokenDetails = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const dispatch = useAppDispatch();

  const fetchTokenDetails = async (token: string, storeInRedux?: boolean) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await sdk.Authentication.getTokenDetails(token);
      setIsLoading(false);
      if (data && storeInRedux) {
        if (data.User) {
          dispatch(storeUser(data.User));
        }
      }
      return data;
    } catch (err) {
      toast.error('Unable to fetch user.', { id: globalToastId });
      setIsLoading(false);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    }
  };

  return { fetchTokenDetails, isLoading, error };
};

//region Users

export const useGetUsersList = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const dispatch = useAppDispatch();

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await sdk.User.readAll();
      setIsLoading(false);
      if (data) {
        dispatch(userLists(data));
      }
      return data;
    } catch (err) {
      toast.error('Unable to fetch users.', { id: globalToastId });
      setIsLoading(false);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    }
  };

  return { fetchUsers, isLoading, error };
};

// Create users
export const useCreateUsers = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const createUsers = async (user: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await sdk.User.create(user);
      setIsLoading(false);
      return data;
    } catch (err) {
      toast.error('Unable to create user.', { id: globalToastId });
      setIsLoading(false);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    }
  };
  return { createUsers, isLoading, error };
};

// Update users by id
export const useUpdateUsersById = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const updateUserById = async (user: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await sdk.User.update(user);
      setIsLoading(false);
      return data;
    } catch (err) {
      toast.error('Unable to update user.', { id: globalToastId });
      setIsLoading(false);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    }
  };

  return { updateUserById, isLoading, error };
};

// Delete users by id
export const useDeleteUsersById = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteUserById = async (userGuid: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await sdk.User.delete(userGuid);
      setIsLoading(false);
      return true;
    } catch (err) {
      toast.error('Unable to delete user.', { id: globalToastId });
      setIsLoading(false);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    }
  };

  return { deleteUserById, isLoading, error };
};

// Fetch users by id
export const useGetUsersById = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchUserById = async (userGuid: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await sdk.User.read(userGuid);
      setIsLoading(false);
      return data;
    } catch (err) {
      toast.error('Unable to fetch user.', { id: globalToastId });
      setIsLoading(false);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    }
  };

  return { fetchUserById, isLoading, error };
};

//region Tenants

export const useGetTenantsList = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const dispatch = useAppDispatch();

  const fetchTenants = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await sdk.Tenant.readAll();
      setIsLoading(false);
      if (data) {
        dispatch(tenantLists(data));
      }
      return data;
    } catch (err) {
      toast.error('Unable to fetch tenants.', { id: globalToastId });
      setIsLoading(false);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    }
  };

  return { fetchTenants, isLoading, error };
};

// Create tenants
export const useCreateTenants = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const createTenants = async (tenant: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await sdk.Tenant.create(tenant);
      setIsLoading(false);
      return data;
    } catch (err) {
      toast.error('Unable to create tenant.', { id: globalToastId });
      setIsLoading(false);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    }
  };
  return { createTenants, isLoading, error };
};

// Update tenants by id
export const useUpdateTenantsById = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const updateTenantById = async (tenant: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await sdk.Tenant.update(tenant);
      setIsLoading(false);
      return data;
    } catch (err) {
      toast.error('Unable to update tenant.', { id: globalToastId });
      setIsLoading(false);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    }
  };

  return { updateTenantById, isLoading, error };
};

// Delete tenants by id
export const useDeleteTenantsById = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteTenantById = async (tenantGuid: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await sdk.Tenant.delete(tenantGuid);
      setIsLoading(false);
      return true;
    } catch (err) {
      toast.error('Unable to delete tenant.', { id: globalToastId });
      setIsLoading(false);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    }
  };

  return { deleteTenantById, isLoading, error };
};

// Fetch tenants by id
export const useGetTenantsById = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchTenantById = async (tenantGuid: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await sdk.Tenant.read(tenantGuid);
      setIsLoading(false);
      return data;
    } catch (err) {
      toast.error('Unable to fetch tenant.', { id: globalToastId });
      setIsLoading(false);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    }
  };

  return { fetchTenantById, isLoading, error };
};

// Search data by vector
export const useSearchDataByVector = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const searchByVector = async (query: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await sdk.Vector.search(query);
      setIsLoading(false);
      return data;
    } catch (err) {
      toast.error('Unable to search by vector.', { id: globalToastId });
      setIsLoading(false);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    }
  };

  return { searchByVector, isLoading, error };
};

// Search TLD graphs
export const useSearchGraphsByTLD = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const searchGraphsByTLD = async (query: {
    GraphGUID?: string;
    Labels: string[];
    Tags: any;
    Ordering: EnumerationOrderEnum;
    Expr: any;
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await sdk.Graph.search(query);
      setIsLoading(false);
      return data;
    } catch (err) {
      console.log(err, 'err');
      toast.error('Unable to search graphs.', { id: globalToastId });
      setIsLoading(false);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    }
  };

  return { searchGraphsByTLD, isLoading, error };
};

// Search TLD nodes
export const useSearchNodesByTLD = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const searchNodesByTLD = async (query: {
    GraphGUID: string;
    Labels: string[];
    Tags: any;
    Ordering: EnumerationOrderEnum;
    Expr: any;
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await sdk.Node.search(query);
      setIsLoading(false);
      return data;
    } catch (err) {
      console.log(err, 'err');
      toast.error('Unable to search nodes.', { id: globalToastId });
      setIsLoading(false);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    }
  };

  return { searchNodesByTLD, isLoading, error };
};

// Search TLD edges
export const useSearchEdgesByTLD = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const searchEdgesByTLD = async (query: {
    GraphGUID: string;
    Labels: string[];
    Tags: any;
    Ordering: EnumerationOrderEnum;
    Expr: any;
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await sdk.Edge.search(query);
      setIsLoading(false);
      return data;
    } catch (err) {
      console.log(err, 'err');
      toast.error('Unable to search edges.', { id: globalToastId });
      setIsLoading(false);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    }
  };

  return { searchEdgesByTLD, isLoading, error };
};

//region Backups

export const useGetBackupsList = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const dispatch = useAppDispatch();

  const fetchBackups = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await sdk.Backup.readAll();
      if (data) {
        dispatch(backupLists(data));
      }
      setIsLoading(false);
      return data;
    } catch (err) {
      toast.error('Unable to fetch backups.', { id: globalToastId });
      setIsLoading(false);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    }
  };

  return { fetchBackups, isLoading, error };
};

export const useGetBackupByFilename = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchBackupByFilename = async (backupFilename: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await sdk.Backup.read(backupFilename);
      setIsLoading(false);
      return data;
    } catch (err) {
      toast.error('Unable to fetch backup.', { id: globalToastId });
      setIsLoading(false);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    }
  };

  return { fetchBackupByFilename, isLoading, error };
};

export const useCreateBackup = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const createBackup = async (backup: BackupMetaDataCreateRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      await sdk.Backup.create(backup);
      setIsLoading(false);
      return true;
    } catch (err) {
      toast.error('Unable to create backup.', { id: globalToastId });
      setIsLoading(false);
      setError(err instanceof Error ? err : new Error(String(err)));
      return false;
    }
  };

  return { createBackup, isLoading, error };
};

export const useDeleteBackupByFilename = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteBackupByFilename = async (backupFilename: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await sdk.Backup.delete(backupFilename);
      setIsLoading(false);
      return true;
    } catch (err) {
      toast.error('Unable to delete backup.', { id: globalToastId });
      setIsLoading(false);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    }
  };

  return { deleteBackupByFilename, isLoading, error };
};

export const useFlushDBtoDisk = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const flushDBtoDisk = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await sdk.Admin.flush();
      setIsLoading(false);
      return true;
    } catch (err) {
      toast.error('Unable to flush database to disk.', { id: globalToastId });
      setIsLoading(false);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    }
  };

  return { flushDBtoDisk, isLoading, error };
};
