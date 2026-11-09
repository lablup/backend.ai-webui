import { AntdPlacement } from '../helper/astryxPlacement';
import { BAIIconWithTooltipProps } from './BAIIconWithTooltip';
import { CircleHelp } from 'lucide-react';
import { default as React, CSSProperties, ReactNode } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.3.1/389d2ab16b7e9a891f1811154c26db12b2fd74e8cb0d60e295d30c107a842d5d/node_modules/react';
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
    /**
     * Where a non-focusable trigger's text reaches assistive tech; see
     * BAIIconWithTooltip. A help icon describes its enclosing control by default.
     * @default 'description'
     */
    announceAs?: BAIIconWithTooltipProps['announceAs'];
}
declare const BAIQuestionIconWithTooltip: ({ title, placement, open, onOpenChange, mouseEnterDelay, style, className, iconProps, focusable, announceAs, }: BAIQuestionIconWithTooltipProps) => React.JSX.Element;
export default BAIQuestionIconWithTooltip;
