'use client';
import { useState } from 'react';
import { PlusSquareOutlined } from '@ant-design/icons';
import LitegraphTable from '@/components/base/table/Table';
import LitegraphButton from '@/components/base/button/Button';
import FallBack from '@/components/base/fallback/FallBack';
import { tableColumns } from './constant';

import PageContainer from '@/components/base/pageContainer/PageContainer';
import AddEditLabel from './components/AddEditLabel';
import DeleteLabel from './components/DeleteLabel';
import { getNodeAndEdgeGUIDsByLabelList, transformLabelsDataForTable } from './utils';
import { useSelectedGraph } from '@/hooks/entityHooks';
import { useLayoutContext } from '@/components/layout/context';
import {
  useEnumerateAndSearchLabelQuery,
  useGetManyEdgesQuery,
  useGetManyNodesQuery,
} from '@/lib/store/slice/slice';
import { usePagination } from '@/hooks/appHooks';
import { tablePaginationConfig } from '@/constants/pagination';
import { LabelMetadata } from 'litegraphdb/dist/types/types';

const LabelPage = () => {
  const selectedGraphRedux = useSelectedGraph();
  const { isGraphsLoading } = useLayoutContext();
  const { page, pageSize, skip, handlePageChange } = usePagination();
  const {
    data: labelsList,
    isLoading,
    error: isLabelsError,
    refetch: fetchLabelsList,
  } = useEnumerateAndSearchLabelQuery(
    {
      MaxResults: pageSize,
      Skip: skip,
      GraphGUID: selectedGraphRedux,
    },
    {
      skip: !selectedGraphRedux,
    }
  );
  const { nodeGUIDs, edgeGUIDs } = getNodeAndEdgeGUIDsByLabelList(labelsList?.Objects || []);
  const {
    data: nodesList,
    isLoading: isNodesLoading,
    refetch: fetchNodesList,
  } = useGetManyNodesQuery({
    graphId: selectedGraphRedux,
    nodeIds: nodeGUIDs,
  });
  const {
    data: edgesList,
    isLoading: isEdgesLoading,
    refetch: fetchEdgesList,
  } = useGetManyEdgesQuery({
    graphId: selectedGraphRedux,
    edgeIds: edgeGUIDs,
  });
  const isNodeAndEdgeLoading = isNodesLoading || isEdgesLoading;
  const fetchNodesAndEdges = async () => {
    fetchNodesList();
    fetchEdgesList();
  };
  // Redux state for the list of graphs

  const [selectedLabel, setSelectedLabel] = useState<LabelMetadata | null | undefined>(null);
  const [isAddEditLabelVisible, setIsAddEditLabelVisible] = useState<boolean>(false);
  const [isDeleteModelVisible, setIsDeleteModelVisible] = useState<boolean>(false);

  const transformedLabelsList = transformLabelsDataForTable(
    labelsList?.Objects || [],
    nodesList || [],
    edgesList || []
  );

  const handleCreateLabel = () => {
    setSelectedLabel(null);
    setIsAddEditLabelVisible(true);
  };

  const handleEditLabel = (data: LabelMetadata) => {
    setSelectedLabel(data);
    setIsAddEditLabelVisible(true);
  };

  const handleDelete = (record: LabelMetadata) => {
    setSelectedLabel(record);
    setIsDeleteModelVisible(true);
  };

  const fetchLabelsAndNodesAndEdges = async () => {
    await fetchLabelsList();
    await fetchNodesAndEdges();
  };

  return (
    <PageContainer
      id="labels"
      pageTitle={'Labels'}
      pageTitleRightContent={
        <>
          {selectedGraphRedux && (
            <LitegraphButton
              type="link"
              icon={<PlusSquareOutlined />}
              onClick={handleCreateLabel}
              weight={600}
            >
              Create Label
            </LitegraphButton>
          )}
        </>
      }
    >
      {isLabelsError ? (
        <FallBack retry={fetchLabelsAndNodesAndEdges}>Something went wrong.</FallBack>
      ) : (
        <LitegraphTable
          loading={isNodeAndEdgeLoading || isLoading || isGraphsLoading}
          columns={tableColumns(handleEditLabel, handleDelete, isNodesLoading, isEdgesLoading)}
          dataSource={transformedLabelsList}
          rowKey={'GUID'}
          pagination={{
            ...tablePaginationConfig,
            total: labelsList?.TotalRecords,
            pageSize: pageSize,
            current: page,
            onChange: handlePageChange,
          }}
        />
      )}

      {isAddEditLabelVisible && (
        <AddEditLabel
          isAddEditLabelVisible={isAddEditLabelVisible}
          setIsAddEditLabelVisible={setIsAddEditLabelVisible}
          label={selectedLabel || null}
          selectedGraph={selectedGraphRedux || 'dummy-graph-id'}
          onLabelUpdated={async () => await fetchLabelsAndNodesAndEdges()}
        />
      )}

      {isDeleteModelVisible && selectedLabel && (
        <DeleteLabel
          title={`Are you sure you want to delete "${selectedLabel.Label}" label?`}
          paragraphText={'This action will delete label.'}
          isDeleteModelVisible={isDeleteModelVisible}
          setIsDeleteModelVisible={setIsDeleteModelVisible}
          selectedLabel={selectedLabel}
          setSelectedLabel={setSelectedLabel}
          onLabelDeleted={async () => await fetchLabelsAndNodesAndEdges()}
        />
      )}
    </PageContainer>
  );
};

export default LabelPage;
