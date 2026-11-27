/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import BAISider from '../BAISider';
import SiderToggleButton from '../SiderToggleButton';
import WebUISiderFooter from './WebUISiderFooter';
import WebUISiderLogo from './WebUISiderLogo';
import WebUISiderNavigation from './WebUISiderNavigation';
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

export default WebUISider;
