/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import CopyButton from './Chat/CopyButton';
import { SyntaxHighlighter } from './Chat/SyntaxHighlighter';
import { theme } from 'antd';
import { createStyles } from 'antd-style';
import { BAIFlex, BAIText } from 'backend.ai-ui';

interface SourceCodeViewProps {
  children: string;
  language: string;
  style?: React.CSSProperties;
}

const useStyles = createStyles(({ token }) => ({
  codeBlock: {
    '& .shiki.github-light': {
      margin: '0 !important',
      padding: `${token.paddingSM}px !important`,
    },
    '& .shiki.github-dark': {
      margin: '0 !important',
      padding: `${token.paddingSM}px !important`,
    },
    '& pre': {
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-all',
    },
  },
}));

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
  const { styles } = useStyles();
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
            type="text"
            copyable={{ text: children ?? '' }}
            style={{
              display: 'block',
            }}
          />
        }
      />
      <div
        className={styles.codeBlock}
        style={{
          paddingTop: 0,
          borderRadius: `0 0 ${token.borderRadiusLG}px ${token.borderRadiusLG}px`,
          overflow: 'auto',
        }}
      >
        <SyntaxHighlighter language={language}>{children}</SyntaxHighlighter>
      </div>
    </div>
  );
};

export default SourceCodeView;
