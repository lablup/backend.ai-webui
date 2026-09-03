/**
 * Element picking. react-grab IS the picker whenever it is present — the app
 * already loads it in dev (`react/src/index.tsx`), its hover overlay names the
 * React component, and its ⌘⌃C hotkey is the review-pick shortcut.
 *
 * EVERY react-grab pick is a review pick — the plugin never checks its own
 * state before intercepting, because react-grab's keyup deactivate can land
 * first and any state gate would hand that pick to its clipboard instead.
 * When react-grab is missing or disabled, a plain hover/click picker takes
 * over — and `isReactGrabChord` re-binds react-grab's own chord to it, because
 * the overlay has no button and would otherwise have no entry point at all.
 */
import type { AnchorComponent } from './types.js';
import type { ReactGrabAPI } from 'react-grab';

export interface PickerCallbacks {
  /** A pick landed. Coordinates are viewport-relative, for the composer. */
  onPick: (element: Element, x: number, y: number) => void;
  onModeChange: (active: boolean) => void;
  onHover: (rect: DOMRect | null, borderRadius?: string) => void;
  /** True for events originating inside the overlay's own shadow host. */
  isOwnEvent: (evt: Event) => boolean;
  showHint: (message: string) => void;
}

const PLUGIN_NAME = 'bai-review-pick';

/** react-grab reads `navigator.platform` first and falls back to the UA. */
const isMac = (): boolean =>
  typeof navigator !== 'undefined' &&
  /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent);

/**
 * react-grab 0.1.50's own activation test (`gr` in its core bundle): the
 * platform modifier — ⌘ on a Mac, ⌃ everywhere else — plus C, no shift, no alt.
 */
export function isReactGrabChord(evt: KeyboardEvent): boolean {
  if (evt.shiftKey || evt.altKey) return false;
  if (!(isMac() ? evt.metaKey : evt.ctrlKey)) return false;
  return evt.code === 'KeyC' || evt.key?.toLowerCase() === 'c';
}

/** react-grab does not activate inside a field either; ⌘C there is copy. */
const isEditable = (node: EventTarget | null): boolean =>
  node instanceof HTMLElement &&
  (node.isContentEditable ||
    node instanceof HTMLInputElement ||
    node instanceof HTMLTextAreaElement);

export function createPicker(callbacks: PickerCallbacks) {
  let grabRegistered = false;
  let grabActive = false;
  let fallbackPicking = false;
  let hotkeyArmed = false;
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
      // react-grab owns the chord again, so stop shadowing it.
      disarmHotkey();
      return grab;
    } catch {
      return null;
    }
  }

  // ------------------------------------------------------- fallback picker

  function onHotkey(evt: KeyboardEvent) {
    if (evt.repeat || !isReactGrabChord(evt)) return;
    if (isEditable(evt.target) || callbacks.isOwnEvent(evt)) return;
    evt.preventDefault();
    start();
  }

  /**
   * The overlay has no button: without this, a page where react-grab failed to
   * load or is disabled offers no way into pick mode at all.
   */
  function armHotkey() {
    if (hotkeyArmed) return;
    hotkeyArmed = true;
    window.addEventListener('keydown', onHotkey, true);
  }

  function disarmHotkey() {
    if (!hotkeyArmed) return;
    hotkeyArmed = false;
    window.removeEventListener('keydown', onHotkey, true);
  }

  function onMove(evt: MouseEvent) {
    if (callbacks.isOwnEvent(evt)) {
      callbacks.onHover(null);
      return;
    }
    const target = evt.target;
    if (!(target instanceof Element)) return;
    callbacks.onHover(
      target.getBoundingClientRect(),
      getComputedStyle(target).borderRadius,
    );
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
      armHotkey();
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
        armHotkey();
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

  /** Tests and hot reloads: leaves nothing bound to the window. */
  function dispose() {
    stop();
    disarmHotkey();
  }

  return {
    start,
    stop,
    dispose,
    isActive: () => grabActive || fallbackPicking,
    watchForReactGrab,
    isHotkeyArmed: () => hotkeyArmed,
    getStack,
    getComponent,
  };
}

export type Picker = ReturnType<typeof createPicker>;
