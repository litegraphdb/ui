import { createApi } from '@reduxjs/toolkit/query/react';

import { BaseQueryFn } from '@reduxjs/toolkit/query';
import { keepUnusedDataFor } from '@/constants/constant';

export interface SdkBaseQueryArgs {
  callback: () => Promise<any>;
}

export const sdkBaseQuery: BaseQueryFn<SdkBaseQueryArgs, unknown, unknown> = async ({
  callback,
}: {
  callback: <T>() => Promise<T>;
}) => {
  try {
    const result = await callback();
    return { data: result };
  } catch (error) {
    return { error };
  }
};

const sdkSlice = createApi({
  reducerPath: 'sdk',
  baseQuery: sdkBaseQuery,
  tagTypes: [],
  endpoints: () => ({}),
  keepUnusedDataFor: keepUnusedDataFor,
});

export default sdkSlice;
