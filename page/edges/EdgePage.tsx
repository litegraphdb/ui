'use client';
import { useEffect, useMemo, useState } from 'react';
import { CloseOutlined, PlusSquareOutlined, SearchOutlined } from '@ant-design/icons';
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
import { useNodeAndEdge, useSearchEdgeData } from '@/hooks/entityHooks';
import LitegraphFlex from '@/components/base/flex/Flex';
import LitegraphText from '@/components/base/typograpghy/Text';
import { SearchData } from '@/components/search/type';
import { convertTagsToRecord } from '@/components/inputs/tags-input/utils';
import SearchByTLDModal from '@/components/search/SearchModal';
import { hasScoreOrDistanceInData } from '@/utils/dataUtils';

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
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const {
    searchEdge,
    searchResults,
    isLoading: isSearchLoading,
    setSearchResults,

    refreshSearch,
  } = useSearchEdgeData();

  const transformedEdgesList = transformEdgeDataForTable(
    isSearching ? searchResults || [] : edgesList,
    nodesList
  );

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
    await searchEdge({
      Domain: values.embeddings ? 'Edge' : undefined,
      SearchType: values.embeddings ? 'CosineSimilarity' : undefined,
      GraphGUID: selectedGraphRedux,
      Ordering: !values.embeddings ? 'CreatedDescending' : undefined,
      Labels: values.labels,
      Expr: values.expr,
      Tags: convertTagsToRecord(values.tags),
      Embeddings: values.embeddings ? values.embeddings : undefined,
    });
  };

  useEffect(() => {
    setIsSearching(false);
    setSearchResults(null);
  }, [selectedGraphRedux]);

  return (
    <PageContainer
      id="edges"
      pageTitle={
        <LitegraphFlex align="center" gap={10}>
          <LitegraphText>{isSearching ? 'Search ' : 'Edges'}</LitegraphText>
          {selectedGraphRedux &&
            (isSearching ? (
              <CloseOutlined className="cursor-pointer" onClick={() => setIsSearching(false)} />
            ) : (
              <SearchOutlined
                className="cursor-pointer"
                onClick={() => {
                  setIsSearching(true);
                  setSearchResults(null);
                }}
              />
            ))}
        </LitegraphFlex>
      }
      pageTitleRightContent={
        <>
          {selectedGraphRedux &&
            (isSearching ? (
              <LitegraphFlex gap={20}>
                <LitegraphButton
                  icon={<SearchOutlined />}
                  type="link"
                  onClick={() => setShowSearchModal(true)}
                >
                  Search by labels, tags, data and embeddings
                </LitegraphButton>
              </LitegraphFlex>
            ) : (
              <LitegraphButton
                type="link"
                icon={<PlusSquareOutlined />}
                onClick={handleCreateEdge}
                weight={500}
              >
                Create Edge
              </LitegraphButton>
            ))}
        </>
      }
    >
      {isEdgesError && <FallBack retry={fetchNodesAndEdges}>{'Something went wrong.'}</FallBack>}
      {!isEdgesError && (
        <LitegraphTable
          columns={tableColumns(handleEditEdge, handleDelete, hasScoreOrDistance)}
          dataSource={transformedEdgesList}
          loading={isNodesAndEdgesLoading || isSearchLoading}
          rowKey={'GUID'}
        />
      )}

      <AddEditEdge
        isAddEditEdgeVisible={isAddEditEdgeVisible}
        setIsAddEditEdgeVisible={setIsAddEditEdgeVisible}
        edge={selectedEdge ? selectedEdge : null}
        selectedGraph={selectedGraphRedux}
        onEdgeUpdated={async () => {
          await fetchNodesAndEdges();
          refreshSearch();
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
