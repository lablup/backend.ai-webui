import { default as React, ReactNode } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
export interface BAINotificationItemStyles {
    title?: React.CSSProperties;
    description?: React.CSSProperties;
    action?: React.CSSProperties;
    footer?: React.CSSProperties;
}
export interface BAINotificationItemProps {
    title?: ReactNode;
    description?: ReactNode;
    action?: ReactNode;
    footer?: ReactNode;
    styles?: BAINotificationItemStyles;
}
declare const BAINotificationItem: React.FC<BAINotificationItemProps>;
export { BAINotificationItem };
export default BAINotificationItem;
