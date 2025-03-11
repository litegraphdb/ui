'use client';
import { useState } from 'react';
import { PlusSquareOutlined } from '@ant-design/icons';
import { tableColumns } from './constant';
import { deleteGraph } from '@/lib/store/graph/actions';
import { useAppDispatch } from '@/lib/store/hooks';
import { useDeleteGraphById, useGetGexfByGraphId } from '@/lib/sdk/litegraph.service';
import { GraphData } from '@/lib/store/graph/types';
import toast from 'react-hot-toast';
import FallBack from '@/components/base/fallback/FallBack';
import LitegraphButton from '@/components/base/button/Button';
import LitegraphParagraph from '@/components/base/typograpghy/Paragraph';
import LitegraphModal from '@/components/base/modal/Modal';
import LitegraphTable from '@/components/base/table/Table';
import PageContainer from '@/components/base/pageContainer/PageContainer';
import dynamic from 'next/dynamic';
import { useGraphList } from '@/hooks/entityHooks';
import { useLayoutContext } from '@/components/layout/context';
import { saveAs } from 'file-saver';
const AddEditGraph = dynamic(() => import('./components/AddEditGraph'), {
  ssr: false,
});

const GraphPage = () => {
  const dispatch = useAppDispatch();
  const graphsList = useGraphList();
  const [isAddEditGraphVisible, setIsAddEditGraphVisible] = useState<boolean>(false);
  const [isDeleteModelVisisble, setIsDeleteModelVisisble] = useState<boolean>(false);
  const [selectedGraph, setSelectedGraph] = useState<GraphData | null>(null);
  const { fetchGexfByGraphId } = useGetGexfByGraphId();

  const { deleteGraphById, isLoading: isDeleteGraphLoading } = useDeleteGraphById();
  const { isGraphsLoading, graphError, refetchGraphs } = useLayoutContext();

  const handleCreateGraph = () => {
    setSelectedGraph(null);
    setIsAddEditGraphVisible(true);
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
      const gexfContent = await fetchGexfByGraphId(graph.GUID);
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

  return (
    <PageContainer
      id="graphs"
      pageTitle="Graphs"
      pageTitleRightContent={
        <LitegraphButton
          type="link"
          icon={<PlusSquareOutlined />}
          onClick={handleCreateGraph}
          weight={500}
        >
          Create Graph
        </LitegraphButton>
      }
    >
      {graphError ? (
        <FallBack retry={refetchGraphs}>
          {graphError ? 'Something went wrong.' : "Can't view details at the moment."}
        </FallBack>
      ) : (
        <LitegraphTable
          columns={tableColumns(handleEdit, handleDelete, handleExportGexf)}
          dataSource={graphsList}
          loading={isGraphsLoading}
          rowKey={'GUID'}
        />
      )}

      <AddEditGraph
        isAddEditGraphVisible={isAddEditGraphVisible}
        setIsAddEditGraphVisible={setIsAddEditGraphVisible}
        graph={selectedGraph ? selectedGraph : null}
        onDone={refetchGraphs}
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
    </PageContainer>
  );
};

export default GraphPage;
