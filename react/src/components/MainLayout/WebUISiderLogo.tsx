/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useCustomThemeConfig } from '../../hooks/useCustomThemeConfig';
import { useWebUIMenuItems } from '../../hooks/useWebUIMenuItems';
import WebUILink from '../WebUILink';
import { useTheme } from '@astryxdesign/core/theme';
import React from 'react';

interface WebUISiderLogoProps {
  /** Render the compact brand mark instead of the wide wordmark. */
  collapsed?: boolean;
}

/**
 * The operator-brandable logo, shared by the sider rail's brand band and the
 * mobile nav drawer header (FR-3612). A real router link (keyboard focusable,
 * middle-clickable) whose accessible name is the img alt. The light/dark
 * asset choice follows the nearest ancestor `<Theme>`'s resolved mode
 * (FR-3482 MAPPING §5).
 */
const WebUISiderLogo: React.FC<WebUISiderLogoProps> = ({ collapsed }) => {
  'use memo';
  const { rawThemeConfig } = useCustomThemeConfig();
  const { mode } = useTheme();
  const { defaultMenuPath } = useWebUIMenuItems();
  const isDark = mode === 'dark';

  return (
    <WebUILink to={defaultMenuPath} style={{ display: 'block' }}>
      {collapsed ? (
        <img
          className="logo-collapsed"
          alt={rawThemeConfig?.branding?.logo?.alt || 'Backend.AI Logo'}
          src={
            isDark
              ? rawThemeConfig?.branding?.logo?.srcCollapsedDark ||
                '/manifest/backend.ai-brand-simple-black.svg'
              : rawThemeConfig?.branding?.logo?.srcCollapsed ||
                '/manifest/backend.ai-brand-simple-white.svg'
          }
          style={{
            width: rawThemeConfig?.branding?.logo?.sizeCollapsed?.width ?? 24,
            height: rawThemeConfig?.branding?.logo?.sizeCollapsed?.height ?? 24,
            display: 'block',
          }}
        />
      ) : (
        <img
          className="logo-wide"
          alt={rawThemeConfig?.branding?.logo?.alt || 'Backend.AI Logo'}
          src={
            isDark
              ? rawThemeConfig?.branding?.logo?.srcDark ||
                '/manifest/backend.ai-webui-white.svg'
              : rawThemeConfig?.branding?.logo?.src ||
                '/manifest/backend.ai-webui-white.svg'
          }
          style={{
            width: rawThemeConfig?.branding?.logo?.size?.width || 159,
            height: rawThemeConfig?.branding?.logo?.size?.height || 24,
            display: 'block',
          }}
        />
      )}
    </WebUILink>
  );
};

export default WebUISiderLogo;
