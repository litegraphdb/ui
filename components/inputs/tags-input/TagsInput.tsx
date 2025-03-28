'use client';
import React from 'react';
import { Form, Input, Button } from 'antd';
import { CloseCircleFilled, PlusOutlined } from '@ant-design/icons';
import styles from './styles.module.scss';
interface TagsInputProps {
  value?: Array<{ key: string; value: string }>;
  onChange?: (values: Record<string, string>) => void;
  name: string;
}

const TagsInput: React.FC<TagsInputProps> = ({ value = [], onChange, name }) => {
  return (
    <Form.List name={name} initialValue={value}>
      {(fields, { add, remove }, { errors }) => (
        <>
          {fields.map((field, index) => (
            <Form.Item {...field} key={field.key} style={{ marginBottom: 8 }}>
              <Input.Group compact>
                <Form.Item
                  name={[field.name, 'key']}
                  noStyle
                  rules={[{ required: true, message: 'Key is required' }]}
                >
                  <Input style={{ width: '50%' }} placeholder="Enter key" />
                </Form.Item>
                <Form.Item
                  name={[field.name, 'value']}
                  noStyle
                  rules={[{ required: true, message: 'Value is required' }]}
                >
                  <Input
                    style={{ width: '50%' }}
                    placeholder="Enter value"
                    suffix={
                      <CloseCircleFilled
                        onClick={() => remove(field.name)}
                        className={styles.closeIcon}
                      />
                    }
                  />
                </Form.Item>
              </Input.Group>
            </Form.Item>
          ))}
          <Form.Item>
            <Button
              type="dashed"
              onClick={() => add()}
              icon={<PlusOutlined />}
              style={{ width: '100%' }}
            >
              Add Tag
            </Button>
            <Form.ErrorList errors={errors} />
          </Form.Item>
        </>
      )}
    </Form.List>
  );
};

export default TagsInput;
