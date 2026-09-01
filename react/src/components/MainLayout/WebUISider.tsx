/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { AstryxReverseTheme } from '../../astryx-theme';
import { useCustomThemeConfig } from '../../hooks/useCustomThemeConfig';
import BAISider from '../BAISider';
import SiderToggleButton from '../SiderToggleButton';
import WebUISiderFooter from './WebUISiderFooter';
import WebUISiderLogo from './WebUISiderLogo';
import WebUISiderNavigation from './WebUISiderNavigation';
import { useTheme } from '@astryxdesign/core/theme';
import { useHover } from 'backend.ai-ui';
import React, { useRef } from 'react';

interface WebUISiderProps {
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean, type: 'clickTrigger') => void;
}

/**
 * The inline sider rail, mounted in AppShell's `sideNav` slot above the
 * mobile breakpoint (FR-3612). Below it, AppShell unmounts the rail and the
 * same navigation renders inside `BAIAppShell`'s drawer instead — the old
 * `onBreakpoint` auto-collapse is gone with it.
 */
const WebUISider: React.FC<WebUISiderProps> = (props) => {
  'use memo';
  const siderRef = useRef<HTMLElement>(null);
  const isSiderHover = useHover(siderRef);

  return (
    <BAISider
      className="webui-sider"
      ref={siderRef}
      collapsed={props.collapsed}
      onCollapse={(collapsed) => props.onCollapse?.(collapsed, 'clickTrigger')}
      // The hover-revealed collapse toggle protrudes past the rail's right
      // edge. `SideNav` clips both axes (`overflow: hidden` on the root,
      // `overflow-x: hidden` on the scroll column), so as a CHILD its outer
      // half was cut off. `overlay` renders it as a sibling of `SideNav`
      // inside BAISider's positioned shell.
      overlay={
        <SiderToggleButton
          collapsed={props.collapsed}
          buttonTop={68}
          onClick={(collapsed) => {
            props.onCollapse?.(collapsed, 'clickTrigger');
          }}
          hidden={!isSiderHover}
        />
      }
      logo={<WebUISiderLogo />}
      logoCollapsed={<WebUISiderLogo collapsed />}
      // `SideNav` renders its sticky-bottom band whenever `footer` is truthy,
      // so the collapsed rail passes `undefined` (its links are hidden anyway).
      footer={props.collapsed ? undefined : <WebUISiderFooter />}
    >
      <WebUISiderNavigation collapsed={props.collapsed} />
    </BAISider>
  );
};

/**
 * Whether the operator's `sider.theme` override asks for the polarity
 * opposite the app's resolved mode. Shared by the rail and the mobile nav
 * drawer so both navigation surfaces follow the operator's choice.
 */
export const useSiderThemeReversed = (): boolean => {
  'use memo';
  const { appearance } = useCustomThemeConfig();
  const { mode } = useTheme();
  const isParentDark = mode === 'dark';

  return (
    (isParentDark && appearance?.theme?.siderMode === 'light') ||
    (!isParentDark && appearance?.theme?.siderMode === 'dark')
  );
};

/**
 * Applies the operator's `sider.theme` override — a nested `<Theme>` with the
 * inverted resolved mode (`AstryxReverseTheme`).
 */
const WebUISiderWithCustomTheme: React.FC<WebUISiderProps> = (props) => {
  'use memo';
  const shouldReverse = useSiderThemeReversed();

  return shouldReverse ? (
    <AstryxReverseTheme>
      <WebUISider {...props} />
    </AstryxReverseTheme>
  ) : (
    <WebUISider {...props} />
  );
};

export default WebUISiderWithCustomTheme;
