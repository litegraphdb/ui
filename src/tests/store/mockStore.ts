import { RootState } from '@/lib/store/store';
import { configureStore } from '@reduxjs/toolkit';
import sdkSlice from '@/lib/store/rtk/rtkSdkInstance';
import { mockTenantData } from '../pages/mockData';

export const createMockStore = () => {
  const initialState = {
    [sdkSlice.reducerPath]: sdkSlice.reducer as any,
    liteGraph: {
      selectedGraph: 'mock-graph-id',
      tenant: mockTenantData[0],
      token: null,
      adminAccessKey: 'adminAccessKey',
      user: null,
    },
  } as RootState;

  return configureStore({
    reducer: (state = initialState) => state,
    preloadedState: initialState,

    middleware: (gDM: any) =>
      gDM({
        serializableCheck: false,
      }).concat([sdkSlice.middleware]),
  });
};
