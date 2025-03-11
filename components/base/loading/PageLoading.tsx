import React from 'react';
import { LoadingOutlined } from '@ant-design/icons';
import styles from './pageLoding.module.css';
import LitegraphText from '../typograpghy/Text';
import LitegraphFlex from '../flex/Flex';
import PageContainer from '../pageContainer/PageContainer';

const PageLoading = ({ message = 'Loading...' }: { message?: string }) => {
  return (
    <PageContainer>
      <LitegraphFlex justify="center" align="center" vertical>
        <LitegraphText>{message}</LitegraphText>
        <LoadingOutlined className={styles.pageLoader} />
      </LitegraphFlex>
    </PageContainer>
  );
};

export default PageLoading;
