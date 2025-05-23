'use client';
import React from 'react';
import { Form, Input } from 'antd';
import { localStorageKeys, paths } from '@/constants/constant';
import toast from 'react-hot-toast';
import { LightGraphTheme } from '@/theme/theme';
import LitegraphText from '@/components/base/typograpghy/Text';
import Link from 'next/link';
import styles from './adminLoginPage.module.scss';
import LitegraphParagraph from '@/components/base/typograpghy/Paragraph';
import LitegraphTitle from '@/components/base/typograpghy/Title';
import { setAccessKey, useGetTenants } from '@/lib/sdk/litegraph.service';
import { useAdminCredentialsToLogin } from '@/hooks/authHooks';
import { useAppDispatch } from '@/lib/store/hooks';
import { storeTenant } from '@/lib/store/litegraph/actions';
import LitegraphButton from '@/components/base/button/Button';
import LitegraphFlex from '@/components/base/flex/Flex';
import classNames from 'classnames';

interface AdminLoginFormData {
  accessKey: string;
}

const AdminLoginPage = () => {
  const dispatch = useAppDispatch();
  const [form] = Form.useForm();
  const { getTenants, isLoading } = useGetTenants();
  const loginWithAdminCredentials = useAdminCredentialsToLogin();

  const handleSubmit = async (values: AdminLoginFormData) => {
    try {
      setAccessKey(values.accessKey);
      const data = await getTenants('Login failed. Please try again.');
      if (data) {
        localStorage.setItem(localStorageKeys.adminAccessKey, values.accessKey);
        loginWithAdminCredentials(values.accessKey);
        dispatch(storeTenant(data[0]));
      }
    } catch (error) {
      toast.error('Login failed. Please try again.');
    }
  };

  return (
    <div className={styles.adminLoginPage}>
      <LitegraphFlex
        className={classNames(styles.adminLoginPageHeader, 'mb pb pt mr ml')}
        align="center"
        justify="space-between"
      >
        <img src="/favicon.png" alt="Litegraph Logo" height={40} />
        <Link href={paths.login}>
          <LitegraphText color={LightGraphTheme.primary}>Login as user</LitegraphText>
        </Link>
      </LitegraphFlex>
      <div className={classNames(styles.loginTitle, 'mt')}>
        <LitegraphTitle fontSize={22} weight={600}>
          Administrator Login
        </LitegraphTitle>
        <LitegraphParagraph color={LightGraphTheme.subHeadingColor}>
          Supply the bearer token for the administrator, which can be found in the LiteGraph
          settings file.
        </LitegraphParagraph>
      </div>
      <div className={styles.loginBox}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              form.submit();
            }
          }}
        >
          <Form.Item
            label="Access Key"
            name="accessKey"
            rules={[{ required: true, message: 'Please input your access key!' }]}
          >
            <Input.Password
              placeholder="Enter your access key"
              onPressEnter={() => form.submit()}
            />
          </Form.Item>

          <Form.Item>
            <LitegraphButton
              type="primary"
              htmlType="submit"
              className="w-100"
              loading={isLoading}
              disabled={isLoading}
            >
              Login
            </LitegraphButton>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default AdminLoginPage;
