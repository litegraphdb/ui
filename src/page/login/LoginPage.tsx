'use client';
import { useEffect, useRef, useState } from 'react';
import { Form, Input, InputRef } from 'antd';
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
  setEndpoint,
  useGenerateToken,
  useGetTenantsForEmail,
  useValidateConnectivity,
} from '@/lib/sdk/litegraph.service';

import { useCredentialsToLogin } from '@/hooks/authHooks';
import { useAppSelector } from '@/lib/store/hooks';
import { RootState } from '@/lib/store/store';
import { localStorageKeys, paths } from '@/constants/constant';
import LitegraphFlex from '@/components/base/flex/Flex';
import classNames from 'classnames';
interface LoginFormData {
  url: string;
  email: string;
  tenant: string;
  username: string;
  password: string;
}

const LoginPage = () => {
  const emailInputRef = useRef<InputRef | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [formData, setFormData] = useState<Partial<LoginFormData>>({});
  const [isServerValid, setIsServerValid] = useState<boolean>(false);
  const [form] = Form.useForm();
  const { generateToken, isLoading: isGeneratingToken } = useGenerateToken();
  const loginWithCredentials = useCredentialsToLogin();
  const { getTenantsForEmail, isLoading: isLoadingTenant } = useGetTenantsForEmail();
  const tenants = useAppSelector((state: RootState) => state.tenants.tenantsList);
  const { validateConnectivity, isLoading: isValidatingConnectivity } = useValidateConnectivity();

  const tenantOptions =
    tenants?.map((tenant) => ({
      label: tenant.Name,
      value: tenant.GUID,
    })) || [];

  const handleNext = async () => {
    console.log('handleNext');
    try {
      const values = await form.validateFields();
      setFormData((prev) => ({ ...prev, ...values }));
      switch (currentStep) {
        case 0:
          setEndpoint(values.url);
          const isValid = await validateConnectivity();
          if (isValid) {
            setIsServerValid(true);
            setFormData((prev) => ({ ...prev, ...values }));
            setCurrentStep(1);
          }
          break;
        case 1:
          setFormData((prev) => ({ ...prev, ...values }));
          if (values.email) {
            setCurrentStep(1);
            getTenantsForEmail(values.email)
              .then((res) => {
                if (res) {
                  if (res && res.length > 1) {
                    setCurrentStep(2);
                  } else if (res?.length === 1) {
                    setFormData((prev) => ({ ...prev, tenant: res[0].GUID }));
                    form.setFieldValue('tenant', res[0].GUID);
                    setCurrentStep(3);
                  }
                } else {
                  setCurrentStep(1);
                }
              })
              .catch((err) => {
                setCurrentStep(1);
              });
          }
          break;
        case 2:
          setFormData((prev) => ({ ...prev, ...values }));
          setCurrentStep(3);
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
        localStorage.setItem(localStorageKeys.serverUrl, finalData.url);
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
          <>
            <Form.Item
              label="LiteGraph Server URL"
              name="url"
              rules={[
                { required: true, message: 'Please enter the LiteGraph Server URL!' },
                { type: 'url', message: 'Please enter a valid URL!' },
              ]}
            >
              <LitegraphInput
                placeholder="https://your-litegraph-server.com"
                size="large"
                disabled={isValidatingConnectivity}
              />
            </Form.Item>
          </>
        );
      case 1:
        return (
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' },
            ]}
          >
            <LitegraphInput
              placeholder="Email"
              size="large"
              ref={emailInputRef}
              disabled={!isServerValid}
              autoFocus
            />
          </Form.Item>
        );

      case 2:
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
              autoFocus
            />
          </Form.Item>
        );
      case 3:
        return (
          <>
            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Please input your password!' }]}
            >
              <Input.Password placeholder="Password" size="large" autoFocus />
            </Form.Item>
          </>
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    if (emailInputRef.current) {
      emailInputRef.current.focus({
        cursor: 'start',
      });
    }
  }, [emailInputRef.current]);

  return (
    <div className={styles.userLoginPage}>
      <LitegraphFlex
        className={classNames(styles.userLoginPageHeader, 'mb pb pt pr pl')}
        align="center"
        justify="space-between"
      >
        <img src="/favicon.png" alt="Litegraph Logo" height={40} />
        <Link href={paths.adminLogin}>
          <LitegraphText color={LightGraphTheme.primary}>Login as Administrator</LitegraphText>
        </Link>
      </LitegraphFlex>
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
              htmlType={'submit'}
              loading={isGeneratingToken || isLoadingTenant || isValidatingConnectivity}
              className={styles.loginButton}
              onClick={currentStep === 3 ? handleSubmit : handleNext}
            >
              {isLoadingTenant || isValidatingConnectivity
                ? 'Loading...'
                : currentStep === 3
                  ? 'Login'
                  : 'Next'}
            </LitegraphButton>
          </div>
        </Form>
      </div>
      <div className={styles.stepIndicatorContainer}>
        {[0, 1, 2, 3].map((step) => (
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
