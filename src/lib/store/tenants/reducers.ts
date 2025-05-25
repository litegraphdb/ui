import { ActionReducerMapBuilder, createReducer } from '@reduxjs/toolkit';
import { TenantType } from './types';
import {
  storeTenants,
  clearTenants,
  createTenant,
  deleteTenant,
  tenantLists,
  updateTenant,
} from './actions';

export type TenantsStore = {
  tenantsList: TenantType[] | null;
};

export const initialState: TenantsStore = {
  tenantsList: null,
};

const tenantsReducer = createReducer(
  initialState,
  (builder: ActionReducerMapBuilder<typeof initialState>) => {
    // Store tenants list
    builder
      .addCase(
        storeTenants,
        (state: typeof initialState, action: ReturnType<typeof storeTenants>) => {
          state.tenantsList = action.payload;
        }
      )
      .addCase(tenantLists, (state, action) => {
        state.tenantsList = action.payload;
      })
      .addCase(clearTenants, (state) => {
        state.tenantsList = null;
      })
      .addCase(createTenant, (state, action) => {
        state.tenantsList = [...(state.tenantsList || []), action.payload];
      })
      .addCase(updateTenant, (state, action) => {
        const updatedTenant = action.payload;
        state.tenantsList = (state.tenantsList || []).map((tenant: TenantType) =>
          tenant.GUID === updatedTenant.GUID ? updatedTenant : tenant
        );
      })
      .addCase(deleteTenant, (state, action) => {
        state.tenantsList = (state.tenantsList || []).filter(
          (tenant) => tenant.GUID !== action.payload.GUID
        );
      });
  }
);

export default tenantsReducer;
