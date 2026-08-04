/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { CodeHead } from './Chat/CodeHead';
import { SyntaxHighlighter } from './Chat/SyntaxHighlighter';
import { theme } from 'antd';
import { createStyles } from 'antd-style';
import { BAIFlex } from 'backend.ai-ui';
// `rehype-katex` does not import the CSS file, so we need to import it manually.
import 'katex/dist/katex.min.css';
import React from 'react';
import Markdown, { type Components } from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

const useStyles = createStyles(({ css, token }) => ({
  // Reading typography for long-form markdown: comfortable line height and
  // bordered headings. Everything `ChatMessageContent` also styles
  // (blockquote, hr, lists, tables, inline code) uses the same tokens it
  // does, so the two renderers produce the same output.
  markdown: css`
    color: ${token.colorText};
    font-size: ${token.fontSize}px;
    line-height: 1.7;
    word-break: break-word;

    & > *:first-child {
      margin-top: 0;
    }
    & > *:last-child {
      margin-bottom: 0;
    }

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      margin: 1.5em 0 0.75em;
      font-weight: ${token.fontWeightStrong};
      line-height: 1.4;
    }
    h1 {
      font-size: 1.9em;
      padding-bottom: 0.3em;
      border-bottom: 1px solid ${token.colorBorderSecondary};
    }
    h2 {
      font-size: 1.5em;
      padding-bottom: 0.3em;
      border-bottom: 1px solid ${token.colorBorderSecondary};
    }
    h3 {
      font-size: 1.25em;
    }
    h4 {
      font-size: 1em;
    }

    p {
      margin: 0 0 1em;
    }

    a {
      color: ${token.colorLink};
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }

    img {
      max-width: 100%;
      border-radius: ${token.borderRadius}px;
    }

    /* Restore list markers: the global reset in resources/webui.css sets
       \`ul { list-style-type: none }\`, which otherwise hides bullets here. */
    ul,
    ol {
      margin: ${token.marginSM}px 0;
      padding-left: ${token.paddingLG}px;
      list-style-position: outside;
    }
    ul {
      list-style-type: disc;
    }
    ul ul {
      list-style-type: circle;
    }
    ul ul ul {
      list-style-type: square;
    }
    ol {
      list-style-type: decimal;
    }
    ol ol {
      list-style-type: lower-alpha;
    }
    ol ol ol {
      list-style-type: lower-roman;
    }
    ul ul,
    ul ol,
    ol ol,
    ol ul {
      margin-top: ${token.marginXXS}px;
      margin-bottom: 0;
    }
    li {
      display: list-item;
      margin-bottom: ${token.marginXXS}px;
    }
    ol > li::marker {
      font-weight: ${token.fontWeightStrong};
    }
    li > p {
      margin: 0;
    }
    li > input[type='checkbox'] {
      margin-right: 0.4em;
    }

    blockquote {
      margin: ${token.marginMD}px 0;
      padding: ${token.paddingSM}px ${token.padding}px;
      color: ${token.colorTextSecondary};
      border-left: ${token.lineWidth * 4}px solid ${token.colorBorderSecondary};
      background-color: ${token.colorFillAlter};
      border-radius: 0 ${token.borderRadiusSM}px ${token.borderRadiusSM}px 0;
    }
    blockquote p {
      margin: 0;
    }
    blockquote p:not(:last-child) {
      margin-bottom: ${token.marginXS}px;
    }
    blockquote > *:last-child {
      margin-bottom: 0;
    }

    hr {
      margin: ${token.marginXS}px 0;
      border: none;
      height: ${token.lineWidth}px;
      background: linear-gradient(
        90deg,
        transparent,
        ${token.colorBorderSecondary},
        transparent
      );
      border-radius: ${token.borderRadiusXS}px;
      opacity: 0.8;
    }

    /* Inline code only; fenced blocks are rendered by SyntaxHighlighter. */
    :not(pre) > code {
      padding: 2px 6px;
      font-family: ${token.fontFamilyCode};
      font-size: 0.875em;
      white-space: pre-wrap;
      background-color: ${token.colorBgContainerDisabled};
      border: ${token.lineWidth}px solid ${token.colorBorder};
      border-radius: ${token.borderRadiusSM}px;
    }
    pre {
      margin: 0 0 1em;
      overflow: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: ${token.fontSizeSM}px;
      background-color: ${token.colorBgContainer};
    }
    th,
    td {
      padding: ${token.paddingXS}px ${token.paddingSM}px;
      border-right: ${token.lineWidth}px solid ${token.colorBorderSecondary};
    }
    th {
      text-align: left;
      font-weight: ${token.fontWeightStrong};
      color: ${token.colorTextSecondary};
      background-color: ${token.colorFillTertiary};
      border-bottom: ${token.lineWidth}px solid ${token.colorBorder};
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    td {
      color: ${token.colorText};
      vertical-align: top;
    }
    tr {
      border-bottom: ${token.lineWidth}px solid ${token.colorBorderSecondary};
      transition: background-color ${token.motionDurationSlow};
    }
    tr:hover {
      background-color: ${token.colorFillQuaternary};
    }
    tr:last-child {
      border-bottom: none;
    }
    th:last-child,
    td:last-child {
      border-right: none;
    }
  `,
  // Wide tables scroll inside their own box instead of stretching the
  // surrounding alert / drawer.
  tableWrapper: css`
    margin: 0 0 1em;
    overflow: auto;
    border: ${token.lineWidth}px solid ${token.colorBorderSecondary};
    border-radius: ${token.borderRadiusSM}px;
  `,
  codeBlock: css`
    & .shiki.github-light,
    & .shiki.github-dark {
      margin: 0 !important;
      padding: ${token.paddingSM}px !important;
    }
    & div[dir='ltr'] {
      display: table;
      min-width: 100%;
    }
  `,
}));

interface MarkdownContentProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children'
> {
  children: string;
  /**
   * Rendered in the top-right slot of every fenced code block's header,
   * next to the language label. Receives the block's code so the caller can
   * wire e.g. a copy button; omitted by default, since whether a copy
   * affordance belongs there is the caller's decision.
   */
  codeBlockExtra?: (code: string) => React.ReactNode;
}

/**
 * Renders markdown text with a shared reading typography (headings,
 * blockquotes, tables, lists) and a shiki-based fenced-code highlighter.
 *
 * Every call site shares one renderer, one plugin set, and one stylesheet so
 * they can't drift from each other — e.g. a blockquote styled in one place
 * but rendered as plain text in another (FR-3402). The element overrides and
 * tokens mirror `ChatMessageContent`, which stays separate because it also
 * owns streaming concerns (per-block splitting, `pre-wrap` paragraphs).
 */
const MarkdownContent: React.FC<MarkdownContentProps> = ({
  children,
  className,
  codeBlockExtra,
  ...divProps
}) => {
  'use memo';

  const { styles, cx } = useStyles();
  const { token } = theme.useToken();

  const components: Components = {
    // The fenced-code box is built in `code` below; `pre` only carries the
    // block's spacing and horizontal scroll.
    pre({ node: _node, ref: _ref, ...props }) {
      return <pre {...props} style={{ overflow: 'auto', marginTop: 0 }} />;
    },
    code({ node, className: codeClassName, children, ref: _ref, ...rest }) {
      const match = /language-(\w+)/.exec(codeClassName ?? '');
      const content = String(children ?? '').replace(/\n$/, '');
      // A fenced block always spans its opening and closing fence, so it
      // never sits on a single source line the way inline code does.
      const isMultiline = node?.position
        ? node.position.start.line !== node.position.end.line
        : content.includes('\n');

      if (!match && !isMultiline) {
        return (
          <code {...rest} className={codeClassName}>
            {children}
          </code>
        );
      }

      const language = match?.[1] ?? 'txt';
      return (
        <BAIFlex
          direction="column"
          align="stretch"
          style={{
            border: `${token.lineWidth}px solid ${token.colorBorder}`,
            borderRadius: token.borderRadiusLG,
            overflow: 'hidden',
          }}
        >
          <CodeHead lang={language} extra={codeBlockExtra?.(content)} />
          <BAIFlex
            className={styles.codeBlock}
            style={{
              width: '100%',
              borderRadius: `0 0 ${token.borderRadiusLG}px ${token.borderRadiusLG}px`,
              overflow: 'auto',
            }}
          >
            <SyntaxHighlighter language={language}>{content}</SyntaxHighlighter>
          </BAIFlex>
        </BAIFlex>
      );
    },
    table({ node: _node, ref: _ref, ...props }) {
      return (
        <div className={styles.tableWrapper}>
          <table {...props} />
        </div>
      );
    },
  };

  return (
    <div className={cx(styles.markdown, className)} {...divProps}>
      <Markdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={components}
      >
        {children}
      </Markdown>
    </div>
  );
};

export default MarkdownContent;
