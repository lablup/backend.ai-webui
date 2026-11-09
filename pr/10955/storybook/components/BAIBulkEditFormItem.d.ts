import { BulkEditFormItemProps } from '@lablup/ui-common/components/BulkEditFormItem';
import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.3.1/389d2ab16b7e9a891f1811154c26db12b2fd74e8cb0d60e295d30c107a842d5d/node_modules/react';
export interface BAIBulkEditFormItemProps extends Omit<BulkEditFormItemProps, 'hasClear'> {
    /** Offers "Clear", which sets the value to `null` for every record. */
    showClear?: boolean;
}
declare const BAIBulkEditFormItem: React.FC<BAIBulkEditFormItemProps>;
export default BAIBulkEditFormItem;
