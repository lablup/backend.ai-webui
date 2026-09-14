import { TabListProps } from '@astryxdesign/core/TabList';
import { default as React, ReactNode } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
export interface BAITabListProps extends Omit<TabListProps, 'ref'> {
    /**
     * antd `Tabs.type`.
     * - `'line'` (default) — Astryx's underlined strip.
     * - `'card'` — boxed, gutter-separated tabs sitting on an accent rail
     *   (legacy `BAITabs` / antd `type="card"`).
     */
    type?: 'line' | 'card';
    /**
     * antd's `tabBarExtraContent`. Rendered as the nav's trailing slot so the
     * rail still spans the whole bar underneath it.
     */
    tabBarExtraContent?: ReactNode;
}
declare const BAITabList: React.FC<BAITabListProps>;
export default BAITabList;
