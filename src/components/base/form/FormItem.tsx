import { Form, FormItemProps } from 'antd';
import React from 'react';
const LitegraphFormItem = (props: FormItemProps) => {
  const { className, ...rest } = props;
  return <Form.Item {...rest}></Form.Item>;
};

export default LitegraphFormItem;
