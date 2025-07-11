'use client';
import LiteGraphCard from '@/components/base/card/Card';
import LiteGraphSpace from '@/components/base/space/Space';
import React, { Dispatch, SetStateAction, useState } from 'react';
import { GraphNodeTooltip } from './types';
import { CloseCircleFilled, CopyOutlined, ExpandOutlined } from '@ant-design/icons';
import { defaultNodeTooltip } from './constant';
import LitegraphText from '@/components/base/typograpghy/Text';
import LitegraphFlex from '@/components/base/flex/Flex';
import { JsonEditor } from 'jsoneditor-react';
import FallBack from '@/components/base/fallback/FallBack';
import PageLoading from '@/components/base/loading/PageLoading';
import LitegraphButton from '@/components/base/button/Button';
import AddEditNode from '@/page/nodes/components/AddEditNode';
import { NodeType } from '@/types/types';
import DeleteNode from '@/page/nodes/components/DeleteNode';
import LitegraphTooltip from '@/components/base/tooltip/Tooltip';
import AddEditEdge from '@/page/edges/components/AddEditEdge';
import { pluralize } from '@/utils/stringUtils';
import classNames from 'classnames';
import styles from './tooltip.module.scss';
import { copyJsonToClipboard } from '@/utils/jsonCopyUtils';
import { useGetGraphGexfContentQuery, useGetNodeByIdQuery } from '@/lib/store/slice/slice';
import { decodeToJSON } from '@/utils/appUtils';

type NodeTooltipProps = {
  tooltip: GraphNodeTooltip;
  setTooltip: Dispatch<SetStateAction<GraphNodeTooltip>>;
  graphId: string;
};
const NodeToolTip = ({ tooltip, setTooltip, graphId }: NodeTooltipProps) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const {
    data: node,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetNodeByIdQuery({
    graphId,
    nodeId: tooltip.nodeId,
    request: { includeSubordinates: true },
  });
  // const { refetch: fetchGexfByGraphId } = useGetGraphGexfContentQuery(graphId);

  // State for AddEditDeleteNode visibility and selected node
  const [isAddEditNodeVisible, setIsAddEditNodeVisible] = useState<boolean>(false);
  const [isDeleteModelVisible, setIsDeleteModelVisible] = useState<boolean>(false);
  const [isAddEditEdgeVisible, setIsAddEditEdgeVisible] = useState<boolean>(false);
  const [selectedNode, setSelectedNode] = useState<NodeType | null | undefined>(undefined);

  // Callback for handling node update
  const handleNodeUpdate = async () => {
    if (graphId && tooltip.nodeId) {
      //Graph re-renders
      // await fetchGexfByGraphId();

      // Clear node tooltip
      setTooltip({ visible: false, nodeId: '', x: 0, y: 0 });
    }
  };

  // Callback for handling node deletion
  const handleNodeDelete = async () => {
    // await fetchGexfByGraphId();

    // Clear the tooltip after deletion
    setTooltip(defaultNodeTooltip);
  };

  // Callback for handling edge update
  const handleEdgeUpdate = async () => {
    // await fetchGexfByGraphId();

    // Clear node tooltip
    setTooltip({ visible: false, nodeId: '', x: 0, y: 0 });
  };

  // useEffect(() => {
  //   const getNode = async () => {
  //     if (!node && graphId) {
  //       await fetchGexfByGraphId();
  //     }
  //   };
  //   getNode();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [node, graphId, tooltip]);
  return (
    <>
      <LiteGraphSpace
        direction="vertical"
        size={16}
        className={classNames(styles.tooltipContainer)}
        style={{
          top: tooltip.y,
          left: tooltip.x,
        }}
      >
        <LiteGraphCard
          title={
            <LitegraphText weight={600} fontSize={18}>
              Node Information
            </LitegraphText>
          }
          extra={
            <LitegraphFlex gap={10}>
              <LitegraphTooltip title="Expand" placement="bottom">
                <ExpandOutlined
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedNode(node);
                    setIsExpanded(true);
                    setIsAddEditNodeVisible(true);
                  }}
                />
              </LitegraphTooltip>
              <CloseCircleFilled
                className="cursor-pointer"
                onClick={() => setTooltip(defaultNodeTooltip)}
              />
            </LitegraphFlex>
          }
          style={{ width: 300 }}
        >
          {/* If error then fallback displays */}
          {isLoading || isFetching ? (
            // If not error but API is in loading state then dispalys loader
            <PageLoading withoutWhiteBG />
          ) : error ? (
            <FallBack retry={refetch}>
              {error ? 'Something went wrong.' : "Can't view details at the moment."}
            </FallBack>
          ) : (
            // Ready to show data after API is ready
            <LitegraphFlex vertical>
              <LitegraphFlex vertical className="card-details">
                <LitegraphText>
                  <strong>Name: </strong>
                  {node?.Name}{' '}
                  <LitegraphText color="gray" fontSize={12}>{`[${node?.GUID}]`}</LitegraphText>
                </LitegraphText>

                <LitegraphText>
                  <strong>Labels: </strong>
                  {`${node?.Labels?.length ? node?.Labels?.join(', ') : 'None'}`}
                </LitegraphText>

                {/* <LitegraphText>
                  <strong>Vectors: </strong>
                  {pluralize(node?.Vectors?.length || 0, 'vector')}
                </LitegraphText> */}

                <LitegraphText>
                  <strong>Tags: </strong>
                  {Object.keys(node?.Tags || {}).length > 0 ? (
                    <JsonEditor
                      key={JSON.stringify(node?.Tags && JSON.parse(JSON.stringify(node.Tags)))}
                      value={(node?.Tags && JSON.parse(JSON.stringify(node.Tags))) || {}}
                      mode="view" // Use 'view' mode to make it read-only
                      mainMenuBar={false} // Hide the menu bar
                      statusBar={false} // Hide the status bar
                      navigationBar={false} // Hide the navigation bar
                      enableSort={false}
                      enableTransform={false}
                    />
                  ) : (
                    <LitegraphText>None</LitegraphText>
                  )}
                </LitegraphText>

                {/* <LitegraphFlex align="center" gap={6}>
                  <LitegraphText>
                    <strong>Data:</strong>
                  </LitegraphText>
                  <LitegraphTooltip title="Copy JSON">
                    <CopyOutlined
                      className="cursor-pointer"
                      onClick={() => {
                        copyJsonToClipboard(node?.Data || {}, 'Data');
                      }}
                    />
                  </LitegraphTooltip>
                </LitegraphFlex>
                <JsonEditor
                  key={JSON.stringify(node?.Data && JSON.parse(JSON.stringify(node.Data)))}
                  value={(node?.Data && JSON.parse(JSON.stringify(node.Data))) || {}}
                  mode="view"
                  mainMenuBar={false}
                  statusBar={false}
                  navigationBar={false}
                  enableSort={false}
                  enableTransform={false}
                /> */}
              </LitegraphFlex>
              {/* Buttons */}
              <LitegraphFlex className="pt-3" gap={10} justify="space-between">
                <LitegraphTooltip title={'Update Node'} placement="bottom">
                  <LitegraphButton
                    type="link"
                    onClick={() => {
                      setSelectedNode(node);
                      setIsAddEditNodeVisible(true);
                    }}
                  >
                    Update
                  </LitegraphButton>
                </LitegraphTooltip>

                <LitegraphTooltip title={'Delete Node'} placement="bottom">
                  <LitegraphButton
                    type="link"
                    onClick={() => {
                      setSelectedNode(node);
                      setIsDeleteModelVisible(true);
                    }}
                  >
                    Delete
                  </LitegraphButton>
                </LitegraphTooltip>

                <LitegraphTooltip title={'Add Edge'} placement="bottom">
                  <LitegraphButton
                    type="link"
                    onClick={() => {
                      setIsAddEditEdgeVisible(true);
                    }}
                  >
                    Add Edge
                  </LitegraphButton>
                </LitegraphTooltip>
              </LitegraphFlex>
            </LitegraphFlex>
          )}
        </LiteGraphCard>
      </LiteGraphSpace>

      {/* AddEditNode Component On Update*/}
      {selectedNode && (
        <AddEditNode
          isAddEditNodeVisible={isAddEditNodeVisible}
          setIsAddEditNodeVisible={setIsAddEditNodeVisible}
          node={selectedNode || null}
          selectedGraph={graphId}
          readonly={isExpanded}
          onNodeUpdated={handleNodeUpdate} // Pass callback to handle updates
          onClose={() => {
            setIsExpanded(false);
            setSelectedNode(null);
          }}
        />
      )}

      {/* DeleteNode Component On Delete*/}
      <DeleteNode
        title={`Are you sure you want to delete "${selectedNode?.Name}" node?`}
        paragraphText={'This action will delete node.'}
        isDeleteModelVisible={isDeleteModelVisible}
        setIsDeleteModelVisible={setIsDeleteModelVisible}
        selectedNode={selectedNode}
        setSelectedNode={setSelectedNode}
        onNodeDeleted={handleNodeDelete}
      />

      {/* AddEditEdge Component On Add*/}
      <AddEditEdge
        isAddEditEdgeVisible={isAddEditEdgeVisible}
        setIsAddEditEdgeVisible={setIsAddEditEdgeVisible}
        edge={null}
        selectedGraph={graphId}
        onEdgeUpdated={handleEdgeUpdate} // Pass callback to handle updates
        fromNodeGUID={tooltip?.nodeId}
      />
    </>
  );
};

export default NodeToolTip;
