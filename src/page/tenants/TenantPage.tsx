'use client';
import React, { useState } from 'react';
import { PlusSquareOutlined } from '@ant-design/icons';
import PageContainer from '@/components/base/pageContainer/PageContainer';
import LitegraphButton from '@/components/base/button/Button';
import LitegraphTable from '@/components/base/table/Table';
import { TenantType } from '@/lib/store/tenants/types';
import AddEditTenant from './components/AddEditTenant';
import DeleteTenant from './components/DeleteTenant';
import { tableColumns } from './constant';
import FallBack from '@/components/base/fallback/FallBack';
import { usePagination } from '@/hooks/appHooks';
import { useEnumerateTenantQuery } from '@/lib/store/slice/slice';
import { tablePaginationConfig } from '@/constants/pagination';

const TenantPage = () => {
  const [selectedTenant, setSelectedTenant] = useState<TenantType | null>(null);
  const [isAddEditTenantVisible, setIsAddEditTenantVisible] = useState<boolean>(false);
  const [isDeleteModelVisible, setIsDeleteModelVisible] = useState<boolean>(false);
  const { page, pageSize, skip, handlePageChange } = usePagination();
  const {
    data,
    refetch: fetchTenantsList,
    isLoading: isTenantsLoading,
    error,
  } = useEnumerateTenantQuery({
    maxKeys: pageSize,
    skip: skip,
  });
  const tenantsList = data?.Objects || [];

  const handleCreateTenant = () => {
    setSelectedTenant(null);
    setIsAddEditTenantVisible(true);
  };

  const handleEditTenant = (data: TenantType) => {
    setSelectedTenant(data);
    setIsAddEditTenantVisible(true);
  };

  const handleDeleteTenant = (data: TenantType) => {
    setSelectedTenant(data);
    setIsDeleteModelVisible(true);
  };

  return (
    <PageContainer
      id="tenants"
      pageTitle="Tenants"
      pageTitleRightContent={
        <LitegraphButton
          type="link"
          icon={<PlusSquareOutlined />}
          onClick={handleCreateTenant}
          weight={500}
        >
          Create Tenant
        </LitegraphButton>
      }
    >
      {error ? (
        <FallBack retry={fetchTenantsList}>Something went wrong.</FallBack>
      ) : (
        <LitegraphTable
          loading={isTenantsLoading}
          columns={tableColumns(handleEditTenant, handleDeleteTenant)}
          dataSource={tenantsList}
          rowKey={'GUID'}
          pagination={{
            ...tablePaginationConfig,
            total: data?.TotalRecords,
            pageSize: pageSize,
            current: page,
            onChange: handlePageChange,
          }}
        />
      )}

      {isAddEditTenantVisible && (
        <AddEditTenant
          isAddEditTenantVisible={isAddEditTenantVisible}
          setIsAddEditTenantVisible={setIsAddEditTenantVisible}
          tenant={selectedTenant || null}
        />
      )}

      {isDeleteModelVisible && selectedTenant && (
        <DeleteTenant
          title={`Are you sure you want to delete "${selectedTenant.Name}" tenant?`}
          paragraphText={'This action will delete tenant.'}
          isDeleteModelVisible={isDeleteModelVisible}
          setIsDeleteModelVisible={setIsDeleteModelVisible}
          selectedTenant={selectedTenant}
          setSelectedTenant={setSelectedTenant}
        />
      )}
    </PageContainer>
  );
};

export default TenantPage;
