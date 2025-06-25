import { UnknownAction, combineReducers } from '@reduxjs/toolkit';
import liteGraphReducer from './litegraph/reducer';
import { rtkQueryErrorLogger } from './rtkApiMiddlewear';
import { localStorageKeys, paths } from '@/constants/constant';
import graphReducer from './graph/reducer';
import nodeReducer from './node/reducer';
import edgeReducer from './edge/reducer';
import { LitegraphAction } from './litegraph/actions';
import tenantsReducer from './tenants/reducers';
import tagReducer from './tag/reducer';
import labelReducer from './label/reducer';
import credentialReducer from './credential/reducer';
import userReducer from './user/reducer';
import { tenantLists } from './tenants/actions';
import vectorReducer from './vector/reducer';
import backupReducer from './backup/reducer';
import sdkSlice from './rtk/rtkSdkInstance';
const rootReducer = combineReducers({
  [sdkSlice.reducerPath]: sdkSlice.reducer,
  liteGraph: liteGraphReducer,
  graphsList: graphReducer,
  nodesList: nodeReducer,
  edgesList: edgeReducer,
  tenants: tenantsReducer,
  tagsList: tagReducer,
  vectorsList: vectorReducer,
  labelsList: labelReducer,
  credentialsList: credentialReducer,
  usersList: userReducer,
  tenantsList: tenantsReducer,
  backupsList: backupReducer,
});

export const apiMiddleWares = [rtkQueryErrorLogger, sdkSlice.middleware];

export const handleLogout = (path?: string) => {
  localStorage.removeItem(localStorageKeys.token);
  localStorage.removeItem(localStorageKeys.tenant);
  localStorage.removeItem(localStorageKeys.user);
  localStorage.removeItem(localStorageKeys.adminAccessKey);
  localStorage.removeItem(localStorageKeys.serverUrl);
  window.location.href = path ? path : paths.login;
};

const resettableRootReducer = (
  state: ReturnType<typeof rootReducer> | undefined,
  action: UnknownAction
) => {
  if (action.type === LitegraphAction.LOG_OUT) {
    handleLogout(action.payload as any);
  }
  return rootReducer(state, action);
};

export default resettableRootReducer;
