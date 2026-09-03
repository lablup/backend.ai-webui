export interface ScrollToFirstErrorOptions extends ScrollIntoViewOptions {
    /** Move focus as well as the viewport. On unless set to `false`. */
    focus?: boolean;
}
/**
 * The first of the given items in DOCUMENT order. `errorFields` arrives in
 * field REGISTRATION order, which disagrees whenever a group mounts
 * conditionally — `DeploymentAddRevisionModal` hand-rolled a DOM walk for
 * exactly that reason, and this is what lets it stop.
 */
export declare function findFirstErrorItem(root: ParentNode, fieldIds: readonly string[]): HTMLElement | undefined;
export declare function scrollToErrorItem(item: HTMLElement, { focus, ...scrollOptions }?: ScrollToFirstErrorOptions): void;
