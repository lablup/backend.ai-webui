export interface LogoSize {
  width: number;
  height: number;
}

export interface LogoConfig {
  src: string;
  srcDark?: string;
  srcCollapsed?: string;
  srcCollapsedDark?: string;
  size?: LogoSize;
  sizeCollapsed?: LogoSize;
  href?: string;
  alt?: string;
}

export interface ColorTokens {
  primary?: string;
  primaryHover?: string;
  headerBg?: string;
  headerText?: string;
  siderBg?: string;
  siderText?: string;
  siderActiveBg?: string;
  siderActiveText?: string;
  siderBorder?: string;
  contentBg?: string;
  contentText?: string;
  borderColor?: string;
}

export interface SiderDimensions {
  widthExpanded?: number;
  widthCollapsed?: number;
}

export interface HeaderDimensions {
  height?: number;
}

export interface BrandingConfig {
  logo?: LogoConfig;
  branding?: {
    companyName?: string;
    brandName?: string;
    productName?: string;
  };
  colors?: {
    light?: ColorTokens;
    dark?: ColorTokens;
  };
  fontFamily?: string;
  sider?: SiderDimensions;
  header?: HeaderDimensions;
  [extension: string]: unknown;
}
