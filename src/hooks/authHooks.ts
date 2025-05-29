import { useGetUser } from '@/lib/sdk/litegraph.service';
import { useAppDispatch } from '@/lib/store/hooks';
import {
  logOut,
  storeToken,
  storeTenant,
  storeUser,
  storeAdminAccessKey,
} from '@/lib/store/litegraph/actions';
import { TenantMetaData, Token } from 'litegraphdb/dist/types/types';

export const useFetchUserDetails = () => {
  const dispatch = useAppDispatch();
  const { fetchUser, isLoading, error } = useGetUser();

  const fetchUserDetails = async (userId: string, storeInRedux: boolean = true) => {
    const response = await fetchUser(userId);
    if (response?.GUID && storeInRedux) {
      dispatch(storeUser(response));
    }
  };
  return { fetchUserDetails, isLoading };
};

export const useCredentialsToLogin = () => {
  const dispatch = useAppDispatch();
  const loginWithCredentials = (token: Token, tenant: TenantMetaData) => {
    dispatch(storeToken(token));
    dispatch(storeTenant(tenant));
  };
  return loginWithCredentials;
};

export const useAdminCredentialsToLogin = () => {
  const dispatch = useAppDispatch();
  const loginWithAdminCredentials = (accessKey: string) => {
    dispatch(storeAdminAccessKey(accessKey));
  };
  return loginWithAdminCredentials;
};

export const useLogout = () => {
  const dispatch = useAppDispatch();

  const logOutFromSystem = (path?: string) => {
    dispatch(logOut(path));
  };
  return logOutFromSystem;
};
