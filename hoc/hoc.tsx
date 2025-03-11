import PageLoading from '@/components/base/loading/PageLoading';
import LogoutFallBack from '@/components/logout-fallback/LogoutFallBack';
import { paths } from '@/constants/constant';
import { useLogout } from '@/hooks/authHooks';
import { useAppDynamicNavigation } from '@/hooks/hooks';
import {
  setAccessKey,
  setAccessToken,
  setTenant,
  useGetTenants,
  useGetTokenDetails,
} from '@/lib/sdk/litegraph.service';
import { useAppSelector } from '@/lib/store/hooks';
import { RootState } from '@/lib/store/store';
import TenantMetaData from 'litegraphdb/types/models/TenantMetaData';
import Token from 'litegraphdb/types/models/Token';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export const withAuth = (WrappedComponent: React.ElementType) => {
  const WithAuth = (props: any) => {
    const token = useAppSelector((state: RootState) => state.liteGraph.token);
    const [hasValidAuth, setHasValidAuth] = useState<boolean | null>(null);
    const { fetchTokenDetails, isLoading: isFetchUserDetailsLoading, error } = useGetTokenDetails();
    const logout = useLogout();

    const authToken = token?.Token;

    useEffect(() => {
      if (authToken) {
        fetchTokenDetails(token.Token, true).then((response: Token | null) => {
          if (response?.User.GUID) {
            setHasValidAuth(true);
          } else {
            setHasValidAuth(false);
          }
        });
      } else {
        logout();
      }
      //eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return isFetchUserDetailsLoading ? (
      <PageLoading />
    ) : hasValidAuth ? (
      <WrappedComponent {...props} />
    ) : (
      <LogoutFallBack />
    );
  };
  return WithAuth;
};

export const withAdminAuth = (WrappedComponent: React.ElementType) => {
  const WithAuth = (props: any) => {
    const adminAccessKey = useAppSelector((state: RootState) => state.liteGraph.adminAccessKey);
    const [hasValidAuth, setHasValidAuth] = useState<boolean | null>(null);
    const logout = useLogout();
    const { getTenants, isLoading: isValidateConnectivityLoading } = useGetTenants();
    const [logoutMessage, setLogoutMessage] = useState<string>('');

    useEffect(() => {
      if (adminAccessKey) {
        setAccessKey(adminAccessKey);
        getTenants()
          .then((res: TenantMetaData[] | null) => {
            if (Boolean(res?.length)) {
              setHasValidAuth(true);
            } else if (res?.length === 0) {
              setLogoutMessage('No Tenant Found.');
              setHasValidAuth(false);
            } else {
              // logout();
            }
          })
          .catch(() => {
            // logout();
          });
      }
      //eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return isValidateConnectivityLoading ? (
      <PageLoading />
    ) : hasValidAuth ? (
      <WrappedComponent {...props} />
    ) : (
      <LogoutFallBack message={logoutMessage} logoutPath={paths.adminLogin} />
    );
  };
  return WithAuth;
};

export const forGuest = (WrappedComponent: React.ElementType) => {
  const ForGuest = (props: any) => {
    const token = useAppSelector((state: RootState) => state.liteGraph.token);
    const adminAccessKey = useAppSelector((state: RootState) => state.liteGraph.adminAccessKey);
    const tenant = useAppSelector((state: RootState) => state.liteGraph.tenant);
    const { serializePath } = useAppDynamicNavigation();
    const router = useRouter();
    useEffect(() => {
      if (token?.Token && tenant?.GUID) {
        setAccessToken(token.Token);
        setTenant(tenant.GUID);
        router.push(serializePath(paths.dashboardHome));
      }
      if (adminAccessKey) {
        setAccessKey(adminAccessKey);
        tenant?.GUID && setTenant(tenant.GUID);
        router.push(serializePath(paths.adminDashboard));
      }
      //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [adminAccessKey, token, tenant]);

    return !token?.Token && !adminAccessKey ? <WrappedComponent {...props} /> : null;
  };
  return ForGuest;
};
