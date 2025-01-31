import CopyButton from './CopyButton';
import { Card, Typography } from 'antd';
import React from 'react';
import Markdown from 'react-markdown';
import {
  Prism as SyntaxHighlighter,
  SyntaxHighlighterProps,
} from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

const { Text } = Typography;

const ChatMessageContent: React.FC<{
  children?: string;
}> = ({ children }) => {
  return (
    <Markdown
      components={{
        p({ node, ...props }) {
          // @ts-ignore
          return <p {...props} style={{ whiteSpace: 'pre-wrap' }} />;
        },
        code(props) {
          const { children, className, node, ref, ...rest } = props;
          const match = /language-(\w+)/.exec(className || '');
          const content = String(children).replace(/\n$/, '');
          return match ? (
            <Card
              title={
                <Text style={{ fontWeight: 'normal' }} type="secondary">
                  {match[1]}
                </Text>
              }
              type="inner"
              size="small"
              extra={
                <CopyButton
                  type="text"
                  copyable={{
                    text: 's',
                  }}
                />
              }
              styles={{
                body: { padding: 0 },
                header: { margin: 0 },
              }}
            >
              <div style={{ margin: '-0.5em 0', width: '100%' }}>
                <CodeBlock
                  ref={ref}
                  {...rest}
                  PreTag="div"
                  language={match[1]}
                  style={oneLight}
                  wrapLongLines
                  wrapLines
                >
                  {content}
                </CodeBlock>
              </div>
            </Card>
          ) : (
            <code {...rest} className={className}>
              {/* @ts-ignore */}
              {children}
            </code>
          );
        },
      }}
    >
      {children}
    </Markdown>
  );
};

const X: React.FC<SyntaxHighlighterProps> = ({ children, ...props }) => {
  return <SyntaxHighlighter {...props}>{children}</SyntaxHighlighter>;
};
const CodeBlock = React.memo(X);

export default React.memo(ChatMessageContent);
