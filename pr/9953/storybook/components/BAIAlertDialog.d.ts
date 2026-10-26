import { BAIDialogProps } from './BAIDialog';
import { AlertDialogProps } from '@astryxdesign/core/AlertDialog';
import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
export interface BAIAlertDialogProps extends Omit<BAIDialogProps, 'children' | 'purpose' | 'role' | 'aria-labelledby' | 'aria-describedby'>, Pick<AlertDialogProps, 'title' | 'description' | 'cancelLabel' | 'actionLabel' | 'actionVariant' | 'isActionLoading' | 'onAction'> {
    /** Escape still cancels even with both buttons disabled. */
    isCancelDisabled?: boolean;
    isActionDisabled?: boolean;
}
declare const BAIAlertDialog: React.FC<BAIAlertDialogProps>;
export default BAIAlertDialog;
