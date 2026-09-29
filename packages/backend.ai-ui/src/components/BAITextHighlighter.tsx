/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 ui-common `TextHighlighter` under its BUI name (FR-4096); `style` styles each
 mark. BAITextHighlighter.css gives every ui-common highlighter the WebUI's
 mark colour.
*/
import './BAITextHighlighter.css';
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
