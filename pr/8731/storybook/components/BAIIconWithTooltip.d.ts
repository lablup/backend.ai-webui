import { TooltipProps } from '@astryxdesign/core/Tooltip';
import { CSSProperties, ReactNode } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
export interface BAIIconWithTooltipProps extends Omit<TooltipProps, 'children' | 'anchorRef'> {
    /** The glyph the tooltip is attached to. */
    icon: ReactNode;
    /**
     * `false` renders the trigger as a plain `<span>` (hover-only) instead of a
     * focusable `<button>` — required inside another interactive element (a
     * link, a select option, a segmented-control label), where nesting a button
     * is invalid.
     */
    focusable?: boolean;
    style?: CSSProperties;
    className?: string;
}
declare const BAIIconWithTooltip: ({ icon, focusable, style, className, ...tooltipProps }: BAIIconWithTooltipProps) => import("react").JSX.Element;
export default BAIIconWithTooltip;
