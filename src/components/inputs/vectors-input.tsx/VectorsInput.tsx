'use client';
import React, { useEffect, useState } from 'react';
import { Form, Button } from 'antd';
import { CloseCircleFilled, PlusOutlined } from '@ant-design/icons';
import LitegraphFormItem from '@/components/base/form/FormItem';
import LitegraphInput from '@/components/base/input/Input';
import { JsonEditor } from 'jsoneditor-react';
import { v4 } from 'uuid';
import styles from './styles.module.scss';
import LitegraphFlex from '@/components/base/flex/Flex';

interface VectorsInputProps {
  value?: any[];
  onChange?: (values: any[]) => void;
  name: string;
  readonly?: boolean;
}

const VectorsInput: React.FC<VectorsInputProps> = ({ value = [], onChange, name, readonly }) => {
  const [uniqueKeys, setUniqueKeys] = useState<string[]>([]);
  const form = Form.useFormInstance();

  useEffect(() => {
    // Generate unique keys for each vector entry
    setUniqueKeys(value.map(() => v4()));
  }, [value.length]);

  return (
    <Form.List name={name} initialValue={value}>
      {(fields, { add, remove }, { errors }) => (
        <>
          {fields.map((field, index) => (
            <div key={field.key} className={styles.vectorInput}>
              {!readonly && (
                <CloseCircleFilled
                  onClick={() => remove(field.name)}
                  className={styles.closeIcon}
                />
              )}

              <LitegraphFlex gap={10}>
                <LitegraphFormItem
                  className="flex-1"
                  label="Model"
                  name={[field.name, 'Model']}
                  rules={[{ required: true, message: 'Please input Model!' }]}
                >
                  <LitegraphInput
                    placeholder="Enter Model"
                    readOnly={readonly}
                    variant={readonly ? 'borderless' : 'outlined'}
                  />
                </LitegraphFormItem>

                <LitegraphFormItem
                  className="flex-1"
                  label="Dimensionality"
                  name={[field.name, 'Dimensionality']}
                  rules={[{ required: true, message: 'Please input Dimensionality!' }]}
                >
                  <LitegraphInput
                    type="number"
                    placeholder="Enter Dimensionality"
                    readOnly={readonly}
                    variant={readonly ? 'borderless' : 'outlined'}
                  />
                </LitegraphFormItem>
              </LitegraphFlex>

              <LitegraphFormItem
                label="Content"
                name={[field.name, 'Content']}
                rules={[{ required: true, message: 'Please input Content!' }]}
              >
                <LitegraphInput
                  placeholder="Enter Content"
                  readOnly={readonly}
                  variant={readonly ? 'borderless' : 'outlined'}
                />
              </LitegraphFormItem>

              <LitegraphFormItem
                label="Vectors"
                name={[field.name, 'Vectors']}
                rules={[{ required: true, message: 'Please input Vectors!' }]}
              >
                <JsonEditor
                  key={uniqueKeys[index]}
                  value={form.getFieldValue([field.name, 'Vectors']) || []}
                  onChange={(json: any) => {
                    // Handle vector array changes
                    const vectors = form.getFieldValue([name, field.name, 'Vectors']);
                    form.setFieldValue([name, field.name, 'Vectors'], json);
                  }}
                  mode={readonly ? 'view' : 'code'}
                  enableSort={false}
                  enableTransform={false}
                  mainMenuBar={!readonly} // Hide the menu bar
                  statusBar={!readonly} // Hide the status bar
                  navigationBar={!readonly} // Hide the navigation bar
                />
              </LitegraphFormItem>
            </div>
          ))}

          {!readonly && (
            <Form.Item>
              <Button
                type="dashed"
                onClick={() => {
                  add({
                    Model: '',
                    Dimensionality: 0,
                    Content: '',
                    Vectors: [0.1, 0.2, 0.3],
                  });
                  setUniqueKeys([...uniqueKeys, v4()]);
                }}
                icon={<PlusOutlined />}
                style={{ width: '100%' }}
              >
                Add Vector
              </Button>
              <Form.ErrorList errors={errors} />
            </Form.Item>
          )}
        </>
      )}
    </Form.List>
  );
};

export default VectorsInput;
