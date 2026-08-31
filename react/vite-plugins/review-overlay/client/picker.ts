/**
 * Element picking. react-grab IS the picker whenever it is present — the app
 * already loads it in dev (`react/src/index.tsx`), its hover overlay names the
 * React component, and its ⌘⌃C hotkey is the review-pick shortcut.
 *
 * The plugin arms on `onActivate`, so EVERY activation (hotkey, dock button,
 * `api.activate()`) opens the review composer; `onElementSelect` returns
 * `false` to cancel react-grab's own clipboard copy. When react-grab is
 * missing, a plain hover/click picker takes over.
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
}

const PLUGIN_NAME = 'bai-review-pick';

export function createPicker(callbacks: PickerCallbacks) {
  let grabRegistered = false;
  let grabArmed = false;
  let fallbackPicking = false;

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
            grabArmed = true;
            setMode(true);
          },
          onElementSelect: (element: Element) => {
            if (!grabArmed) return undefined;
            grabArmed = false;
            // Deactivate FIRST, on a later tick: react-grab restores focus on
            // deactivate, and doing it after the composer opens steals focus
            // straight back out of the textarea.
            setTimeout(() => {
              grab.deactivate();
              const rect = element.getBoundingClientRect();
              callbacks.onPick(
                element,
                rect.left + Math.min(rect.width, 160),
                rect.bottom + 6,
              );
            }, 0);
            return false;
          },
          onDeactivate: () => {
            grabArmed = false;
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
      grabArmed = true;
      grab.activate();
      setMode(true);
      callbacks.showHint(
        'Click an element — hover shows its component (Esc to cancel)',
      );
      return;
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
    if (grabArmed) {
      grabArmed = false;
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
      if (ensureGrabPlugin() || ++tries > 40) clearInterval(timer);
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
      return {
        name: source.componentName,
        src: `${source.filePath}${line}${column}`,
      };
    } catch {
      return undefined;
    }
  }

  return {
    start,
    stop,
    isActive: () => grabArmed || fallbackPicking,
    watchForReactGrab,
    getStack,
    getComponent,
  };
}

export type Picker = ReturnType<typeof createPicker>;
