import { FormInstance } from 'antd';
import { SearchData } from './type';

export const initialSearchData = {
  expr: null,
  tags: [],
  labels: [],
};

export const initialSearchByVectorData = {
  embeddings: [],
};

export const validateAtLeastOne = (form: FormInstance<SearchData>) => (_: any, value: any) => {
  const { expr, tags, labels } = form.getFieldsValue();
  console.log({ expr, tags, labels }, 'chk value');
  if (Object.keys(expr || {}).length > 0 || tags?.length > 0 || labels?.length > 0) {
    return Promise.resolve();
  }
  return Promise.reject(new Error('At least one field is required.'));
};
