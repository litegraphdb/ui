'use client';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { SigmaContainer } from '@react-sigma/core';
import GraphLoader from './GraphLoader';
import { MultiDirectedGraph } from 'graphology';
import '@react-sigma/core/lib/react-sigma.min.css';
import { useAppSelector } from '@/lib/store/hooks';
import { GraphEdgeTooltip, GraphNodeTooltip } from './types';
import NodeToolTip from './NodeToolTip';
import { RootState } from '@/lib/store/store';
import PageLoading from '../loading/PageLoading';
import EdgeToolTip from './EdgeTooltip';
import AddEditNode from '@/page/nodes/components/AddEditNode';
import AddEditEdge from '@/page/edges/components/AddEditEdge';
import FallBack, { FallBackEnums } from '../fallback/FallBack';
import styles from './graph.module.scss';
import {
  useEnumerateAndSearchNodeQuery,
  useGetGraphGexfContentQuery,
} from '@/lib/store/slice/slice';
import { parseEdge, parseGexf, parseNode } from '@/lib/graph/parser';
import { EdgeData } from '@/lib/graph/types';
import { useLazyLoadEdges, useLazyLoadEdgesAndNodes, useLazyLoadNodes } from '@/hooks/entityHooks';
import GraphLoader3d from './GraphLoader3d';
import LitegraphFlex from '../flex/Flex';
import LitegraphButton from '../button/Button';
import { Progress, Switch } from 'antd';
import LitegraphFormItem from '../form/FormItem';
import { getPercentage, humanizeNumber } from '@/utils/dataUtils';
import ProgressBar from './ProgressBar';
import LitegraphTooltip from '../tooltip/Tooltip';

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
  // Redux state for the list of graphs
  const [show3d, setShow3d] = useState(false);
  const selectedGraphRedux = useAppSelector((state: RootState) => state.liteGraph.selectedGraph);

  const {
    nodes,
    edges,
    refetch,
    nodesFirstResult,
    edgesFirstResult,
    isLoading,
    isNodesLoading,
    isEdgesLoading,
  } = useLazyLoadEdgesAndNodes(selectedGraphRedux);

  useEffect(() => {
    setShow3d(false);
  }, [selectedGraphRedux]);

  // Callback for handling node update
  const handleNodeUpdate = async () => {};
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
      <LitegraphFlex
        justify="space-between"
        align="center"
        style={{ marginTop: '-10px' }}
        className="mb-sm"
      >
        {isNodesLoading ? (
          <ProgressBar
            loaded={nodes.length}
            total={nodesFirstResult?.TotalRecords || 0}
            label="Loading nodes..."
          />
        ) : isEdgesLoading ? (
          <ProgressBar
            loaded={edges.length}
            total={edgesFirstResult?.TotalRecords || 0}
            label="Loading edges..."
          />
        ) : null}
        <LitegraphTooltip
          title={
            isNodesLoading || isEdgesLoading
              ? 'Please wait for the graph to load before enabling 3D view'
              : ''
          }
        >
          <LitegraphFormItem className="mb-0 ml-auto" label={'Explore in 3D'}>
            <Switch
              disabled={isNodesLoading || isEdgesLoading}
              checked={show3d}
              onChange={(checked) => setShow3d(checked)}
              size="small"
            />
          </LitegraphFormItem>
        </LitegraphTooltip>
      </LitegraphFlex>
      <div className={styles.graphContainer}>
        <>
          {isLoading && nodes.length === 0 ? (
            <PageLoading />
          ) : !nodes.length && !isLoading ? (
            <FallBack className="mt-lg" type={FallBackEnums.WARNING}>
              This graph has no nodes.
            </FallBack>
          ) : (
            <>
              {show3d ? (
                <GraphLoader3d
                  nodes={nodes}
                  edges={edges}
                  setTooltip={setNodeTooltip}
                  setEdgeTooltip={setEdgeTooltip}
                />
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
                    renderLabels: false,
                    edgeLabelSize: 12,
                    minCameraRatio: 0.1,
                    maxCameraRatio: 10,
                    nodeReducer: (node, data) => ({
                      ...data,
                      highlighted: data.highlighted,
                      size: data.highlighted ? 12 : 7,
                      color: data.highlighted ? '#ff9900' : data.color,
                    }),
                    edgeReducer: (edge, data) => ({
                      ...data,
                      size: data.size * (data.highlighted ? 1.2 : 0.7),
                      color: data.highlighted ? '#ff9900' : data.color,
                      label: data.highlighted ? data.label : undefined,
                    }),
                  }}
                  graph={MultiDirectedGraph}
                >
                  <GraphLoader
                    nodes={nodes}
                    edges={edges}
                    gexfContent={''}
                    setTooltip={setNodeTooltip}
                    setEdgeTooltip={setEdgeTooltip}
                    nodeTooltip={nodeTooltip}
                    edgeTooltip={edgeTooltip}
                  />
                </SigmaContainer>
              )}
            </>
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
            />
          )}
        </>
      </div>
    </div>
  );
};

export default GraphViewer;
