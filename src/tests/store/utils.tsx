import DashboardLayout from '@/components/layout/DashboardLayout';
import { adminDashboardRoutes, tenantDashboardRoutes } from '@/constants/sidebar';
import resettableRootReducer from '@/lib/store/rootReducer';
import sdkSlice from '@/lib/store/rtk/rtkSdkInstance';
import { RootState } from '@/lib/store/store';
import { StyleProvider } from '@ant-design/cssinjs';
import { configureStore } from '@reduxjs/toolkit';
import { render } from '@testing-library/react';
import { Toaster } from 'react-hot-toast';
import { Provider } from 'react-redux';

export const renderWithRedux = (
  ui: React.ReactNode,
  reduxState?: RootState,
  useGraphsSelector?: boolean,
  useTenantSelector?: boolean
) => {
  const reduxStore = reduxState
    ? configureStore({
        reducer: resettableRootReducer,
        preloadedState: reduxState as RootState,
        middleware: (gDM: any) =>
          gDM({
            serializableCheck: false,
          }).concat([sdkSlice.middleware]),
      })
    : configureStore({
        reducer: resettableRootReducer,
        middleware: (gDM: any) =>
          gDM({
            serializableCheck: false,
          }).concat([sdkSlice.middleware]),
      });
  return render(
    <Provider store={reduxStore}>
      <DashboardLayout
        menuItems={useGraphsSelector ? tenantDashboardRoutes : adminDashboardRoutes}
        useGraphsSelector={useGraphsSelector}
        useTenantSelector={useTenantSelector}
      >
        {ui}
      </DashboardLayout>
    </Provider>
  );
};
