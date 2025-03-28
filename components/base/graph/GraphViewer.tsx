'use client';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { SigmaContainer } from '@react-sigma/core';
import GraphLoader from './GraphLoader';
import { MultiDirectedGraph } from 'graphology';
import '@react-sigma/core/lib/react-sigma.min.css';
import { useGetGexfByGraphId } from '@/lib/sdk/litegraph.service';
import { getGexfOgGraphByID } from '@/lib/store/graph/actions';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { GraphEdgeTooltip, GraphNodeTooltip } from './types';
import NodeToolTip from './NodeToolTip';
import { RootState } from '@/lib/store/store';
import PageLoading from '../loading/PageLoading';
import EdgeToolTip from './EdgeTooltip';
import AddEditNode from '@/page/nodes/components/AddEditNode';
import AddEditEdge from '@/page/edges/components/AddEditEdge';
import { useNodes } from '@/hooks/entityHooks';
import FallBack, { FallBackEnums } from '../fallback/FallBack';
import styles from './graph.module.scss';

const GraphViewer = ({
  isAddEditNodeVisible,
  setIsAddEditNodeVisible,
  nodeTooltip,
  edgeTooltip,
  setNodeTooltip,
  setEdgeTooltip,
  isAddEditEdgeVisible,
  setIsAddEditEdgeVisible,
}: {
  isAddEditNodeVisible: boolean;
  setIsAddEditNodeVisible: Dispatch<SetStateAction<boolean>>;
  nodeTooltip: GraphNodeTooltip;
  edgeTooltip: GraphEdgeTooltip;
  setNodeTooltip: Dispatch<SetStateAction<GraphNodeTooltip>>;
  setEdgeTooltip: Dispatch<SetStateAction<GraphEdgeTooltip>>;
  isAddEditEdgeVisible: boolean;
  setIsAddEditEdgeVisible: Dispatch<SetStateAction<boolean>>;
}) => {
  const dispatch = useAppDispatch();
  // Redux state for the list of graphs
  const selectedGraphRedux = useAppSelector((state: RootState) => state.liteGraph.selectedGraph);

  // Manage local state for the selected graph and its context
  const [selectedGraphContext, setSelectedGraphContext] = useState<any>(null);

  const { fetchNodesList, nodesList } = useNodes(selectedGraphRedux);
  const { fetchGexfByGraphId, isLoading: isGetGexfByGraphIdLoading } = useGetGexfByGraphId();
  ``;
  const fetchGexfAndNodes = async (graphId: string) => {
    setSelectedGraphContext(null);
    const data = await fetchGexfByGraphId(graphId);
    if (data) {
      dispatch(getGexfOgGraphByID({ GUID: graphId, gexfContent: data }));
      setSelectedGraphContext(data); // Keep the selected graph context locally
      await fetchNodesList();
    }
  };

  // Reset the content based on selectedGraph redux value
  useEffect(() => {
    if (selectedGraphRedux) {
      fetchGexfAndNodes(selectedGraphRedux);
    }
  }, [selectedGraphRedux]);

  // Callback for handling node update
  const handleNodeUpdate = async () => {
    //Graph re-renders
    if (selectedGraphRedux) {
      const data: any = await fetchGexfByGraphId(selectedGraphRedux);
      if (data) {
        dispatch(getGexfOgGraphByID({ GUID: selectedGraphRedux, gexfContent: data }));
        setSelectedGraphContext(data); // Keep the selected graph context locally
      }
    }
  };

  return (
    <div className="space-y-2">
      {Boolean(selectedGraphRedux) && (
        <AddEditNode
          {...{
            isAddEditNodeVisible,
            setIsAddEditNodeVisible,
            selectedGraph: selectedGraphRedux,
            node: null,
            onNodeUpdated: handleNodeUpdate,
          }}
        />
      )}
      {Boolean(selectedGraphRedux) && (
        <AddEditEdge
          {...{
            isAddEditEdgeVisible,
            setIsAddEditEdgeVisible,
            selectedGraph: selectedGraphRedux,
            edge: null,
            onEdgeUpdated: handleNodeUpdate,
          }}
        />
      )}
      <div className={styles.graphContainer}>
        {isGetGexfByGraphIdLoading ? (
          <PageLoading />
        ) : (
          <>
            {!selectedGraphContext ? (
              <FallBack className="mt-lg" type={FallBackEnums.INFO}>
                Select a graph to visualize
              </FallBack>
            ) : !nodesList.length ? (
              <FallBack className="mt-lg" type={FallBackEnums.WARNING}>
                This graph has no nodes.
              </FallBack>
            ) : (
              <SigmaContainer
                key={selectedGraphContext?.GUID} // Force re-render when the context changes
                style={{ height: '100%' }}
                settings={{
                  enableEdgeHoverEvents: true, // Explicitly enable edge hover events
                  enableEdgeClickEvents: true, // Enable click events for edges
                  defaultNodeColor: '#999',
                  defaultEdgeColor: '#999',
                  labelSize: 14,
                  labelWeight: 'bold',
                  renderEdgeLabels: true,
                  edgeLabelSize: 12,
                  minCameraRatio: 0.1,
                  maxCameraRatio: 10,
                  nodeReducer: (node, data) => ({
                    ...data,
                    highlighted: data.highlighted,
                    size: data.highlighted ? 20 : 15,
                    color: data.highlighted ? '#ff9900' : data.color,
                  }),
                  edgeReducer: (edge, data) => ({
                    ...data,
                    size: data.size * (data.highlighted ? 2 : 1),
                    color: data.highlighted ? '#ff9900' : data.color,
                    label: data.highlighted ? data.label : undefined,
                  }),
                }}
                graph={MultiDirectedGraph}
              >
                <GraphLoader
                  gexfContent={selectedGraphContext}
                  setTooltip={setNodeTooltip}
                  setEdgeTooltip={setEdgeTooltip}
                />
              </SigmaContainer>
            )}
            {nodeTooltip.visible && (
              <NodeToolTip
                tooltip={nodeTooltip}
                setTooltip={setNodeTooltip}
                graphId={selectedGraphRedux}
                setSelectedGraphContext={setSelectedGraphContext}
              />
            )}
            {edgeTooltip.visible && (
              <EdgeToolTip
                tooltip={edgeTooltip}
                setTooltip={setEdgeTooltip}
                graphId={selectedGraphRedux}
                setSelectedGraphContext={setSelectedGraphContext}
                nodesList={nodesList || []}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GraphViewer;
