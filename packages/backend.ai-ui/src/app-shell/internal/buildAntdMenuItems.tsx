import { Typography } from 'antd';
import type { MenuProps } from 'antd';
import type { ReactNode } from 'react';

export interface RootAppShellMenuItem {
  key: string;
  label: string;
  /** Optional icon node. Recommend a 16px lucide-react icon. */
  icon?: ReactNode;
  /** Optional group name. Consecutive items with the same group are grouped together. */
  group?: string;
}

type AntdMenuItem = NonNullable<MenuProps['items']>[number];

function groupTitle(text: string, collapsed: boolean) {
  if (collapsed) {
    return (
      <div
        style={{
          height: 0,
          borderBottom: '1px solid var(--bai-sider-border)',
        }}
      />
    );
  }
  return (
    <Typography.Text
      type="secondary"
      ellipsis
      style={{ fontSize: 14, fontWeight: 500 }}
    >
      {text}
    </Typography.Text>
  );
}

/**
 * Convert RootAppShell's flat menu list into antd Menu's nested
 * `MenuProps['items']` structure. Items are bucketed by their `group` field —
 * consecutive items with the same group share one antd `type: 'group'` parent.
 *
 * Items without a group are rendered directly without a group wrapper.
 */
export function buildAntdMenuItems(
  menus: RootAppShellMenuItem[],
  collapsed: boolean,
): NonNullable<MenuProps['items']> {
  const result: AntdMenuItem[] = [];
  let currentGroup: string | undefined;
  let bucket: AntdMenuItem[] = [];
  let groupIndex = 0;

  const flush = () => {
    if (bucket.length === 0) return;
    if (currentGroup === undefined) {
      result.push(...bucket);
    } else {
      // Monotonic prefix in the key so the same group name appearing twice
      // (e.g. Main → MLOps → Main) doesn't collide on antd's reconciler.
      result.push({
        type: 'group',
        key: `__group:${groupIndex}:${currentGroup}`,
        label: groupTitle(currentGroup, collapsed),
        children: bucket,
      });
      groupIndex += 1;
    }
    bucket = [];
  };

  for (const menu of menus) {
    if (menu.group !== currentGroup) {
      flush();
      currentGroup = menu.group;
    }
    bucket.push({
      key: menu.key,
      label: menu.label,
      icon: menu.icon,
    });
  }
  flush();

  return result;
}
