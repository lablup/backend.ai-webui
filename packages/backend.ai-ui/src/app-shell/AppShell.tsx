import { AppShellHeader } from './AppShellHeader';
import { AppShellSider } from './AppShellSider';
import { AppShellStateContext } from './hooks/useAppShellState';
import { useKeyboardShortcut } from './hooks/useKeyboardShortcut';
import { useSiderCollapsed } from './hooks/useSiderCollapsed';
import { useAppShellStyles } from './styles';
import type { AppShellProps } from './types';
import { Layout } from 'antd';
import { useCallback, useMemo } from 'react';

export function AppShell({
  siderHeader,
  siderContent,
  siderFooter,
  headerLeft,
  headerRight,
  showHeaderCollapseToggle = false,
  showSiderCollapseToggle = true,
  contentBanner,
  children,
  defaultCollapsed = false,
  collapseStorageKey = 'appShell.sideCollapsed',
  collapseShortcut = '[',
}: AppShellProps) {
  const { styles } = useAppShellStyles();
  const { collapsed, setCollapsed, setCollapsedTransient, restorePersisted } =
    useSiderCollapsed(collapseStorageKey, defaultCollapsed);
  const toggleCollapsed = useCallback(
    () => setCollapsed((c) => !c),
    [setCollapsed],
  );
  const handleBreakpoint = useCallback(
    (broken: boolean) => {
      if (broken) setCollapsedTransient(true);
      else restorePersisted();
    },
    [setCollapsedTransient, restorePersisted],
  );

  useKeyboardShortcut(collapseShortcut, toggleCollapsed);

  const stateValue = useMemo(
    () => ({ collapsed, toggleCollapsed }),
    [collapsed, toggleCollapsed],
  );

  return (
    <AppShellStateContext.Provider value={stateValue}>
      <Layout hasSider style={{ flex: 1, minHeight: 'inherit' }}>
        <AppShellSider
          collapsed={collapsed}
          onToggleCollapse={toggleCollapsed}
          onBreakpointCollapse={handleBreakpoint}
          showEdgeToggle={showSiderCollapseToggle}
          header={siderHeader}
          footer={siderFooter}
        >
          {siderContent}
        </AppShellSider>
        <Layout>
          <AppShellHeader
            collapsed={collapsed}
            onToggleCollapse={toggleCollapsed}
            showCollapseToggle={showHeaderCollapseToggle}
            left={headerLeft}
            right={headerRight}
          />
          {contentBanner && (
            <div className={styles.banner}>{contentBanner}</div>
          )}
          <Layout.Content className={styles.content}>{children}</Layout.Content>
        </Layout>
      </Layout>
    </AppShellStateContext.Provider>
  );
}
