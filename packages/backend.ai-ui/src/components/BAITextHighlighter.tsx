/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 ui-common `TextHighlighter` under its BUI name (FR-4096); `style` styles each
 mark. The mark colour is the theme's `--color-warning-border-hover`, which
 ui-common reads itself.
*/
import { TextHighlighter } from '@lablup/ui-common/components/TextHighlighter';
import React from 'react';

export interface BAITextHighlighterProps {
  children?: string | null;
  keyword?: string;
  /** Inline style of each marked part. */
  style?: React.CSSProperties;
}

const BAITextHighlighter: React.FC<BAITextHighlighterProps> = ({
  children,
  keyword,
  style,
}) => (
  <TextHighlighter keyword={keyword} highlightStyle={style}>
    {children}
  </TextHighlighter>
);

export default BAITextHighlighter;
