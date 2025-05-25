import { RootState } from '@/lib/store/store';
import { GraphData } from '@/lib/store/graph/types';
import { TenantType } from '@/lib/store/tenants/types';
import { CredentialType } from '@/lib/store/credential/types';
import { NodeType, NodeGroupWithGraph } from '@/lib/store/node/types';
import { EdgeType, EdgeGroupWithGraph } from '@/lib/store/edge/types';
import { LabelType, LabelGroupWithGraph } from '@/lib/store/label/types';
import { TagType, TagGroupWithGraph } from '@/lib/store/tag/types';
import { configureStore } from '@reduxjs/toolkit';

export const createMockStore = () => {
  const initialState = {
    graphsList: {
      graphs: [] as GraphData[],
    },
    tenants: {
      tenantsList: [] as TenantType[],
    },
    credentialsList: {
      allCredentials: [] as CredentialType[],
    },
    nodesList: {
      allNodes: [] as NodeType[],
      nodes: [] as NodeGroupWithGraph[],
    },
    edgesList: {
      allEdges: [] as EdgeType[],
      edges: [] as EdgeGroupWithGraph[],
    },
    labelsList: {
      allLabels: [] as LabelType[],
      labels: [] as LabelGroupWithGraph[],
    },
    tagsList: {
      allTags: [] as TagType[],
      tags: [] as TagGroupWithGraph[],
    },
    liteGraph: {
      selectedGraph: 'mock-graph-id',
      tenant: null,
      token: null,
      adminAccessKey: null,
      user: null,
    },
  } as RootState;

  return configureStore({
    reducer: (state = initialState) => state,
    preloadedState: initialState,
  });
};
