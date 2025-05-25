import { MenuProps } from 'antd';
import { paths } from './constant';
import {
  HomeOutlined,
  ShareAltOutlined,
  NodeIndexOutlined,
  ApiOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CrownOutlined,
  TeamOutlined,
  TagsOutlined,
  KeyOutlined,
} from '@ant-design/icons';
import { MenuItemProps } from '@/components/menu-item/types';

export const tenantDashboardRoutes: MenuItemProps[] = [
  {
    key: '/',
    icon: <HomeOutlined />,
    label: 'Home',
    path: paths.dashboardHome,
  },
  {
    key: '/graphs',
    icon: <ShareAltOutlined />,
    label: 'Graphs',
    path: paths.graphs,
  },

  {
    key: '/nodes',
    icon: <NodeIndexOutlined />,
    label: 'Nodes',
    path: paths.nodes,
  },
  {
    key: '/edges',
    icon: <ApiOutlined />,
    label: 'Edges',
    path: paths.edges,
  },
  {
    key: '/labels',
    icon: <TagsOutlined />,
    label: 'Labels',
    path: paths.labels,
  },
  {
    key: '/tags',
    icon: <TagsOutlined />,
    label: 'Tags',
    path: paths.tags,
  },
  {
    key: '/vectors',
    icon: <TagsOutlined />,
    label: 'Vectors',
    path: paths.vectors,
  },
];

export const adminDashboardRoutes: MenuItemProps[] = [
  {
    key: '/',
    icon: <HomeOutlined />,
    label: 'Tenant',
    path: paths.adminDashboard,
  },
  // {
  //   key: '/tenants',
  //   icon: <CrownOutlined />,
  //   label: 'Tenant',
  //   path: paths.tenants,
  // },
  {
    key: '/users',
    icon: <TeamOutlined />,
    label: 'Users',
    path: paths.users,
  },
  {
    key: '/credentials',
    icon: <KeyOutlined />,
    label: 'Credentials',
    path: paths.credentials,
  },
];
