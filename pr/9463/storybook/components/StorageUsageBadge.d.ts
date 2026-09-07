import { BAIBadgeProps } from './BAIBadge';
import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
export interface StorageUsageBadgeProps extends Omit<BAIBadgeProps, 'color' | 'processing'> {
    percent?: number;
}
declare const StorageUsageBadge: React.FC<StorageUsageBadgeProps>;
export default StorageUsageBadge;
