import { default as React, ReactNode } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
export type ModalKind = 'confirm' | 'info' | 'success' | 'error' | 'warning';
export interface ModalShimFuncProps {
    title?: ReactNode;
    content?: ReactNode;
    okText?: ReactNode;
    cancelText?: ReactNode;
    okType?: 'primary' | 'danger' | 'default' | 'dashed' | 'link' | 'text';
    /**
     * `danger`/`disabled` are honoured. `loading` is accepted and ignored:
     * antd itself only reflects a *static* `loading` here (there is no
     * `.update()` path in this repo), and the shim derives ok-button loading
     * from the pending `onOk` promise instead.
     */
    okButtonProps?: {
        danger?: boolean;
        disabled?: boolean;
        loading?: unknown;
    };
    /** `disabled` is honoured on the cancel button; other keys are ignored. */
    cancelButtonProps?: {
        danger?: boolean;
        disabled?: boolean;
        loading?: unknown;
    };
    /** May return a promise — see the promise semantics note above. */
    onOk?: () => unknown;
    onCancel?: () => unknown;
    width?: number | string;
    /** Forwarded to `BAIDialog`'s `zIndex` — see there for what it resolves to. */
    zIndex?: number;
    /**
     * PILOT-DECISION: the following antd props are accepted for call-site
     * compatibility but have no Astryx destination and are ignored:
     * - `centered` — Astryx dialogs are always centered.
     * - `icon` — the dialog has no icon slot; severity reads from the action
     *   button variant instead.
     * - `maskClosable`/`keyboard` — dismissal is governed by Dialog `purpose`;
     *   the shim always uses antd's confirm-family defaults (Escape yes,
     *   backdrop no).
     * - `closable` — the alert-dialog branch never has a header X; the other
     *   branch always has one (DialogHeader). Either way Escape already
     *   cancels (see `maskClosable`/`keyboard` above), so a header-X toggle
     *   cannot enforce anything Escape does not already allow.
     */
    centered?: boolean;
    icon?: ReactNode;
    maskClosable?: boolean;
    keyboard?: boolean;
    closable?: boolean;
}
/** antd's confirm return: an imperative handle that is also thenable. */
export interface ModalShimReturn extends PromiseLike<boolean> {
    destroy: () => void;
    update: (config: ModalShimFuncProps) => void;
}
export declare const modal: {
    confirm: (options: ModalShimFuncProps) => ModalShimReturn;
    info: (options: ModalShimFuncProps) => ModalShimReturn;
    success: (options: ModalShimFuncProps) => ModalShimReturn;
    error: (options: ModalShimFuncProps) => ModalShimReturn;
    warning: (options: ModalShimFuncProps) => ModalShimReturn;
};
export type ModalApi = typeof modal;
/**
 * Renders every pending imperative modal task. Mounted exactly once by
 * `<BAIAppProvider>`. Concurrent tasks each get their own portal, and
 * `BAIDialog`'s level stack keeps them in call order.
 */
export declare const AppShimModalHost: React.FC;
