/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 ui-common `OverlayScrollbar`, raised above the Backend.AI shell's sticky
 header (`BAIOverlayScrollbar.css`).
*/
import './BAIOverlayScrollbar.css';
import {
  OverlayScrollbar,
  type OverlayScrollbarProps,
} from '@lablup/ui-common/components/OverlayScrollbar';
import React from 'react';

export type BAIOverlayScrollbarProps = OverlayScrollbarProps;

const BAIOverlayScrollbar: React.FC<BAIOverlayScrollbarProps> = ({
  className,
  ...props
}) => {
  'use memo';
  return (
    <OverlayScrollbar
      {...props}
      className={['bai-overlay-scrollbar', className].filter(Boolean).join(' ')}
    />
  );
};

export default BAIOverlayScrollbar;
