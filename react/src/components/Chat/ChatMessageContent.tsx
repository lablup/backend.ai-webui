/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import CopyButton from './CopyButton';
import { SyntaxHighlighter } from './SyntaxHighlighter';
import { theme, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { BAIFlex } from 'backend.ai-ui';
// `rehype-katex` does not import the CSS file, so we need to import it manually.
import 'katex/dist/katex.min.css';
import { marked } from 'marked';
import React, { memo, useCallback, useMemo } from 'react';
import Markdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

const { Text } = Typography;

const useMarkdownStyles = createStyles(({ token }) => ({
  markdownTable: {
    '& tr:hover': {
      backgroundColor: `${token.colorFillQuaternary} !important`,
    },
    '& tr:last-child': {
      borderBottom: 'none !important',
    },
    '& th:last-child, & td:last-child': {
      borderRight: 'none !important',
    },
  },
  blockquote: {
    margin: `${token.marginMD}px 0`,
    padding: `${token.paddingSM}px ${token.padding}px`,
    borderLeft: `${token.lineWidth * 4}px solid ${token.colorBorderSecondary}`,
    backgroundColor: token.colorFillAlter,
    borderRadius: `0 ${token.borderRadiusSM}px ${token.borderRadiusSM}px 0`,
    color: token.colorTextSecondary,
    fontSize: token.fontSize,
    lineHeight: token.lineHeight,
    '& p': {
      margin: '0 !important',
    },
    '& p:not(:last-child)': {
      marginBottom: `${token.marginXS}px !important`,
    },
  },
  hr: {
    margin: `${token.marginXS}px 0`,
    border: 'none',
    height: `${token.lineWidth}px`,
    background: `linear-gradient(90deg, transparent, ${token.colorBorderSecondary}, transparent)`,
    borderRadius: token.borderRadiusXS,
    opacity: 0.8,
    '&::before': {
      content: '""',
      display: 'block',
      height: '100%',
      background: 'inherit',
    },
  },
  ul: {
    margin: `${token.marginSM}px 0`,
    paddingLeft: `${token.paddingLG}px`,
    lineHeight: token.lineHeight,
    listStyleType: 'disc',
    listStylePosition: 'outside',
    '& li': {
      marginBottom: `${token.marginXXS}px`,
      color: token.colorText,
      display: 'list-item',
    },
    '& ul': {
      marginTop: `${token.marginXXS}px`,
      marginBottom: 0,
      listStyleType: 'circle',
    },
    '& ul ul': {
      listStyleType: 'square',
    },
    '& ol': {
      marginTop: `${token.marginXXS}px`,
      marginBottom: 0,
    },
  },
  ol: {
    margin: `${token.marginSM}px 0`,
    paddingLeft: `${token.paddingLG}px`,
    lineHeight: token.lineHeight,
    listStyleType: 'decimal',
    listStylePosition: 'outside',
    '& li': {
      marginBottom: `${token.marginXXS}px`,
      color: token.colorText,
      display: 'list-item',
    },
    '& li::marker': {
      fontWeight: token.fontWeightStrong,
    },
    '& ol': {
      marginTop: `${token.marginXXS}px`,
      marginBottom: 0,
      listStyleType: 'lower-alpha',
    },
    '& ol ol': {
      listStyleType: 'lower-roman',
    },
    '& ul': {
      marginTop: `${token.marginXXS}px`,
      marginBottom: 0,
    },
  },
  codeBlock: {
    '& .shiki.github-light': {
      margin: '0 !important',
      padding: `${token.paddingSM}px !important`,
    },
    '& .shiki.github-dark': {
      margin: '0 !important',
      padding: `${token.paddingSM}px !important`,
    },
    '& div[dir="ltr"]': {
      display: 'table',
      minWidth: '100%',
    },
  },
}));

function parseMarkdownIntoBlocks(markdown: string): string[] {
  const tokens = marked.lexer(markdown);
  return tokens.map((token) => token.raw);
}

const CodeHead = memo<{ lang: string; extra?: React.ReactNode }>(
  ({ lang, extra }) => {
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
          <Text style={{ fontWeight: 'normal' }} type="secondary">
            {lang}
          </Text>
        </BAIFlex>
        <BAIFlex>{extra}</BAIFlex>
      </BAIFlex>
    );
  },
);

CodeHead.displayName = 'CodeHead';

const ChatMessageContentBlock = memo<{ block?: string; isStreaming?: boolean }>(
  ({ block, isStreaming }) => {
    const { styles } = useMarkdownStyles();
    const renderPre = useCallback((props: React.HTMLProps<HTMLPreElement>) => {
      return <pre {...props} style={{ overflow: 'auto', marginTop: 0 }} />;
    }, []);

    const renderCode = useCallback(
      (props: any) => {
        const { children, className, node, ref: _ref, ...rest } = props;
        const match = /language-(\w+)/.exec(className || '');
        const content = String(children ?? '').replace(/\n$/, '');
        const { token } = theme.useToken();

        const isOneLine =
          node.position?.start?.line === node.position?.end?.line || false;

        return match ? (
          <BAIFlex
            direction={'column'}
            style={{
              border: `1px solid ${token.colorBorder}`,
              margin: '0',
              padding: '0',
              borderRadius: token.borderRadiusLG,
              overflow: 'hidden',
            }}
            align="stretch"
          >
            <CodeHead
              lang={match[1]}
              extra={
                <CopyButton
                  type="text"
                  copyable={{ text: content ?? '' }}
                  style={{
                    display: isStreaming ? 'none' : 'block',
                  }}
                />
              }
            />
            <BAIFlex
              className={styles.codeBlock}
              style={{
                width: '100%',
                paddingTop: 0,
                borderRadius: `0 0 ${token.borderRadiusLG}px ${token.borderRadiusLG}px`,
                overflow: 'auto',
              }}
            >
              <SyntaxHighlighter
                {...rest}
                PreTag="div"
                language={match[1]}
                wrapLongLines
                wrapLines
              >
                {content}
              </SyntaxHighlighter>
            </BAIFlex>
          </BAIFlex>
        ) : (
          <code
            {...rest}
            style={{
              whiteSpace: 'pre-wrap',
              ...(isOneLine
                ? {
                    backgroundColor: token.colorBgContainerDisabled,
                    border: `1px solid ${token.colorBorder}`,
                    padding: '2px 6px',
                    borderRadius: token.borderRadiusSM,
                    fontSize: '0.875em',
                  }
                : {}),
            }}
            className={className}
          >
            {/* @ts-ignore */}
            {children}
          </code>
        );
      },
      [isStreaming, styles.codeBlock],
    );

    const renderParagraph = useCallback(({ node: _node, ...props }: any) => {
      return (
        <p
          {...props}
          style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
        />
      );
    }, []);

    const renderBlockquote = useCallback(
      (props: any) => {
        return <blockquote {...props} className={styles.blockquote} />;
      },
      [styles.blockquote],
    );

    const renderHr = useCallback(
      (props: any) => {
        return <hr {...props} className={styles.hr} />;
      },
      [styles.hr],
    );

    const renderUl = useCallback(
      (props: any) => {
        return <ul {...props} className={styles.ul} />;
      },
      [styles.ul],
    );

    const renderOl = useCallback(
      (props: any) => {
        return <ol {...props} className={styles.ol} />;
      },
      [styles.ol],
    );

    const renderLi = useCallback((props: any) => {
      return <li {...props} />;
    }, []);

    const renderTable = useCallback(
      (props: any) => {
        const { token } = theme.useToken();
        return (
          <div
            style={{
              overflow: 'auto',
              border: `1px solid ${token.colorBorderSecondary}`,
              borderRadius: token.borderRadiusSM,
            }}
          >
            <table
              {...props}
              className={styles.markdownTable}
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: token.fontSizeSM,
                lineHeight: token.lineHeight,
                backgroundColor: token.colorBgContainer,
              }}
            />
          </div>
        );
      },
      [styles.markdownTable],
    );

    const renderTableRow = useCallback((props: any) => {
      const { token } = theme.useToken();
      return (
        <tr
          {...props}
          style={{
            borderBottom: `${token.lineWidth}px solid ${token.colorBorderSecondary}`,
            transition: `background-color ${token.motionDurationSlow}`,
          }}
        />
      );
    }, []);

    const renderTableHeader = useCallback((props: any) => {
      const { token } = theme.useToken();
      return (
        <th
          {...props}
          style={{
            padding: `${token.paddingXS}px ${token.paddingSM}px`,
            textAlign: 'left',
            fontWeight: token.fontWeightStrong,
            fontSize: token.fontSizeSM,
            backgroundColor: token.colorFillTertiary,
            borderBottom: `${token.lineWidth}px solid ${token.colorBorder}`,
            borderRight: `${token.lineWidth}px solid ${token.colorBorderSecondary}`,
            color: token.colorTextSecondary,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        />
      );
    }, []);

    const renderTableCell = useCallback((props: any) => {
      const { token } = theme.useToken();
      return (
        <td
          {...props}
          style={{
            padding: `${token.paddingXS}px ${token.paddingSM}px`,
            borderRight: `${token.lineWidth}px solid ${token.colorBorderSecondary}`,
            color: token.colorText,
            fontSize: token.fontSizeSM,
            verticalAlign: 'top',
          }}
        />
      );
    }, []);

    return (
      <Markdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          p: renderParagraph,
          code: renderCode,
          pre: renderPre,
          blockquote: renderBlockquote,
          hr: renderHr,
          ul: renderUl,
          ol: renderOl,
          li: renderLi,
          table: renderTable,
          tr: renderTableRow,
          th: renderTableHeader,
          td: renderTableCell,
        }}
      >
        {block}
      </Markdown>
    );
  },
);

ChatMessageContentBlock.displayName = 'ChatMessageContentBlock';

const ChatMessageContent: React.FC<{
  children?: string;
  isStreaming?: boolean;
}> = ({ children, isStreaming }) => {
  const blocks = useMemo(
    () => parseMarkdownIntoBlocks(children ?? ''),
    [children],
  );

  return blocks.map((block, index) => (
    <ChatMessageContentBlock
      block={block}
      key={`block_${index}`}
      isStreaming={isStreaming}
    />
  ));
};

ChatMessageContent.displayName = 'ChatMessageContent';

export default memo(ChatMessageContent);
