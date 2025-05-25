'use client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { adminDashboardRoutes } from '@/constants/sidebar';
import { withAdminAuth } from '@/hoc/hoc';

const RootLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  return (
    <DashboardLayout menuItems={adminDashboardRoutes} noProfile={true} useTenantSelector={true}>
      {children}
    </DashboardLayout>
  );
};

export default withAdminAuth(RootLayout);
