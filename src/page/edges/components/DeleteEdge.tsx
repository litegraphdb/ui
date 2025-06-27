import React, { Dispatch, SetStateAction } from 'react';
import toast from 'react-hot-toast';
import LitegraphModal from '@/components/base/modal/Modal';
import LitegraphParagraph from '@/components/base/typograpghy/Paragraph';
import LitegraphButton from '@/components/base/button/Button';
import { EdgeType } from '@/lib/store/edge/types';
import { useDeleteEdgeMutation } from '@/lib/store/slice/slice';

type DeleteEdgeProps = {
  title: string;
  paragraphText: string;
  isDeleteModelVisisble: boolean;
  setIsDeleteModelVisisble: Dispatch<SetStateAction<boolean>>;
  selectedEdge: EdgeType | null | undefined;
  setSelectedEdge: Dispatch<SetStateAction<EdgeType | null | undefined>>;
  onEdgeDeleted?: () => Promise<void>;
};
const DeleteEdge = ({
  title,
  paragraphText,
  isDeleteModelVisisble,
  setIsDeleteModelVisisble,
  selectedEdge,
  setSelectedEdge,
  onEdgeDeleted,
}: DeleteEdgeProps) => {
  const [deleteEdgeById, { isLoading: isDeleteEdgeLoading }] = useDeleteEdgeMutation();

  const handleDeleteEdge = async () => {
    if (selectedEdge) {
      const res = await deleteEdgeById({
        graphId: selectedEdge.GraphGUID,
        edgeId: selectedEdge.GUID,
      });
      if (res) {
        toast.success('Delete Edge successfully');
        setIsDeleteModelVisisble(false);
        setSelectedEdge(null);
        onEdgeDeleted && onEdgeDeleted();
      }
    }
  };

  return (
    <LitegraphModal
      title={title}
      centered
      open={isDeleteModelVisisble}
      onCancel={() => setIsDeleteModelVisisble(false)}
      footer={
        <LitegraphButton type="primary" onClick={handleDeleteEdge} loading={isDeleteEdgeLoading}>
          Confirm
        </LitegraphButton>
      }
    >
      <LitegraphParagraph>{paragraphText}</LitegraphParagraph>
    </LitegraphModal>
  );
};

export default DeleteEdge;
