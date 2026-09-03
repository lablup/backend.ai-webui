import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
export type WindowState = 'default' | 'minimized' | 'maximized' | 'fullscreen';
export type WindowAction = 'minimize' | 'maximize' | 'fullscreen';
export type MinimizedPlacement = 'bottomRight' | 'bottomLeft' | 'topRight' | 'topLeft';
/** antd's `onCancel` signature, preserved verbatim for the 110 call sites. */
export type BAIModalCancelEvent = React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLElement>;
/**
 * Footer render-function form, re-typed from antd's `ModalProps['footer']`.
 * antd's footer union does not let TypeScript contextually type the render
 * function's parameters (they fall back to implicit `any`), so callers are
 * forced to annotate `(originNode, { OkBtn, CancelBtn }) => ...`. This clean
 * named signature restores parameter inference.
 */
export type BAIModalFooterRender = (originNode: React.ReactNode, extra: {
    OkBtn: React.FC;
    CancelBtn: React.FC;
}) => React.ReactNode;
/**
 * The slice of antd `ButtonProps` the Astryx footer can honour. Every key is
 * optional and NO index signature is declared on purpose — that is what lets a
 * value still typed as antd `ButtonProps` (11 call sites spread a
 * `ModalProps`-extending prop bag straight into `<BAIModal>`) stay assignable:
 * extra source keys are allowed, an index signature on the target would not be
 * satisfied by an interface. Keys not listed here are accepted and ignored.
 */
export interface BAIModalActionButtonProps {
    danger?: boolean;
    disabled?: boolean;
    loading?: boolean | {
        delay?: number;
    };
    icon?: React.ReactNode;
    autoFocus?: boolean;
    /** antd `ButtonType`. Mapped onto the Astryx `Button` variant scale. */
    type?: 'primary' | 'default' | 'dashed' | 'link' | 'text' | 'ghost';
    htmlType?: 'button' | 'submit' | 'reset';
    form?: string;
    style?: React.CSSProperties;
    className?: string;
    id?: string;
    title?: string;
    tabIndex?: number;
    onClick?: React.MouseEventHandler<HTMLElement>;
}
/** Per-slot inline styles, mirroring antd's `ModalProps['styles']` keys. */
export interface BAIModalSemanticStyles {
    root?: React.CSSProperties;
    wrapper?: React.CSSProperties;
    mask?: React.CSSProperties;
    header?: React.CSSProperties;
    title?: React.CSSProperties;
    body?: React.CSSProperties;
    footer?: React.CSSProperties;
    container?: React.CSSProperties;
    content?: React.CSSProperties;
    close?: React.CSSProperties;
}
/** Per-slot class names, mirroring antd's `ModalProps['classNames']` keys. */
export type BAIModalSemanticClassNames = Partial<Record<keyof BAIModalSemanticStyles, string>>;
/**
 * antd v6 accepted both an object and a `(info) => object` form for `styles` /
 * `classNames`. The function form was already ignored by the antd-era
 * `BAIModal` (it guarded every read with `_.isFunction(...)`), so it is kept in
 * the type purely so a spread `ModalProps` bag still assigns, and ignored.
 */
type SemanticOrFn<T> = T | ((...args: any[]) => any);
/** antd's responsive width form: `{ xs: 320, md: 520 }`. */
export type BAIModalResponsiveWidth = Partial<Record<'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl', string | number>>;
export interface BAIModalProps {
    /** Whether the modal is visible. */
    open?: boolean;
    /** Astryx-style alias for `open`, so a call site can use either name. */
    isOpen?: boolean;
    /**
     * Fired when the user dismisses the modal: cancel button, header X, Escape,
     * or a backdrop click. Escape/backdrop have no React event to forward, so
     * the argument is `undefined` there — antd synthesised one, Astryx does not.
     */
    onCancel?: (e: BAIModalCancelEvent) => void;
    /** Astryx-style alias for `onCancel`; called with `false`. */
    onOpenChange?: (isOpen: boolean) => void;
    /** Called after the modal has closed. Drives `BAIUnmountAfterClose`. */
    afterClose?: () => void;
    /** Called with the new visibility right after it changes. */
    afterOpenChange?: (open: boolean) => void;
    title?: React.ReactNode;
    /** Secondary line under the title. */
    subtitle?: string;
    /**
     * Replaces the whole header row (ticket 16, FolderExplorer). A close button
     * is appended so dismissal stays reachable.
     */
    headerContent?: React.ReactNode;
    /** Accessible name for the close button rendered next to `headerContent`. */
    closeLabel?: string;
    /** `false` removes the header close button. */
    closable?: boolean | {
        closeIcon?: React.ReactNode;
    };
    /** `false` removes the header close button (antd alias for `closable`). */
    closeIcon?: React.ReactNode | false;
    /** Visual variant that changes the header title colour. */
    type?: 'normal' | 'warning' | 'error';
    children?: React.ReactNode;
    /** Ref to the body wrapper — used as a file drag-and-drop container. */
    bodyRef?: React.Ref<HTMLDivElement>;
    /** Extra props spread onto the body wrapper element. */
    bodyProps?: React.HTMLAttributes<HTMLDivElement> & {
        ref?: React.Ref<HTMLDivElement>;
    };
    /** Renders a `BAISkeleton` (title + paragraph rows) in place of the body. */
    loading?: boolean;
    /**
     * Modal footer. `null` removes it; a render function receives the generated
     * footer plus the `OkBtn` / `CancelBtn` components.
     */
    footer?: React.ReactNode | BAIModalFooterRender;
    onOk?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    okText?: React.ReactNode;
    cancelText?: React.ReactNode;
    okType?: 'primary' | 'danger' | 'default' | 'dashed' | 'link' | 'text' | 'ghost';
    okButtonProps?: BAIModalActionButtonProps;
    cancelButtonProps?: BAIModalActionButtonProps;
    /** Puts the OK button into its loading state. */
    confirmLoading?: boolean;
    /** Whether a backdrop click closes the modal. Default `true` (antd's). */
    maskClosable?: boolean;
    /** Whether Escape closes the modal. Default `true` (antd's). */
    keyboard?: boolean;
    /**
     * antd's mask config. Only `closable` is honoured (as `maskClosable`); the
     * backdrop itself is owned by `BAIDialog` and is never removable.
     */
    mask?: boolean | {
        closable?: boolean;
        blur?: boolean;
    };
    width?: number | string | BAIModalResponsiveWidth;
    maxHeight?: number | string;
    /**
     * `'fullscreen'` fills the viewport and makes `width` / `maxHeight` inert.
     * It is the only way to reach edge-to-edge: Astryx caps the standard dialog
     * at `maxWidth: 90vw`, so `width="90%"` and `width="100%"` render alike.
     */
    variant?: 'standard' | 'fullscreen';
    /** When non-empty, window controls are rendered in the header. */
    windowActions?: Array<WindowAction>;
    onWindowStateChange?: (state: WindowState) => void;
    /** Placement of the minimized modal bar. Defaults to `bottomRight`. */
    minimizedPlacement?: MinimizedPlacement;
    /**
     * When true, calls `onConfirmClose` before closing the modal. If it returns
     * false or rejects, the close is prevented.
     */
    confirmBeforeClose?: boolean;
    onConfirmClose?: () => void | boolean | Promise<boolean>;
    className?: string;
    style?: React.CSSProperties;
    styles?: SemanticOrFn<BAIModalSemanticStyles>;
    classNames?: SemanticOrFn<BAIModalSemanticClassNames>;
    'aria-label'?: string;
    'data-testid'?: string;
    /** Forwarded to `BAIDialog`'s `zIndex` — see there for what it resolves to. */
    zIndex?: number;
    centered?: boolean;
    destroyOnClose?: boolean;
    destroyOnHidden?: boolean;
    draggable?: boolean;
    stickyTitle?: boolean;
    forceRender?: boolean;
    getContainer?: unknown;
    wrapClassName?: string;
    rootClassName?: string;
    rootStyle?: React.CSSProperties;
    bodyStyle?: React.CSSProperties;
    maskStyle?: React.CSSProperties;
    transitionName?: string;
    maskTransitionName?: string;
    modalRender?: (node: React.ReactNode) => React.ReactNode;
    mousePosition?: unknown;
    scrollLock?: boolean;
    focusTriggerAfterClose?: boolean;
    prefixCls?: string;
    wrapProps?: unknown;
}
declare const BAIModal: React.FC<BAIModalProps>;
export default BAIModal;
