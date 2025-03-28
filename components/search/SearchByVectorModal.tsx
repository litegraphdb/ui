'use client';
import { Form } from 'antd';
import { useState, useRef, useEffect } from 'react';
import { v4 } from 'uuid';
import LitegraphModal from '@/components/base/modal/Modal';
import LitegraphFormItem from '@/components/base/form/FormItem';
import { JsonEditor } from 'jsoneditor-react';
import { SearchByVectorData } from './type';
import { initialSearchByVectorData } from './constants';

interface SearchModalProps {
  isSearchModalVisible: boolean;
  setIsSearchModalVisible: (visible: boolean) => void;
  onSearch: (values: SearchByVectorData) => void;
  onClose?: () => void;
}

const SearchByVectorModal = ({
  isSearchModalVisible,
  setIsSearchModalVisible,
  onSearch,
  onClose,
}: SearchModalProps) => {
  const [form] = Form.useForm<SearchByVectorData>();
  const [formValid, setFormValid] = useState(false);
  const uniqueKey = useRef(v4());

  // Add form validation watcher
  const [formValues, setFormValues] = useState({});
  useEffect(() => {
    form
      .validateFields({ validateOnly: true })
      .then(() => setFormValid(true))
      .catch(() => setFormValid(false));
  }, [formValues, form]);

  const handleSearch = async () => {
    try {
      const values = await form.validateFields();
      onSearch({
        embeddings: values.embeddings || {},
      });
      setIsSearchModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  return (
    <LitegraphModal
      destroyOnClose={false}
      title="Search by Vector"
      centered
      open={isSearchModalVisible}
      onCancel={() => {
        setIsSearchModalVisible(false);
        form.resetFields();
      }}
      onOk={handleSearch}
      okText="Search"
      okButtonProps={{ disabled: !formValid }}
      onClose={onClose}
    >
      <Form
        form={form}
        initialValues={initialSearchByVectorData}
        layout="vertical"
        onValuesChange={(_: any, values: SearchByVectorData) => setFormValues(values)}
      >
        <LitegraphFormItem
          label="Embeddings"
          name="embeddings"
          rules={[{ required: true, message: 'Please input expression' }]}
        >
          <JsonEditor
            key={uniqueKey.current}
            value={form.getFieldValue('embeddings') || {}}
            onChange={(json: any) => {
              form.setFieldsValue({ embeddings: json });
            }}
            enableSort={false}
            enableTransform={false}
            mode="code"
            data-testid="vector-search-input"
          />
        </LitegraphFormItem>
      </Form>
    </LitegraphModal>
  );
};

export default SearchByVectorModal;
