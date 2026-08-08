/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useBAIBreakpoint } from '../theme-shim';
import './BAIContentWithDrawerArea.css';
import { isOpenDrawerState } from './BAINotificationButton';
import { useAtomValue } from 'jotai';
import React from 'react';

// PILOT-DECISION: antd `Layout.Content` (MAPPING §5 `Layout` → COMPOSITION)
// carried no behaviour here — it is a `<main>`-ish block that this component
// only uses to hang a className on. It becomes a plain block element, and the
// props interface drops `antd/lib/layout/layout`'s `BasicProps` for the
// grepped surface (P1: MainLayout passes `drawerWidth` + `children` only).
//
// Ticket 33 retired the `createGlobalStyle` block that used to live here; the
// rules moved to BAIContentWithDrawerArea.css, which explains how the two
// dynamic inputs (`drawerWidth`, `drawerStyle`) survive the move.
interface Props {
  drawerWidth?: number;
  className?: string;
  children?: React.ReactNode;
}

type DrawerStyle = 'margin-style' | 'overlay-style';

const BAIContentWithDrawerArea: React.FC<Props> = ({
  drawerWidth = 256,
  ...contextProps
}) => {
  const isOpenDrawer = useAtomValue(isOpenDrawerState);
  // Responsive policy (ticket 14): JS behaviour branch — the drawer style is
  // a layout MODE, not a track layout, so it stays on the JS-side hook.
  const { xl } = useBAIBreakpoint();
  const drawerStyle: DrawerStyle =
    xl && isOpenDrawer ? 'margin-style' : 'overlay-style';
  return (
    <div
      {...contextProps}
      className={
        `main-layout-main-content ${drawerStyle}` +
        (contextProps.className || '')
      }
      style={
        {
          '--bai-drawer-area-width': `${drawerWidth}px`,
        } as React.CSSProperties
      }
    />
  );
};

export default BAIContentWithDrawerArea;
