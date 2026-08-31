import { InternalNamePath } from './namePath';
/**
 * `FormItem` stamps the JSON-encoded name path on its wrapper. JSON rather
 * than a `_` join because the join is not injective — `['a_b']` and
 * `['a','b']` would collide and the lookup could scroll the wrong item.
 */
export declare const FORM_ITEM_NAME_ATTR = "data-bai-form-item-name";
/** The attribute value for a name path. Must match `FormItem`'s. */
export declare function formItemNameKey(namePath: InternalNamePath): string;
export interface FirstErrorTarget {
    /** What gets scrolled — the whole item, so its label and message come along. */
    item: HTMLElement;
    /** What gets focused, when the control could be resolved. */
    control?: HTMLElement;
}
/**
 * @param resolveControl the store's id-based lookup, which also reaches
 * `noStyle` children — they render no wrapper of their own.
 */
export declare function findFirstErrorTarget(root: ParentNode, names: InternalNamePath[], resolveControl: (name: InternalNamePath) => HTMLElement | undefined): FirstErrorTarget | undefined;
export declare function scrollErrorIntoView(target: FirstErrorTarget, { focus, ...scrollOptions }: ScrollIntoViewOptions & {
    focus?: boolean;
}): void;
