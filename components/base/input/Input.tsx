import React from 'react';
import { Input } from 'antd';
import { InputProps } from 'antd/es/input';

const LitegraphInput = (props: InputProps) => {
  const { ...rest } = props;
  return <Input {...rest} />;
};

export default LitegraphInput;
