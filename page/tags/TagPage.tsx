'use client';
import { useState } from 'react';
import { PlusSquareOutlined } from '@ant-design/icons';
import LitegraphTable from '@/components/base/table/Table';
import LitegraphButton from '@/components/base/button/Button';
import FallBack from '@/components/base/fallback/FallBack';
import { TagType } from '@/lib/store/tag/types';
import { tableColumns } from './constant';

import PageContainer from '@/components/base/pageContainer/PageContainer';
import AddEditTag from './components/AddEditTag';
import DeleteTag from './components/DeleteTag';
import { transformTagsDataForTable } from './utils';
import { useNodeAndEdge, useSelectedGraph, useTags } from '@/hooks/entityHooks';
import { useLayoutContext } from '@/components/layout/context';

const TagPage = () => {
  // Redux state for the list of graphs
  const selectedGraphRedux = useSelectedGraph();
  const { isGraphsLoading } = useLayoutContext();

  const {
    nodesList,
    edgesList,
    isLoading: isEdgesAndNodeLoading,
    fetchNodesAndEdges,
  } = useNodeAndEdge(selectedGraphRedux);
  const {
    tagsList,
    fetchTagsList,
    isLoading: isTagsLoading,
    error: isTagsError,
  } = useTags(selectedGraphRedux);
  const transformedTagsList = transformTagsDataForTable(tagsList, nodesList, edgesList);
  const [selectedTag, setSelectedTag] = useState<TagType | null | undefined>(null);
  const [isAddEditTagVisible, setIsAddEditTagVisible] = useState<boolean>(false);
  const [isDeleteModelVisible, setIsDeleteModelVisible] = useState<boolean>(false);

  const handleCreateTag = () => {
    setSelectedTag(null);
    setIsAddEditTagVisible(true);
  };

  const handleEditTag = (data: TagType) => {
    setSelectedTag(data);
    setIsAddEditTagVisible(true);
  };

  const handleDelete = (record: TagType) => {
    setSelectedTag(record);
    setIsDeleteModelVisible(true);
  };

  return (
    <PageContainer
      id="tags"
      pageTitle={'Tags'}
      pageTitleRightContent={
        <>
          {selectedGraphRedux && (
            <LitegraphButton
              type="link"
              icon={<PlusSquareOutlined />}
              onClick={handleCreateTag}
              weight={500}
            >
              Create Tag
            </LitegraphButton>
          )}
        </>
      }
    >
      {isTagsError ? (
        <FallBack retry={fetchTagsList}>Something went wrong.</FallBack>
      ) : (
        <LitegraphTable
          loading={isGraphsLoading || isEdgesAndNodeLoading || isTagsLoading}
          columns={tableColumns(handleEditTag, handleDelete)}
          dataSource={transformedTagsList}
          rowKey={'GUID'}
        />
      )}

      {isAddEditTagVisible && (
        <AddEditTag
          isAddEditTagVisible={isAddEditTagVisible}
          setIsAddEditTagVisible={setIsAddEditTagVisible}
          tag={selectedTag || null}
          selectedGraph={selectedGraphRedux || 'dummy-graph-id'}
          onTagUpdated={async () => {
            await fetchTagsList();
            await fetchNodesAndEdges();
          }}
        />
      )}

      {isDeleteModelVisible && selectedTag && (
        <DeleteTag
          title={`Are you sure you want to delete "${selectedTag.Key}" tag?`}
          paragraphText={'This action will delete tag.'}
          isDeleteModelVisible={isDeleteModelVisible}
          setIsDeleteModelVisible={setIsDeleteModelVisible}
          selectedTag={selectedTag}
          setSelectedTag={setSelectedTag}
          onTagDeleted={async () => await fetchNodesAndEdges()}
        />
      )}
    </PageContainer>
  );
};

export default TagPage;
