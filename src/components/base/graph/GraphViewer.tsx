'use client';
import { Dispatch, SetStateAction } from 'react';
import { SigmaContainer } from '@react-sigma/core';
import GraphLoader from './GraphLoader';
import { MultiDirectedGraph } from 'graphology';
import '@react-sigma/core/lib/react-sigma.min.css';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { GraphEdgeTooltip, GraphNodeTooltip } from './types';
import NodeToolTip from './NodeToolTip';
import { RootState } from '@/lib/store/store';
import PageLoading from '../loading/PageLoading';
import EdgeToolTip from './EdgeTooltip';
import AddEditNode from '@/page/nodes/components/AddEditNode';
import AddEditEdge from '@/page/edges/components/AddEditEdge';
import FallBack, { FallBackEnums } from '../fallback/FallBack';
import styles from './graph.module.scss';
import { useGetAllNodesQuery, useGetGraphGexfContentQuery } from '@/lib/store/slice/slice';

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

  const { data } = useGetAllNodesQuery({ graphId: selectedGraphRedux });
  const nodesList = data || [];
  const {
    data: gexfContent,
    refetch: fetchGexfByGraphId,
    isLoading: isGetGexfByGraphIdLoading,
  } = useGetGraphGexfContentQuery(selectedGraphRedux);

  // Callback for handling node update
  const handleNodeUpdate = async () => {
    //Graph re-renders
    if (selectedGraphRedux) {
      await fetchGexfByGraphId();
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
            {!gexfContent ? (
              <FallBack className="mt-lg" type={FallBackEnums.INFO}>
                Select a graph to visualize
              </FallBack>
            ) : !nodesList.length ? (
              <FallBack className="mt-lg" type={FallBackEnums.WARNING}>
                This graph has no nodes.
              </FallBack>
            ) : (
              <SigmaContainer
                key={selectedGraphRedux} // Force re-render when the context changes
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
                  gexfContent={gexfContent}
                  setTooltip={setNodeTooltip}
                  setEdgeTooltip={setEdgeTooltip}
                  nodeTooltip={nodeTooltip}
                  edgeTooltip={edgeTooltip}
                />
              </SigmaContainer>
            )}
            {nodeTooltip.visible && (
              <NodeToolTip
                tooltip={nodeTooltip}
                setTooltip={setNodeTooltip}
                graphId={selectedGraphRedux}
              />
            )}
            {edgeTooltip.visible && (
              <EdgeToolTip
                tooltip={edgeTooltip}
                setTooltip={setEdgeTooltip}
                graphId={selectedGraphRedux}
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
