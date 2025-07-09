import { theme, ThemeConfig } from 'antd';

export const LightGraphTheme = {
  primary: '#558f42', //95DB7B
  primaryRed: '#d9383a',
  secondaryBlue: '#b1e5ff',
  secondaryYellow: '#ffe362',
  borderGray: '#C1C1C1',
  white: '#ffffff',
  fontFamily: '"Inter", "serif"',
  colorBgContainerDisabled: '#E9E9E9',
  textDisabled: '#bbbbbb',
  subHeadingColor: '#666666',
};

export const primaryTheme: ThemeConfig = {
  cssVar: true,
  algorithm: theme.defaultAlgorithm,
  token: {
    colorPrimary: LightGraphTheme.primary,
    fontFamily: LightGraphTheme.fontFamily,
    colorBorder: LightGraphTheme.borderGray,
    colorTextDisabled: LightGraphTheme.textDisabled,
    colorBgContainerDisabled: LightGraphTheme.colorBgContainerDisabled,
  },
  components: {
    Tabs: {
      cardBg: '#F2F2F2',
      titleFontSize: 12,
    },
    Typography: {
      fontWeightStrong: 400,
    },
    Layout: {
      fontFamily: LightGraphTheme.fontFamily,
    },
    Menu: {
      itemSelectedBg: '#fff',
    },
    Button: {
      borderRadius: 4,
      primaryColor: LightGraphTheme.white,
      defaultColor: '#333333',
      colorLink: LightGraphTheme.primary,
      colorLinkHover: LightGraphTheme.primary,
    },
    Table: {
      headerBg: '#ffffff',
      padding: 18,
      borderColor: '#d1d5db',
    },
    Collapse: {
      headerBg: LightGraphTheme.white,
    },
    Input: {
      borderRadiusLG: 3,
      borderRadius: 3,
      borderRadiusXS: 3,
    },
    Select: {
      borderRadiusLG: 3,
      borderRadius: 3,
      borderRadiusXS: 3,
      optionSelectedColor: LightGraphTheme.white,
      optionSelectedBg: LightGraphTheme.primary,
    },
    Pagination: {
      fontFamily: LightGraphTheme.fontFamily,
    },
    Form: {
      labelColor: LightGraphTheme.subHeadingColor,
      colorBorder: 'none',
      verticalLabelPadding: 0,
      itemMarginBottom: 10,
    },
  },
};

export const darkTheme: ThemeConfig = {
  cssVar: true,
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: LightGraphTheme.primary,
    fontFamily: LightGraphTheme.fontFamily,
    colorBorder: LightGraphTheme.borderGray,
    colorTextDisabled: LightGraphTheme.textDisabled,
    colorBgContainerDisabled: LightGraphTheme.colorBgContainerDisabled,
  },
  components: {
    Tabs: {
      cardBg: '#F2F2F2',
      titleFontSize: 12,
    },
    Typography: {
      fontWeightStrong: 400,
    },
    Layout: {
      fontFamily: LightGraphTheme.fontFamily,
    },
    Menu: {
      itemSelectedBg: '#fff',
    },
    Button: {
      borderRadius: 4,
      primaryColor: LightGraphTheme.white,
      defaultColor: '#333333',
      colorLink: LightGraphTheme.primary,
      colorLinkHover: LightGraphTheme.primary,
    },
    Table: {
      headerBg: '#ffffff',
      padding: 18,
      borderColor: '#d1d5db',
    },
    Collapse: {
      headerBg: LightGraphTheme.white,
    },
    Input: {
      borderRadiusLG: 3,
      borderRadius: 3,
      borderRadiusXS: 3,
    },
    Select: {
      borderRadiusLG: 3,
      borderRadius: 3,
      borderRadiusXS: 3,
      optionSelectedColor: LightGraphTheme.white,
      optionSelectedBg: LightGraphTheme.primary,
    },
    Pagination: {
      fontFamily: LightGraphTheme.fontFamily,
    },
    Form: {
      labelColor: LightGraphTheme.subHeadingColor,
      colorBorder: 'none',
      verticalLabelPadding: 0,
      itemMarginBottom: 10,
    },
  },
};
