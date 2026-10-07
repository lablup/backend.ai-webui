import { FormItemProps } from '@lablup/ui-common/Form';
import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
export interface BAIFormItemProps<Values = any> extends FormItemProps<Values> {
    /**
     * Actions for the label row: far end in vertical layout, right after the
     * label otherwise. Needs a `label`.
     */
    labelExtra?: React.ReactNode;
}
declare const BAIFormItem: <Values>({ label, labelExtra, ...formItemProps }: BAIFormItemProps<Values>) => React.JSX.Element;
export default BAIFormItem;
