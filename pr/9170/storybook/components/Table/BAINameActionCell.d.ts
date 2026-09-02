import { default as React } from '../../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
import { LinkProps } from 'react-router-dom';
export interface BAINameActionCellAction {
    /** Unique key for React rendering and overflow tracking */
    key: string;
    /** Label shown as tooltip on icon buttons and as text in overflow menu */
    title: string;
    /** Icon rendered in both button and menu form */
    icon?: React.ReactNode;
    /** Click handler */
    onClick?: () => void;
    /** Async click handler with automatic loading state (mirrors BAIButton.action) */
    action?: () => Promise<void>;
    /**
     * Visual style type:
     * - 'default': colorInfo text on colorInfoBg background
     * - 'danger': colorError text on colorErrorBg background
     */
    type?: 'default' | 'danger';
    /**
     * Whether the action is disabled. Pass `{ reason }` to disable it AND say
     * why — the reason becomes the button tooltip. A bare `true` disables it
     * without one, which is then a deliberate choice rather than a call site
     * that let two fields drift apart (FR-3722).
     */
    disabled?: boolean | {
        reason: string;
    };
    /** Loading spinner for progress this cell does not own (e.g. a background
     * delete tracked by the parent). Use `action` when the click itself awaits. */
    loading?: boolean;
    /** Custom style override for the action button */
    style?: React.CSSProperties;
    /**
     * Where to show the action:
     * - 'auto': shown as button when space allows, otherwise in more menu (default)
     * - 'always': always shown only in the more menu
     */
    showInMenu?: 'auto' | 'always';
    /**
     * Ant Design Popconfirm props to gate the action behind a confirmation
     * popover. When set, the visible icon button is wrapped with `<Popconfirm>`
     * and the confirm action should be wired via `popConfirm.onConfirm`.
     *
     * When the action overflows into the more menu, the menu item falls back
     * to a `Modal.confirm` dialog that mirrors the popConfirm title,
     * description, okText, cancelText, and button props — so the
     * confirmation UI is preserved in both visible and overflow states.
     * If `onClick`/`action` is also set, those take precedence and the
     * popConfirm is ignored in the overflow menu.
     */
    popConfirm?: BAIPopconfirmConfig;
}
/**
 * The antd `PopconfirmProps` subset every call site actually passes, restated
 * locally (to-astryx W2-D). Measured across the 11 live `popConfirm` objects
 * in `ResourceGroupList`, `AdminUserCredentialList` ×2, `AdminUserManagement`,
 * `QuotaScopeTable`, `DeploymentRevisionHistoryTab`, `LoginSession`,
 * `RBACManagementPage` ×2 and `ProjectPage` ×2: `title`, `description`,
 * `okText`, `cancelText`, `okButtonProps.danger`, `onConfirm`, `onCancel`.
 * Keeping antd's own type was the last thing holding this module in the antd
 * import graph (P15), and the wide type advertised knobs — `placement`,
 * `icon`, `overlayStyle`, `getPopupContainer` — that Astryx's `Popover` does
 * not have.
 */
export interface BAIPopconfirmConfig {
    title?: React.ReactNode;
    /**
     * Accepted and inert: Astryx's `Popover` splits antd's compound placement
     * into `placement` + `alignment`, and the confirm popover anchors itself to
     * the row action. One call site (`QuotaScopeTable`) passes `'bottom'`, which
     * is already the Astryx default.
     */
    placement?: string;
    description?: React.ReactNode;
    okText?: React.ReactNode;
    cancelText?: React.ReactNode;
    okButtonProps?: {
        danger?: boolean;
        disabled?: boolean;
    };
    cancelButtonProps?: {
        disabled?: boolean;
    };
    onConfirm?: () => void | Promise<void>;
    onCancel?: () => void;
}
export interface BAINameActionCellProps {
    /** Icon displayed before the title text */
    icon?: React.ReactNode;
    /** Title text or custom content */
    title?: React.ReactNode;
    /** React Router path for making the title a link */
    to?: LinkProps['to'];
    /** Click handler for the title (used when `to` is not provided) */
    onTitleClick?: (e: React.MouseEvent) => void;
    /** Action definitions rendered as icon buttons, collapsing into overflow menu */
    actions?: BAINameActionCellAction[];
    /** When to show the actions area. Default: 'hover' */
    showActions?: 'hover' | 'always';
    /** Minimum number of action buttons to keep visible before overflow. Default: 0 */
    minVisibleActions?: number;
    /** Disable the overflow More (…) button. Individual menu items remain visible. */
    moreMenuDisabled?: boolean;
    /** Show a copy-to-clipboard icon on hover next to the title text */
    copyable?: boolean;
    style?: React.CSSProperties;
    className?: string;
}
declare const BAINameActionCell: React.FC<BAINameActionCellProps>;
export default BAINameActionCell;
