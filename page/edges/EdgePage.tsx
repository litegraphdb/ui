'use client';
import { useState } from 'react';
import { PlusSquareOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { RootState } from '@/lib/store/store';
import LitegraphTable from '@/components/base/table/Table';
import LitegraphButton from '@/components/base/button/Button';
import FallBack from '@/components/base/fallback/FallBack';
import { EdgeType } from '@/lib/store/edge/types';
import { tableColumns } from './constant';
import AddEditEdge from './components/AddEditEdge';
import DeleteEdge from './components/DeleteEdge';
import { transformEdgeDataForTable } from './utils';
import PageContainer from '@/components/base/pageContainer/PageContainer';
import { useNodeAndEdge } from '@/hooks/entityHooks';

const EdgePage = () => {
  const dispatch = useAppDispatch();
  // Redux state for the list of graphs
  const selectedGraphRedux = useAppSelector((state: RootState) => state.liteGraph.selectedGraph);
  const {
    nodesList,
    edgesList,
    fetchNodesAndEdges,
    isLoading: isNodesAndEdgesLoading,
    edgesError: isEdgesError,
  } = useNodeAndEdge(selectedGraphRedux);
  const [selectedEdge, setSelectedEdge] = useState<EdgeType | null | undefined>(null);

  const [isAddEditEdgeVisible, setIsAddEditEdgeVisible] = useState<boolean>(false);
  const [isDeleteModelVisisble, setIsDeleteModelVisisble] = useState<boolean>(false);

  const transformedEdgesList = transformEdgeDataForTable(edgesList, nodesList);

  const handleCreateEdge = () => {
    setSelectedEdge(null);
    setIsAddEditEdgeVisible(true);
  };

  const handleEditEdge = (data: EdgeType) => {
    setSelectedEdge(data);
    setIsAddEditEdgeVisible(true);
  };

  const handleDelete = (record: EdgeType) => {
    setSelectedEdge(record);
    setIsDeleteModelVisisble(true);
  };

  return (
    <PageContainer
      id="edges"
      pageTitle={'Edges'}
      pageTitleRightContent={
        <>
          {selectedGraphRedux && (
            <LitegraphButton
              type="link"
              icon={<PlusSquareOutlined />}
              onClick={handleCreateEdge}
              weight={500}
            >
              Create Edge
            </LitegraphButton>
          )}
        </>
      }
    >
      {isEdgesError && <FallBack retry={fetchNodesAndEdges}>{'Something went wrong.'}</FallBack>}
      {!isEdgesError && (
        <LitegraphTable
          columns={tableColumns(handleEditEdge, handleDelete)}
          dataSource={transformedEdgesList}
          loading={isNodesAndEdgesLoading}
          rowKey={'GUID'}
        />
      )}

      <AddEditEdge
        isAddEditEdgeVisible={isAddEditEdgeVisible}
        setIsAddEditEdgeVisible={setIsAddEditEdgeVisible}
        edge={selectedEdge ? selectedEdge : null}
        selectedGraph={selectedGraphRedux}
        onEdgeUpdated={fetchNodesAndEdges}
      />

      <DeleteEdge
        title={`Are you sure you want to delete "${selectedEdge?.name}" edge?`}
        paragraphText={'This action will delete edge.'}
        isDeleteModelVisisble={isDeleteModelVisisble}
        setIsDeleteModelVisisble={setIsDeleteModelVisisble}
        selectedEdge={selectedEdge}
        setSelectedEdge={setSelectedEdge}
      />
    </PageContainer>
  );
};

export default EdgePage;
