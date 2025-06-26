'use client';
import { useMemo, useState } from 'react';
import { CloseOutlined, PlusSquareOutlined, SearchOutlined } from '@ant-design/icons';
import { tableColumns } from './constant';
import { deleteGraph } from '@/lib/store/graph/actions';
import { useAppDispatch } from '@/lib/store/hooks';
import { useGetGraphGexfContentByIdMutation } from '@/lib/store/slice/slice';
import { GraphData } from '@/lib/store/graph/types';
import toast from 'react-hot-toast';
import FallBack from '@/components/base/fallback/FallBack';
import LitegraphButton from '@/components/base/button/Button';
import LitegraphParagraph from '@/components/base/typograpghy/Paragraph';
import LitegraphModal from '@/components/base/modal/Modal';
import LitegraphTable from '@/components/base/table/Table';
import PageContainer from '@/components/base/pageContainer/PageContainer';
import dynamic from 'next/dynamic';
import { useSearchGraphData } from '@/hooks/entityHooks';
import { saveAs } from 'file-saver';
import LitegraphText from '@/components/base/typograpghy/Text';
import LitegraphFlex from '@/components/base/flex/Flex';
import SearchByTLDModal from '@/components/search/SearchModal';
import { convertTagsToRecord } from '@/components/inputs/tags-input/utils';
import { SearchData } from '@/components/search/type';
import { hasScoreOrDistanceInData } from '@/utils/dataUtils';
import { SEARCH_BUTTON_LABEL } from '@/constants/uiLabels';
import { usePagination } from '@/hooks/appHooks';
import { useDeleteGraphMutation, useSearchAndEnumerateGraphQuery } from '@/lib/store/slice/slice';
import { tablePaginationConfig } from '@/constants/pagination';
import { EnumerateAndSearchRequest } from 'litegraphdb/dist/types/types';
const AddEditGraph = dynamic(() => import('./components/AddEditGraph'), {
  ssr: false,
});

const GraphPage = () => {
  const dispatch = useAppDispatch();
  const { page, pageSize, skip, handlePageChange } = usePagination();
  const [searchParams, setSearchParams] = useState<EnumerateAndSearchRequest>({});
  const {
    data,
    isLoading: isGraphsLoading,
    refetch: refetchGraphs,
    error: graphError,
  } = useSearchAndEnumerateGraphQuery({
    ...searchParams,
    MaxResults: pageSize,
    Skip: skip,
    IncludeSubordinates: true,
    IncludeData: true,
  });
  const graphsList = data?.Objects || [];
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [isAddEditGraphVisible, setIsAddEditGraphVisible] = useState<boolean>(false);
  const [isDeleteModelVisisble, setIsDeleteModelVisisble] = useState<boolean>(false);
  const [selectedGraph, setSelectedGraph] = useState<GraphData | null>(null);
  const [fetchGexfByGraphId, { isLoading: isFetchGexfByGraphIdLoading }] =
    useGetGraphGexfContentByIdMutation();
  const {
    searchGraph,
    isLoading: isSearchLoading,
    searchResults,
    refreshSearch,
    setSearchResults,
  } = useSearchGraphData();

  const [deleteGraphById, { isLoading: isDeleteGraphLoading }] = useDeleteGraphMutation();

  const handleCreateGraph = () => {
    setSelectedGraph(null);
    setIsAddEditGraphVisible(true);
  };
  const onSearch = async (values: SearchData) => {
    setSearchParams({
      Ordering: !values.embeddings ? 'CreatedDescending' : undefined,
      Labels: values.labels,
      Expr: values.expr,
      Tags: convertTagsToRecord(values.tags),
    });
  };
  const handleEdit = async (data: GraphData) => {
    setSelectedGraph(data);
    setIsAddEditGraphVisible(true);
  };

  const handleDelete = (record: GraphData) => {
    setSelectedGraph(record);
    setIsDeleteModelVisisble(true);
  };

  const handleExportGexf = async (graph: GraphData) => {
    try {
      const res = await fetchGexfByGraphId({ graphId: graph.GUID });
      const gexfContent = res?.data;
      if (!gexfContent) {
        throw new Error('No GEXF content received');
      }

      // Create a blob from the GEXF content
      const blob = new Blob([gexfContent], { type: 'application/xml' });
      saveAs(blob, `graph-${graph.GUID}.gexf`);
      toast.success('Graph exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export graph');
    }
  };

  const handleDeleteGraph = async () => {
    if (selectedGraph) {
      const res = await deleteGraphById(selectedGraph.GUID);
      if (res) {
        dispatch(deleteGraph({ GUID: selectedGraph.GUID }));
        toast.success('Delete Graph successfully');
        setIsDeleteModelVisisble(false);
        setSelectedGraph(null);
      }
    }
  };

  const graphDataSource = isSearching ? searchResults || [] : graphsList || [];
  const hasScoreOrDistance = useMemo(
    () => hasScoreOrDistanceInData(graphDataSource),
    [graphDataSource]
  );

  return (
    <PageContainer
      id="graphs"
      pageTitle={
        <LitegraphFlex align="center" gap={10}>
          <LitegraphText>{isSearching ? 'Search ' : 'Graphs'}</LitegraphText>
          {isSearching ? (
            <CloseOutlined className="cursor-pointer" onClick={() => setIsSearching(false)} />
          ) : (
            <SearchOutlined
              className="cursor-pointer"
              onClick={() => {
                setIsSearching(true);
                setSearchResults(null);
              }}
            />
          )}
        </LitegraphFlex>
      }
      pageTitleRightContent={
        isSearching ? (
          <LitegraphFlex gap={20}>
            <LitegraphButton
              type="link"
              icon={<SearchOutlined />}
              onClick={() => setShowSearchModal(true)}
            >
              {SEARCH_BUTTON_LABEL}
            </LitegraphButton>
          </LitegraphFlex>
        ) : (
          <LitegraphButton
            type="link"
            icon={<PlusSquareOutlined />}
            onClick={handleCreateGraph}
            weight={500}
          >
            Create Graph
          </LitegraphButton>
        )
      }
    >
      {graphError ? (
        <FallBack retry={refetchGraphs}>
          {graphError ? 'Something went wrong.' : "Can't view details at the moment."}
        </FallBack>
      ) : (
        <>
          <LitegraphFlex gap={20}>
            <LitegraphButton
              type="link"
              icon={<SearchOutlined />}
              onClick={() => setShowSearchModal(true)}
            >
              {SEARCH_BUTTON_LABEL}
            </LitegraphButton>
          </LitegraphFlex>
          <LitegraphTable
            columns={tableColumns(handleEdit, handleDelete, handleExportGexf, hasScoreOrDistance)}
            dataSource={graphDataSource}
            loading={isGraphsLoading || isSearchLoading || isFetchGexfByGraphIdLoading}
            rowKey={'GUID'}
            pagination={{
              ...tablePaginationConfig,
              total: data?.TotalRecords,
              pageSize: pageSize,
              current: page,
              onChange: handlePageChange,
            }}
          />
        </>
      )}

      <AddEditGraph
        isAddEditGraphVisible={isAddEditGraphVisible}
        setIsAddEditGraphVisible={setIsAddEditGraphVisible}
        graph={selectedGraph ? selectedGraph : null}
        onDone={() => {
          refetchGraphs();
          refreshSearch();
        }}
      />

      <LitegraphModal
        title="Are you sure you want to delete this graph?"
        centered
        open={isDeleteModelVisisble}
        onCancel={() => setIsDeleteModelVisisble(false)}
        footer={
          <LitegraphButton
            type="primary"
            onClick={handleDeleteGraph}
            loading={isDeleteGraphLoading}
          >
            Confirm
          </LitegraphButton>
        }
      >
        <LitegraphParagraph>This action will delete graph.</LitegraphParagraph>
      </LitegraphModal>
      <SearchByTLDModal
        setIsSearchModalVisible={setShowSearchModal}
        isSearchModalVisible={showSearchModal}
        onSearch={onSearch}
      />
    </PageContainer>
  );
};

export default GraphPage;
