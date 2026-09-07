import { default as React, ReactNode } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
export type BAITextType = 'secondary' | 'success' | 'warning' | 'danger';
export type BAITextSize = '4xs' | '3xs' | '2xs' | 'xsm' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
/**
 * antd `TooltipProps`, of which only `title` has a destination; the other
 * keys are accepted and ignored, and a missing `title` means the children.
 */
export interface BAITextTooltipConfig {
    title?: ReactNode;
    [antdTooltipProp: string]: unknown;
}
/** antd `EllipsisConfig`. */
export interface BAITextEllipsisConfig {
    rows?: number;
    expandable?: boolean;
    /** `true` shows the children; a node shows that node; `{ title }` its title. */
    tooltip?: ReactNode | BAITextTooltipConfig;
    onExpand?: (e: React.MouseEvent<HTMLElement>, info: {
        expanded: boolean;
    }) => void;
}
/** antd `CopyConfig`. Tuples are `[resting, copied]`. */
export interface BAITextCopyConfig {
    text?: string | (() => string | Promise<string>);
    icon?: ReactNode | [ReactNode, ReactNode];
    tooltips?: boolean | ReactNode | [ReactNode, ReactNode];
    onCopy?: (event?: React.MouseEvent<HTMLElement>) => void;
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
    /** Renders the children's text as an Astryx `Kbd` shortcut (`+`-separated). */
    keyboard?: boolean;
    disabled?: boolean;
    monospace?: boolean;
    /** Font size step (Astryx scale); antd had no counterpart. */
    size?: BAITextSize;
    /** CSS ellipsis — single line, or `rows` lines — with an optional tooltip. */
    ellipsis?: boolean | BAITextEllipsisConfig;
    copyable?: boolean | BAITextCopyConfig;
    /**
     * Take the surrounding colour instead of the text default, for a BAIText
     * nested in an element that owns the colour, e.g. a link (FR-3692). Ignored
     * when `type` / `disabled` name a colour.
     */
    inheritColor?: boolean;
}
declare const BAIText: React.FC<BAITextProps>;
export default BAIText;
