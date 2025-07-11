import React, { Dispatch, SetStateAction } from 'react';
import toast from 'react-hot-toast';
import LitegraphModal from '@/components/base/modal/Modal';
import LitegraphParagraph from '@/components/base/typograpghy/Paragraph';
import LitegraphButton from '@/components/base/button/Button';
import { NodeType } from '@/types/types';
import { useDeleteNodeMutation } from '@/lib/store/slice/slice';

type DeleteNodeProps = {
  title: string;
  paragraphText: string;
  isDeleteModelVisible: boolean;
  setIsDeleteModelVisible: Dispatch<SetStateAction<boolean>>;
  selectedNode: NodeType | null | undefined;
  setSelectedNode: Dispatch<SetStateAction<NodeType | null | undefined>>;
  onNodeDeleted?: () => Promise<void>;
};
const DeleteNode = ({
  title,
  paragraphText,
  isDeleteModelVisible,
  setIsDeleteModelVisible,
  selectedNode,
  setSelectedNode,
  onNodeDeleted,
}: DeleteNodeProps) => {
  const [deleteNodeById, { isLoading: isDeleteNodeLoading }] = useDeleteNodeMutation();

  const handleDeleteNode = async () => {
    if (selectedNode) {
      const res = await deleteNodeById({
        graphId: selectedNode.GraphGUID,
        nodeId: selectedNode.GUID,
      });
      if (res) {
        toast.success('Delete Node successfully');
        setIsDeleteModelVisible(false);
        setSelectedNode(null);
        onNodeDeleted && onNodeDeleted();
      }
    }
  };
  return (
    <LitegraphModal
      title={title}
      centered
      open={isDeleteModelVisible}
      onCancel={() => setIsDeleteModelVisible(false)}
      footer={
        <LitegraphButton type="primary" onClick={handleDeleteNode} loading={isDeleteNodeLoading}>
          Confirm
        </LitegraphButton>
      }
      data-testid="delete-node-modal"
    >
      <LitegraphParagraph>{paragraphText}</LitegraphParagraph>
    </LitegraphModal>
  );
};

export default DeleteNode;
