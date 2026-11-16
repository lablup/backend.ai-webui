import { UncontrolledInputProps } from '@lablup/ui-common/components/UncontrolledInput';
import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
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
