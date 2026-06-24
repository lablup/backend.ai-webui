import { createStyles } from 'antd-style';

/**
 * Styles for the AppShell layout primitives. Mirrors the staging-repo
 * `styles.css` (see `lablup/backend.ai-appshell` source), but adapted to
 * `antd-style` `createStyles` so it composes into BUI's library bundle and
 * scopes class names through the css-in-js pipeline.
 *
 * The component-level antd theming (colors, fonts, sizes) lives in
 * `utils/antdTheme.ts` and is applied by `AppShellProvider` via
 * `<ConfigProvider>`. The `--bai-*` CSS custom properties below are still
 * set by `AppShellProvider` on the root div as inline style — keeping them
 * available for non-antd custom styling consumers might want.
 */
export const useAppShellStyles = createStyles(({ css }) => ({
  /** Root wrapper applied to the AntdApp <div>. Holds default `--bai-*` vars
   *  and base flex layout. */
  root: css`
    --bai-color-primary: #1677ff;
    --bai-color-primary-hover: #4096ff;
    --bai-header-bg: #ffffff;
    --bai-header-text: #141414;
    --bai-sider-bg: #ffffff;
    --bai-sider-text: #141414;
    --bai-sider-active-bg: #e6f4ff;
    --bai-sider-active-text: #1677ff;
    --bai-sider-border: #dee1e7;
    --bai-content-bg: #f5f7fa;
    --bai-content-text: #141414;
    --bai-border-color: #dee1e7;

    --bai-sider-width-expanded: 240px;
    --bai-sider-width-collapsed: 74px;
    --bai-header-height: 60px;
    --bai-font-family: 'Ubuntu', system-ui, -apple-system, sans-serif;

    --bai-logo-bg: var(--bai-color-primary);
    --bai-logo-text: var(--bai-header-text);

    font-family: var(--bai-font-family);
    display: flex;
    flex-direction: column;
    width: 100%;
    /* Inherit min-height from parent so consumers mounting this inside a sized
       container (e.g. WebUI's existing chrome) get the right scroll boundary
       instead of forcing 100vh. Falls back to 100vh on bare html/body. */
    min-height: inherit;

    /* When the root is the document's direct child, fall back to viewport
       height so demo templates and standalone consumers fill the screen. */
    body > & {
      min-height: 100vh;
    }
  `,

  /** Sider wrapper — sticky positioning + box-shadow on top of antd Sider. */
  sider: css`
    &.ant-layout-sider {
      position: sticky;
      top: 0;
      height: 100vh;
      box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
    }

    /* Sider must be a flex column to stack header + content + footer correctly */
    .ant-layout-sider-children {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: visible; /* allow edge toggle to escape */
    }

    /* Align antd Menu group title with the icon column of items below.
     *   Menu items: itemMarginInline=16 + itemPaddingInline=16 → icons start at 32px.
     *   Group title default padding-inline: 16px — bump to 32px (paddingXL convention)
     *   so the title text and icon column line up. Tighter vertical rhythm too. */
    .ant-menu-item-group-title {
      padding-inline-start: 32px;
      padding-inline-end: 16px;
      padding-block: 12px 4px;
    }
  `,

  /** Modifier on the sider when collapsed. */
  siderCollapsed: css`
    /* Collapsed: no inline padding so the divider line spans the full sider width. */
    .ant-menu-item-group-title {
      padding-inline: 0;
      padding-block: 8px;
    }
  `,

  /** Logo bar — custom; antd has no equivalent. */
  siderHeader: css`
    position: sticky;
    top: 0;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    height: var(--bai-header-height);
    padding: 0 30px;
    background: var(--bai-logo-bg);
    color: var(--bai-logo-text);
    flex-shrink: 0;
    transition:
      padding 200ms ease,
      background-color 200ms ease;
  `,

  /** Modifier on the sider header when collapsed (centers the logo). */
  siderHeaderCollapsed: css`
    justify-content: center;
    padding: 0 8px;
  `,

  /** Logo image — pre-rendered for every variant; CSS shows the active one. */
  logo: css`
    max-width: 100%;
    height: auto;
    display: none;
    user-select: none;
  `,

  logoLink: css`
    display: inline-flex;
    align-items: center;
    text-decoration: none;
    color: inherit;
    outline: none;
  `,

  brandText: css`
    color: inherit;
    white-space: nowrap;
    overflow: hidden;
  `,

  /** Sider scrollable content with hover-reveal scrollbar.
   *  Visibility is driven by the parent sider's :hover / :focus-within state
   *  (handled by `siderHovering` modifier rules in the React component). */
  siderContent: css`
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 16px 0 8px;
    scrollbar-width: thin;
    scrollbar-color: transparent transparent;

    &::-webkit-scrollbar {
      width: 6px;
    }
    &::-webkit-scrollbar-track {
      background: transparent;
    }
    &::-webkit-scrollbar-thumb {
      background-color: transparent;
      border-radius: 3px;
      transition: background-color 200ms ease;
    }
  `,

  /** Modifier toggled when the sider is hovered/focused — reveals the
   *  scrollbar thumb. Apply alongside `siderContent`. */
  siderContentHovering: css`
    scrollbar-color: var(--bai-sider-border) transparent;

    &::-webkit-scrollbar-thumb {
      background-color: var(--bai-sider-border);
    }
  `,

  /** Sider footer (small, muted; only shown when expanded). */
  siderFooter: css`
    padding: 12px 16px;
    border-top: 1px solid var(--bai-sider-border);
    font-size: 12px;
    opacity: 0.65;
    text-align: center;
    flex-shrink: 0;
  `,

  /** Hover-reveal collapse toggle on sider's right edge.
   *  `translateX(12px)` matches WebUI's SiderToggleButton — the button
   *  protrudes 12px outside the sider's right edge so it's clearly tappable. */
  edgeToggle: css`
    position: absolute;
    right: 0;
    top: calc(var(--bai-header-height) + 16px);
    transform: translateX(12px);
    z-index: 11;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 1px solid var(--bai-sider-border);
    background: var(--bai-sider-bg);
    color: var(--bai-sider-text);
    cursor: pointer;
    padding: 0;
    visibility: hidden;
    opacity: 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transition:
      opacity 200ms ease,
      visibility 200ms ease,
      background-color 120ms ease;

    &:hover {
      background: var(--bai-sider-active-bg);
      color: var(--bai-sider-active-text);
    }

    &:focus-visible {
      visibility: visible;
      opacity: 1;
      outline: 2px solid var(--bai-color-primary);
      outline-offset: 2px;
    }
  `,

  /** Modifier that forces the edge toggle visible (e.g. on hover). */
  edgeToggleVisible: css`
    visibility: visible;
    opacity: 1;
  `,

  /** Header — antd Layout.Header, with our slot layout on top. */
  header: css`
    display: flex;
    align-items: center;
    position: sticky;
    top: 0;
    z-index: 10;
    gap: 12px;
  `,

  collapseToggle: css`
    flex-shrink: 0;
  `,

  headerLeft: css`
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
    min-width: 0;
  `,

  headerRight: css`
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  `,

  banner: css`
    flex-shrink: 0;
  `,

  content: css`
    padding: 16px;
    overflow: auto;
  `,
}));
