import type { BrandingConfig } from '../branding-schema';
import type { ReactNode } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface AppShellProviderProps {
  branding?: BrandingConfig;
  defaultThemeMode?: ThemeMode;
  themeStorageKey?: string;
  children: ReactNode;
}

export interface AppShellProps {
  /** Slot rendered at the top of the sider (the logo bar). Defaults to the branding logo. */
  siderHeader?: ReactNode;
  /** Sider body — typically a navigation menu. Consumer brings their own (antd Menu, custom, etc.). */
  siderContent?: ReactNode;
  /** Optional sider footer (copyright, version). Hidden when collapsed. */
  siderFooter?: ReactNode;

  /** Header left slot — typically a project selector, breadcrumb, or page title. */
  headerLeft?: ReactNode;
  /** Header right slot — typically theme toggle + user menu cluster. */
  headerRight?: ReactNode;
  /** Show the collapse toggle button in the header. Defaults to false — the sider edge
   *  hover-reveal toggle is the canonical collapse control. Set true to add a second
   *  always-visible toggle in the header (helpful for touch devices). */
  showHeaderCollapseToggle?: boolean;

  /** Show the hover-reveal collapse toggle on the sider's right edge. Defaults to true. */
  showSiderCollapseToggle?: boolean;

  /** Optional banner rendered between header and content (e.g. connectivity warning). */
  contentBanner?: ReactNode;

  /** Main content. */
  children?: ReactNode;

  /** Initial collapsed state when no value is persisted. Defaults to false. */
  defaultCollapsed?: boolean;
  /** localStorage key for persisting collapse. Defaults to 'appShell.sideCollapsed'. */
  collapseStorageKey?: string;
  /** Single-character key that toggles collapse. Defaults to '['. Set to null to disable. */
  collapseShortcut?: string | null;
}

export interface AppShellHeaderProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  showCollapseToggle?: boolean;
  left?: ReactNode;
  right?: ReactNode;
}

export interface AppShellSiderProps {
  collapsed: boolean;
  onToggleCollapse?: () => void;
  /** Called whenever the antd Sider crosses the responsive breakpoint, with
   *  `broken=true` when entering narrow mode and `broken=false` when entering
   *  wide mode. AppShell wires this to (a) force-collapse on narrow without
   *  persisting and (b) restore the user's persisted choice on wide. */
  onBreakpointCollapse?: (broken: boolean) => void;
  showEdgeToggle?: boolean;
  header?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
}
