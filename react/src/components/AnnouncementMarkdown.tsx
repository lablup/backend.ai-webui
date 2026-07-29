/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { SyntaxHighlighter } from './Chat/SyntaxHighlighter';
import { createStyles } from 'antd-style';
// `rehype-katex` does not import the CSS file, so we need to import it manually.
import 'katex/dist/katex.min.css';
import React from 'react';
import Markdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

const useStyles = createStyles(({ css, token }) => ({
  // velog-style reading typography: comfortable line height, bordered
  // headings, accented blockquotes, GitHub-flavored tables.
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
      margin: 0 0 1em;
      padding-left: 1.6em;
    }
    ul {
      list-style: disc;
    }
    ul ul {
      list-style: circle;
    }
    ol {
      list-style: decimal;
    }
    li {
      margin: 0.25em 0;
    }
    li > p {
      margin: 0;
    }
    li > input[type='checkbox'] {
      margin-right: 0.4em;
    }

    blockquote {
      margin: 0 0 1em;
      padding: 0.4em 1em;
      color: ${token.colorTextSecondary};
      border-left: 4px solid ${token.colorPrimary};
      background: ${token.colorFillQuaternary};
      border-radius: ${token.borderRadiusSM}px;
    }
    blockquote > *:last-child {
      margin-bottom: 0;
    }

    hr {
      margin: 1.5em 0;
      border: none;
      border-top: 1px solid ${token.colorBorderSecondary};
    }

    /* Inline code only; fenced blocks are rendered by SyntaxHighlighter. */
    :not(pre) > code {
      padding: 0.15em 0.4em;
      font-family: ${token.fontFamilyCode};
      font-size: 0.9em;
      background: ${token.colorFillSecondary};
      border-radius: ${token.borderRadiusSM}px;
    }
    pre {
      margin: 0 0 1em;
      border-radius: ${token.borderRadius}px;
      overflow: auto;
    }

    table {
      width: 100%;
      margin: 0 0 1em;
      border-collapse: collapse;
      font-size: 0.95em;
    }
    th,
    td {
      padding: ${token.paddingXS}px ${token.paddingSM}px;
      border: 1px solid ${token.colorBorderSecondary};
    }
    th {
      background: ${token.colorFillTertiary};
      font-weight: ${token.fontWeightStrong};
      text-align: left;
    }
  `,
}));

interface AnnouncementMarkdownProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children'
> {
  children: string;
}

/**
 * Renders an announcement message as markdown.
 *
 * The editor's preview pane and the published announcement alert both render
 * through this component so that the preview is a faithful preview: one
 * renderer, one plugin set, one stylesheet. Rendering them separately let the
 * two drift — a blockquote styled in the preview came out as plain text once
 * published (FR-3402).
 */
const AnnouncementMarkdown: React.FC<AnnouncementMarkdownProps> = ({
  children,
  className,
  ...divProps
}) => {
  'use memo';

  const { styles, cx } = useStyles();

  return (
    <div className={cx(styles.markdown, className)} {...divProps}>
      <Markdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          // Fenced code blocks: render through the shared shiki-based
          // highlighter (theme-aware). Inline code keeps the default
          // <code> and is styled via CSS.
          pre({ children }) {
            const codeElement = Array.isArray(children)
              ? children[0]
              : children;
            const className: string =
              // @ts-ignore - react-markdown passes the <code> element here
              codeElement?.props?.className ?? '';
            const match = /language-(\w+)/.exec(className);
            const content = String(
              // @ts-ignore
              codeElement?.props?.children ?? '',
            ).replace(/\n$/, '');
            return (
              <SyntaxHighlighter language={match?.[1] ?? 'txt'}>
                {content}
              </SyntaxHighlighter>
            );
          },
        }}
      >
        {children}
      </Markdown>
    </div>
  );
};

export default AnnouncementMarkdown;
