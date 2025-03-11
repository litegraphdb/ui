import React, { useState } from 'react';
import { LogoutOutlined } from '@ant-design/icons';
import { Layout } from 'antd';
import Navigation from '../navigation';
import LitegraphText from '../base/typograpghy/Text';
import { useLogout } from '@/hooks/authHooks';
import { RootState } from '@/lib/store/store';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import styles from './dashboard.module.scss';
import { MenuItemProps } from '../menu-item/types';
import LitegraphSelect from '../base/select/Select';
import { useGraphs, useSelectedGraph, useSelectedTenant, useTenantList } from '@/hooks/entityHooks';
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

const { Header, Content } = Layout;

interface LayoutWrapperProps {
  children: React.ReactNode;
  menuItems: MenuItemProps[];
  noProfile?: boolean;
  useGraphsSelector?: boolean;
  useTenantSelector?: boolean;
}

const DashboardLayout = ({
  children,
  menuItems,
  noProfile,
  useGraphsSelector,
  useTenantSelector,
}: LayoutWrapperProps) => {
  const [collapsed, setCollapsed] = useState(false);

  const dispatch = useAppDispatch();
  const selectedGraphRedux = useSelectedGraph();
  const selectedTenantRedux = useSelectedTenant();
  const {
    graphOptions,
    isLoading: isGraphsLoading,
    error: graphError,
    fetchGraphsList,
  } = useGraphs(!useGraphsSelector);

  const { tenantOptions, tenantsList } = useTenantList();

  const handleGraphSelect = async (graphId: any) => {
    dispatch(clearNodes());
    dispatch(clearEdges());
    dispatch(clearLabels());
    dispatch(clearTags());
    dispatch(clearVectors());
    dispatch(storeSelectedGraph({ graph: graphId.toString() }));
  };

  const handleTenantSelect = async (tenantId: any) => {
    dispatch(clearCredentials());
    dispatch(clearUsers());
    const tenant = tenantsList.find((tenant: TenantType) => tenant.GUID === tenantId);
    if (tenant) {
      localStorage.setItem(localStorageKeys.tenant, JSON.stringify(tenant));
      setTenant(tenant.GUID);
      dispatch(storeTenant(tenant));
    }
  };

  const logOutFromSystem = useLogout();
  const FirstName = useAppSelector((state: RootState) => state.liteGraph.user?.FirstName);
  const LastName = useAppSelector((state: RootState) => state.liteGraph.user?.LastName);
  const userName = `${FirstName} ${LastName}`;

  return (
    <LayoutContext.Provider value={{ isGraphsLoading, graphError, refetchGraphs: fetchGraphsList }}>
      <Layout style={{ minHeight: '100vh' }}>
        <Navigation collapsed={collapsed} menuItems={menuItems} setCollapsed={setCollapsed} />
        <Layout>
          <Header className={styles.header}>
            <LitegraphFlex vertical justify="center">
              {useGraphsSelector && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                </div>
              )}
              {useTenantSelector && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>Tenant:</span>
                  <LitegraphSelect
                    placeholder="Select a tenant"
                    options={tenantOptions}
                    value={selectedTenantRedux?.GUID || undefined}
                    onChange={handleTenantSelect}
                    style={{ width: 200 }}
                  />
                </div>
              )}
            </LitegraphFlex>

            <div className={styles.userSection}>
              {!noProfile && (
                <LitegraphText className={styles.userName} strong weight={100}>
                  {userName}
                </LitegraphText>
              )}
              <div
                className={styles.logoutLink}
                onClick={() => logOutFromSystem()}
                role="button"
                tabIndex={0}
              >
                <LogoutOutlined className={styles.logoutIcon} />
                <span>Logout</span>
              </div>
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
