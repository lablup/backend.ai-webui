import { PopoverProps } from '@astryxdesign/core/Popover';
import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
export interface BAIPopconfirmProps extends Omit<PopoverProps, 'content' | 'label'> {
    /** The question. antd `title`. */
    title: React.ReactNode;
    /** Supporting line under the title. antd `description`. */
    description?: React.ReactNode;
    /** Confirm button label. Defaults to the shared `general.button.Confirm` string. */
    okText?: string;
    /** Cancel button label. Defaults to the shared `general.button.Cancel` string. */
    cancelText?: string;
    /**
     * Confirm styled as destructive — antd's `okType="danger"` and
     * `okButtonProps={{ danger: true }}` collapse into this one flag.
     */
    isDanger?: boolean;
    /** antd `okButtonProps={{ disabled }}`. */
    isOkDisabled?: boolean;
    /**
     * Confirm handler. May return a promise — it is handed to Astryx's
     * `clickAction`, which renders the button's own pending state and blocks
     * re-entry until it settles. The popover closes when it resolves, and stays
     * open when it rejects so the user can see the error and retry.
     */
    onConfirm?: (e: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;
    /** Cancel handler. The popover closes regardless. */
    onCancel?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    /** Leading icon beside the title (antd `icon`). */
    icon?: React.ReactNode;
    /** Accessible name for the popover dialog; defaults to a string `title`. */
    label?: string;
}
declare const BAIPopconfirm: React.FC<BAIPopconfirmProps>;
export default BAIPopconfirm;
