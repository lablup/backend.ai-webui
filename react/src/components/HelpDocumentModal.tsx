/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useDocNavigation } from '../hooks/useDocNavigation';
import {
  ExportOutlined,
  LeftOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  RightOutlined,
} from '@ant-design/icons';
import useResizeObserver from '@react-hook/resize-observer';
import { Button, Spin, Tooltip, theme } from 'antd';
import { createStyles } from 'antd-style';
import { BAIModal, type BAIModalProps } from 'backend.ai-ui';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

const TOC_WIDTH = 240;
const COLLAPSE_BREAKPOINT = 768;
const ADMIN_DOC_PATH = 'admin_menu/admin_menu.md';

interface AdminSubSection {
  anchor: string;
  title: string;
}

/**
 * Parse h2 headings and their preceding anchor IDs from admin_menu markdown.
 * Pattern: <a id="anchor-id"></a>\n\n## Heading Title
 */
function parseAdminSubSections(markdownText: string): AdminSubSection[] {
  const sections: AdminSubSection[] = [];
  const lines = markdownText.split('\n');

  let lastAnchor: string | null = null;
  for (const line of lines) {
    const anchorMatch = line.match(/<a\s+id=["']([^"']+)["']\s*\/?>\s*<\/a>/);
    if (anchorMatch) {
      lastAnchor = anchorMatch[1];
      continue;
    }
    const h2Match = line.match(/^##\s+(.+)$/);
    if (h2Match && lastAnchor) {
      sections.push({ anchor: lastAnchor, title: h2Match[1].trim() });
      lastAnchor = null;
    } else if (h2Match) {
      // h2 without preceding anchor — use slugified title
      const slug = h2Match[1]
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      sections.push({ anchor: slug, title: h2Match[1].trim() });
    }
  }
  return sections;
}

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
  tocSidebar: css`
    width: ${TOC_WIDTH}px;
    min-width: ${TOC_WIDTH}px;
    overflow-y: auto;
    border-right: ${token.lineWidth}px solid ${token.colorBorderSecondary};
    background: ${token.colorBgLayout};
    padding: ${token.paddingSM}px 0;
    transition: all ${token.motionDurationMid};
  `,
  tocSidebarCollapsed: css`
    width: 0;
    min-width: 0;
    padding: 0;
    overflow: hidden;
    border-right: none;
  `,
  tocItem: css`
    display: block;
    padding: ${token.paddingXS}px ${token.paddingMD}px;
    color: ${token.colorText};
    cursor: pointer;
    font-size: ${token.fontSize}px;
    line-height: 1.5;
    border-left: ${token.lineWidthBold}px solid transparent;
    transition: all ${token.motionDurationFast};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    &:hover {
      background: ${token.colorFillQuaternary};
      color: ${token.colorPrimary};
    }
  `,
  tocSubItem: css`
    padding-left: ${token.paddingMD + token.paddingSM}px;
    font-size: ${token.fontSizeSM}px;
  `,
  tocItemActive: css`
    background: ${token.colorPrimaryBg};
    color: ${token.colorPrimary};
    font-weight: ${token.fontWeightStrong};
    border-left-color: ${token.colorPrimary};

    &:hover {
      background: ${token.colorPrimaryBg};
    }
  `,
  tocSectionHeader: css`
    padding: ${token.paddingSM}px ${token.paddingMD}px ${token.paddingXXS}px;
    margin-top: ${token.marginSM}px;
    border-top: ${token.lineWidth}px solid ${token.colorBorderSecondary};
    font-size: ${token.fontSize}px;
    font-weight: ${token.fontWeightStrong};
    color: ${token.colorText};
  `,
  prevNextBar: css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${token.paddingMD}px ${token.paddingXL}px;
    border-top: ${token.lineWidth}px solid ${token.colorBorderSecondary};
    background: ${token.colorBgElevated};
    flex-shrink: 0;
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
  const { styles, cx } = useStyles();

  const [activeDocPath, setActiveDocPath] = useState(docPath);
  const [markdown, setMarkdown] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [tocCollapsed, setTocCollapsed] = useState(false);
  const [adminSubSections, setAdminSubSections] = useState<AdminSubSection[]>(
    [],
  );
  const docsBodyRef = useRef<HTMLDivElement>(null);
  const tocActiveRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { navItems, currentIndex, prevItem, nextItem } = useDocNavigation(
    docLang,
    activeDocPath,
  );

  // Sync activeDocPath when initial docPath prop changes (route change)
  useEffect(() => {
    setActiveDocPath(docPath);
  }, [docPath]);

  // Responsive: auto-collapse TOC based on container width
  useResizeObserver(containerRef, (entry: ResizeObserverEntry) => {
    setTocCollapsed(entry.contentRect.width < COLLAPSE_BREAKPOINT);
  });

  const basePath = `/packages/backend.ai-webui-docs/src/${docLang}/`;
  const [filePath, anchor] = activeDocPath.split('#');
  const mdURL = basePath + filePath;

  // Fetch admin_menu.md to extract h2 sub-sections for TOC
  const fetchAdminSubSections = useCallback(async () => {
    try {
      const res = await fetch(basePath + ADMIN_DOC_PATH);
      if (!res.ok) return;
      const text = await res.text();
      setAdminSubSections(parseAdminSubSections(text));
    } catch {
      setAdminSubSections([]);
    }
  }, [basePath]);

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchMarkdown = useCallback(
    async (url: string, anchorId?: string, displayPath?: string) => {
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setLoading(true);
      try {
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`${res.status}`);
        const text = await res.text();
        if (controller.signal.aborted) return;
        const cleaned = text
          .replace(/<!--[\s\S]*?-->/g, '')
          .replace(/^:::\w+(?:\[.*?\])?\s*$/gm, '')
          .replace(/^:::\s*$/gm, '');
        setMarkdown(cleaned);
        requestAnimationFrame(() => {
          if (anchorId) {
            const target = docsBodyRef.current?.querySelector(
              `#${CSS.escape(anchorId)}`,
            );
            target?.scrollIntoView({ behavior: 'instant' });
          } else {
            docsBodyRef.current?.scrollTo(0, 0);
          }
        });
      } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') return;
        setMarkdown(
          `> ${t('webui.menu.HelpDocumentNotFound', { docLang, docPath: displayPath ?? url })}`,
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    },
    [docLang, t],
  );

  // Fetch markdown when activeDocPath changes
  useEffect(() => {
    if (modalProps.open && activeDocPath) {
      fetchMarkdown(mdURL, anchor, filePath);
    }
  }, [activeDocPath, modalProps.open, mdURL, anchor, filePath, fetchMarkdown]);

  // Auto-scroll TOC to keep active item visible
  useEffect(() => {
    tocActiveRef.current?.scrollIntoView({ block: 'nearest' });
  }, [currentIndex, activeDocPath]);

  const handleNavigate = useCallback((path: string) => {
    setActiveDocPath(path);
  }, []);

  // Compute image base path for url transforms
  const imageBasePath =
    basePath +
    (filePath.includes('/')
      ? filePath.substring(0, filePath.lastIndexOf('/') + 1)
      : '');

  // Check if a sub-section is the currently active anchor
  const activeAnchor = filePath === ADMIN_DOC_PATH ? anchor : undefined;

  // Determine if the current path is in the admin section (admin_menu or its sub-section)
  const isInAdminDoc = filePath === ADMIN_DOC_PATH;

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
      afterOpenChange={(isOpen) => {
        if (isOpen) {
          setActiveDocPath(docPath);
          const openFilePath = docPath.split('#')[0];
          fetchMarkdown(
            basePath + openFilePath,
            docPath.split('#')[1],
            openFilePath,
          );
          fetchAdminSubSections();
        } else {
          setMarkdown('');
        }
      }}
      styles={{
        body: {
          padding: 0,
          paddingTop: 0,
          paddingBottom: 0,
          display: 'flex',
          flexDirection: 'row',
          overflow: 'hidden',
        },
      }}
      {...modalProps}
    >
      <div
        ref={containerRef}
        style={{ display: 'flex', flex: 1, overflow: 'hidden' }}
      >
        {/* TOC Sidebar */}
        <div
          className={cx(
            styles.tocSidebar,
            tocCollapsed && styles.tocSidebarCollapsed,
          )}
        >
          {navItems.map((item, idx) => {
            const isAdminDoc = item.path === ADMIN_DOC_PATH;

            // Skip admin_menu entry itself — replaced by section header + sub-items
            if (isAdminDoc) {
              return (
                <React.Fragment key={item.path}>
                  {/* Admin section header */}
                  <div
                    role="button"
                    tabIndex={0}
                    className={styles.tocSectionHeader}
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleNavigate(ADMIN_DOC_PATH)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleNavigate(ADMIN_DOC_PATH);
                      }
                    }}
                  >
                    {t('webui.menu.Administration')}
                  </div>
                  {/* Admin sub-sections */}
                  {adminSubSections.map((sub) => (
                    <div
                      key={sub.anchor}
                      role="button"
                      tabIndex={0}
                      ref={
                        isInAdminDoc && activeAnchor === sub.anchor
                          ? tocActiveRef
                          : undefined
                      }
                      className={cx(
                        styles.tocItem,
                        styles.tocSubItem,
                        isInAdminDoc &&
                          activeAnchor === sub.anchor &&
                          styles.tocItemActive,
                      )}
                      onClick={() =>
                        handleNavigate(`${ADMIN_DOC_PATH}#${sub.anchor}`)
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleNavigate(`${ADMIN_DOC_PATH}#${sub.anchor}`);
                        }
                      }}
                      title={sub.title}
                    >
                      {sub.title}
                    </div>
                  ))}
                </React.Fragment>
              );
            }

            // For post-admin items, no special treatment — they render normally
            return (
              <div
                key={item.path}
                role="button"
                tabIndex={0}
                ref={
                  idx === currentIndex && !isInAdminDoc
                    ? tocActiveRef
                    : undefined
                }
                className={cx(
                  styles.tocItem,
                  idx === currentIndex && !isInAdminDoc && styles.tocItemActive,
                )}
                onClick={() => handleNavigate(item.path)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleNavigate(item.path);
                  }
                }}
                title={item.title}
              >
                {item.title}
              </div>
            );
          })}
        </div>

        {/* Content area */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* TOC toggle button */}
          <Button
            type="text"
            size="small"
            icon={tocCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setTocCollapsed((prev) => !prev)}
            aria-label={
              tocCollapsed
                ? 'Expand table of contents'
                : 'Collapse table of contents'
            }
            aria-expanded={!tocCollapsed}
            style={{
              position: 'absolute',
              top: token.paddingXXS,
              left: token.paddingXS,
              zIndex: 1,
            }}
          />

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
            <div ref={docsBodyRef} className={styles.docsBody}>
              <Markdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                urlTransform={(url) => {
                  if (
                    url.startsWith('images/') ||
                    url.startsWith('../images/') ||
                    url.startsWith('./images/')
                  ) {
                    return imageBasePath + url;
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
                            const target = document.getElementById(
                              href.slice(1),
                            );
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

          {/* Prev/Next navigation bar */}
          {(prevItem || nextItem) && !loading ? (
            <div className={styles.prevNextBar}>
              <div>
                {prevItem ? (
                  <Button
                    type="text"
                    icon={<LeftOutlined />}
                    onClick={() => handleNavigate(prevItem.path)}
                  >
                    {prevItem.title}
                  </Button>
                ) : null}
              </div>
              <div>
                {nextItem ? (
                  <Button
                    type="text"
                    onClick={() => handleNavigate(nextItem.path)}
                  >
                    {nextItem.title} <RightOutlined />
                  </Button>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </BAIModal>
  );
};

export default HelpDocumentModal;
