'use client';
import { useState } from 'react';
import { PlusSquareOutlined } from '@ant-design/icons';
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
import { useNodes } from '@/hooks/entityHooks';

const NodePage = () => {
  // Redux state for the list of graphs
  const selectedGraphRedux = useAppSelector((state: RootState) => state.liteGraph.selectedGraph);

  const {
    nodesList,
    fetchNodesList,
    isLoading: isNodesLoading,
    error: isNodesError,
  } = useNodes(selectedGraphRedux);
  const [selectedNode, setSelectedNode] = useState<NodeType | null | undefined>(null);

  const [isAddEditNodeVisible, setIsAddEditNodeVisible] = useState<boolean>(false);
  const [isDeleteModelVisible, setIsDeleteModelVisible] = useState<boolean>(false);

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
  console.log({ nodesList, isNodesLoading, isNodesError });
  return (
    <PageContainer
      showGraphSelector
      id="nodes"
      pageTitle={'Nodes'}
      pageTitleRightContent={
        <>
          {selectedGraphRedux && (
            <LitegraphButton
              type="link"
              icon={<PlusSquareOutlined />}
              onClick={handleCreateNode}
              weight={500}
            >
              Create Node
            </LitegraphButton>
          )}
        </>
      }
    >
      {isNodesError && <FallBack retry={fetchNodesList}>{'Something went wrong.'}</FallBack>}
      <LitegraphTable
        columns={tableColumns(handleEditNode, handleDelete)}
        dataSource={nodesList}
        loading={isNodesLoading}
        rowKey={'GUID'}
      />

      <AddEditNode
        onNodeUpdated={fetchNodesList}
        isAddEditNodeVisible={isAddEditNodeVisible}
        setIsAddEditNodeVisible={setIsAddEditNodeVisible}
        node={selectedNode ? selectedNode : null}
        selectedGraph={selectedGraphRedux}
      />

      <DeleteNode
        title={`Are you sure you want to delete "${selectedNode?.name}" node?`}
        paragraphText={'This action will delete node.'}
        isDeleteModelVisible={isDeleteModelVisible}
        setIsDeleteModelVisible={setIsDeleteModelVisible}
        selectedNode={selectedNode}
        setSelectedNode={setSelectedNode}
      />
    </PageContainer>
  );
};

export default NodePage;
