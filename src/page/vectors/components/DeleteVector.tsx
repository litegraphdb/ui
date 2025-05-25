'use client';
import { useDeleteVectorById } from '@/lib/sdk/litegraph.service';
import { VectorType } from '@/lib/store/vector/types';
import LitegraphModal from '@/components/base/modal/Modal';
import LitegraphParagraph from '@/components/base/typograpghy/Paragraph';
import { useAppDispatch } from '@/lib/store/hooks';
import { deleteVector } from '@/lib/store/vector/actions';
import toast from 'react-hot-toast';

interface DeleteVectorProps {
  title: string;
  paragraphText: string;
  isDeleteModelVisible: boolean;
  setIsDeleteModelVisible: (visible: boolean) => void;
  selectedVector: VectorType | null | undefined;
  setSelectedVector: (vector: VectorType | null | undefined) => void;
  onVectorDeleted?: () => Promise<void>;
}

const DeleteVector = ({
  title,
  paragraphText,
  isDeleteModelVisible,
  setIsDeleteModelVisible,
  selectedVector,
  setSelectedVector,
  onVectorDeleted,
}: DeleteVectorProps) => {
  const dispatch = useAppDispatch();
  const { deleteVectorById, isLoading } = useDeleteVectorById();

  const handleDelete = async () => {
    if (selectedVector) {
      const res = await deleteVectorById(selectedVector.GUID);
      if (res) {
        dispatch(deleteVector({ GUID: selectedVector.GUID }));
        toast.success('Vector deleted successfully');
        setIsDeleteModelVisible(false);
        setSelectedVector(null);
        onVectorDeleted && onVectorDeleted();
      }
    }
  };

  return (
    <LitegraphModal
      title={title}
      centered
      open={isDeleteModelVisible}
      onOk={handleDelete}
      onCancel={() => {
        setIsDeleteModelVisible(false);
        setSelectedVector(null);
      }}
      confirmLoading={isLoading}
      okText="Delete"
      okButtonProps={{ danger: true }}
    >
      <LitegraphParagraph>{paragraphText}</LitegraphParagraph>
    </LitegraphModal>
  );
};

export default DeleteVector;
