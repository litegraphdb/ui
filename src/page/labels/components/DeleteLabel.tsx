'use client';
import { LabelType } from '@/lib/store/label/types';
import LitegraphModal from '@/components/base/modal/Modal';
import LitegraphParagraph from '@/components/base/typograpghy/Paragraph';
import toast from 'react-hot-toast';
import { useDeleteLabelMutation } from '@/lib/store/slice/slice';

interface DeleteLabelProps {
  title: string;
  paragraphText: string;
  isDeleteModelVisible: boolean;
  setIsDeleteModelVisible: (visible: boolean) => void;
  selectedLabel: LabelType | null | undefined;
  setSelectedLabel: (label: LabelType | null | undefined) => void;

  onLabelDeleted?: () => Promise<void>;
}

const DeleteLabel = ({
  title,
  paragraphText,
  isDeleteModelVisible,
  setIsDeleteModelVisible,
  selectedLabel,
  setSelectedLabel,

  onLabelDeleted,
}: DeleteLabelProps) => {
  const [deleteLabelById, { isLoading }] = useDeleteLabelMutation();

  const handleDelete = async () => {
    if (selectedLabel) {
      const res = await deleteLabelById(selectedLabel.GUID);
      if (res) {
        toast.success('Label deleted successfully');
        setIsDeleteModelVisible(false);
        setSelectedLabel(null);
        onLabelDeleted && onLabelDeleted();
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
        setSelectedLabel(null);
      }}
      confirmLoading={isLoading}
      okText="Delete"
      okButtonProps={{ danger: true }}
    >
      <LitegraphParagraph>{paragraphText}</LitegraphParagraph>
    </LitegraphModal>
  );
};

export default DeleteLabel;
