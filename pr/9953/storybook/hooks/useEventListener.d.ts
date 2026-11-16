import { BasicTarget, TargetType } from './internal/domTarget';
/**
 * Subscribe to a DOM event for the lifetime of the component.
 *
 * Ported from ahooks (alibaba/hooks, MIT) — `useEventListener`.
 *
 * Supported option surface (everything this repo uses, plus the two flags the
 * listener registration needs to stay symmetric):
 * `target`, `capture`, `once`, `passive`, `enable`.
 */
export type UseEventListenerTarget = BasicTarget<TargetType>;
export interface UseEventListenerOptions {
    /** Defaults to `window`. Accepts an element, a ref, or a getter. */
    target?: UseEventListenerTarget;
    capture?: boolean;
    once?: boolean;
    passive?: boolean;
    /** When `false` the listener is not attached at all. Defaults to `true`. */
    enable?: boolean;
}
declare function useEventListener<K extends keyof HTMLElementEventMap>(eventName: K, handler: (ev: HTMLElementEventMap[K]) => void, options?: UseEventListenerOptions): void;
declare function useEventListener<K extends keyof DocumentEventMap>(eventName: K, handler: (ev: DocumentEventMap[K]) => void, options?: UseEventListenerOptions): void;
declare function useEventListener<K extends keyof WindowEventMap>(eventName: K, handler: (ev: WindowEventMap[K]) => void, options?: UseEventListenerOptions): void;
declare function useEventListener(eventName: string | string[], handler: (ev: Event) => void, options?: UseEventListenerOptions): void;
export default useEventListener;
