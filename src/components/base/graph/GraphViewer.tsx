'use client';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import Graph2DViewer from './graph-2d/Graph2DViewer';
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
import { useLazyLoadEdgesAndNodes } from '@/hooks/entityHooks';
import GraphLoader3d from './GraphLoader3d';
import LitegraphFlex from '../flex/Flex';
import { Switch } from 'antd';
import LitegraphFormItem from '../form/FormItem';
import ProgressBar from './ProgressBar';
import LitegraphTooltip from '../tooltip/Tooltip';
import ErrorBoundary from '@/hoc/ErrorBoundary';
import { nodeLightColorByType } from './constant';

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
  const [containerDivHeightAndWidth, setContainerDivHeightAndWidth] = useState<{
    height?: number;
    width?: number;
  }>({
    height: undefined,
    width: undefined,
  });
  const [show3d, setShow3d] = useState(false);
  const [topologicalSortNodes, setTopologicalSortNodes] = useState(false);
  const [showGraphHorizontal, setShowGraphHorizontal] = useState(false);
  const [showGraphLegend, setShowGraphLegend] = useState(true);
  const [showLabel, setShowLabel] = useState(false);
  const selectedGraphRedux = useAppSelector((state: RootState) => state.liteGraph.selectedGraph);
  const ref = useRef<HTMLDivElement>(null);
  const {
    nodes,
    edges,
    rawEdges,
    refetch,
    isError,
    nodesFirstResult,
    edgesFirstResult,
    isLoading,
    isNodesLoading,
    isEdgesLoading,
  } = useLazyLoadEdgesAndNodes(selectedGraphRedux, showGraphHorizontal, topologicalSortNodes);

  useEffect(() => {
    setShow3d(false);
  }, [selectedGraphRedux]);

  // Callback for handling node update
  const handleNodeUpdate = async () => {};

  useEffect(() => {
    const handleResize = () => {
      setContainerDivHeightAndWidth({
        height: ref.current?.clientHeight,
        width: ref.current?.clientWidth,
      });
    };

    window.addEventListener('resize', handleResize);

    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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
            loaded={rawEdges.length}
            total={edgesFirstResult?.TotalRecords || 0}
            label="Loading edges..."
          />
        ) : (
          <LitegraphFlex gap={10} align="center">
            {!show3d && (
              <>
                <LitegraphFormItem className="mb-0" label={'Horizontal view'}>
                  <Switch
                    size="small"
                    checked={showGraphHorizontal}
                    onChange={(checked) => setShowGraphHorizontal(checked)}
                  />
                </LitegraphFormItem>
                <LitegraphFormItem className="mb-0" label={'Sort nodes topologically'}>
                  <Switch
                    size="small"
                    checked={topologicalSortNodes}
                    onChange={(checked) => setTopologicalSortNodes(checked)}
                  />
                </LitegraphFormItem>
              </>
            )}
            <LitegraphFormItem className="mb-0" label={'Show graph legend'}>
              <Switch
                size="small"
                checked={showGraphLegend}
                onChange={(checked) => setShowGraphLegend(checked)}
              />
            </LitegraphFormItem>
            <LitegraphFormItem className="mb-0" label={'Show node name'}>
              <Switch
                size="small"
                checked={showLabel}
                onChange={(checked) => setShowLabel(checked)}
              />
            </LitegraphFormItem>
          </LitegraphFlex>
        )}
        <LitegraphTooltip
          title={
            isNodesLoading || isEdgesLoading
              ? 'Please wait for the graph to load before enabling 3D view.'
              : ''
          }
        >
          <LitegraphFormItem className="mb-0 ml-auto" label={'3D'}>
            <Switch
              disabled={isNodesLoading || isEdgesLoading}
              checked={show3d}
              onChange={(checked) => {
                setShow3d(checked);
                setNodeTooltip({ visible: false, nodeId: '', x: 0, y: 0 });
                setEdgeTooltip({ visible: false, edgeId: '', x: 0, y: 0 });
              }}
              size="small"
              data-testid="3d-switch"
            />
          </LitegraphFormItem>
        </LitegraphTooltip>
      </LitegraphFlex>
      <ErrorBoundary>
        <div className={styles.graphContainer} ref={ref}>
          <>
            {isError ? (
              <FallBack className="mt-lg" type={FallBackEnums.ERROR} retry={refetch}>
                Error loading graph
              </FallBack>
            ) : isLoading && nodes.length === 0 ? (
              <PageLoading />
            ) : !nodes.length && !isLoading ? (
              <FallBack className="mt-lg" type={FallBackEnums.WARNING}>
                This graph has no nodes.
              </FallBack>
            ) : (
              <>
                {showGraphLegend && (
                  <LitegraphFlex className={styles.legendContainer} gap={15}>
                    {Object.keys(nodeLightColorByType).map((key) => (
                      <LitegraphFlex key={key} align="center" gap={5}>
                        <div
                          className={styles.legendColor}
                          style={{ backgroundColor: nodeLightColorByType[key] }}
                        />
                        <span>{key}</span>
                      </LitegraphFlex>
                    ))}
                  </LitegraphFlex>
                )}
                {show3d ? (
                  <GraphLoader3d
                    nodes={nodes}
                    edges={edges}
                    setTooltip={setNodeTooltip}
                    setEdgeTooltip={setEdgeTooltip}
                    ref={ref}
                    showLabels={showLabel}
                    containerDivHeightAndWidth={containerDivHeightAndWidth}
                  />
                ) : (
                  <Graph2DViewer
                    show3d={show3d}
                    selectedGraphRedux={selectedGraphRedux}
                    nodes={nodes}
                    edges={edges}
                    gexfContent={''}
                    showGraphHorizontal={showGraphHorizontal}
                    topologicalSortNodes={topologicalSortNodes}
                    setTooltip={setNodeTooltip}
                    setEdgeTooltip={setEdgeTooltip}
                    nodeTooltip={nodeTooltip}
                    edgeTooltip={edgeTooltip}
                    showLabel={showLabel}
                  />
                )}
              </>
            )}
            {nodeTooltip.visible && (
              <NodeToolTip
                tooltip={nodeTooltip}
                setTooltip={setNodeTooltip}
                graphId={selectedGraphRedux}
                data-testid="node-tooltip"
              />
            )}
            {edgeTooltip.visible && (
              <EdgeToolTip
                tooltip={edgeTooltip}
                setTooltip={setEdgeTooltip}
                graphId={selectedGraphRedux}
                data-testid="edge-tooltip"
              />
            )}
          </>
        </div>
      </ErrorBoundary>
    </div>
  );
};

export default GraphViewer;
