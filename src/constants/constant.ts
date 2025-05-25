export const localStorageKeys = {
  tenant: 'tenant',
  token: 'token',
  adminAccessKey: 'adminAccessKey',
  user: 'user',
};

export const dynamicSlugs = {
  tenantId: ':tenantId',
};
export const paths = {
  login: `/login`,
  dashboardHome: `/dashboard/${dynamicSlugs.tenantId}`,
  graphs: `/dashboard/${dynamicSlugs.tenantId}/graphs`,
  nodes: `/dashboard/${dynamicSlugs.tenantId}/nodes`,
  edges: `/dashboard/${dynamicSlugs.tenantId}/edges`,
  tags: `/dashboard/${dynamicSlugs.tenantId}/tags`,
  vectors: `/dashboard/${dynamicSlugs.tenantId}/vectors`,
  labels: `/dashboard/${dynamicSlugs.tenantId}/labels`,
  adminLogin: `/login/admin`,
  adminDashboard: `/admin/dashboard`,
  credentials: `/admin/dashboard/credentials`,
  users: `/admin/dashboard/users`,
  tenants: `/admin/dashboard/tenants`,

};
