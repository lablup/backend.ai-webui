/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 `BAIDialog` — Astryx `Dialog`'s surface portalled into `document.body`
 instead of a native `<dialog>` promoted with `showModal()`. Leaving the top
 layer is the point: no page container is inert — only covered dialog roots are
 — so the notification stack paints above it and stays clickable (FR-3578).

 The inner `<Dialog isInline>` is always told `isOpen`: its inline path renders
 `null` when closed, and children stay mounted as the native `<dialog>` did.
*/
import './BAIDialog.css';
import { BAI_MODAL_OPEN_ATTRIBUTE, useDialogLevel } from './dialogLevelStack';
import { Dialog } from '@astryxdesign/core/Dialog';
import type { DialogPosition, DialogProps } from '@astryxdesign/core/Dialog';
import { useFocusTrap, useScrollLock } from '@astryxdesign/core/hooks';
import { dataAttr } from '@astryxdesign/core/naming';
import { useThemeName } from '@astryxdesign/core/theme';
import { devWarn, mergeRefs } from '@astryxdesign/core/utils';
import classNames from 'classnames';
import React, { useEffect, useId, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

const HEADING_SELECTOR = '[role="heading"], h1, h2, h3, h4, h5, h6';
const DIALOG_SELECTOR = 'dialog, [role="dialog"], [role="alertdialog"]';

/**
 * Astryx's own restore snapshots in a passive effect, by which time the level
 * stack has inerted the covering root and blurred the trigger — it captures
 * `<body>`. Guarded like theirs, so a focus a consumer moved on purpose stays.
 */
function restoreTriggerFocus(
  trigger: HTMLElement | null,
  root: HTMLElement | null,
): void {
  const active = document.activeElement;
  const focusWasLost =
    active == null ||
    active === document.body ||
    active === document.documentElement ||
    root?.contains(active) === true;
  if (focusWasLost && trigger?.isConnected) {
    trigger.focus();
  }
}

/**
 * The dialog's own title, by its ARIA role rather than by an Astryx class or
 * `tabindex` — and never a heading belonging to a dialog nested inside it.
 */
function findDialogTitle(node: HTMLElement): HTMLElement | null {
  for (const heading of node.querySelectorAll<HTMLElement>(HEADING_SELECTOR)) {
    if (heading.closest(DIALOG_SELECTOR) === node) {
      return heading;
    }
  }
  return null;
}

// Normalized trigger→viewport-center vector, scaled to `distance`.
// SYNC: copy of `getDialogDirection` in `@astryxdesign/core/Dialog/Dialog` (no subpath export); diff it on an Astryx bump.
function getDialogDirection(
  triggerEl: HTMLElement,
  distance = 16,
): { x: number; y: number } {
  const rect = triggerEl.getBoundingClientRect();
  const dx = rect.left + rect.width / 2 - window.innerWidth / 2;
  const dy = rect.top + rect.height / 2 - window.innerHeight / 2;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  return {
    x: Math.round((dx / dist) * distance),
    y: Math.round((dy / dist) * distance),
  };
}

function toCssLength(value: number | string): string {
  return typeof value === 'number' ? `${value}px` : value;
}

// Logical `start`/`end` become `inset-inline-*`; unset offsets fall back to `auto`.
// SYNC: copy of `resolveDialogPositionOffsets` in `@astryxdesign/core/Dialog/Dialog` (no subpath export); diff it on an Astryx bump.
function resolveDialogPortalPosition(
  position: DialogPosition,
): React.CSSProperties {
  const { top, bottom, start, end } = position;
  return {
    top: top !== undefined ? toCssLength(top) : 'auto',
    bottom: bottom !== undefined ? toCssLength(bottom) : 'auto',
    insetInlineStart: start !== undefined ? toCssLength(start) : 'auto',
    insetInlineEnd: end !== undefined ? toCssLength(end) : 'auto',
  };
}

export interface BAIDialogProps extends Omit<
  DialogProps,
  'ref' | 'isInline' | 'width' | 'aria-modal'
> {
  /** Ref to the element carrying `role="dialog"` — a `div`, not a `<dialog>`. */
  ref?: React.Ref<HTMLDivElement>;
  /**
   * Width of the outer sizing box, so a percentage resolves against the
   * viewport. Astryx's own 90vw cap still applies to the surface inside it;
   * `variant="fullscreen"` ignores this.
   */
  width?: number | string;
  /**
   * Raises the portal root within the modal band, as a request the level stack
   * resolves (`resolveDialogZIndex`): a dialog opened later is still placed
   * above this one, and a value outside the band is ignored. Pass a
   * `BAI_Z_INDEX` layer, not a literal. `style` reaches the inner Dialog
   * surface, so `style={{ zIndex }}` does not.
   */
  zIndex?: number;
}

const BAIDialog: React.FC<BAIDialogProps> = ({
  isOpen,
  onOpenChange,
  width = 400,
  maxHeight = '75vh',
  position,
  variant = 'standard',
  purpose = 'info',
  padding,
  zIndex,
  role,
  children,
  xstyle,
  className,
  style,
  ref,
  ...rest
}) => {
  'use memo';

  // Theme CSS is `@scope`d to `[data-astryx-theme]`, so re-emitting the nearest
  // theme's NAME (not its mode) keeps an admin-region modal on the admin accent.
  const themeName = useThemeName();

  const allowEscape = purpose !== 'required';
  const allowBackdropClick = purpose === 'info';
  const hasConsumerName =
    rest['aria-label'] != null || rest['aria-labelledby'] != null;
  const titleId = useId();

  const handleEscape = () => {
    if (allowEscape) {
      onOpenChange(false);
    }
  };

  const rootRef = useRef<HTMLDivElement>(null);
  // Ahead of `useDialogLevel`, which inerts the covering root — the browser
  // blurs whatever that subtree held.
  const triggerRef = useRef<HTMLElement | null>(null);
  useLayoutEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement as HTMLElement | null;
    }
  }, [isOpen]);
  // Its shared stack resolves Escape topmost-only, so a popover nested in the
  // modal keeps single-Escape dismissal; it also restores focus on deactivate.
  // A covered dialog drops its trap; see `syncCoveredDialogs`.
  // It also owns the root's z-index, so an explicit `zIndex` goes through the
  // stack rather than around it (one order decides paint AND inertness).
  const isTopmost = useDialogLevel(rootRef, isOpen, zIndex);

  const { containerRef, focusFirst } = useFocusTrap<HTMLDivElement>({
    isActive: isOpen && isTopmost,
    onEscape: handleEscape,
  });

  // Declared after the trap on purpose: its document-level capture listener is
  // still installed during earlier cleanups and would pull focus straight back
  // into the closing dialog.
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const root = rootRef.current;
    return () => restoreTriggerFocus(triggerRef.current, root);
  }, [isOpen]);

  useScrollLock(isOpen);

  // `isInline` gives us `DialogContext` (so `DialogHeader` renders its title
  // with an id) but nothing points at it. Every e2e dialog selector is
  // `getByRole('dialog', {name})`, so this wiring is load-bearing.
  const syncAccessibleName = () => {
    const node = containerRef.current;
    if (!isOpen || !node || hasConsumerName) {
      return;
    }
    const title = findDialogTitle(node);
    if (!title) {
      node.removeAttribute('aria-labelledby');
      return;
    }
    if (!title.id) {
      title.id = titleId;
    }
    node.setAttribute('aria-labelledby', title.id);
  };
  // Refs attach bottom-up, so the title is already in the DOM on the first run.
  useEffect(syncAccessibleName);

  const wrapRef = mergeRefs<HTMLDivElement>(ref, containerRef);

  // Set before first paint so the entry keyframe reads the trigger's direction;
  // cleared on close so a later trigger-less open uses the CSS defaults.
  useLayoutEffect(() => {
    const node = containerRef.current;
    if (!isOpen || !node) {
      return;
    }
    const trigger = document.activeElement;
    // Under reduced motion the CSS sets `animation-name: none`, so nothing
    // would read the measurement.
    if (
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
      trigger instanceof HTMLElement &&
      trigger !== document.body
    ) {
      const { x, y } = getDialogDirection(trigger);
      node.style.setProperty('--bai-dialog-dir-x', `${x}px`);
      node.style.setProperty('--bai-dialog-dir-y', `${y}px`);
    }
    return () => {
      node.style.removeProperty('--bai-dialog-dir-x');
      node.style.removeProperty('--bai-dialog-dir-y');
    };
  }, [isOpen, containerRef]);

  // `[data-autofocus]` wins, then the header title (which `isInline` stops
  // `DialogHeader` from focusing itself), then the first focusable element.
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const node = containerRef.current;
    if (!node) {
      return;
    }
    const target =
      node.querySelector<HTMLElement>('[data-autofocus]') ??
      findDialogTitle(node);
    target?.focus();
    if (document.activeElement !== target) {
      focusFirst();
    }
  }, [isOpen, containerRef, focusFirst]);

  const hasWarnedRef = useRef(false);
  useEffect(() => {
    if (!isOpen || hasConsumerName || hasWarnedRef.current) {
      return;
    }
    const node = containerRef.current;
    if (!node || findDialogTitle(node) != null) {
      return;
    }
    hasWarnedRef.current = true;
    devWarn(
      'BAIDialog',
      'open dialog has no accessible name. Add a DialogHeader ' +
        'with a `title`, or pass `aria-label`/`aria-labelledby`.',
    );
  }, [isOpen, hasConsumerName, containerRef]);

  const maskRef = useRef<HTMLDivElement>(null);
  const isPointerDownOnMaskRef = useRef(false);
  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    isPointerDownOnMaskRef.current = event.target === maskRef.current;
  };
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    // A drag that started inside the dialog must not dismiss it.
    const isBackdropClick =
      isPointerDownOnMaskRef.current && event.target === maskRef.current;
    isPointerDownOnMaskRef.current = false;
    if (isBackdropClick && allowBackdropClick) {
      onOpenChange(false);
    }
  };

  const isFullscreen = variant === 'fullscreen';
  const hasPosition = position != null && !isFullscreen;

  return createPortal(
    <div
      ref={rootRef}
      className={classNames('bai-dialog', !isOpen && 'bai-dialog--closed')}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      {...{
        [BAI_MODAL_OPEN_ATTRIBUTE]: isOpen ? '' : undefined,
        [dataAttr('theme')]: themeName ?? undefined,
      }}
    >
      <div ref={maskRef} className="bai-dialog__mask" />
      <div
        {...(rest as React.HTMLAttributes<HTMLDivElement>)}
        ref={wrapRef}
        className={classNames(
          'bai-dialog__wrap',
          hasPosition && 'bai-dialog__wrap--positioned',
        )}
        // Astryx applies `width` to the surface, where a percentage would
        // resolve against the wrap rather than the viewport. `maxHeight` stays
        // on the surface: Astryx also feeds it to the inner scroll container.
        style={{
          ...(hasPosition ? resolveDialogPortalPosition(position) : null),
          width: isFullscreen ? undefined : toCssLength(width),
        }}
        // A consumer `role` wins: the app-shim's confirm needs `alertdialog`
        // on a `form`-purpose dialog, which `purpose` alone cannot express.
        role={
          isOpen
            ? (role ?? (purpose === 'required' ? 'alertdialog' : 'dialog'))
            : undefined
        }
        // No `aria-modal` (and it is Omitted from the props): it asserts that
        // everything outside is unavailable, which FR-3578 made false. Residue:
        // `useFocusTrap` above still holds Tab, so the notices are reachable in
        // a screen reader's browse mode but not by keyboard.
      >
        <Dialog
          isInline
          isOpen
          onOpenChange={onOpenChange}
          width="100%"
          maxHeight={maxHeight}
          variant={variant}
          padding={padding}
          xstyle={xstyle}
          className={className}
          style={style}
        >
          {children}
        </Dialog>
      </div>
    </div>,
    document.body,
  );
};

BAIDialog.displayName = 'BAIDialog';

export default BAIDialog;
