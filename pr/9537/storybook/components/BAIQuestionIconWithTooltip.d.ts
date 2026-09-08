import { AntdPlacement } from '../helper/astryxPlacement';
import { CircleHelp } from 'lucide-react';
import { default as React, CSSProperties, ReactNode } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
export interface BAIQuestionIconWithTooltipProps {
    /** antd's name for the tooltip body. */
    title?: ReactNode;
    placement?: AntdPlacement;
    /** Controlled visibility (antd v5 name). */
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    /** Delay before showing, in seconds (antd) — converted to Astryx's ms. */
    mouseEnterDelay?: number;
    style?: CSSProperties;
    className?: string;
    iconProps?: React.ComponentProps<typeof CircleHelp>;
    /** See BAIIconWithTooltip — `false` for triggers nested in interactive elements. */
    focusable?: boolean;
}
declare const BAIQuestionIconWithTooltip: ({ title, placement, open, onOpenChange, mouseEnterDelay, style, className, iconProps, focusable, }: BAIQuestionIconWithTooltipProps) => React.JSX.Element;
export default BAIQuestionIconWithTooltip;
