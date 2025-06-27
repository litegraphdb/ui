import { defaultEdgeTooltip } from './constant';
import { GraphEdgeTooltip } from './types';
import { Dispatch, SetStateAction, useState } from 'react';
import LiteGraphSpace from '@/components/base/space/Space';
import LiteGraphCard from '@/components/base/card/Card';
import { CloseCircleFilled, CopyOutlined, ExpandOutlined } from '@ant-design/icons';
import FallBack from '@/components/base/fallback/FallBack';
import PageLoading from '@/components/base/loading/PageLoading';
import LitegraphFlex from '@/components/base/flex/Flex';
import LitegraphText from '@/components/base/typograpghy/Text';
import LitegraphButton from '@/components/base/button/Button';
import AddEditEdge from '@/page/edges/components/AddEditEdge';
import { EdgeType } from '@/lib/store/edge/types';
import DeleteEdge from '@/page/edges/components/DeleteEdge';
import LitegraphTooltip from '@/components/base/tooltip/Tooltip';
import { getNodeNameByGUID } from '@/page/edges/utils';
import { NodeType } from '@/lib/store/node/types';
import { JsonEditor } from 'jsoneditor-react';
import { pluralize } from '@/utils/stringUtils';
import styles from './tooltip.module.scss';
import classNames from 'classnames';
import { copyJsonToClipboard } from '@/utils/jsonCopyUtils';
import { useGetEdgeByIdQuery, useGetGraphGexfContentQuery } from '@/lib/store/slice/slice';

type EdgeTooltipProps = {
  tooltip: GraphEdgeTooltip;
  setTooltip: Dispatch<SetStateAction<GraphEdgeTooltip>>;
  graphId: string;
  nodesList: NodeType[];
};

const EdgeToolTip = ({ tooltip, setTooltip, graphId, nodesList }: EdgeTooltipProps) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // State for AddEditDeleteNode visibility and selected node
  const [isAddEditEdgeVisible, setIsAddEditEdgeVisible] = useState<boolean>(false);
  const [isDeleteModelVisisble, setIsDeleteModelVisisble] = useState<boolean>(false);
  const [selectedEdge, setSelectedEdge] = useState<EdgeType | null | undefined>(undefined);

  const { data: edge, isLoading, error } = useGetEdgeByIdQuery({ graphId, edgeId: tooltip.edgeId });
  const { refetch: fetchGexfByGraphId } = useGetGraphGexfContentQuery(graphId);

  // Callback for handling edge update
  const handleEdgeUpdate = async () => {
    if (graphId && tooltip.edgeId) {
      await fetchGexfByGraphId();
    }
  };

  // Callback for handling edge deletion
  const handleEdgeDelete = async () => {
    await fetchGexfByGraphId();

    // Clear the tooltip after deletion
    setTooltip(defaultEdgeTooltip);
  };

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
              Edge Information
            </LitegraphText>
          }
          extra={
            <LitegraphFlex gap={10}>
              <LitegraphTooltip title="Expand" placement="bottom">
                <ExpandOutlined
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedEdge(edge);
                    setIsExpanded(true);
                    setIsAddEditEdgeVisible(true);
                  }}
                />
              </LitegraphTooltip>
              <CloseCircleFilled
                className="cursor-pointer"
                onClick={() => setTooltip(defaultEdgeTooltip)}
              />
            </LitegraphFlex>
          }
          style={{ width: 300 }}
        >
          {/* If error then fallback displays */}
          {error ? (
            <FallBack>
              {error ? 'Something went wrong.' : "Can't view details at the moment."}
            </FallBack>
          ) : isLoading ? (
            // If not error but API is in loading state then dispalys loader
            <PageLoading />
          ) : (
            // Ready to show data after API is ready
            <LitegraphFlex vertical>
              <LitegraphFlex vertical className="card-details">
                <LitegraphText>
                  <strong>Name: </strong>
                  {edge?.Name}{' '}
                  <LitegraphText color="gray" fontSize={12}>{`[${edge?.GUID}]`}</LitegraphText>
                </LitegraphText>

                <LitegraphText>
                  <strong>From: </strong>
                  {edge?.From ? getNodeNameByGUID(edge.From, nodesList) : edge?.From}
                </LitegraphText>

                <LitegraphText>
                  <strong>To: </strong>
                  {edge?.To ? getNodeNameByGUID(edge.To, nodesList) : edge?.To}
                </LitegraphText>

                <LitegraphText>
                  <strong>Cost: </strong>
                  {edge?.Cost}
                </LitegraphText>

                <LitegraphText>
                  <strong>Labels: </strong>
                  {`${edge?.Labels?.length ? edge?.Labels?.join(', ') : 'N/A'}`}
                </LitegraphText>

                <LitegraphText>
                  <strong>Vectors: </strong>
                  {pluralize(edge?.Vectors?.length || 0, 'vector')}
                </LitegraphText>

                <LitegraphText>
                  <strong>Tags: </strong>
                  <JsonEditor
                    key={JSON.stringify(edge?.Tags && JSON.parse(JSON.stringify(edge.Tags)))}
                    value={(edge?.Tags && JSON.parse(JSON.stringify(edge.Tags))) || {}}
                    mode="view" // Use 'view' mode to make it read-only
                    mainMenuBar={false} // Hide the menu bar
                    statusBar={false} // Hide the status bar
                    navigationBar={false} // Hide the navigation bar
                    enableSort={false}
                    enableTransform={false}
                  />
                </LitegraphText>

                <LitegraphFlex align="center" gap={6}>
                  <LitegraphText>
                    <strong>Data:</strong>
                  </LitegraphText>
                  <LitegraphTooltip title="Copy JSON">
                    <CopyOutlined
                      className="cursor-pointer"
                      onClick={() => {
                        copyJsonToClipboard(edge?.Data || {}, 'Data');
                      }}
                    />
                  </LitegraphTooltip>
                </LitegraphFlex>
                <JsonEditor
                  key={JSON.stringify(edge?.Data && JSON.parse(JSON.stringify(edge?.Data)))}
                  value={(edge?.Data && JSON.parse(JSON.stringify(edge.Data))) || {}}
                  mode="view" // Use 'view' mode to make it read-only
                  mainMenuBar={false} // Hide the menu bar
                  statusBar={false} // Hide the status bar
                  navigationBar={false} // Hide the navigation bar
                  enableSort={false}
                  enableTransform={false}
                />
              </LitegraphFlex>

              {/* Buttons */}
              <LitegraphFlex justify="space-between" gap={10} className="pt-3">
                <LitegraphTooltip title={'Update Edge'} placement="bottom">
                  <LitegraphButton
                    type="link"
                    onClick={() => {
                      setSelectedEdge(edge);
                      setIsAddEditEdgeVisible(true);
                    }}
                  >
                    Update
                  </LitegraphButton>
                </LitegraphTooltip>
                <LitegraphTooltip title={'Delete Edge'} placement="bottom">
                  <LitegraphButton
                    type="link"
                    onClick={() => {
                      setSelectedEdge(edge);
                      setIsDeleteModelVisisble(true);
                    }}
                  >
                    Delete
                  </LitegraphButton>
                </LitegraphTooltip>
              </LitegraphFlex>
            </LitegraphFlex>
          )}
        </LiteGraphCard>
      </LiteGraphSpace>

      {/* AddEditEdge Component On Update*/}
      {selectedEdge && (
        <AddEditEdge
          isAddEditEdgeVisible={isAddEditEdgeVisible}
          setIsAddEditEdgeVisible={setIsAddEditEdgeVisible}
          edge={selectedEdge || null}
          selectedGraph={graphId}
          onEdgeUpdated={handleEdgeUpdate} // Pass callback to handle updates
          readonly={isExpanded}
          onClose={() => {
            setIsAddEditEdgeVisible(false);
            setSelectedEdge(null);
            setIsExpanded(false);
          }}
        />
      )}

      {/* DeleteEdge Component On Delete*/}
      <DeleteEdge
        title={`Are you sure you want to delete "${selectedEdge?.Name}" edge?`}
        paragraphText={'This action will delete edge.'}
        isDeleteModelVisisble={isDeleteModelVisisble}
        setIsDeleteModelVisisble={setIsDeleteModelVisisble}
        selectedEdge={selectedEdge}
        setSelectedEdge={setSelectedEdge}
        onEdgeDeleted={handleEdgeDelete}
      />
    </>
  );
};

export default EdgeToolTip;
