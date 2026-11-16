import { BAIAlertProps } from './BAIAlert';
import { ListBannerItem } from '@lablup/ui-common/components/ListBanner';
import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.3.1/389d2ab16b7e9a891f1811154c26db12b2fd74e8cb0d60e295d30c107a842d5d/node_modules/react';
export type BAIListAlertItem = ListBannerItem;
export interface BAIListAlertProps extends Omit<BAIAlertProps, 'description'> {
    items: Array<BAIListAlertItem>;
    /** Height at which the list scrolls. Defaults to 165 (about seven rows). */
    maxHeight?: number | string;
}
/**
 * An alert that lists items (e.g. the resources a modal acts on) and scrolls
 * the list past `maxHeight`. Say how many items there are in `title`.
 */
declare const BAIListAlert: React.FC<BAIListAlertProps>;
export default BAIListAlert;
