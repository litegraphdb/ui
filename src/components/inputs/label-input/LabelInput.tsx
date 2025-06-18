'use client';
import React from 'react';
import { Form, Input, Button, Select } from 'antd';
import { CloseCircleFilled, PlusOutlined } from '@ant-design/icons';
import styles from './styles.module.scss';
import LitegraphText from '@/components/base/typograpghy/Text';
import LitegraphFormItem from '@/components/base/form/FormItem';
import LitegraphSelect from '@/components/base/select/Select';

interface LabelInputProps {
  value?: string[];
  onChange?: (values: string[]) => void;
  placeholder?: string;
  name: string;
  readonly?: boolean;
  className?: string;
}

const LabelInput: React.FC<LabelInputProps> = ({
  value = [],
  onChange,
  placeholder = 'Enter label',
  name,
  readonly,
  className,
}) => {
  return (
    <LitegraphFormItem label="Labels" name={name} className={className}>
      <LitegraphSelect
        variant={readonly ? 'borderless' : 'outlined'}
        readonly={readonly}
        mode="tags"
        style={{ width: '100%' }}
        placeholder={readonly ? 'N/A' : 'Enter labels, separated by commas'}
        tokenSeparators={[',']}
        open={false}
        // value={labels}
        // onChange={handleChange}
      />
    </LitegraphFormItem>
  );
  return (
    <Form.List name={name} initialValue={value}>
      {(fields, { add, remove }, { errors }) => (
        <>
          {fields?.length > 0
            ? fields.map((field, index) => (
                <Form.Item {...field} key={field.key} style={{ marginBottom: 8 }}>
                  <Input
                    placeholder={placeholder}
                    readOnly={readonly}
                    variant={readonly ? 'borderless' : 'outlined'}
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
              ))
            : readonly && <LitegraphText>N/A</LitegraphText>}
          {!readonly && (
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
          )}
        </>
      )}
    </Form.List>
  );
};

export default LabelInput;
