'use client';
import { useEffect, useState } from 'react';
import { Form, Input } from 'antd';
import styles from './login.module.scss';
import LitegraphInput from '@/components/base/input/Input';
import LitegraphSelect from '@/components/base/select/Select';
import LitegraphTitle from '@/components/base/typograpghy/Title';
import LitegraphParagraph from '@/components/base/typograpghy/Paragraph';
import LitegraphButton from '@/components/base/button/Button';
import { LightGraphTheme } from '@/theme/theme';
import LitegraphText from '@/components/base/typograpghy/Text';
import Link from 'next/link';
import {
  useGenerateToken,
  useGetTenants,
  useGetTenantsForEmail,
} from '@/lib/sdk/litegraph.service';

import { useCredentialsToLogin } from '@/hooks/authHooks';
import { useAppSelector } from '@/lib/store/hooks';
import { RootState } from '@/lib/store/store';
import { localStorageKeys, paths } from '@/constants/constant';

interface LoginFormData {
  email: string;
  tenant: string;
  username: string;
  password: string;
}

const LoginPage = () => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [formData, setFormData] = useState<Partial<LoginFormData>>({});
  const [form] = Form.useForm();
  const { generateToken, isLoading: isGeneratingToken } = useGenerateToken();
  const loginWithCredentials = useCredentialsToLogin();
  const { getTenantsForEmail, isLoading: isLoadingTenant } = useGetTenantsForEmail();
  const tenants = useAppSelector((state: RootState) => state.tenants.tenantsList);

  const tenantOptions =
    tenants?.map((tenant) => ({
      label: tenant.Name,
      value: tenant.GUID,
    })) || [];

  const handleNext = async () => {
    try {
      const values = await form.validateFields();
      setFormData((prev) => ({ ...prev, ...values }));
      switch (currentStep) {
        case 0:
          if (values.email) {
            setCurrentStep(1);
            getTenantsForEmail(values.email)
              .then((res) => {
                if (res) {
                  if (res.length > 1) {
                    setCurrentStep(1);
                  } else {
                    setFormData((prev) => ({ ...prev, tenant: res[0].GUID }));
                    form.setFieldValue('tenant', res[0].GUID);
                    setCurrentStep(2);
                  }
                } else {
                  setCurrentStep(0);
                }
              })
              .catch((err) => {
                setCurrentStep(0);
              });
          }
          break;
        case 1:
          setCurrentStep(2);
          break;

        default:
          break;
      }
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const finalData: LoginFormData = { ...formData, ...values };
      const token = await generateToken(finalData.email, finalData.password, finalData.tenant);
      const selectedTenant = tenants?.find((t) => t.GUID === finalData.tenant);

      if (token && selectedTenant) {
        localStorage.setItem(localStorageKeys.token, JSON.stringify(token));
        localStorage.setItem(localStorageKeys.tenant, JSON.stringify(selectedTenant));
        loginWithCredentials(token, selectedTenant);
      }
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' },
            ]}
          >
            <LitegraphInput placeholder="Email" size="large" />
          </Form.Item>
        );
      case 1:
        return (
          <Form.Item
            name="tenant"
            label="Tenants"
            rules={[{ required: true, message: 'Please select a tenant!' }]}
          >
            <LitegraphSelect
              loading={isLoadingTenant}
              disabled={isLoadingTenant}
              placeholder="Select tenant"
              options={tenantOptions}
              size="large"
            />
          </Form.Item>
        );
      case 2:
        return (
          <>
            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Please input your password!' }]}
            >
              <Input.Password placeholder="Password" size="large" />
            </Form.Item>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className={'h-screen pl-8 pr-8'}>
      <div className="mb-12 flex items-center justify-between border-b border-gray-300 pb-4 pt-4">
        <img src="/favicon.png" alt="Litegraph Logo" className="h-8" />
        <Link href={paths.adminLogin}>
          <LitegraphText color={LightGraphTheme.primary}>Login as Administrator</LitegraphText>
        </Link>
      </div>
      <div className={styles.loginTitle}>
        <LitegraphTitle fontSize={22} weight={600}>
          Login
        </LitegraphTitle>
        <LitegraphParagraph color={LightGraphTheme.subHeadingColor}>
          Please enter your email and password to login
        </LitegraphParagraph>
      </div>
      <div className={styles.loginBox}>
        <Form form={form} layout="vertical" initialValues={formData}>
          {renderStep()}

          <div className={styles.loginButtonContainer}>
            {currentStep > 0 && (
              <LitegraphButton className={styles.backButton} onClick={handleBack}>
                Back
              </LitegraphButton>
            )}
            <LitegraphButton
              type="primary"
              htmlType={currentStep === 2 ? 'submit' : 'button'}
              loading={isGeneratingToken || isLoadingTenant}
              className={styles.loginButton}
              onClick={currentStep === 2 ? handleSubmit : handleNext}
            >
              {isLoadingTenant ? 'Loading...' : currentStep === 2 ? 'Login' : 'Next'}
            </LitegraphButton>
          </div>
        </Form>
      </div>
      <div className={styles.stepIndicatorContainer}>
        {[0, 1, 2].map((step) => (
          <div
            key={step}
            className={styles.stepIndicator}
            style={{
              backgroundColor: currentStep === step ? LightGraphTheme.primary : '#d9d9d9',
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default LoginPage;
