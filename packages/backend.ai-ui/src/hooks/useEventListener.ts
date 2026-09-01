import {
  getTargetElement,
  useEffectWithTarget,
  type BasicTarget,
  type TargetType,
} from './internal/domTarget';
import { useLatest } from './internal/useLatest';

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

function useEventListener<K extends keyof HTMLElementEventMap>(
  eventName: K,
  handler: (ev: HTMLElementEventMap[K]) => void,
  options?: UseEventListenerOptions,
): void;
function useEventListener<K extends keyof DocumentEventMap>(
  eventName: K,
  handler: (ev: DocumentEventMap[K]) => void,
  options?: UseEventListenerOptions,
): void;
function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (ev: WindowEventMap[K]) => void,
  options?: UseEventListenerOptions,
): void;
function useEventListener(
  eventName: string | string[],
  handler: (ev: Event) => void,
  options?: UseEventListenerOptions,
): void;
function useEventListener(
  eventName: string | string[],
  handler: (ev: any) => void,
  options: UseEventListenerOptions = {},
): void {
  const { enable = true } = options;
  const handlerRef = useLatest(handler);

  useEffectWithTarget(
    () => {
      if (!enable) {
        return;
      }
      const targetElement = getTargetElement(options.target, window);
      if (!targetElement?.addEventListener) {
        return;
      }

      const eventListener = (event: Event) => handlerRef.current(event);
      const eventNames = Array.isArray(eventName) ? eventName : [eventName];

      eventNames.forEach((name) => {
        targetElement.addEventListener(name, eventListener, {
          capture: options.capture,
          once: options.once,
          passive: options.passive,
        });
      });

      return () => {
        eventNames.forEach((name) => {
          targetElement.removeEventListener(name, eventListener, {
            capture: options.capture,
          });
        });
      };
    },
    [eventName, options.capture, options.once, options.passive, enable],
    options.target,
  );
}

export default useEventListener;
