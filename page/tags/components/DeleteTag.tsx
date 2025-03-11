'use client';
import { useDeleteTagById } from '@/lib/sdk/litegraph.service';
import { TagType } from '@/lib/store/tag/types';
import LitegraphModal from '@/components/base/modal/Modal';
import LitegraphParagraph from '@/components/base/typograpghy/Paragraph';
import { useAppDispatch } from '@/lib/store/hooks';
import { deleteTag } from '@/lib/store/tag/actions';
import toast from 'react-hot-toast';

interface DeleteTagProps {
  title: string;
  paragraphText: string;
  isDeleteModelVisible: boolean;
  setIsDeleteModelVisible: (visible: boolean) => void;
  selectedTag: TagType | null | undefined;
  setSelectedTag: (tag: TagType | null | undefined) => void;
  onTagDeleted?: () => Promise<void>;
}

const DeleteTag = ({
  title,
  paragraphText,
  isDeleteModelVisible,
  setIsDeleteModelVisible,
  selectedTag,
  setSelectedTag,
  onTagDeleted,
}: DeleteTagProps) => {
  const dispatch = useAppDispatch();
  const { deleteTagById, isLoading } = useDeleteTagById();

  const handleDelete = async () => {
    if (selectedTag) {
      const res = await deleteTagById(selectedTag.GUID);
      if (res) {
        dispatch(deleteTag({ GUID: selectedTag.GUID }));
        toast.success('Tag deleted successfully');
        setIsDeleteModelVisible(false);
        setSelectedTag(null);
        onTagDeleted && onTagDeleted();
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
        setSelectedTag(null);
      }}
      confirmLoading={isLoading}
      okText="Delete"
      okButtonProps={{ danger: true }}
    >
      <LitegraphParagraph>{paragraphText}</LitegraphParagraph>
    </LitegraphModal>
  );
};

export default DeleteTag;
