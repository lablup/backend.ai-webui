import { TextProps } from '@astryxdesign/core/Text';
import { default as React, ReactNode } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
/** antd `Typography.Text` semantic types, kept verbatim for the call sites. */
export type BAITextType = 'secondary' | 'success' | 'warning' | 'danger';
/**
 * antd `EllipsisConfig`, restated locally (the antd type import is what kept
 * this module — and 592 files downstream — inside the antd import graph).
 * `suffix`/`symbol` are omitted: no call site passes them, and Astryx's
 * truncation renders neither.
 */
export interface BAITextEllipsisConfig {
    rows?: number;
    expandable?: boolean;
    /**
     * `true` -> tooltip shows the full text (Astryx's native behaviour).
     * A string/node -> that content instead.
     * An object with `title` -> antd's `TooltipProps` shape; only `title` is read.
     */
    tooltip?: ReactNode | {
        title?: ReactNode;
    };
    onExpand?: (e: React.MouseEvent<HTMLElement>, info: {
        expanded: boolean;
    }) => void;
}
/** antd `Typography` `copyable` config, restated locally. */
export interface BAITextCopyConfig {
    /** Copy THIS instead of the rendered children. */
    text?: string;
    /** antd took `[copy, copied]`; only the resting label is used. */
    tooltips?: [ReactNode, ReactNode] | ReactNode[] | boolean;
    icon?: ReactNode;
    onCopy?: () => void;
}
export interface BAITextProps extends Omit<React.HTMLAttributes<HTMLElement>, 'color' | 'children'> {
    children?: ReactNode;
    type?: BAITextType;
    strong?: boolean;
    italic?: boolean;
    underline?: boolean;
    delete?: boolean;
    mark?: boolean;
    code?: boolean;
    disabled?: boolean;
    monospace?: boolean;
    /** Astryx `Text` size step, forwarded as-is (antd had no counterpart). */
    size?: TextProps['size'];
    /** CSS-based ellipsis (multi-line via `rows`), with an optional tooltip. */
    ellipsis?: boolean | BAITextEllipsisConfig;
    copyable?: boolean | BAITextCopyConfig;
    /**
     * Take the surrounding colour instead of Astryx `Text`'s `primary` default —
     * for a `BAIText` nested in an element that owns the colour, e.g. a link
     * (FR-3692). antd's `Typography.Text` had no colour of its own, so this is
     * the antd behaviour rather than a new one. Ignored when `type`/`disabled`
     * name a colour explicitly.
     */
    inheritColor?: boolean;
}
declare const BAIText: React.FC<BAITextProps>;
export default BAIText;
