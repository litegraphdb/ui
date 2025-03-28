'use client';
import React from 'react';
import { Form, Input, Button } from 'antd';
import { CloseCircleFilled, PlusOutlined } from '@ant-design/icons';
import styles from './styles.module.scss';

interface LabelInputProps {
  value?: string[];
  onChange?: (values: string[]) => void;
  placeholder?: string;
  name: string;
}

const LabelInput: React.FC<LabelInputProps> = ({
  value = [],
  onChange,
  placeholder = 'Enter label',
  name,
}) => {
  return (
    <Form.List name={name} initialValue={value}>
      {(fields, { add, remove }, { errors }) => (
        <>
          {fields.map((field, index) => (
            <Form.Item {...field} key={field.key} style={{ marginBottom: 8 }}>
              <Input
                placeholder={placeholder}
                suffix={
                  value ? (
                    <CloseCircleFilled
                      onClick={() => remove(field.name)}
                      className={styles.closeIcon}
                    />
                  ) : null
                }
              />
            </Form.Item>
          ))}
          <Form.Item>
            <Button
              type="dashed"
              onClick={() => add()}
              icon={<PlusOutlined />}
              style={{ width: '100%' }}
            >
              Add Label
            </Button>
            <Form.ErrorList errors={errors} />
          </Form.Item>
        </>
      )}
    </Form.List>
  );
};

export default LabelInput;
