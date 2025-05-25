import { createAction } from '@reduxjs/toolkit';
import { TenantType } from './types';
import TenantMetaData from 'litegraphdb/types/models/TenantMetaData';

export enum TenantsAction {
  STORE_TENANTS = 'STORE_TENANTS',
  STORE_SELECTED_TENANT = 'STORE_SELECTED_TENANT',
}
export const TenantActions = {
  TENANT_LISTS: 'TENANT_LISTS',
  CLEAR_TENANTS: 'CLEAR_TENANTS',
  CREATE_TENANT: 'CREATE_TENANT',
  UPDATE_TENANT: 'UPDATE_TENANT',
  DELETE_TENANT: 'DELETE_TENANT',
};

export const storeTenants = createAction<TenantMetaData[]>(TenantsAction.STORE_TENANTS);
export const tenantLists = createAction<TenantType[]>(TenantActions.TENANT_LISTS);
export const clearTenants = createAction(TenantActions.CLEAR_TENANTS);
export const createTenant = createAction<TenantType>(TenantActions.CREATE_TENANT);
export const updateTenant = createAction<TenantType>(TenantActions.UPDATE_TENANT);
export const deleteTenant = createAction<{ GUID: string }>(TenantActions.DELETE_TENANT);
