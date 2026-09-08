import { CircleAlertIcon } from 'lucide-react';
import { default as React, ReactNode } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
export interface BAIAlertIconWithTooltipProps {
    /** antd `Tooltip.title` — the tooltip body. */
    title?: ReactNode;
    iconProps?: React.ComponentProps<typeof CircleAlertIcon>;
    type?: 'warning' | 'error';
    placement?: 'above' | 'below' | 'start' | 'end';
}
declare const BAIAlertIconWithTooltip: ({ iconProps, type, title, placement, }: BAIAlertIconWithTooltipProps) => React.JSX.Element;
export default BAIAlertIconWithTooltip;
