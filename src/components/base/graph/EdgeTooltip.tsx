import { defaultEdgeTooltip } from './constant';
import { GraphEdgeTooltip } from './types';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import LiteGraphSpace from '@/components/base/space/Space';
import LiteGraphCard from '@/components/base/card/Card';
import { CloseCircleFilled } from '@ant-design/icons';
import FallBack from '@/components/base/fallback/FallBack';
import PageLoading from '@/components/base/loading/PageLoading';
import LitegraphFlex from '@/components/base/flex/Flex';
import LitegraphText from '@/components/base/typograpghy/Text';
import LitegraphButton from '@/components/base/button/Button';
import { useAppDispatch } from '@/lib/store/hooks';
import { useGetEdgeById, useGetGexfByGraphId } from '@/lib/sdk/litegraph.service';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { updateEdgeGroupWithGraph } from '@/lib/store/edge/actions';
import AddEditEdge from '@/page/edges/components/AddEditEdge';
import { EdgeType } from '@/lib/store/edge/types';
import { getGexfOgGraphByID } from '@/lib/store/graph/actions';
import DeleteEdge from '@/page/edges/components/DeleteEdge';
import LitegraphTooltip from '@/components/base/tooltip/Tooltip';
import { getNodeNameByGUID } from '@/page/edges/utils';
import { NodeType } from '@/lib/store/node/types';
import { JsonEditor } from 'jsoneditor-react';
import { pluralize } from '@/utils/stringUtils';
import styles from './tooltip.module.scss';
import classNames from 'classnames';

type EdgeTooltipProps = {
  tooltip: GraphEdgeTooltip;
  setTooltip: Dispatch<SetStateAction<GraphEdgeTooltip>>;
  graphId: string;
  setSelectedGraphContext: any;
  nodesList: NodeType[];
};

const EdgeToolTip = ({
  tooltip,
  setTooltip,
  graphId,
  setSelectedGraphContext,
  nodesList,
}: EdgeTooltipProps) => {
  const dispatch = useAppDispatch();

  // State for AddEditDeleteNode visibility and selected node
  const [isAddEditEdgeVisible, setIsAddEditEdgeVisible] = useState<boolean>(false);
  const [isDeleteModelVisisble, setIsDeleteModelVisisble] = useState<boolean>(false);
  const [selectedEdge, setSelectedEdge] = useState<EdgeType | null | undefined>(undefined);

  const { fetchEdgeById, isLoading, error } = useGetEdgeById();
  const { fetchGexfByGraphId } = useGetGexfByGraphId();

  const edge = useSelector((state: RootState) => {
    const graphGroup = state.edgesList.edges.find((group: any) => group[graphId]);
    const existEdge = graphGroup
      ? graphGroup[graphId].find((n: any) => n.GUID === tooltip.edgeId)
      : null;
    return existEdge;
  });

  // Callback for handling edge update
  const handleEdgeUpdate = async () => {
    if (graphId && tooltip.edgeId) {
      const updatedEdge = await fetchEdgeById(graphId, tooltip.edgeId); // Fetch updated node
      if (updatedEdge) {
        dispatch(updateEdgeGroupWithGraph({ edgeId: tooltip.edgeId, edgeData: updatedEdge })); // Update Redux store
      }
    }
  };

  // Callback for handling edge deletion
  const handleEdgeDelete = async () => {
    const data = await fetchGexfByGraphId(graphId);
    if (data) {
      dispatch(getGexfOgGraphByID({ GUID: graphId, gexfContent: data }));
      setSelectedGraphContext(data); // Keep the selected graph context locally
    }

    // Clear the tooltip after deletion
    setTooltip(defaultEdgeTooltip);
  };

  useEffect(() => {
    const getEdge = async () => {
      if (!edge && graphId) {
        const fetchedEdge = await fetchEdgeById(graphId, tooltip.edgeId);
        if (fetchedEdge) {
          dispatch(updateEdgeGroupWithGraph({ edgeId: tooltip.edgeId, edgeData: fetchedEdge }));
        }
      }
    };
    getEdge();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graphId, tooltip]);

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
          title="Edge Information"
          extra={<CloseCircleFilled onClick={() => setTooltip(defaultEdgeTooltip)} />}
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
                  {edge?.Name} {`[${edge?.GUID}]`}
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

                <LitegraphText>
                  <strong>Data: </strong>
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
                </LitegraphText>
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
      <AddEditEdge
        isAddEditEdgeVisible={isAddEditEdgeVisible}
        setIsAddEditEdgeVisible={setIsAddEditEdgeVisible}
        edge={selectedEdge || null}
        selectedGraph={graphId}
        onEdgeUpdated={handleEdgeUpdate} // Pass callback to handle updates
      />

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
