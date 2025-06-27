import React, { useEffect, useState } from 'react';
import { LogoutOutlined, ReloadOutlined } from '@ant-design/icons';
import { Layout } from 'antd';
import Navigation from '../navigation';
import LitegraphText from '../base/typograpghy/Text';
import { useLogout } from '@/hooks/authHooks';
import { useAppDispatch } from '@/lib/store/hooks';
import styles from './dashboard.module.scss';
import { MenuItemProps } from '../menu-item/types';
import LitegraphSelect from '../base/select/Select';
import { useSelectedGraph, useSelectedTenant } from '@/hooks/entityHooks';
import { clearNodes } from '@/lib/store/node/actions';
import { clearEdges } from '@/lib/store/edge/actions';
import { storeSelectedGraph, storeTenant } from '@/lib/store/litegraph/actions';
import { LayoutContext } from './context';
import { clearLabels } from '@/lib/store/label/actions';
import { clearTags } from '@/lib/store/tag/actions';
import { clearVectors } from '@/lib/store/vector/actions';
import { setTenant } from '@/lib/sdk/litegraph.service';
import { clearCredentials } from '@/lib/store/credential/actions';
import { clearUsers } from '@/lib/store/user/actions';
import { localStorageKeys } from '@/constants/constant';
import LitegraphFlex from '../base/flex/Flex';
import { TenantType } from '@/lib/store/tenants/types';
import { useGetAllGraphsQuery, useGetAllTenantsQuery } from '@/lib/store/slice/slice';
import { transformToOptions } from '@/lib/graph/utils';
import LoggedUserInfo from '../logged-in-user/LoggedUserInfo';
import sdkSlice from '@/lib/store/rtk/rtkSdkInstance';
import { SliceTags } from '@/lib/store/slice/types';

const { Header, Content } = Layout;

interface LayoutWrapperProps {
  children: React.ReactNode;
  menuItems: MenuItemProps[];
  noProfile?: boolean;
  useGraphsSelector?: boolean;
  useTenantSelector?: boolean;
  isAdmin?: boolean;
}

const DashboardLayout = ({
  children,
  menuItems,
  noProfile,
  useGraphsSelector,
  useTenantSelector,
  isAdmin,
}: LayoutWrapperProps) => {
  const [collapsed, setCollapsed] = useState(false);

  const dispatch = useAppDispatch();
  const selectedGraphRedux = useSelectedGraph();
  const selectedTenantRedux = useSelectedTenant();
  const {
    data: graphsList,
    isLoading: isGraphsLoading,
    error: graphError,
    refetch: fetchGraphsList,
  } = useGetAllGraphsQuery(undefined, { skip: !useGraphsSelector });
  const graphOptions = transformToOptions(graphsList);
  const {
    data: tenantsList = [],
    isLoading: isTenantsLoading,
    isError: tenantsError,
    refetch: fetchTenantsList,
  } = useGetAllTenantsQuery(undefined, { skip: !useTenantSelector });
  const tenantOptions = transformToOptions(tenantsList);

  useEffect(() => {
    if (!selectedGraphRedux && graphOptions?.length > 0) {
      dispatch(storeSelectedGraph({ graph: graphOptions[0].value }));
    }
  }, [selectedGraphRedux, graphOptions, dispatch]);

  useEffect(() => {
    if (!selectedTenantRedux && tenantsList?.length > 0) {
      localStorage.setItem(localStorageKeys.tenant, JSON.stringify(tenantsList[0]));
      setTenant(tenantsList[0].GUID);
      dispatch(storeTenant(tenantsList[0]));
    }
  }, [selectedTenantRedux, tenantsList, dispatch]);

  const handleGraphSelect = async (graphId: any) => {
    dispatch(clearNodes());
    dispatch(clearEdges());
    dispatch(clearLabels());
    dispatch(clearTags());
    dispatch(clearVectors());
    dispatch(storeSelectedGraph({ graph: graphId.toString() }));
  };

  const handleTenantSelect = async (tenantId: any) => {
    if (!useTenantSelector) return;
    dispatch(clearCredentials());
    dispatch(clearUsers());
    const tenant = tenantsList.find((tenant: TenantType) => tenant.GUID === tenantId);
    if (tenant) {
      localStorage.setItem(localStorageKeys.tenant, JSON.stringify(tenant));
      setTenant(tenant.GUID);
      dispatch(storeTenant(tenant));
      dispatch(sdkSlice.util.invalidateTags([SliceTags.USER, SliceTags.CREDENTIAL] as any));
    }
  };

  const logOutFromSystem = useLogout();

  return (
    <LayoutContext.Provider value={{ isGraphsLoading, graphError, refetchGraphs: fetchGraphsList }}>
      <Layout style={{ minHeight: '100vh' }}>
        <Navigation
          collapsed={collapsed}
          menuItems={menuItems}
          setCollapsed={setCollapsed}
          isAdmin={isAdmin}
        />
        <Layout>
          <Header className={styles.header}>
            <LitegraphFlex vertical justify="center">
              {useGraphsSelector && (
                <LitegraphFlex align="center" gap={8}>
                  <span>Graph:</span>
                  <LitegraphSelect
                    placeholder="Select a graph"
                    options={graphOptions}
                    value={selectedGraphRedux || undefined}
                    onChange={handleGraphSelect}
                    style={{ width: 200 }}
                    loading={isGraphsLoading}
                    data-testid="litegraph-select"
                  />
                </LitegraphFlex>
              )}
              {useTenantSelector && (
                <LitegraphFlex align="center" gap={8}>
                  <span>Tenant:</span>
                  {tenantsError ? (
                    <LitegraphText
                      fontSize={12}
                      className={'cursor-pointer'}
                      style={{ color: 'red' }}
                      onClick={() => fetchTenantsList()}
                    >
                      <ReloadOutlined /> Retry
                    </LitegraphText>
                  ) : (
                    <LitegraphSelect
                      loading={isTenantsLoading}
                      placeholder="Select a tenant"
                      options={tenantOptions}
                      value={selectedTenantRedux?.GUID || undefined}
                      onChange={handleTenantSelect}
                      style={{ width: 200 }}
                      disabled={!useTenantSelector}
                    />
                  )}
                </LitegraphFlex>
              )}
              {!useTenantSelector && !useGraphsSelector && <span></span>}
            </LitegraphFlex>

            <div className={styles.userSection}>
              {!noProfile ? (
                <LoggedUserInfo />
              ) : (
                <div
                  className={styles.logoutLink}
                  onClick={() => logOutFromSystem()}
                  role="button"
                  tabIndex={0}
                >
                  <LogoutOutlined className={styles.logoutIcon} />
                  <span>Logout</span>
                </div>
              )}
            </div>
          </Header>
          <Content
            style={{
              minHeight: 280,
              background: '#fff',
            }}
          >
            {children}
          </Content>
        </Layout>
      </Layout>
    </LayoutContext.Provider>
  );
};

export default DashboardLayout;
