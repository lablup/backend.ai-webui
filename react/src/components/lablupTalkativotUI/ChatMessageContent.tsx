import CopyButton from './CopyButton';
import { Card, Typography, Collapse, theme } from 'antd';
import _ from 'lodash';
import React from 'react';
import Markdown, { Components } from 'react-markdown';
import {
  Prism as SyntaxHighlighter,
  SyntaxHighlighterProps,
} from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

const ChatMessageContent: React.FC<{
  children?: string;
  customTags?: Array<string>;
}> = ({ children, customTags = ['think'] }) => {
  const { token } = theme.useToken();
  const markdownComponents: Components & {
    [key: string]: React.FC<{ children: React.ReactNode }>;
  } = {
    ..._.reduce(
      customTags,
      (acc, tag) => {
        acc[tag] = ({ children }: { children: React.ReactNode }) => {
          const childArray = React.Children.toArray(children);
          const removedNewLine = _.filter(childArray, (child) => {
            return child !== '\n';
          });
          const collapseContent = _.slice(removedNewLine, 0, -1);
          const outsideContent = _.last(removedNewLine);

          return (
            <>
              {_.trim(String(collapseContent)) && (
                <Collapse style={{ marginTop: token.margin, width: '100%' }}>
                  <Collapse.Panel header={'Thinking...'} key="1">
                    {collapseContent}
                  </Collapse.Panel>
                </Collapse>
              )}
              {outsideContent}
            </>
          );
        };
        return acc;
      },
      {} as { [key: string]: React.FC<{ children: React.ReactNode }> },
    ),
    p({ node, ...props }) {
      return <p {...props} style={{ whiteSpace: 'pre-wrap' }} />;
    },
    code(props) {
      const { children, className, node, ref, ...rest } = props;
      const match = /language-(\w+)/.exec(className || '');
      const content = String(children).replace(/\n$/, '');
      return match ? (
        <Card
          title={
            <Typography.Text style={{ fontWeight: 'normal' }} type="secondary">
              {match[1]}
            </Typography.Text>
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
          {children}
        </code>
      );
    },
  };

  return (
    <Markdown
      remarkPlugins={[remarkMath, remarkGfm]}
      rehypePlugins={[rehypeKatex, rehypeRaw]}
      components={markdownComponents}
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
