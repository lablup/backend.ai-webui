/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ExportOutlined } from '@ant-design/icons';
import { Button, Spin, Tooltip, theme } from 'antd';
import { createStyles } from 'antd-style';
import { BAIModal, type BAIModalProps } from 'backend.ai-ui';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

const useStyles = createStyles(({ token, css }) => ({
  docsBody: css`
    padding: ${token.paddingLG}px ${token.paddingXL}px;
    overflow: auto;
    flex: 1;
    font-size: ${token.fontSize}px;
    line-height: 1.7;
    color: ${token.colorText};
    background: ${token.colorBgElevated};

    h1 {
      font-size: ${token.fontSizeHeading2}px;
      margin-top: 0;
    }
    h2 {
      font-size: ${token.fontSizeHeading3}px;
      margin-top: ${token.marginXL}px;
      padding-bottom: ${token.paddingXS}px;
      border-bottom: ${token.lineWidth}px solid ${token.colorBorderSecondary};
    }
    h3 {
      font-size: ${token.fontSizeHeading4}px;
      margin-top: ${token.marginLG}px;
    }
    img {
      max-width: 100%;
      border-radius: ${token.borderRadiusLG}px;
      margin: ${token.marginSM}px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: ${token.marginMD}px 0;
    }
    th,
    td {
      border: ${token.lineWidth}px solid ${token.colorBorderSecondary};
      padding: ${token.paddingXS}px ${token.paddingSM}px;
      text-align: left;
    }
    th {
      background: ${token.colorFillAlter};
      font-weight: ${token.fontWeightStrong};
    }
    blockquote {
      margin: ${token.marginMD}px 0;
      padding: ${token.paddingSM}px ${token.padding}px;
      border-left: ${token.lineWidthBold * 2}px solid ${token.colorPrimary};
      background: ${token.colorFillAlter};
      border-radius: 0 ${token.borderRadiusSM}px ${token.borderRadiusSM}px 0;
    }
    code {
      background: ${token.colorFillTertiary};
      padding: ${token.lineWidth * 2}px ${token.paddingXS - 2}px;
      border-radius: ${token.borderRadiusSM}px;
      font-size: 0.9em;
    }
    pre {
      background: ${token.colorFillQuaternary};
      padding: ${token.paddingSM}px;
      border-radius: ${token.borderRadiusLG}px;
      overflow-x: auto;
    }
    pre code {
      background: none;
      padding: 0;
    }
    ul,
    ol {
      padding-left: ${token.paddingLG + token.paddingXS}px;
      margin: ${token.marginSM}px 0;
    }
    ul {
      list-style-type: disc;
    }
    ol {
      list-style-type: decimal;
    }
    ul ul {
      list-style-type: circle;
    }
    ul ul ul {
      list-style-type: square;
    }
    li {
      margin-bottom: ${token.marginXXS}px;
    }
    a {
      color: ${token.colorLink};
    }
  `,
}));

interface HelpDocumentModalProps extends Omit<
  BAIModalProps,
  'title' | 'children'
> {
  /** Markdown file path relative to docs src (e.g., "summary/summary.md") */
  docPath: string;
  /** Language code for docs (e.g., "en", "ko") */
  docLang: string;
  /** External docs URL for "open in new tab" button */
  externalDocURL?: string;
}

const HelpDocumentModal: React.FC<HelpDocumentModalProps> = ({
  docPath,
  docLang,
  externalDocURL,
  ...modalProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { styles } = useStyles();
  const [markdown, setMarkdown] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const basePath = `/packages/backend.ai-webui-docs/src/${docLang}/`;
  const mdURL = basePath + docPath;

  const fetchMarkdown = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(mdURL);
      if (!res.ok) throw new Error(`${res.status}`);
      const text = await res.text();
      // Strip HTML comments (<!-- ... -->) and
      // admonition fences (:::note, :::warning, etc.) for simple rendering
      const cleaned = text
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/^:::\w+(?:\[.*?\])?\s*$/gm, '')
        .replace(/^:::\s*$/gm, '');
      setMarkdown(cleaned);
    } catch {
      setMarkdown(
        `> ${t('webui.menu.HelpDocumentNotFound', { docLang, docPath })}`,
      );
    } finally {
      setLoading(false);
    }
  }, [mdURL, docLang, docPath, t]);

  return (
    <BAIModal
      title={
        <>
          {t('webui.menu.Help')}
          {externalDocURL ? (
            <Tooltip title={t('webui.menu.OpenExternalLink')}>
              <Button
                icon={<ExportOutlined />}
                type="text"
                size="small"
                href={externalDocURL}
                target="_blank"
                rel="noopener noreferrer"
                style={{ marginLeft: token.marginXS }}
              />
            </Tooltip>
          ) : null}
        </>
      }
      windowControls
      footer={null}
      width="70vw"
      afterOpenChange={(open) => {
        if (open) {
          fetchMarkdown();
        }
      }}
      styles={{
        body: {
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
        },
      }}
      {...modalProps}
    >
      {loading ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flex: 1,
            minHeight: token.controlHeightLG * 10,
          }}
        >
          <Spin />
        </div>
      ) : (
        <div className={styles.docsBody}>
          <Markdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            urlTransform={(url) => {
              // Resolve relative image paths to the docs directory
              if (
                url.startsWith('images/') ||
                url.startsWith('../images/') ||
                url.startsWith('./images/')
              ) {
                const dirPath = docPath.includes('/')
                  ? docPath.substring(0, docPath.lastIndexOf('/') + 1)
                  : '';
                return basePath + dirPath + url;
              }
              return url;
            }}
            components={{
              a: ({ href, children, ...props }) => {
                if (href?.startsWith('#')) {
                  return (
                    <a
                      {...props}
                      href={href}
                      onClick={(e) => {
                        e.preventDefault();
                        const target = document.getElementById(href.slice(1));
                        target?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      {children}
                    </a>
                  );
                }
                return (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    {...props}
                  >
                    {children}
                  </a>
                );
              },
            }}
          >
            {markdown}
          </Markdown>
        </div>
      )}
    </BAIModal>
  );
};

export default HelpDocumentModal;
