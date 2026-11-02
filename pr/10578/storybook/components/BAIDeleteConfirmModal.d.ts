import { BAIModalProps } from './BAIModal';
import { DeleteConfirmModalItem } from '@lablup/ui-common/components/DeleteConfirmModal';
import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
export type BAIDeleteConfirmModalItem = DeleteConfirmModalItem;
/**
 * The slice of the old antd `InputProps` the confirmation field honours. The
 * index signature keeps the rest accepted-and-ignored.
 */
export interface BAIDeleteConfirmModalInputProps {
    placeholder?: string;
    autoFocus?: boolean;
    disabled?: boolean;
    maxLength?: number;
    [key: string]: unknown;
}
export interface BAIDeleteConfirmModalProps extends Omit<BAIModalProps, 'title' | 'children'> {
    /** Items to be deleted. */
    items: BAIDeleteConfirmModalItem[];
    /** Custom modal title. Defaults to "Delete" / "Delete N items". */
    title?: React.ReactNode;
    /** Description shown above the item list. Defaults to a `target`-based or generic question. */
    description?: React.ReactNode;
    /** Resource type label ("Credential"), named in the default description. */
    target?: React.ReactNode;
    /**
     * The action is reversible: no typed confirmation, no "cannot be undone"
     * warning. Default: false
     */
    reversible?: boolean;
    /** Force text-input confirmation even for a single item. Default: false */
    requireConfirmInput?: boolean;
    /**
     * Text the user must type. Defaults to a single item's plain-text label,
     * else the localized "Delete". Pass it when the label is a ReactNode.
     */
    confirmText?: string;
    /** Label above the confirmation input. Default: "Type {confirmText} to confirm." */
    inputLabel?: React.ReactNode;
    /** Additional props for the confirmation input. */
    inputProps?: BAIDeleteConfirmModalInputProps;
    /** Content rendered after the input field (e.g. checkboxes). */
    extraContent?: React.ReactNode;
    /** Override for "This action cannot be undone." */
    cannotBeUndoneText?: string;
    /** Max height (px) of the scrollable item list. Default: 200. Set 0 for no limit. */
    itemListMaxHeight?: number;
    /** Render items without the boxed surface. Default: false */
    plainItems?: boolean;
}
declare const BAIDeleteConfirmModal: React.FC<BAIDeleteConfirmModalProps>;
export default BAIDeleteConfirmModal;
