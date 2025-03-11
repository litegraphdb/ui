import DashboardLayout from '@/components/layout/DashboardLayout';
import { adminDashboardRoutes, tenantDashboardRoutes } from '@/constants/sidebar';
import resettableRootReducer from '@/lib/store/rootReducer';
import { RootState } from '@/lib/store/store';
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
      })
    : configureStore({
        reducer: resettableRootReducer,
      });
  return render(
    <Provider store={reduxStore}>
      <Toaster />
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
