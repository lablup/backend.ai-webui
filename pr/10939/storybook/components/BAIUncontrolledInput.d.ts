import { UncontrolledInputProps } from '@lablup/ui-common/components/UncontrolledInput';
import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.3.1/389d2ab16b7e9a891f1811154c26db12b2fd74e8cb0d60e295d30c107a842d5d/node_modules/react';
export interface BAIUncontrolledInputProps extends Omit<UncontrolledInputProps, 'isDisabled' | 'status'> {
    disabled?: boolean;
    /** antd's `status`, reshaped onto Astryx's `status` object. */
    status?: 'error' | 'warning' | '';
}
/**
 * An uncontrolled input that commits its value on Enter or blur, not on
 * every keystroke.
 */
declare const BAIUncontrolledInput: React.FC<BAIUncontrolledInputProps>;
export default BAIUncontrolledInput;
