import type {
  BrandingConfig,
  ColorTokens,
  LogoConfig,
} from '../../branding-schema';

export interface RootAppShellTokens {
  /** Sider expanded width in px. Default 240. */
  siderWidth?: number;
  /** Sider collapsed width in px. Default 74. */
  siderCollapsedWidth?: number;
  /** Header height in px. Default 60. */
  headerHeight?: number;
  /** CSS font-family value. Default `'Ubuntu', system-ui, ...`. */
  fontFamily?: string;
}

export interface RootAppShellBrandingProps {
  /** Optional full BrandingConfig — individual props (logo/colors/etc.) override its fields. */
  branding?: BrandingConfig;
  /** Logo config (variants for light/dark, expanded/collapsed). */
  logo?: LogoConfig;
  /** Brand display name (e.g. "Backend.AI"). */
  brandName?: string;
  /** Company name shown in default sider footer copyright. */
  companyName?: string;
  /** Product display name (e.g. "FastTrack") shown next to brand name in header. */
  productName?: string;
  /** Color tokens for light + dark modes. */
  colors?: { light?: ColorTokens; dark?: ColorTokens };
  /** Dimension tokens (sider/header sizes, font family). */
  tokens?: RootAppShellTokens;
}

/**
 * Build a BrandingConfig from the flat props on RootAppShell. Individual props
 * override the corresponding fields of `branding` if both are provided.
 */
export function buildBrandingFromProps(
  props: RootAppShellBrandingProps,
): BrandingConfig | undefined {
  const {
    branding,
    logo,
    brandName,
    companyName,
    productName,
    colors,
    tokens,
  } = props;

  // If no individual props are given and no branding object, return undefined
  // so AppShellProvider falls back to defaultBranding.
  const hasAny =
    branding ||
    logo ||
    brandName ||
    companyName ||
    productName ||
    colors ||
    tokens;
  if (!hasAny) return undefined;

  const merged: BrandingConfig = {
    ...(branding ?? {}),
    logo: logo ?? branding?.logo,
    branding: {
      ...(branding?.branding ?? {}),
      ...(brandName !== undefined ? { brandName } : {}),
      ...(companyName !== undefined ? { companyName } : {}),
      ...(productName !== undefined ? { productName } : {}),
    },
    colors: colors
      ? {
          light: {
            ...(branding?.colors?.light ?? {}),
            ...(colors.light ?? {}),
          },
          dark: { ...(branding?.colors?.dark ?? {}), ...(colors.dark ?? {}) },
        }
      : branding?.colors,
    fontFamily: tokens?.fontFamily ?? branding?.fontFamily,
    sider: {
      ...(branding?.sider ?? {}),
      ...(tokens?.siderWidth !== undefined
        ? { widthExpanded: tokens.siderWidth }
        : {}),
      ...(tokens?.siderCollapsedWidth !== undefined
        ? { widthCollapsed: tokens.siderCollapsedWidth }
        : {}),
    },
    header: {
      ...(branding?.header ?? {}),
      ...(tokens?.headerHeight !== undefined
        ? { height: tokens.headerHeight }
        : {}),
    },
  };

  return merged;
}
