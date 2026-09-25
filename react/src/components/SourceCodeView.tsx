/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { theme } from '../theme-shim';
import CopyButton from './Chat/CopyButton';
import './SourceCodeView.css';
import { BAIFlex, BAIText } from 'backend.ai-ui';
import React, { Suspense } from 'react';

// shiki is ~200 KB; keep it out of the chunks that merely render this view.
const SyntaxHighlighter = React.lazy(() =>
  import('./Chat/SyntaxHighlighter').then((m) => ({
    default: m.SyntaxHighlighter,
  })),
);

interface SourceCodeViewProps {
  children: string;
  language: string;
  style?: React.CSSProperties;
}

const CodeHead = ({
  lang,
  extra,
}: {
  lang: string;
  extra?: React.ReactNode;
}) => {
  'use memo';
  const { token } = theme.useToken();

  return (
    <BAIFlex
      style={{
        margin: 0,
        minHeight: 38,
        padding: `0 ${token.paddingSM}px`,
        background: 'rgba(0, 0, 0, 0.02)',
        width: '100%',
      }}
    >
      <BAIFlex
        style={{
          display: 'inline-block',
          flex: '1',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
        }}
      >
        <BAIText style={{ fontWeight: 'normal' }} type="secondary">
          {lang}
        </BAIText>
      </BAIFlex>
      <BAIFlex>{extra}</BAIFlex>
    </BAIFlex>
  );
};

const SourceCodeView: React.FC<SourceCodeViewProps> = ({
  children,
  language,
  style,
}) => {
  'use memo';
  const { token } = theme.useToken();

  return (
    <div
      style={{
        border: `1px solid ${token.colorBorderSecondary}`,
        margin: 0,
        padding: 0,
        borderRadius: token.borderRadiusLG,
        overflow: 'hidden',
        flex: 1,
        minWidth: 0,
        ...style,
      }}
    >
      <CodeHead
        lang={language}
        extra={
          <CopyButton
            copyable={{ text: children ?? '' }}
            style={{
              display: 'block',
            }}
          />
        }
      />
      <div
        className="source-code-view-block"
        style={{
          paddingTop: 0,
          borderRadius: `0 0 ${token.borderRadiusLG}px ${token.borderRadiusLG}px`,
          overflow: 'auto',
        }}
      >
        <Suspense fallback={<pre style={{ margin: 0 }}>{children}</pre>}>
          <SyntaxHighlighter language={language}>{children}</SyntaxHighlighter>
        </Suspense>
      </div>
    </div>
  );
};

export default SourceCodeView;
