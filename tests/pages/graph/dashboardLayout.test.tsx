import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { mockTenantData, mockUserData } from '../mockData';

jest.mock('@/hooks/entityHooks', () => ({
  useSelectedTenant: jest.fn(() => null),
  useSelectedGraph: jest.fn(() => null),
  useCurrentTenant: jest.fn(() => ({
    GUID: mockTenantData[0].GUID,
    Name: mockTenantData[0].Name,
  })),
  useGraphs: () => ({
    graphOptions: [],
    isLoading: false,
    error: null,
    fetchGraphsList: jest.fn(),
  }),
  useTenantList: () => ({
    tenantOptions: mockTenantData.map((tenant) => ({
      label: tenant.Name,
      value: tenant.GUID,
    })),
    tenantsList: mockTenantData,
  }),
}));

describe('DashboardLayout', () => {
  const store = configureStore({
    reducer: (
      state = {
        liteGraph: {
          user: {
            FirstName: mockUserData[0].FirstName,
            LastName: mockUserData[0].LastName,
          },
        },
      }
    ) => state,
  });

  it('should display tenants in the tenant dropdown', async () => {
    const { container } = render(
      <Provider store={store}>
        <DashboardLayout
          menuItems={[]}
          useTenantSelector={true}
          noProfile={true}
          useGraphsSelector={false}
        >
          <div />
        </DashboardLayout>
      </Provider>
    );

    // Find and click the tenant dropdown
    const tenantDropdown = screen.getByRole('combobox');
    expect(tenantDropdown).toBeInTheDocument();

    fireEvent.mouseDown(tenantDropdown);

    // Wait for dropdown options to be visible and take snapshot
    await waitFor(() => {
      mockTenantData.forEach((tenant) => {
        const tenantOption = screen.getByText(tenant.Name);
        expect(tenantOption).toBeInTheDocument();
        expect(tenantOption).toBeVisible();
      });
    });

    // Take snapshots of both the dropdown and its options
    expect(tenantDropdown).toMatchSnapshot('tenant dropdown');
    const tenantOptions = mockTenantData.map((tenant) => screen.getByText(tenant.Name));
    tenantOptions.forEach((option) => {
      expect(option).toMatchSnapshot(`tenant option - ${option.textContent}`);
    });
  });
});
