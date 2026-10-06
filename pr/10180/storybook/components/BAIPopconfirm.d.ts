import { ConfirmPopoverProps } from '@lablup/ui-common/components/ConfirmPopover';
import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
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
     * closes once it resolves. A rejection is logged and keeps the popover open;
     * surface it to the user from the handler (e.g. a notification).
     */
    onConfirm?: (e: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;
}
declare const BAIPopconfirm: React.FC<BAIPopconfirmProps>;
export default BAIPopconfirm;
