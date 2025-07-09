import React from 'react';
import {
  DownCircleOutlined,
  AccountBookOutlined,
  LogoutOutlined,
  UserOutlined,
  MoonOutlined,
} from '@ant-design/icons';
import { RootState } from '@/lib/store/store';
import { getFirstLetterOfTheWord, getUserName } from '@/utils/stringUtils';
import { MenuProps, theme } from 'antd';
import styles from './styles.module.scss';
import { useLogout } from '@/hooks/authHooks';
import { useAppSelector } from '@/lib/store/hooks';
import LitegraphDropdown from '@/components/base/dropdown/Dropdown';
import LitegraphFlex from '@/components/base/flex/Flex';
import LitegraphText from '@/components/base/typograpghy/Text';
import LitegraphAvatar from '@/components/base/avatar/Avatar';
import { ThemeEnum } from '@/types/types';
import { useAppContext } from '@/hooks/appHooks';

const LoggedUserInfo = () => {
  const logOutFromSystem = useLogout();

  const { theme, setTheme } = useAppContext();
  const user = useAppSelector((state: RootState) => state.liteGraph.user);
  const userName = getUserName(user);

  const onClick: MenuProps['onClick'] = ({ key }: { key: string }) => {
    if (key === 'logout') {
      logOutFromSystem();
    }
  };

  const items: MenuProps['items'] = [
    {
      label: 'Logout',
      key: 'logout',
      icon: <LogoutOutlined />,
    },
    {
      label: 'Change Theme',
      key: 'change-theme',
      icon: <MoonOutlined />,
      onClick: () => {
        setTheme(theme === ThemeEnum.LIGHT ? ThemeEnum.DARK : ThemeEnum.LIGHT);
      },
    },
  ];
  return (
    <LitegraphDropdown menu={{ items, onClick }} trigger={['click']}>
      <LitegraphFlex className={styles.container} gap={10} align="center">
        <LitegraphText className="ant-color-white" strong weight={400}>
          {userName}
        </LitegraphText>
        <LitegraphAvatar
          alt="User Profile"
          src={!userName && '/profile-pic.png'}
          size={'small'}
          style={{ background: 'primary' }}
        >
          {getFirstLetterOfTheWord(userName)}
        </LitegraphAvatar>
        <DownCircleOutlined className="ant-color-white" />
      </LitegraphFlex>
    </LitegraphDropdown>
  );
};

export default LoggedUserInfo;
