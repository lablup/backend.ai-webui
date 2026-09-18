import { RefObject } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
/**
 * Marks an open portal modal root. Consumers scope document queries to it —
 * import it rather than retyping the string; a rename fails silently.
 */
export declare const BAI_MODAL_OPEN_ATTRIBUTE = "data-bai-modal-open";
export declare const MAX_DIALOG_LEVEL = 80;
/** The claim's handle. Released by reference, never by `level` — the clamp at
    `MAX_DIALOG_LEVEL` lets two entries share one. */
export interface DialogLevelEntry {
    level: number;
    /** The stack, not the caller, is the authority on where the root paints. */
    zIndex: number;
    isTopmost: boolean;
    root: HTMLElement | null;
    setIsTopmost: (isTopmost: boolean) => void;
}
export declare function claimDialogLevel(root: HTMLElement | null, setIsTopmost: (isTopmost: boolean) => void, requestedZIndex?: number): DialogLevelEntry;
export declare function releaseDialogLevel(entry: DialogLevelEntry): void;
/**
 * Claims a level for `rootRef` while `isOpen`, publishing that level and the
 * z-index it resolved to on the root's inline style. Written to the DOM rather
 * than to state: the values must be right at first paint, and they are
 * properties React never manages.
 *
 * Returns whether this surface is the topmost one, which its focus trap has to
 * gate on — see `syncCoveredDialogs`.
 */
export declare function useDialogLevel(rootRef: RefObject<HTMLElement | null>, isOpen: boolean, zIndex?: number): boolean;
