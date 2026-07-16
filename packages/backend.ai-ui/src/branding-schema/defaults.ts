import type { BrandingConfig, ColorTokens } from './types';

const lightColors: Required<
  Pick<
    ColorTokens,
    | 'primary'
    | 'primaryHover'
    | 'headerBg'
    | 'headerText'
    | 'siderBg'
    | 'siderText'
    | 'siderActiveBg'
    | 'siderActiveText'
    | 'siderBorder'
    | 'contentBg'
    | 'contentText'
    | 'borderColor'
  >
> = {
  primary: '#1677FF',
  primaryHover: '#4096FF',
  headerBg: '#FFFFFF',
  headerText: '#141414',
  siderBg: '#FFFFFF',
  siderText: '#141414',
  siderActiveBg: '#E6F4FF',
  siderActiveText: '#1677FF',
  siderBorder: '#DEE1E7',
  contentBg: '#F5F7FA',
  contentText: '#141414',
  borderColor: '#DEE1E7',
};

const darkColors: typeof lightColors = {
  primary: '#4096FF',
  primaryHover: '#69B1FF',
  headerBg: '#141414',
  headerText: '#FFFFFF',
  siderBg: '#1F1F1F',
  siderText: '#FFFFFF',
  siderActiveBg: '#111B26',
  siderActiveText: '#4096FF',
  siderBorder: '#303030',
  contentBg: '#000000',
  contentText: '#FFFFFF',
  borderColor: '#303030',
};

export const defaultBranding: BrandingConfig = {
  branding: {
    companyName: 'Lablup Inc.',
    brandName: 'Backend.AI',
  },
  colors: {
    light: lightColors,
    dark: darkColors,
  },
  fontFamily: "'Ubuntu', system-ui, -apple-system, sans-serif",
  sider: {
    widthExpanded: 240,
    widthCollapsed: 74,
  },
  header: {
    height: 60,
  },
};
