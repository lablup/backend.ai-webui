import { AppShell } from './AppShell';
import { AppShellProvider } from './AppShellProvider';
import {
  DefaultHeaderActions,
  type DefaultHeaderActionsProps,
} from './internal/DefaultHeaderActions';
import { DefaultHeaderLeft } from './internal/DefaultHeaderLeft';
import { DefaultSiderMenu } from './internal/DefaultSiderMenu';
import type { RootAppShellMenuItem } from './internal/buildAntdMenuItems';
import {
  type RootAppShellBrandingProps,
  buildBrandingFromProps,
} from './internal/buildBrandingFromProps';
import type { ThemeMode } from './types';
import { type ReactNode, useCallback, useMemo, useState } from 'react';

export type { RootAppShellMenuItem } from './internal/buildAntdMenuItems';
export type {
  RootAppShellTokens,
  RootAppShellBrandingProps,
} from './internal/buildBrandingFromProps';

export interface RootAppShellProps
  extends RootAppShellBrandingProps, DefaultHeaderActionsProps {
  /** Sider navigation items. Group items by setting the same `group` field on consecutive entries. */
  menus: RootAppShellMenuItem[];

  /** Currently selected menu key. Pass to control the selection from outside. */
  selectedKey?: string;
  /** Initial selected menu key when uncontrolled. Defaults to the first menu item. */
  defaultSelectedKey?: string;
  /** Called when the user picks a menu item. Use this to navigate. */
  onSelect?: (key: string) => void;

  /** Override the header's left slot. Default: brand name + chevron + selected page title. */
  headerLeft?: ReactNode;
  /** Override the header's right slot. Default: theme toggle + help + user buttons. */
  headerRight?: ReactNode;
  /** Sider footer. Default: copyright with company name. */
  siderFooter?: ReactNode;
  /** Optional banner rendered between header and content (e.g. connectivity warning). */
  contentBanner?: ReactNode;

  /** Initial theme mode. Defaults to `'system'`. */
  defaultThemeMode?: ThemeMode;
  /** Initial collapsed state when no value is persisted. Defaults to false. */
  defaultCollapsed?: boolean;
  /** Single-character key that toggles collapse. Defaults to `'['`. Set to null to disable. */
  collapseShortcut?: string | null;

  /** Page content rendered in the main column. */
  children: ReactNode;
}

/**
 * High-level convenience component that wires up Provider + Shell + default
 * sider menu + default header actions in a single tag.
 *
 * For full control, use the lower-level `<AppShellProvider>` + `<AppShell>`
 * with custom slot content.
 */
export function RootAppShell({
  // Branding props (extracted for buildBrandingFromProps)
  branding,
  logo,
  brandName,
  companyName,
  productName,
  colors,
  tokens,

  // Menu
  menus,
  selectedKey: controlledSelectedKey,
  defaultSelectedKey,
  onSelect,

  // Slot overrides
  headerLeft,
  headerRight,
  siderFooter,
  contentBanner,

  // Header action toggles (forwarded to DefaultHeaderActions)
  showThemeToggle,
  showHelpButton,
  showUserButton,
  onHelpClick,
  onUserClick,

  // Behavior
  defaultThemeMode = 'system',
  defaultCollapsed = false,
  collapseShortcut = '[',

  children,
}: RootAppShellProps) {
  const resolvedBranding = useMemo(
    () =>
      buildBrandingFromProps({
        branding,
        logo,
        brandName,
        companyName,
        productName,
        colors,
        tokens,
      }),
    [branding, logo, brandName, companyName, productName, colors, tokens],
  );

  // Controlled / uncontrolled selectedKey
  const initialKey = defaultSelectedKey ?? menus[0]?.key ?? '';
  const [internalSelectedKey, setInternalSelectedKey] =
    useState<string>(initialKey);
  const selectedKey = controlledSelectedKey ?? internalSelectedKey;

  const handleSelect = useCallback(
    (key: string) => {
      if (controlledSelectedKey === undefined) setInternalSelectedKey(key);
      onSelect?.(key);
    },
    [controlledSelectedKey, onSelect],
  );

  const selectedMenu = useMemo(
    () => menus.find((m) => m.key === selectedKey),
    [menus, selectedKey],
  );

  const resolvedHeaderLeft = headerLeft ?? (
    <DefaultHeaderLeft pageTitle={selectedMenu?.label} />
  );
  const resolvedHeaderRight = headerRight ?? (
    <DefaultHeaderActions
      showThemeToggle={showThemeToggle}
      showHelpButton={showHelpButton}
      showUserButton={showUserButton}
      onHelpClick={onHelpClick}
      onUserClick={onUserClick}
    />
  );
  const resolvedSiderFooter =
    siderFooter ??
    (companyName || resolvedBranding?.branding?.companyName ? (
      <>
        © {new Date().getFullYear()}{' '}
        {companyName ?? resolvedBranding?.branding?.companyName}
      </>
    ) : undefined);

  return (
    <AppShellProvider
      branding={resolvedBranding}
      defaultThemeMode={defaultThemeMode}
    >
      <AppShell
        defaultCollapsed={defaultCollapsed}
        collapseShortcut={collapseShortcut}
        siderContent={
          <DefaultSiderMenu
            menus={menus}
            selectedKey={selectedKey}
            onSelect={handleSelect}
          />
        }
        siderFooter={resolvedSiderFooter}
        headerLeft={resolvedHeaderLeft}
        headerRight={resolvedHeaderRight}
        contentBanner={contentBanner}
      >
        {children}
      </AppShell>
    </AppShellProvider>
  );
}
