/**
 * Element picking. react-grab IS the picker whenever it is present — the app
 * already loads it in dev (`react/src/index.tsx`), its hover overlay names the
 * React component, and its ⌘⌃C hotkey is the review-pick shortcut.
 *
 * EVERY react-grab pick is a review pick — the plugin never checks its own
 * state before intercepting, because react-grab's keyup deactivate can land
 * first and any state gate would hand that pick to its clipboard instead.
 * When react-grab is missing or disabled, a plain hover/click picker takes over.
 */
import type { AnchorComponent } from './types.js';
import type { ReactGrabAPI } from 'react-grab';

export interface PickerCallbacks {
  /** A pick landed. Coordinates are viewport-relative, for the composer. */
  onPick: (element: Element, x: number, y: number) => void;
  onModeChange: (active: boolean) => void;
  onHover: (rect: DOMRect | null) => void;
  /** True for events originating inside the overlay's own shadow host. */
  isOwnEvent: (evt: Event) => boolean;
  showHint: (message: string) => void;
  /** react-grab never showed up, or is present but disabled. */
  onReactGrabUnavailable: () => void;
}

const PLUGIN_NAME = 'bai-review-pick';

export function createPicker(callbacks: PickerCallbacks) {
  let grabRegistered = false;
  let grabActive = false;
  let fallbackPicking = false;
  /** First element of the current react-grab selection, until the deferred open. */
  let pendingPick: Element | null = null;

  const api = () => window.__REACT_GRAB__ ?? null;

  const setMode = (active: boolean) => {
    callbacks.onModeChange(active);
  };

  function ensureGrabPlugin(): ReactGrabAPI | null {
    const grab = api();
    if (!grab) return null;
    if (grabRegistered) return grab;
    try {
      grab.registerPlugin({
        name: PLUGIN_NAME,
        hooks: {
          onActivate: () => {
            grabActive = true;
            setMode(true);
          },
          onElementSelect: (element: Element) => {
            // react-grab calls this once per element and copies every one it
            // was not told to skip, so a box/shift select must be intercepted
            // WHOLE. The composer opens for the first element only.
            if (!pendingPick) {
              pendingPick = element;
              // Deactivate FIRST, on a later tick: react-grab restores focus
              // on deactivate, and doing it after the composer opens steals
              // focus straight back out of the textarea.
              setTimeout(() => {
                const target = pendingPick;
                pendingPick = null;
                if (!target) return undefined;
                grab.deactivate();
                const rect = target.getBoundingClientRect();
                callbacks.onPick(
                  target,
                  rect.left + Math.min(rect.width, 160),
                  rect.bottom + 6,
                );
                return undefined;
              }, 0);
            }
            // react-grab 0.1.50 marks an element intercepted on a TRUTHY
            // return (`if (a) wasIntercepted = true`), so `false` reads as
            // "not intercepted" and it copies the element anyway.
            return true;
          },
          // `copyElement()` is the one clipboard path `onElementSelect` never
          // sees; an empty body makes react-grab skip the write entirely.
          transformCopyContent: () => '',
          onDeactivate: () => {
            grabActive = false;
            setMode(false);
          },
        },
      });
      grabRegistered = true;
      return grab;
    } catch {
      return null;
    }
  }

  // ------------------------------------------------------- fallback picker

  function onMove(evt: MouseEvent) {
    if (callbacks.isOwnEvent(evt)) {
      callbacks.onHover(null);
      return;
    }
    const target = evt.target;
    if (!(target instanceof Element)) return;
    callbacks.onHover(target.getBoundingClientRect());
  }

  function onClick(evt: MouseEvent) {
    if (callbacks.isOwnEvent(evt)) return;
    const target = evt.target;
    if (!(target instanceof Element)) return;
    evt.preventDefault();
    evt.stopPropagation();
    stop();
    callbacks.onPick(target, evt.clientX, evt.clientY);
  }

  function start() {
    const grab = ensureGrabPlugin();
    if (grab) {
      grab.activate();
      // `activate()` is a silent no-op when react-grab is loaded but disabled
      // (its own toggle, or instrumentation that never attached), which would
      // leave the reviewer clicking a dead button. Verify, then fall through.
      if (grab.isActive()) {
        grabActive = true;
        setMode(true);
        callbacks.showHint(
          'Click an element — hover shows its component (Esc to cancel)',
        );
        return;
      }
      callbacks.onReactGrabUnavailable();
    }
    if (fallbackPicking) return;
    fallbackPicking = true;
    document.documentElement.style.cursor = 'crosshair';
    document.addEventListener('mousemove', onMove, true);
    document.addEventListener('click', onClick, true);
    setMode(true);
    callbacks.showHint(
      'Click the element you want to comment on (Esc to cancel)',
    );
  }

  function stop() {
    if (grabActive) {
      grabActive = false;
      pendingPick = null;
      api()?.deactivate();
    }
    if (fallbackPicking) {
      fallbackPicking = false;
      document.documentElement.style.cursor = '';
      document.removeEventListener('mousemove', onMove, true);
      document.removeEventListener('click', onClick, true);
    }
    callbacks.onHover(null);
    setMode(false);
  }

  /**
   * react-grab arrives through a dynamic import, so poll briefly at boot —
   * registering early is what makes its ⌘⌃C arm review-pick from the start.
   */
  function watchForReactGrab() {
    if (ensureGrabPlugin()) return;
    let tries = 0;
    const timer = setInterval(() => {
      if (ensureGrabPlugin()) {
        clearInterval(timer);
        return;
      }
      if (++tries > 40) {
        clearInterval(timer);
        // No react-grab means no ⌘⌃C, so the dock is the only way in. Show it
        // rather than leaving the reviewer with an overlay they cannot reach.
        callbacks.onReactGrabUnavailable();
      }
    }, 500);
  }

  /** react-grab's component stack for the element, quoted verbatim later. */
  async function getStack(element: Element): Promise<string[]> {
    const grab = api();
    if (!grab) return [];
    try {
      const context = await grab.getStackContext(element);
      return String(context || '')
        .split('\n')
        .map((line) => line.trimEnd())
        .filter((line) => line.trim());
    } catch {
      return [];
    }
  }

  async function getComponent(
    element: Element,
  ): Promise<AnchorComponent | undefined> {
    const grab = api();
    if (!grab) return undefined;
    try {
      const source = await grab.getSource(element);
      if (!source || !source.componentName) return undefined;
      const line = source.lineNumber == null ? '' : `:${source.lineNumber}`;
      const column =
        source.columnNumber == null ? '' : `:${source.columnNumber}`;
      // `getSource` names the OWNER component and `getDisplayName` the
      // rendered one; the read side can only compare the latter with itself.
      const dn =
        typeof grab.getDisplayName === 'function'
          ? grab.getDisplayName(element)
          : null;
      return {
        name: source.componentName,
        src: `${source.filePath}${line}${column}`,
        ...(dn ? { dn } : {}),
      };
    } catch {
      return undefined;
    }
  }

  return {
    start,
    stop,
    isActive: () => grabActive || fallbackPicking,
    watchForReactGrab,
    getStack,
    getComponent,
  };
}

export type Picker = ReturnType<typeof createPicker>;
