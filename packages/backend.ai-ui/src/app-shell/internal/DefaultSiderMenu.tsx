import { useAppShellState } from '../hooks/useAppShellState';
import {
  type RootAppShellMenuItem,
  buildAntdMenuItems,
} from './buildAntdMenuItems';
import { Menu } from 'antd';
import { memo, useMemo } from 'react';

interface DefaultSiderMenuProps {
  menus: RootAppShellMenuItem[];
  selectedKey: string;
  onSelect: (key: string) => void;
}

export const DefaultSiderMenu = memo(function DefaultSiderMenu({
  menus,
  selectedKey,
  onSelect,
}: DefaultSiderMenuProps) {
  const { collapsed } = useAppShellState();
  const items = useMemo(
    () => buildAntdMenuItems(menus, collapsed),
    [menus, collapsed],
  );

  // Note: no `theme={...}` prop. ConfigProvider's algorithm (set by
  // AppShellProvider) drives dark/light coloring; setting Menu's `theme` here
  // would override our `Layout.siderBg` and `colorPrimary` token customizations
  // with antd's hardcoded preset palette.
  return (
    <Menu
      mode="inline"
      inlineCollapsed={collapsed}
      items={items}
      selectedKeys={[selectedKey]}
      onClick={({ key }) => onSelect(key)}
      style={{
        borderInlineEnd: 'none',
        background: 'transparent',
        userSelect: 'none',
      }}
    />
  );
});
