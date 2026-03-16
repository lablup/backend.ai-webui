/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useDocNavigation } from '../hooks/useDocNavigation';
import { findDocPathByAnchor, useDocSearch } from '../hooks/useDocSearch';
import {
  CloseOutlined,
  DownOutlined,
  ExportOutlined,
  LeftOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  RightOutlined,
  SearchOutlined,
  UpOutlined,
} from '@ant-design/icons';
import useResizeObserver from '@react-hook/resize-observer';
import { Button, Input, type InputRef, Spin, Tooltip, theme } from 'antd';
import { createStyles } from 'antd-style';
import { BAIModal, type BAIModalProps } from 'backend.ai-ui';
import React, {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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

// Minimal HAST node types (inline to avoid dependency on @types/hast)
interface HastText {
  type: 'text';
  value: string;
}
interface HastElement {
  type: 'element';
  tagName: string;
  properties?: Record<string, unknown>;
  children: HastNode[];
}
interface HastRoot {
  type: 'root';
  children: HastNode[];
}
type HastNode = HastText | HastElement | HastRoot | { type: string };

const SKIP_TAGS = new Set(['pre', 'code', 'mark']);

/**
 * Rehype plugin that wraps matching text in <mark> elements.
 * Operates on the HAST (HTML AST) so React manages all DOM nodes — no
 * direct DOM manipulation that would conflict with React's reconciler.
 */
function rehypeSearchHighlight(query: string) {
  const lowerQuery = query.toLowerCase();

  function processNode(node: HastNode, matchCounter: { value: number }): void {
    if (node.type === 'element') {
      const el = node as HastElement;
      if (SKIP_TAGS.has(el.tagName)) return;

      const newChildren: HastNode[] = [];
      for (const child of el.children) {
        if (child.type === 'text') {
          const textNode = child as HastText;
          const text = textNode.value;
          const lowerText = text.toLowerCase();

          if (!lowerText.includes(lowerQuery)) {
            newChildren.push(child);
            continue;
          }

          let lastIdx = 0;
          let searchFrom = 0;
          while (searchFrom < lowerText.length) {
            const idx = lowerText.indexOf(lowerQuery, searchFrom);
            if (idx === -1) break;

            if (idx > lastIdx) {
              newChildren.push({
                type: 'text',
                value: text.slice(lastIdx, idx),
              });
            }
            newChildren.push({
              type: 'element',
              tagName: 'mark',
              properties: {
                'data-search-match': String(matchCounter.value),
              },
              children: [
                { type: 'text', value: text.slice(idx, idx + query.length) },
              ],
            });
            matchCounter.value++;
            lastIdx = idx + query.length;
            searchFrom = idx + 1;
          }
          if (lastIdx < text.length) {
            newChildren.push({ type: 'text', value: text.slice(lastIdx) });
          }
        } else {
          processNode(child, matchCounter);
          newChildren.push(child);
        }
      }
      el.children = newChildren;
    } else if (node.type === 'root') {
      const root = node as HastRoot;
      for (const child of root.children) {
        processNode(child, { value: 0 });
      }
    }
  }

  return () => (tree: HastRoot) => {
    if (!query || query.length < 2) return;
    const counter = { value: 0 };
    for (const child of tree.children) {
      processNode(child, counter);
    }
  };
}

/**
 * Count the number of case-insensitive substring matches in the rendered markdown.
 * Used to track currentDocMatchCount for the match navigation bar.
 */
function countMatchesInMarkdown(markdown: string, query: string): number {
  if (!query || query.length < 2) return 0;
  const lowerQuery = query.toLowerCase();
  // Strip markdown syntax to approximate the rendered text, matching what rehype processes
  const text = markdown
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/```[\s\S]*?```/g, '') // skip code blocks
    .replace(/`[^`]*`/g, '') // skip inline code
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[([^\]]*)\]\(.*?\)/g, '$1')
    .replace(/<[^>]+>/g, '') // strip HTML tags
    .toLowerCase();
  let count = 0;
  let searchFrom = 0;
  while (searchFrom < text.length) {
    const idx = text.indexOf(lowerQuery, searchFrom);
    if (idx === -1) break;
    count++;
    searchFrom = idx + 1;
  }
  return count;
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
    mark[data-search-match] {
      scroll-margin-top: ${token.marginLG}px;
      background-color: ${token.colorWarningBg};
      border-radius: ${token.borderRadiusXS}px;
      padding: 0 1px;
    }
    mark[data-search-match].active-match {
      background-color: ${token.colorWarning};
      color: ${token.colorWhite};
    }
  `,
  tocSidebar: css`
    width: ${TOC_WIDTH}px;
    min-width: ${TOC_WIDTH}px;
    display: flex;
    flex-direction: column;
    border-right: ${token.lineWidth}px solid ${token.colorBorderSecondary};
    background: ${token.colorBgLayout};
    transition: all ${token.motionDurationMid};
    overflow: hidden;
  `,
  tocSidebarCollapsed: css`
    width: 0;
    min-width: 0;
    border-right: none;
  `,
  tocSearchArea: css`
    flex-shrink: 0;
    padding: ${token.paddingSM}px ${token.paddingSM}px 0;
    border-bottom: ${token.lineWidth}px solid ${token.colorBorderSecondary};
    background: ${token.colorBgLayout};
  `,
  tocList: css`
    flex: 1;
    overflow-y: auto;
    padding: ${token.paddingXS}px 0;
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
  tocSearchInput: css`
    margin-bottom: ${token.marginSM}px;
  `,
  tocItemDimmed: css`
    opacity: 0.4;
  `,
  matchBadge: css`
    margin-left: ${token.marginXXS}px;
    font-size: ${token.fontSizeSM}px;
    color: ${token.colorTextSecondary};
  `,
  floatingSearchBar: css`
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
    display: flex;
    align-items: center;
    gap: ${token.marginXS}px;
    padding: ${token.paddingXS}px ${token.paddingSM}px;
    background: ${token.colorBgElevated};
    border: ${token.lineWidth}px solid ${token.colorBorderSecondary};
    border-top: none;
    border-radius: 0 0 ${token.borderRadiusLG}px ${token.borderRadiusLG}px;
    box-shadow: ${token.boxShadowSecondary};
    max-width: calc(100% - ${token.paddingMD * 2}px);
  `,
  matchNavInfo: css`
    font-size: ${token.fontSizeSM}px;
    color: ${token.colorTextSecondary};
    white-space: nowrap;
    min-width: 48px;
    text-align: center;
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
  const [showFloatingSearch, setShowFloatingSearch] = useState(false);
  const [searchInputValue, setSearchInputValue] = useState('');
  const [activeMatchIndex, setActiveMatchIndex] = useState(0);
  const docsBodyRef = useRef<HTMLDivElement>(null);
  const tocActiveRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const floatingSearchInputRef = useRef<InputRef>(null);

  const { navItems, currentIndex, prevItem, nextItem } = useDocNavigation(
    docLang,
    activeDocPath,
  );

  const {
    query: searchQuery,
    setQuery: setSearchQuery,
    results: searchResults,
    getMatchCount,
  } = useDocSearch(docLang, !!modalProps.open, navItems);

  // Input updates immediately, search query is deferred for smooth typing
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const hasActiveSearch = deferredSearchQuery.length >= 2;

  // Compute current doc match count from markdown text (not DOM)
  const currentDocMatchCount = useMemo(
    () => countMatchesInMarkdown(markdown, deferredSearchQuery),
    [markdown, deferredSearchQuery],
  );

  // Build the rehype highlight plugin, memoized on deferred query
  const rehypePlugins = useMemo(
    () =>
      hasActiveSearch
        ? [rehypeRaw, rehypeSearchHighlight(deferredSearchQuery)]
        : [rehypeRaw],
    [hasActiveSearch, deferredSearchQuery],
  );

  // Sync search input value with the hook's query (for controlled input)
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchInputValue(value);
      setSearchQuery(value);
    },
    [setSearchQuery],
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

  // Scroll to active match when activeMatchIndex changes
  useEffect(() => {
    if (!hasActiveSearch || currentDocMatchCount === 0) return;

    const container = docsBodyRef.current;
    if (!container) return;

    const marks = container.querySelectorAll('mark[data-search-match]');
    marks.forEach((mark, i) => {
      mark.classList.toggle('active-match', i === activeMatchIndex);
      if (i === activeMatchIndex) {
        mark.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }, [
    activeMatchIndex,
    hasActiveSearch,
    currentDocMatchCount,
    deferredSearchQuery,
    markdown,
  ]);

  const navigateMatch = useCallback(
    (direction: 'next' | 'prev') => {
      if (currentDocMatchCount === 0) return;
      setActiveMatchIndex((prev) => {
        if (direction === 'next') {
          return (prev + 1) % currentDocMatchCount;
        }
        return (prev - 1 + currentDocMatchCount) % currentDocMatchCount;
      });
    },
    [currentDocMatchCount],
  );

  // Reset active match when query or document changes
  useEffect(() => {
    setActiveMatchIndex(0);
  }, [deferredSearchQuery, activeDocPath]);

  const clearSearch = useCallback(() => {
    handleSearchChange('');
    setShowFloatingSearch(false);
    setActiveMatchIndex(0);
  }, [handleSearchChange]);

  // Keyboard handler for Ctrl+F and search navigation
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !modalProps.open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        e.stopPropagation();
        setShowFloatingSearch(true);
        requestAnimationFrame(() => {
          floatingSearchInputRef.current?.focus();
          floatingSearchInputRef.current?.select?.();
        });
        return;
      }
      if (e.key === 'Escape' && (showFloatingSearch || hasActiveSearch)) {
        e.preventDefault();
        e.stopPropagation();
        clearSearch();
        return;
      }
      if (showFloatingSearch || hasActiveSearch) {
        if (e.key === 'Enter' || e.key === 'F3') {
          e.preventDefault();
          navigateMatch(e.shiftKey ? 'prev' : 'next');
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [
    modalProps.open,
    showFloatingSearch,
    hasActiveSearch,
    navigateMatch,
    clearSearch,
  ]);

  // Auto-scroll TOC to keep active item visible
  useEffect(() => {
    tocActiveRef.current?.scrollIntoView({ block: 'nearest' });
  }, [currentIndex, activeDocPath]);

  const handleNavigate = useCallback((path: string) => {
    setActiveDocPath(path);
    setActiveMatchIndex(0);
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
          // Focus container so Cmd+F is intercepted instead of browser search
          requestAnimationFrame(() => {
            containerRef.current?.focus();
          });
        } else {
          setMarkdown('');
          clearSearch();
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
        tabIndex={-1}
        style={{
          display: 'flex',
          flex: 1,
          overflow: 'hidden',
          outline: 'none',
        }}
      >
        {/* TOC Sidebar */}
        <div
          className={cx(
            styles.tocSidebar,
            tocCollapsed && styles.tocSidebarCollapsed,
          )}
          inert={tocCollapsed || undefined}
        >
          {/* Fixed search area */}
          <div className={styles.tocSearchArea}>
            <Input
              className={styles.tocSearchInput}
              placeholder={t('webui.menu.SearchDocs')}
              prefix={<SearchOutlined />}
              size="small"
              allowClear
              value={searchInputValue}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
          {/* Scrollable TOC list */}
          <div className={styles.tocList}>
            {hasActiveSearch && searchResults.length === 0 ? (
              <div
                style={{
                  padding: `${token.paddingXS}px ${token.paddingMD}px`,
                  color: token.colorTextSecondary,
                  fontSize: token.fontSizeSM,
                }}
              >
                {t('webui.menu.NoSearchResults')}
              </div>
            ) : null}
            {navItems.map((item, idx) => {
              const isAdminDoc = item.path === ADMIN_DOC_PATH;
              const itemMatchCount = getMatchCount(item.path);
              const isDimmed = hasActiveSearch && itemMatchCount === 0;

              // Skip admin_menu entry itself — replaced by section header + sub-items
              if (isAdminDoc) {
                return (
                  <React.Fragment key={item.path}>
                    {/* Admin section header */}
                    <div
                      role="button"
                      tabIndex={0}
                      className={cx(
                        styles.tocSectionHeader,
                        isDimmed && styles.tocItemDimmed,
                      )}
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
                      {hasActiveSearch && itemMatchCount > 0 ? (
                        <span className={styles.matchBadge}>
                          ({itemMatchCount})
                        </span>
                      ) : null}
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
                          isDimmed && styles.tocItemDimmed,
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
                    idx === currentIndex &&
                      !isInAdminDoc &&
                      styles.tocItemActive,
                    isDimmed && styles.tocItemDimmed,
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
                  {hasActiveSearch && itemMatchCount > 0 ? (
                    <span className={styles.matchBadge}>
                      ({itemMatchCount})
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
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
          {/* Floating search bar (Ctrl+F / Cmd+F) */}
          {showFloatingSearch ? (
            <div className={styles.floatingSearchBar}>
              <Input
                ref={floatingSearchInputRef}
                placeholder={t('webui.menu.SearchDocs')}
                prefix={<SearchOutlined />}
                size="small"
                allowClear
                value={searchInputValue}
                onChange={(e) => handleSearchChange(e.target.value)}
                style={{ minWidth: 140, flex: 1 }}
              />
              {hasActiveSearch ? (
                <>
                  <span className={styles.matchNavInfo}>
                    {currentDocMatchCount > 0
                      ? t('webui.menu.MatchCount', {
                          current: activeMatchIndex + 1,
                          total: currentDocMatchCount,
                        })
                      : t('webui.menu.NoSearchResults')}
                  </span>
                  <Button
                    type="text"
                    size="small"
                    icon={<UpOutlined />}
                    disabled={currentDocMatchCount === 0}
                    onClick={() => navigateMatch('prev')}
                  />
                  <Button
                    type="text"
                    size="small"
                    icon={<DownOutlined />}
                    disabled={currentDocMatchCount === 0}
                    onClick={() => navigateMatch('next')}
                  />
                </>
              ) : null}
              <Button
                type="text"
                size="small"
                icon={<CloseOutlined />}
                onClick={() => {
                  clearSearch();
                }}
              />
            </div>
          ) : null}

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
                rehypePlugins={rehypePlugins}
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
                    // Same-page anchor link (#id) — fall back to cross-doc lookup
                    if (href?.startsWith('#')) {
                      return (
                        <a
                          {...props}
                          href={href}
                          onClick={(e) => {
                            e.preventDefault();
                            const anchorId = href.slice(1);
                            const target = docsBodyRef.current?.querySelector(
                              `[id="${CSS.escape(anchorId)}"]`,
                            );
                            if (target) {
                              target.scrollIntoView({ behavior: 'smooth' });
                            } else {
                              // Anchor not in current doc — search cached docs
                              const docPath = findDocPathByAnchor(anchorId);
                              if (docPath) {
                                handleNavigate(`${docPath}#${anchorId}`);
                              }
                            }
                          }}
                        >
                          {children}
                        </a>
                      );
                    }
                    // Internal doc link (*.md or *.md#anchor)
                    if (href && /\.md(#|$)/.test(href)) {
                      // Resolve relative paths against the current doc directory
                      const currentDir = filePath.includes('/')
                        ? filePath.substring(0, filePath.lastIndexOf('/') + 1)
                        : '';
                      // Normalize the path (handle ../ and ./)
                      const parsed = new URL(href, `http://d/${currentDir}`);
                      const resolvedPath =
                        parsed.pathname.slice(1) + (parsed.hash || ''); // preserve #anchor
                      return (
                        <a
                          {...props}
                          href={href}
                          onClick={(e) => {
                            e.preventDefault();
                            handleNavigate(resolvedPath);
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

          {/* Match navigation bar (for TOC sidebar search) */}
          {hasActiveSearch && !showFloatingSearch && !loading ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: token.marginXS,
                padding: `${token.paddingXXS}px ${token.paddingMD}px`,
                borderTop: `${token.lineWidth}px solid ${token.colorBorderSecondary}`,
                background: token.colorBgLayout,
                flexShrink: 0,
              }}
            >
              <span className={styles.matchNavInfo}>
                {currentDocMatchCount > 0
                  ? t('webui.menu.MatchCount', {
                      current: activeMatchIndex + 1,
                      total: currentDocMatchCount,
                    })
                  : t('webui.menu.NoSearchResults')}
              </span>
              <Button
                type="text"
                size="small"
                icon={<UpOutlined />}
                disabled={currentDocMatchCount === 0}
                onClick={() => navigateMatch('prev')}
              />
              <Button
                type="text"
                size="small"
                icon={<DownOutlined />}
                disabled={currentDocMatchCount === 0}
                onClick={() => navigateMatch('next')}
              />
            </div>
          ) : null}

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
