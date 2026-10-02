import { BannerProps } from '@lablup/ui-common/Banner';
import { default as React, ReactNode } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
export interface BAIAlertProps {
    /** antd `Alert.type`. Defaults to `info`, as antd did. */
    type?: 'info' | 'warning' | 'error' | 'success';
    title?: ReactNode;
    /** antd's deprecated alias for `title`. */
    message?: ReactNode;
    description?: ReactNode;
    /** antd rendered the status icon only on request; Banner always does. */
    showIcon?: boolean;
    icon?: ReactNode;
    closable?: boolean;
    onClose?: () => void;
    /** antd's full-width, square-cornered page banner. */
    banner?: boolean;
    action?: ReactNode;
    /** No-op since the Astryx conversion — see the PILOT-DECISION above. */
    ghostInfoBg?: boolean;
    className?: string;
    style?: React.CSSProperties;
    children?: ReactNode;
    'data-testid'?: string;
}
/** BAIAlert's props as `Banner` props; `BAIListAlert` shares the mapping. */
export declare const toBannerProps: ({ type, title, message, description, showIcon: _showIcon, icon, closable, onClose, banner, action, ghostInfoBg: _ghostInfoBg, className, children: _children, ...restProps }: BAIAlertProps) => Omit<BannerProps, "children">;
declare const BAIAlert: React.FC<BAIAlertProps>;
export default BAIAlert;
