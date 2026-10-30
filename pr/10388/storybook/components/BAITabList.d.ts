import { TabListProps } from '@lablup/ui-common/TabList';
import { default as React, ReactNode } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.3.1/389d2ab16b7e9a891f1811154c26db12b2fd74e8cb0d60e295d30c107a842d5d/node_modules/react';
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
