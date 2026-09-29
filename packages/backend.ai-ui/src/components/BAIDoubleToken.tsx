/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 ui-common `DoubleToken` under its BUI name (FR-4096): a welded run of Tokens
 for a settled pair; the live counterpart is `BAIDoubleBadge`.
*/
import './BAITextHighlighter.css';
import {
  DoubleToken,
  type DoubleTokenProps,
  type DoubleTokenValue,
} from '@lablup/ui-common/components/DoubleToken';
import React from 'react';

export type BAIDoubleTokenValue = DoubleTokenValue;

export type BAIDoubleTokenProps = DoubleTokenProps;

const BAIDoubleToken: React.FC<BAIDoubleTokenProps> = (props) => (
  <DoubleToken {...props} />
);

export default BAIDoubleToken;
