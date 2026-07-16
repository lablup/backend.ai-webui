import { useAppShellStyles } from './styles';
import type { AppShellHeaderProps } from './types';
import { Button, Layout } from 'antd';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';

export function AppShellHeader({
  collapsed,
  onToggleCollapse,
  showCollapseToggle = true,
  left,
  right,
}: AppShellHeaderProps) {
  const { styles } = useAppShellStyles();
  const ToggleIcon = collapsed ? PanelLeftOpen : PanelLeftClose;
  return (
    <Layout.Header className={styles.header}>
      {showCollapseToggle && (
        <Button
          type="text"
          size="middle"
          icon={<ToggleIcon size={18} aria-hidden="true" />}
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
          className={styles.collapseToggle}
        />
      )}
      <div className={styles.headerLeft}>{left}</div>
      <div className={styles.headerRight}>{right}</div>
    </Layout.Header>
  );
}
