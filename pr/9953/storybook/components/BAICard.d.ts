import { Card } from '@astryxdesign/core/Card';
import { default as React, CSSProperties, ReactNode, Ref } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
/** antd `Card`'s `tabList` item, restated locally. */
export interface BAICardTabItem {
    key: string;
    label?: ReactNode;
    /** antd's pre-v5 name for `label`; still passed by a few call sites. */
    tab?: ReactNode;
    /**
     * Trailing slot inside the tab (a count badge, a help tooltip icon).
     *
     * Astryx `Tab` is `label` (a required STRING that doubles as the accessible
     * name) plus `endContent`. A JSX `label` therefore has to be SPLIT, and only
     * the call site knows where the seam is — so it passes the extras here and
     * keeps `label` a plain string. See the render note below for what used to
     * happen when it did not.
     */
    endContent?: ReactNode;
    /**
     * Accepted and ignored: Astryx `Tab` has no disabled state. No call site in
     * the repo passes it, so nothing regresses — it stays in the type only so an
     * antd-shaped `tabList` literal keeps type-checking.
     */
    disabled?: boolean;
}
/**
 * antd `Card`'s `styles` slot map, restated locally. Accepted and ignored —
 * see the PILOT-DECISION above.
 */
export interface BAICardSlotStyles {
    header?: CSSProperties;
    body?: CSSProperties;
    cover?: CSSProperties;
    actions?: CSSProperties;
    extra?: CSSProperties;
    title?: CSSProperties;
}
export interface BAICardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title' | 'color' | 'children'> {
    /** Visual status of the card affecting border color and extra button icons */
    status?: 'success' | 'error' | 'warning' | 'default';
    title?: ReactNode;
    /** Custom content to display in the header area */
    extra?: ReactNode;
    /** Title for the extra button that appears in the header */
    extraButtonTitle?: string | ReactNode;
    /** Show header divider. Automatically enabled when tabList is specified */
    showDivider?: boolean;
    /** Callback function triggered when the extra button is clicked */
    onClickExtraButton?: () => void;
    size?: 'default' | 'small';
    /**
     * Astryx `Card` padding step; overrides the `size`-derived default (6, or 3
     * for `size="small"`). The full-bleed tab strip follows it (BAICard.css).
     */
    padding?: React.ComponentProps<typeof Card>['padding'];
    /** Astryx `Card` width passthrough. */
    width?: React.ComponentProps<typeof Card>['width'];
    /** antd's nested/inner card treatment. */
    type?: 'inner';
    /** antd v5 `bordered` / antd v6 `variant` — both mean the same thing here. */
    bordered?: boolean;
    variant?: 'outlined' | 'borderless';
    hoverable?: boolean;
    loading?: boolean;
    cover?: ReactNode;
    actions?: Array<ReactNode>;
    tabList?: Array<BAICardTabItem>;
    activeTabKey?: string;
    defaultActiveTabKey?: string;
    onTabChange?: (key: string) => void;
    tabBarExtraContent?: ReactNode;
    /** Accepted and ignored — see the PILOT-DECISION above. */
    styles?: BAICardSlotStyles;
    children?: ReactNode;
    /** React ref for the card container */
    ref?: Ref<HTMLDivElement> | undefined;
    [key: `data-${string}`]: string | undefined;
}
declare const BAICard: React.FC<BAICardProps>;
export default BAICard;
