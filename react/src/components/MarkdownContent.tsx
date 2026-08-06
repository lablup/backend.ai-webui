/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { CodeHead } from './Chat/CodeHead';
import { SyntaxHighlighter } from './Chat/SyntaxHighlighter';
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
  // bordered headings. `ChatMessageContent` renders through this same
  // component (see its file), so every element styled here — blockquote,
  // hr, lists, tables, inline code — looks identical in chat and elsewhere.
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
    /* Fenced blocks are replaced wholesale below, so the only \`pre\` left is
       the highlighter's own loading fallback, which sits inside the panel. */
    pre {
      margin: 0;
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
  // Margin lives here rather than inline so the container's
  // \`& > *:last-child { margin-bottom: 0 }\` can still win over it.
  codeBlockPanel: css`
    margin-bottom: 1em;
    overflow: hidden;
    border: ${token.lineWidth}px solid ${token.colorBorder};
    border-radius: ${token.borderRadiusLG}px;
  `,
  codeBlock: css`
    width: 100%;
    overflow: auto;
    border-radius: 0 0 ${token.borderRadiusLG}px ${token.borderRadiusLG}px;

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
  // Streaming-only: preserves literal whitespace/newlines in a paragraph
  // that may not yet be "finished" markdown (see `isStreaming` doc below).
  paragraphStreaming: css`
    white-space: pre-wrap;
    word-break: break-word;
  `,
  // Streaming-only: strips the inline-code background/border for a code
  // span that currently crosses a newline. `:not(pre) > code` above styles
  // every inline code the same way, which is correct once markdown is
  // final — but mid-stream, an unterminated fenced block can momentarily
  // parse as a multi-line code span, and giving that the inline pill style
  // reads as a rendering glitch.
  codeSpanStreaming: css`
    background: none;
    border: none;
    padding: 0;
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
  /**
   * Set while the `children` markdown is still arriving incrementally (e.g.
   * a chat message being streamed token-by-token) rather than complete.
   * Turns on two defensive renderers that don't apply to finished markdown:
   * paragraphs keep literal whitespace (`pre-wrap`) instead of collapsing
   * it, and an inline code span that currently spans multiple lines (an
   * unterminated fence can momentarily parse this way) renders without the
   * inline-code pill style instead of looking like a broken code block.
   */
  isStreaming?: boolean;
}

/**
 * Renders markdown text with a shared reading typography (headings,
 * blockquotes, tables, lists) and a shiki-based fenced-code highlighter.
 *
 * Every call site shares one renderer, one plugin set, and one stylesheet so
 * they can't drift from each other — e.g. a blockquote styled in one place
 * but rendered as plain text in another (FR-3402). `ChatMessageContent`
 * renders through this component too (one block at a time, for its
 * per-block streaming memoization); its streaming-only quirks are opted
 * into via `isStreaming` rather than living in a second copy of this file.
 */
const MarkdownContent: React.FC<MarkdownContentProps> = ({
  children,
  className,
  codeBlockExtra,
  isStreaming,
  ...divProps
}) => {
  'use memo';

  const { styles, cx } = useStyles();

  const components: Components = {
    // Fenced code reaches us as `pre > code`. Replace the whole `pre` rather
    // than rendering the panel inside it: `pre` takes phrasing content, so a
    // panel there would nest block elements — and the highlighter's own
    // `pre` — inside a preformatted element.
    //
    // Reading the language and text off the element tree also settles
    // block-vs-inline structurally. Inline code never reaches this override,
    // so it keeps the default `<code>` (styled by `:not(pre) > code` above)
    // even for a code span that wraps across a newline, which CommonMark
    // allows and a line-count heuristic would misread as a fenced block.
    pre({ node }) {
      const codeNode = node?.children.find(
        (child) => child.type === 'element' && child.tagName === 'code',
      );
      const rawClassName =
        codeNode && 'properties' in codeNode
          ? codeNode.properties.className
          : undefined;
      const classNames = Array.isArray(rawClassName)
        ? rawClassName.map(String)
        : typeof rawClassName === 'string'
          ? rawClassName.split(/\s+/)
          : [];
      // Capture the whole token: `useHighlight` knows `git-commit`,
      // `objective-c`, `c#` and `f#`, all of which a `\w+` capture truncates.
      const language =
        classNames
          .map((name) => /^language-(\S+)$/.exec(name)?.[1])
          .find(Boolean) ?? 'txt';
      const content = (
        codeNode && 'children' in codeNode
          ? codeNode.children
              .map((child) => ('value' in child ? child.value : ''))
              .join('')
          : ''
      ).replace(/\n$/, '');

      return (
        <BAIFlex
          direction="column"
          align="stretch"
          className={styles.codeBlockPanel}
        >
          <CodeHead lang={language} extra={codeBlockExtra?.(content)} />
          <BAIFlex className={styles.codeBlock}>
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

  // Streaming-only overrides — see `isStreaming` doc on the props above.
  // Omitted entirely when not streaming, so finished markdown keeps the
  // plain default `p` and the unconditional `:not(pre) > code` styling.
  if (isStreaming) {
    components.p = ({ node: _node, className: pClassName, ...props }) => (
      <p {...props} className={cx(pClassName, styles.paragraphStreaming)} />
    );
    components.code = ({
      node,
      className: codeClassName,
      ref: _ref,
      ...rest
    }) => {
      const isOneLine =
        node?.position?.start?.line === node?.position?.end?.line;
      return (
        <code
          {...rest}
          className={
            isOneLine
              ? codeClassName
              : cx(codeClassName, styles.codeSpanStreaming)
          }
        />
      );
    };
  }

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
