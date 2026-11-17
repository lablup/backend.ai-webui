import { ConfirmPopoverProps } from '@lablup/ui-common/components/ConfirmPopover';
import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.3.1/389d2ab16b7e9a891f1811154c26db12b2fd74e8cb0d60e295d30c107a842d5d/node_modules/react';
export interface BAIPopconfirmProps extends Omit<ConfirmPopoverProps, 'onAction' | 'actionLabel' | 'actionVariant' | 'isActionDisabled' | 'cancelLabel'> {
    /** Confirm button label. */
    okText?: string;
    /** Cancel button label. */
    cancelText?: string;
    /** Confirm styled as destructive (antd `okType="danger"`). */
    isDanger?: boolean;
    /** antd `okButtonProps={{ disabled }}`. */
    isOkDisabled?: boolean;
    /**
     * May return a promise: the confirm button stays pending and the popover
     * closes once it resolves.
     */
    onConfirm?: (e: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;
}
declare const BAIPopconfirm: React.FC<BAIPopconfirmProps>;
export default BAIPopconfirm;
