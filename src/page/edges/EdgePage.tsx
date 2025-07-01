'use client';
import { useMemo, useState } from 'react';
import { CloseOutlined, PlusSquareOutlined, SearchOutlined } from '@ant-design/icons';
import { useAppSelector } from '@/lib/store/hooks';
import { RootState } from '@/lib/store/store';
import LitegraphTable from '@/components/base/table/Table';
import LitegraphButton from '@/components/base/button/Button';
import FallBack from '@/components/base/fallback/FallBack';
import { EdgeType } from '@/types/types';
import { tableColumns } from './constant';
import AddEditEdge from './components/AddEditEdge';
import DeleteEdge from './components/DeleteEdge';
import { transformEdgeDataForTable } from './utils';
import PageContainer from '@/components/base/pageContainer/PageContainer';
import LitegraphFlex from '@/components/base/flex/Flex';
import LitegraphText from '@/components/base/typograpghy/Text';
import { SearchData } from '@/components/search/type';
import { convertTagsToRecord } from '@/components/inputs/tags-input/utils';
import SearchByTLDModal from '@/components/search/SearchModal';
import { hasScoreOrDistanceInData } from '@/utils/dataUtils';
import { usePagination } from '@/hooks/appHooks';
import { tablePaginationConfig } from '@/constants/pagination';
import { useEnumerateAndSearchEdgeQuery, useGetAllNodesQuery } from '@/lib/store/slice/slice';
import { EnumerateAndSearchRequest } from 'litegraphdb/dist/types/types';

const EdgePage = () => {
  // Redux state for the list of graphs
  const [searchParams, setSearchParams] = useState<EnumerateAndSearchRequest>({});
  const selectedGraphRedux = useAppSelector((state: RootState) => state.liteGraph.selectedGraph);
  const { page, pageSize, skip, handlePageChange } = usePagination();
  const { data: nodesList, isLoading: isNodesLoading } = useGetAllNodesQuery({
    graphId: selectedGraphRedux,
  });
  const {
    data: edgesList,
    refetch: fetchEdgesList,
    isLoading: isEdgesLoading,
    error: isEdgesError,
  } = useEnumerateAndSearchEdgeQuery({
    graphId: selectedGraphRedux,
    request: {
      ...searchParams,
      IncludeData: true,
      IncludeSubordinates: true,
      MaxResults: pageSize,
      Skip: skip,
    },
  });

  const isNodesAndEdgesLoading = isNodesLoading || isEdgesLoading;

  const [selectedEdge, setSelectedEdge] = useState<EdgeType | null | undefined>(null);

  const [isAddEditEdgeVisible, setIsAddEditEdgeVisible] = useState<boolean>(false);
  const [isDeleteModelVisisble, setIsDeleteModelVisisble] = useState<boolean>(false);
  const [showSearchModal, setShowSearchModal] = useState(false);

  const transformedEdgesList = transformEdgeDataForTable(edgesList?.Objects || [], nodesList || []);

  const hasScoreOrDistance = useMemo(
    () => hasScoreOrDistanceInData(transformedEdgesList),
    [transformedEdgesList]
  );

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
  const onSearch = async (values: SearchData) => {
    setSearchParams({
      Labels: values.labels,
      Expr: values.expr,
      Tags: convertTagsToRecord(values.tags),
    });
  };

  return (
    <PageContainer
      id="edges"
      pageTitle={
        <LitegraphFlex align="center" gap={10}>
          <LitegraphText>Edges</LitegraphText>
          {selectedGraphRedux && (
            <SearchOutlined className="cursor-pointer" onClick={() => setShowSearchModal(true)} />
          )}
        </LitegraphFlex>
      }
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
      {!!isEdgesError && <FallBack retry={fetchEdgesList}>{'Something went wrong.'}</FallBack>}
      {!isEdgesError && (
        <>
          <LitegraphFlex
            style={{ marginTop: '-10px' }}
            gap={20}
            justify="space-between"
            align="center"
            className="mb-sm"
          >
            {Boolean(Object.keys(searchParams).length) && (
              <LitegraphText>
                {edgesList?.TotalRecords} edge{`(s)`} found{' '}
                <LitegraphButton
                  icon={<CloseOutlined />}
                  type="link"
                  onClick={() => setSearchParams({})}
                >
                  Clear
                </LitegraphButton>{' '}
              </LitegraphText>
            )}
          </LitegraphFlex>
          <LitegraphTable
            columns={tableColumns(handleEditEdge, handleDelete, hasScoreOrDistance)}
            dataSource={transformedEdgesList}
            loading={isNodesAndEdgesLoading}
            rowKey={'GUID'}
            pagination={{
              ...tablePaginationConfig,
              total: edgesList?.TotalRecords,
              pageSize: pageSize,
              current: page,
              onChange: handlePageChange,
            }}
          />
        </>
      )}

      <AddEditEdge
        isAddEditEdgeVisible={isAddEditEdgeVisible}
        setIsAddEditEdgeVisible={setIsAddEditEdgeVisible}
        edge={selectedEdge ? selectedEdge : null}
        selectedGraph={selectedGraphRedux}
        onEdgeUpdated={async () => {
          await fetchEdgesList();
        }}
      />

      <DeleteEdge
        title={`Are you sure you want to delete "${selectedEdge?.Name}" edge?`}
        paragraphText={'This action will delete edge.'}
        isDeleteModelVisisble={isDeleteModelVisisble}
        setIsDeleteModelVisisble={setIsDeleteModelVisisble}
        selectedEdge={selectedEdge}
        setSelectedEdge={setSelectedEdge}
      />
      <SearchByTLDModal
        setIsSearchModalVisible={setShowSearchModal}
        isSearchModalVisible={showSearchModal}
        onSearch={onSearch}
      />
    </PageContainer>
  );
};

export default EdgePage;
