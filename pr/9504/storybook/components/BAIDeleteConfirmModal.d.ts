import { BAIModalProps } from './BAIModal';
import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
export interface BAIDeleteConfirmModalItem {
    /** Unique key for React list rendering */
    key: string;
    /** Display label — accepts ReactNode for custom rendering (icons, tags, etc.) */
    label: React.ReactNode;
}
/**
 * The slice of the old antd `InputProps` the confirmation field honours. Every
 * call site in the repo passes `placeholder` only; the index signature keeps
 * the rest accepted-and-ignored so no call site needs an edit.
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
    /** Description shown above the item list. If omitted, falls back to a `target`-based or generic default. */
    description?: React.ReactNode;
    /**
     * Resource type label (e.g. "Credential", "Project"). When provided and `description` is not,
     * the default description becomes "Are you sure you want to permanently delete {target}?".
     */
    target?: React.ReactNode;
    /**
     * Marks the confirmed action as reversible (e.g. revoke a role assignment,
     * remove a permission from a role). When true the modal keeps the exact same
     * header / footer / body design as the irreversible-delete modal, but never
     * renders the typed-confirmation input (even for multiple items or when
     * `requireConfirmInput` is set) and omits the "This action cannot be undone."
     * warning. Use for actions the user can recover from in <30s without
     * contacting support — see `.claude/rules/destructive-confirmation.md`.
     * Default: false
     */
    reversible?: boolean;
    /** Force text-input confirmation even for a single item. Default: false */
    requireConfirmInput?: boolean;
    /**
     * Custom confirmation text the user must type.
     * Defaults: single item → item label as string (falls back to localized "Delete" if label is ReactNode),
     * multiple items → localized "Delete".
     * When using ReactNode labels with requireConfirmInput, provide this prop explicitly.
     */
    confirmText?: string;
    /** Label above the confirmation input. Default: "Type {confirmText} to confirm." */
    inputLabel?: React.ReactNode;
    /** Additional props for the confirmation input. */
    inputProps?: BAIDeleteConfirmModalInputProps;
    /** Content rendered between the input field and "cannot be undone" text (e.g. checkboxes). */
    extraContent?: React.ReactNode;
    /** Override for "This action cannot be undone." Defaults to the localized string. */
    cannotBeUndoneText?: string;
    /** Max height (px) of the scrollable item list. Default: 200. Set 0 for no limit. */
    itemListMaxHeight?: number;
    /**
     * Render items without the default surface (background / border / padding /
     * scroll) container. Use when an item's `label` is already a self-contained
     * block (e.g. a table) so the default box does not create a redundant
     * double border. Default: false
     */
    plainItems?: boolean;
}
declare const BAIDeleteConfirmModal: React.FC<BAIDeleteConfirmModalProps>;
export default BAIDeleteConfirmModal;
