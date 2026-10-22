/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { CodeBlock } from '@lablup/ui-common/CodeBlock';
import React from 'react';

interface SourceCodeViewProps {
  children: string;
  language: string;
  style?: React.CSSProperties;
}

// Astryx's tokenizer covers every language this view is given; anything else
// renders as plain text. shiki stays with the chat markdown renderer only.
const SUPPORTED_LANGUAGES = new Set([
  'bash',
  'javascript',
  'json',
  'plaintext',
  'python',
  'shell',
  'typescript',
  'yaml',
]);

const SourceCodeView: React.FC<SourceCodeViewProps> = ({
  children,
  language,
  style,
}) => {
  'use memo';
  const lang = language.toLowerCase();
  return (
    <CodeBlock
      code={children ?? ''}
      language={SUPPORTED_LANGUAGES.has(lang) ? lang : 'plaintext'}
      width="100%"
      style={{ flex: 1, minWidth: 0, ...style }}
    />
  );
};

export default SourceCodeView;
