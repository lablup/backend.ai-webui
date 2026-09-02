/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import CopyButton from './Chat/CopyButton';
import { SyntaxHighlighter } from './Chat/SyntaxHighlighter';
import './SourceCodeView.css';
import { useTheme } from '@astryxdesign/core/theme';
import { BAIFlex, BAIText } from 'backend.ai-ui';

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
  const { token } = useTheme();

  return (
    <BAIFlex
      style={{
        margin: 0,
        minHeight: 38,
        padding: `0 ${token('--spacing-3')}`,
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
  const { token } = useTheme();

  return (
    <div
      style={{
        border: `1px solid ${token('--color-border')}`,
        margin: 0,
        padding: 0,
        borderRadius: token('--radius-element'),
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
          borderRadius: `0 0 ${token('--radius-element')} ${token('--radius-element')}`,
          overflow: 'auto',
        }}
      >
        <SyntaxHighlighter language={language}>{children}</SyntaxHighlighter>
      </div>
    </div>
  );
};

export default SourceCodeView;
