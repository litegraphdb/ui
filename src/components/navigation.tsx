'use client';
import { Button, Layout } from 'antd';
import LitegraphFlex from './base/flex/Flex';
import MenuItems from './menu-item/MenuItems';
import { MenuItemProps } from './menu-item/types';
import { DoubleLeftOutlined, DoubleRightOutlined } from '@ant-design/icons';
import Image from 'next/image';
import LitegraphTitle from './base/typograpghy/Title';
import styles from './layout/nav.module.scss';

const { Sider } = Layout;

const Navigation = ({
  collapsed,
  menuItems,
  setCollapsed,
}: {
  collapsed: boolean;
  menuItems: MenuItemProps[];
  setCollapsed: (collapsed: boolean) => void;
}) => {
  const liteGraphConnected = true;
  return (
    <Sider
      theme="light"
      width={170}
      trigger={null}
      collapsible
      collapsed={collapsed}
      collapsedWidth={60}
      className={styles.sidebarContainer}
    >
      <LitegraphFlex justify="center" gap={8} align="center" className={styles.logoContainer}>
        {collapsed ? (
          <Image src={'/favicon.png'} alt="Litegraph logo" width={30} height={30} />
        ) : (
          <>
            <Image src={'/favicon.png'} alt="Litegraph logo" width={30} height={30} />
            <LitegraphTitle level={4} className="mt-xs" weight={600}>
              LiteGraph
            </LitegraphTitle>
          </>
        )}
      </LitegraphFlex>
      <LitegraphFlex justify="flex-end" className="pl-sm pr-sm pt-sm">
        <Button
          type="link"
          icon={collapsed ? <DoubleRightOutlined /> : <DoubleLeftOutlined />}
          onClick={() => setCollapsed(!collapsed)}
          style={{
            fontSize: '16px',
            top: '150',
            right: '8%',
          }}
        />
      </LitegraphFlex>
      <MenuItems menuItems={menuItems} />
    </Sider>
  );
};

export default Navigation;
