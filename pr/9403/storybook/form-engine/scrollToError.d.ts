export interface ScrollToFirstErrorOptions extends ScrollIntoViewOptions {
    /** Move focus as well as the viewport. On unless set to `false`. */
    focus?: boolean;
}
/** The first invalid item in DOM order that the user can actually reach. */
export declare function findFirstErrorItem(root: ParentNode): HTMLElement | undefined;
export declare function scrollToErrorItem(item: HTMLElement, { focus, ...scrollOptions }?: ScrollToFirstErrorOptions): void;
/**
 * `data-status` only says "error" once the rejected validation has re-rendered
 * the items, so the read waits for the next frame.
 */
export declare function scrollToFirstErrorAfterRender(getRoot: () => ParentNode | null, options?: ScrollToFirstErrorOptions): void;
