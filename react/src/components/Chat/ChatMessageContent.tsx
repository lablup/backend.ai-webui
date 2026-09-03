/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import './ChatMessageContent.css';
import CopyButton from './CopyButton';
import { SyntaxHighlighter } from './SyntaxHighlighter';
import { Text } from '@astryxdesign/core/Text';
import { useTheme } from '@astryxdesign/core/theme';
import { BAIFlex } from 'backend.ai-ui';
// `rehype-katex` does not import the CSS file, so we need to import it manually.
import 'katex/dist/katex.min.css';
import { marked } from 'marked';
import React, { memo, useCallback, useMemo } from 'react';
import Markdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

function parseMarkdownIntoBlocks(markdown: string): string[] {
  const tokens = marked.lexer(markdown);
  return tokens.map((token) => token.raw);
}

const CodeHead = memo<{ lang: string; extra?: React.ReactNode }>(
  ({ lang, extra }) => {
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
          <Text style={{ fontWeight: 'normal' }} color="secondary">
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
    const { token } = useTheme();
    const renderPre = useCallback((props: React.HTMLProps<HTMLPreElement>) => {
      return <pre {...props} style={{ overflow: 'auto', marginTop: 0 }} />;
    }, []);

    const renderCode = useCallback(
      (props: any) => {
        const { children, className, node, ref: _ref, ...rest } = props;
        const match = /language-(\w+)/.exec(className || '');
        const content = String(children ?? '').replace(/\n$/, '');

        const isOneLine =
          node.position?.start?.line === node.position?.end?.line || false;

        return match ? (
          <BAIFlex
            direction={'column'}
            style={{
              border: `1px solid ${token('--color-border-emphasized')}`,
              margin: '0',
              padding: '0',
              borderRadius: token('--radius-element'),
              overflow: 'hidden',
            }}
            align="stretch"
          >
            <CodeHead
              lang={match[1]}
              extra={
                <CopyButton
                  copyable={{ text: content ?? '' }}
                  style={{
                    display: isStreaming ? 'none' : 'block',
                  }}
                />
              }
            />
            <BAIFlex
              className="chat-markdown-code-block"
              style={{
                width: '100%',
                paddingTop: 0,
                borderRadius: `0 0 ${token('--radius-element')} ${token('--radius-element')}`,
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
                    backgroundColor: token('--color-bg-container-disabled'),
                    border: `1px solid ${token('--color-border-emphasized')}`,
                    padding: '2px 6px',
                    borderRadius: token('--radius-none'),
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
      [isStreaming, token],
    );

    const renderParagraph = useCallback(({ node: _node, ...props }: any) => {
      return (
        <p
          {...props}
          style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
        />
      );
    }, []);

    const renderBlockquote = useCallback((props: any) => {
      return <blockquote {...props} className="chat-markdown-blockquote" />;
    }, []);

    const renderHr = useCallback((props: any) => {
      return <hr {...props} className="chat-markdown-hr" />;
    }, []);

    const renderUl = useCallback((props: any) => {
      return <ul {...props} className="chat-markdown-ul" />;
    }, []);

    const renderOl = useCallback((props: any) => {
      return <ol {...props} className="chat-markdown-ol" />;
    }, []);

    const renderLi = useCallback((props: any) => {
      return <li {...props} />;
    }, []);

    const renderTable = useCallback(
      (props: any) => {
        return (
          <div
            style={{
              overflow: 'auto',
              border: `1px solid ${token('--color-border')}`,
              borderRadius: token('--radius-none'),
            }}
          >
            <table
              {...props}
              className="chat-markdown-table"
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: token('--font-size-sm'),
                lineHeight: 1.5714285714285714,
                backgroundColor: token('--color-background-surface'),
              }}
            />
          </div>
        );
      },
      [token],
    );

    const renderTableRow = useCallback(
      (props: any) => {
        return (
          <tr
            {...props}
            style={{
              borderBottom: `${token('--border-width')} solid ${token('--color-border')}`,
              transition: `background-color ${token('--duration-slow')}`,
            }}
          />
        );
      },
      [token],
    );

    const renderTableHeader = useCallback(
      (props: any) => {
        return (
          <th
            {...props}
            style={{
              padding: `${token('--spacing-2')} ${token('--spacing-3')}`,
              textAlign: 'left',
              fontWeight: token('--font-weight-semibold'),
              fontSize: token('--font-size-sm'),
              backgroundColor: token('--color-fill-tertiary'),
              borderBottom: `${token('--border-width')} solid ${token('--color-border-emphasized')}`,
              borderRight: `${token('--border-width')} solid ${token('--color-border')}`,
              color: token('--color-text-secondary'),
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          />
        );
      },
      [token],
    );

    const renderTableCell = useCallback(
      (props: any) => {
        return (
          <td
            {...props}
            style={{
              padding: `${token('--spacing-2')} ${token('--spacing-3')}`,
              borderRight: `${token('--border-width')} solid ${token('--color-border')}`,
              color: token('--color-text-primary'),
              fontSize: token('--font-size-sm'),
              verticalAlign: 'top',
            }}
          />
        );
      },
      [token],
    );

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
