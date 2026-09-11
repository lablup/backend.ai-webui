import { BAIAlertProps } from './BAIAlert';
import { default as React, ReactNode } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
export interface BAIListAlertItem {
    key?: React.Key | null;
    content: ReactNode;
}
export interface BAIListAlertProps extends Omit<BAIAlertProps, 'description'> {
    items: Array<BAIListAlertItem>;
    maxHeight?: React.CSSProperties['maxHeight'];
}
/**
 * Alert that summarizes a list of items (e.g. selected resources in a modal)
 * as a standardized `ul` inside the alert description. The list scrolls
 * vertically once it exceeds `maxHeight`, so the surrounding modal never
 * grows unbounded. Item count indication belongs in the consumer-provided
 * `title` prop (i18n `count` interpolation).
 */
declare const BAIListAlert: React.FC<BAIListAlertProps>;
export default BAIListAlert;
