/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 to-astryx ticket 24 — the sider menu.

 PILOT-DECISION (the single biggest call of this ticket): antd `Menu` is
 MAPPING §2's one **COMPOSITION** entry with no generic `<Menu>` destination —
 "pick `NavMenu` / `SideNav*` / `TopNav*` / `DropdownMenu` by purpose". This is
 the application's primary sidebar navigation, so the destination is
 `SideNavSection` + `SideNavItem`, rendered inside the `SideNav` that
 `BAISider` now is.

 What that costs, deliberately:

 - The whole `ConfigProvider` component-token block (`itemHeight: 40`,
   `itemBorderRadius: 20`, `itemMarginInline`, `itemSelectedBg` = the brand
   accent at 15% alpha, `fontSize: fontSizeLG`) is DROPPED. It is the textbook
   P11 case — a wrapper that existed only to fight antd's default look has
   nowhere to land, because Astryx's nav-item styling is theme-owned and its
   enums are closed. The selected row now uses Astryx's own selected
   treatment.
 - The `createStyles` block is DELETED rather than translated: every selector
   in it (`ul.ant-menu-item-group-list li.ant-menu-item`,
   `li div.ant-menu-item-group-title`) targeted antd's DOM, which no longer
   exists. Leaving it would be a textbook P6 silent death — compiles, applies
   to nothing.
 - `selectedKeys: string[]` collapses to a per-item `isSelected` boolean.
 - antd rendered the label as a `<WebUILink>` INSIDE the item; Astryx
   `SideNavItem` renders the anchor ITSELF (`as` + `href`), so the router link
   is supplied as a component, not as children (§1 contract 1: `label` is a
   required string).
 - `collapsed` no longer needs to be forwarded to the items: `SideNav`'s
   collapse context reaches them, and the group headers hide via
   `isHeaderHidden` instead of an emptied label.
*/
import AstryxRouterLink from './AstryxRouterLink';
import { SideNavItem, SideNavSection } from '@astryxdesign/core/SideNav';
import React from 'react';

/**
 * The neutral menu shape produced by `useWebUIMenuItems` — an item, or a
 * titled group of items. Kept structural (not an import of the hook's types)
 * so both the general and the admin menu, which have different `group`
 * unions, satisfy it.
 */
export interface BAIMenuItem {
  key: string;
  labelText: string;
  icon?: React.ReactNode;
  to?: string;
  disabled?: boolean;
  onClick?: () => void;
}

export interface BAIMenuGroup {
  type: 'group';
  name: string;
  labelText: string;
  children: Array<BAIMenuItem>;
}

export type BAIMenuEntry = BAIMenuItem | BAIMenuGroup;

interface BAIMenuProps {
  items: Array<BAIMenuEntry | undefined | null | false>;
  /** Keys of the currently active route (antd `selectedKeys`). */
  selectedKeys?: Array<string>;
  /** Hide the group headers while the sider rail is collapsed. */
  hideGroupName?: boolean;
}

const isGroup = (entry: BAIMenuEntry): entry is BAIMenuGroup =>
  (entry as BAIMenuGroup).type === 'group';

const renderItem = (item: BAIMenuItem, selectedKeys: Array<string>) => (
  <SideNavItem
    key={item.key}
    label={item.labelText}
    icon={item.icon}
    isSelected={selectedKeys.includes(item.key)}
    isDisabled={item.disabled}
    href={item.to}
    as={item.to ? AstryxRouterLink : undefined}
    onClick={item.onClick}
  />
);

const BAIMenu: React.FC<BAIMenuProps> = ({
  items,
  selectedKeys = [],
  hideGroupName = false,
}) => {
  'use memo';
  return (
    <>
      {items.map((entry) => {
        if (!entry) {
          return null;
        }
        if (isGroup(entry)) {
          return (
            <SideNavSection
              key={entry.name}
              title={entry.labelText}
              isHeaderHidden={hideGroupName}
            >
              {entry.children.map((child) => renderItem(child, selectedKeys))}
            </SideNavSection>
          );
        }
        return renderItem(entry, selectedKeys);
      })}
    </>
  );
};

export default BAIMenu;
