import Flex from '../Flex';
import CopyButton from './CopyButton';
import { SyntaxHighlighter, SyntaxHighlighterProps } from './SyntaxHighight';
import { Typography } from 'antd';
// `rehype-katex` does not import the CSS file, so we need to import it manually.
import 'katex/dist/katex.min.css';
import React, { memo, useCallback } from 'react';
import Markdown from 'react-markdown';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

const { Text } = Typography;

const LangType = memo<{ lang: string }>(({ lang }) => {
  return (
    <Text style={{ fontWeight: 'normal' }} type="secondary">
      {lang}
    </Text>
  );
});

LangType.displayName = 'RenderLangType';

const CodeBlock = memo<SyntaxHighlighterProps>(({ children, ...props }) => (
  <SyntaxHighlighter {...props}>{children}</SyntaxHighlighter>
));

CodeBlock.displayName = 'CodeBlock';

const CodeHead = memo<{ lang: string; extra?: React.ReactNode }>(
  ({ lang, extra }) => (
    <Flex
      style={{
        margin: '0',
        minHeight: '38px',
        padding: '0 12px',
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
        <LangType lang={lang} />
      </Flex>
      <Flex>{extra}</Flex>
    </Flex>
  ),
  (prevProps, nextProps) => {
    if (prevProps.lang !== nextProps.lang) return false;
    if (prevProps.extra !== nextProps.extra) return false;
    return true;
  },
);

CodeHead.displayName = 'CodeHead';

const ChatMessageContent: React.FC<{
  children?: string;
  isStreaming?: boolean;
}> = ({ children, isStreaming }) => {
  const renderCode = useCallback(
    (props: any) => {
      const { children, className, node, ref, ...rest } = props;
      const match = /language-(\w+)/.exec(className || '');
      const content = String(children).replace(/\n$/, '');

      return match ? (
        <Flex
          direction={'column'}
          style={{
            border: '1px solid #f0f0f0',
            margin: '0',
            padding: '0',
            borderRadius: '8px',
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
              padding: '12px',
              borderRadius: '0 0 8px 8px',
              margin: '-0.5em 0',
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
        <code {...rest} className={className}>
          {/* @ts-ignore */}
          {children}
        </code>
      );
    },
    [isStreaming],
  );

  const renderParagraph = useCallback((props: any) => {
    return <p {...props} style={{ whiteSpace: 'pre-wrap' }} />;
  }, []);

  return (
    <Markdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{ p: renderParagraph, code: renderCode }}
    >
      {children}
    </Markdown>
  );
};

export default memo(ChatMessageContent);
