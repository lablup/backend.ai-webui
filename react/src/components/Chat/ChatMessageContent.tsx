import Flex from '../Flex';
import CopyButton from './CopyButton';
import { SyntaxHighlighter, SyntaxHighlighterProps } from './SyntaxHighight';
import { theme, Typography } from 'antd';
// `rehype-katex` does not import the CSS file, so we need to import it manually.
import 'katex/dist/katex.min.css';
import { marked } from 'marked';
import React, { memo, useCallback, useMemo } from 'react';
import Markdown from 'react-markdown';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

const { Text } = Typography;

function parseMarkdownIntoBlocks(markdown: string): string[] {
  const tokens = marked.lexer(markdown);
  return tokens.map((token) => token.raw);
}

const CodeBlock = memo<SyntaxHighlighterProps>(({ children, ...props }) => (
  <SyntaxHighlighter {...props}>{children}</SyntaxHighlighter>
));

CodeBlock.displayName = 'CodeBlock';

const CodeHead = memo<{ lang: string; extra?: React.ReactNode }>(
  ({ lang, extra }) => {
    const { token } = theme.useToken();

    return (
      <Flex
        style={{
          margin: 0,
          minHeight: 38,
          padding: `0 ${token.paddingSM}px`,
          background: 'rgba(0, 0, 0, 0.02)',
          width: '100%',
        }}
      >
        <Flex
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
        </Flex>
        <Flex>{extra}</Flex>
      </Flex>
    );
  },
);

CodeHead.displayName = 'CodeHead';

const ChatMessageContentBlock = memo<{ block?: string; isStreaming?: boolean }>(
  ({ block, isStreaming }) => {
    const renderPre = useCallback((props: React.HTMLProps<HTMLPreElement>) => {
      return <pre {...props} style={{ overflow: 'auto' }} />;
    }, []);

    const renderCode = useCallback(
      (props: any) => {
        const { children, className, node, ref, ...rest } = props;
        const match = /language-(\w+)/.exec(className || '');
        const content = String(children ?? '').replace(/\n$/, '');
        const { token } = theme.useToken();

        const isOneLine = node.position?.start?.line === node.position?.end?.line || false;

        return match ? (
          <Flex
            direction={'column'}
            style={{
              border: '1px solid #f0f0f0',
              margin: '0',
              padding: '0',
              borderRadius: token.borderRadiusLG,
              overflow: 'hidden',
            }}
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
            <Flex
              style={{
                width: '100%',
                padding: token.paddingSM,
                borderRadius: `0 0 ${token.borderRadiusLG}px ${token.borderRadiusLG}px`,
                margin: '-0.5em 0',
                overflow: 'scroll',
              }}
            >
              <CodeBlock
                {...rest}
                PreTag="div"
                language={match[1]}
                style={oneLight}
                wrapLongLines
                wrapLines
              >
                {content}
              </CodeBlock>
            </Flex>
          </Flex>
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
      [isStreaming],
    );

    const renderParagraph = useCallback(({ node, ...props }: any) => {
      return <p {...props} style={{ whiteSpace: 'pre-wrap' }} />;
    }, []);

    return (
      <Markdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{ p: renderParagraph, code: renderCode, pre: renderPre }}
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
