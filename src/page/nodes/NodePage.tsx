'use client';
import { useEffect, useMemo, useState } from 'react';
import { CloseOutlined, PlusSquareOutlined, SearchOutlined } from '@ant-design/icons';
import { useAppSelector } from '@/lib/store/hooks';
import { RootState } from '@/lib/store/store';
import LitegraphTable from '@/components/base/table/Table';
import { tableColumns } from './constant';
import LitegraphButton from '@/components/base/button/Button';
import { NodeType } from '@/lib/store/node/types';
import FallBack from '@/components/base/fallback/FallBack';
import AddEditNode from './components/AddEditNode';
import DeleteNode from './components/DeleteNode';
import PageContainer from '@/components/base/pageContainer/PageContainer';
import { useSearchNodeData } from '@/hooks/entityHooks';
import LitegraphFlex from '@/components/base/flex/Flex';
import LitegraphText from '@/components/base/typograpghy/Text';
import SearchByTLDModal from '@/components/search/SearchModal';
import { SearchData } from '@/components/search/type';
import { convertTagsToRecord } from '@/components/inputs/tags-input/utils';
import { hasScoreOrDistanceInData } from '@/utils/dataUtils';
import { useEnumerateNodeQuery, useGetAllNodesQuery } from '@/lib/store/slice/slice';
import { usePagination } from '@/hooks/appHooks';
import { tablePaginationConfig } from '@/constants/pagination';

const NodePage = () => {
  // Redux state for the list of graphs
  const selectedGraphRedux = useAppSelector((state: RootState) => state.liteGraph.selectedGraph);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const { page, pageSize, skip, handlePageChange } = usePagination();
  const {
    data: nodesList,
    refetch: fetchNodesList,
    isLoading: isNodesLoading,
    isError: isNodesError,
  } = useEnumerateNodeQuery({
    graphId: selectedGraphRedux,
    request: {
      maxKeys: pageSize,
      skip: skip,
    },
  });
  const [selectedNode, setSelectedNode] = useState<NodeType | null | undefined>(null);

  const [isAddEditNodeVisible, setIsAddEditNodeVisible] = useState<boolean>(false);
  const [isDeleteModelVisible, setIsDeleteModelVisible] = useState<boolean>(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const {
    searchNode,
    searchResults,
    isLoading: isSearchLoading,
    setSearchResults,
    refreshSearch,
  } = useSearchNodeData();

  const handleCreateNode = () => {
    setSelectedNode(null);
    setIsAddEditNodeVisible(true);
  };

  const handleEditNode = (data: NodeType) => {
    setSelectedNode(data);
    setIsAddEditNodeVisible(true);
  };

  const handleDelete = (record: NodeType) => {
    setSelectedNode(record);
    setIsDeleteModelVisible(true);
  };
  const onSearch = async (values: SearchData) => {
    await searchNode({
      Domain: values.embeddings ? 'Node' : undefined,
      SearchType: values.embeddings ? 'CosineSimilarity' : undefined,
      Ordering: !values.embeddings ? 'CreatedDescending' : undefined,
      GraphGUID: selectedGraphRedux,
      Labels: values.labels,
      Expr: values.expr,
      Tags: convertTagsToRecord(values.tags),
      Embeddings: values.embeddings ? values.embeddings : undefined,
    });
  };

  const dataSource = isSearching ? searchResults || [] : nodesList?.Objects || [];
  const hasScoreOrDistance = useMemo(
    () => hasScoreOrDistanceInData(dataSource || []),
    [dataSource]
  );

  useEffect(() => {
    setIsSearching(false);
    setSearchResults(null);
  }, [selectedGraphRedux]);

  return (
    <PageContainer
      showGraphSelector
      id="nodes"
      pageTitle={
        <LitegraphFlex align="center" gap={10}>
          <LitegraphText>{isSearching ? 'Search ' : 'Nodes'}</LitegraphText>
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
                onClick={handleCreateNode}
                weight={500}
              >
                Create Node
              </LitegraphButton>
            ))}
        </>
      }
    >
      {isNodesError ? (
        <FallBack retry={fetchNodesList}>{'Something went wrong.'}</FallBack>
      ) : (
        <LitegraphTable
          columns={
            hasScoreOrDistance
              ? tableColumns(handleEditNode, handleDelete, true)
              : tableColumns(handleEditNode, handleDelete, false)
          }
          dataSource={dataSource}
          loading={isNodesLoading || isSearchLoading}
          rowKey={'GUID'}
          pagination={{
            ...tablePaginationConfig,
            total: nodesList?.TotalRecords,
            pageSize: pageSize,
            current: page,
            onChange: handlePageChange,
          }}
        />
      )}

      <AddEditNode
        onNodeUpdated={async () => {
          await fetchNodesList();
          refreshSearch();
        }}
        isAddEditNodeVisible={isAddEditNodeVisible}
        setIsAddEditNodeVisible={setIsAddEditNodeVisible}
        node={selectedNode ? selectedNode : null}
        selectedGraph={selectedGraphRedux}
      />

      <DeleteNode
        title={`Are you sure you want to delete "${selectedNode?.Name}" node?`}
        paragraphText={'This action will delete node.'}
        isDeleteModelVisible={isDeleteModelVisible}
        setIsDeleteModelVisible={setIsDeleteModelVisible}
        selectedNode={selectedNode}
        setSelectedNode={setSelectedNode}
      />
      <SearchByTLDModal
        setIsSearchModalVisible={setShowSearchModal}
        isSearchModalVisible={showSearchModal}
        onSearch={onSearch}
      />
    </PageContainer>
  );
};

export default NodePage;
