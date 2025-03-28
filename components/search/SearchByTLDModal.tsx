'use client';
import { useEffect, useRef, useState } from 'react';
import { Form } from 'antd';
import LitegraphModal from '@/components/base/modal/Modal';
import LabelInput from '../inputs/label-input/LabelInput';
import TagsInput from '../inputs/tags-input/TagsInput';
import LitegraphFormItem from '@/components/base/form/FormItem';
import { JsonEditor } from 'jsoneditor-react';
import { v4 } from 'uuid';
import { initialSearchData, validateAtLeastOne } from './constants';
import { SearchData } from './type';
import LitegraphText from '../base/typograpghy/Text';
import { LightGraphTheme } from '@/theme/theme';

interface SearchModalProps {
  isSearchModalVisible: boolean;
  setIsSearchModalVisible: (visible: boolean) => void;
  onSearch: (values: SearchData) => void;
  onClose?: () => void;
}

const SearchByTLDModal = ({
  isSearchModalVisible,
  setIsSearchModalVisible,
  onSearch,
  onClose,
}: SearchModalProps) => {
  const [form] = Form.useForm<SearchData>();
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
        expr: values.expr || {},
        tags: values.tags || {},
        labels: values.labels || [],
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
      title="Search"
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
        initialValues={initialSearchData}
        form={form}
        layout="vertical"
        onValuesChange={(_, values) => setFormValues(values)}
      >
        <Form.Item label="Labels" rules={[{ validator: validateAtLeastOne(form) }]}>
          <LabelInput name="labels" />
        </Form.Item>
        <Form.Item label="Tags" rules={[{ validator: validateAtLeastOne(form) }]}>
          <TagsInput name="tags" />
        </Form.Item>
        <LitegraphFormItem
          label="Expression"
          name="expr"
          rules={[{ validator: validateAtLeastOne(form) }]}
          extra={
            <>
              <LitegraphText color={LightGraphTheme.subHeadingColor}>
                Example:{' '}
                {`
              {
                "Left": "Key",
                "Operator": "Equals",
                "Right": "Value"
              }
              `}
              </LitegraphText>
            </>
          }
        >
          <JsonEditor
            key={uniqueKey.current}
            value={form.getFieldValue('expr')}
            onChange={(json: any) => {
              form.setFieldsValue({ expr: json });
            }}
            enableSort={false}
            enableTransform={false}
            mode="code"
            data-testid="node-data-input"
          />
        </LitegraphFormItem>
      </Form>
    </LitegraphModal>
  );
};

export default SearchByTLDModal;
