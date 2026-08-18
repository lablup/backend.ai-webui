/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 `BAIDialogPortal` — Astryx `Dialog`'s surface rendered through a portal into
 `document.body` instead of a native `<dialog>` promoted with `showModal()`.
 Leaving the top layer is the point: with nothing outside the modal marked
 inert, the notification stack paints above it and stays clickable (FR-3578).

 The inner `<Dialog isInline>` is always told `isOpen` — its inline path returns
 `null` when closed, and we keep children mounted as the native `<dialog>` did.
*/
import { BAI_Z_INDEX } from '../styles/zIndexLadder';
import './BAIDialogPortal.css';
import { Dialog } from '@astryxdesign/core/Dialog';
import type { DialogPosition, DialogProps } from '@astryxdesign/core/Dialog';
import { useFocusTrap, useScrollLock } from '@astryxdesign/core/hooks';
import { dataAttr } from '@astryxdesign/core/naming';
import { useThemeName } from '@astryxdesign/core/theme';
import { devWarn, mergeRefs } from '@astryxdesign/core/utils';
import classNames from 'classnames';
import React, { useEffect, useId, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

/**
 * Marks an open portal modal root. Consumers scope document queries to it, so
 * renaming it here without updating them fails silently — import, never retype.
 */
export const BAI_MODAL_OPEN_ATTRIBUTE = 'data-bai-modal-open';

// The CSS climbs one ladder step per nesting level; past this ceiling a modal
// would reach the notice stack, the inversion FR-3578 exists to prevent.
// Exported so `zIndexLadder.test.ts` pins THIS number under it, not a copy.
export const MAX_DIALOG_LEVEL = 80;

/**
 * The `zIndex` escape hatch is reachable from every `<BAIModal>`. A number
 * below the band is always a stale one, so it degrades to "on top of the band"
 * rather than to an invisible modal (FR-3578 T10).
 */
function floorToModalBand(zIndex: number): number {
  if (zIndex >= BAI_Z_INDEX.modalBase) {
    return zIndex;
  }
  devWarn(
    'BAIDialogPortal',
    `zIndex ${zIndex} is below the modal band base ` +
      `(${BAI_Z_INDEX.modalBase}); clamping. Pass a layer from ` +
      '`BAI_Z_INDEX` rather than a literal, or drop the prop.',
  );
  return BAI_Z_INDEX.modalBase;
}

// Module-level: inside `'use memo'` the compiler rewrites a read-then-increment.
const openDialogs: Array<{ level: number; root: HTMLElement | null }> = [];

/**
 * Only the topmost portal stays interactive. A covered dialog's `useFocusTrap`
 * would otherwise redirect Tab back into itself — measured: tabbing inside a
 * nested dialog landed on the parent's last button.
 */
function syncCoveredDialogs(): void {
  openDialogs.forEach(({ root }, index) => {
    if (index === openDialogs.length - 1) {
      root?.removeAttribute('inert');
    } else {
      root?.setAttribute('inert', '');
    }
  });
}

function claimDialogLevel(root: HTMLElement | null): number {
  const level = Math.min(
    (openDialogs.at(-1)?.level ?? -1) + 1,
    MAX_DIALOG_LEVEL,
  );
  openDialogs.push({ level, root });
  syncCoveredDialogs();
  return level;
}

function releaseDialogLevel(level: number): void {
  const index = openDialogs.findIndex((entry) => entry.level === level);
  if (index !== -1) {
    openDialogs.splice(index, 1);
  }
  syncCoveredDialogs();
}

const HEADING_SELECTOR = '[role="heading"], h1, h2, h3, h4, h5, h6';
const DIALOG_SELECTOR = 'dialog, [role="dialog"], [role="alertdialog"]';

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

function formatPosition(value: number | string): string {
  return typeof value === 'number' ? `${value}px` : value;
}

// Logical `start`/`end` become `inset-inline-*`; unset offsets fall back to `auto`.
// SYNC: copy of `resolveDialogPositionOffsets` in `@astryxdesign/core/Dialog/Dialog` (no subpath export); diff it on an Astryx bump.
function resolveDialogPortalPosition(
  position: DialogPosition,
): React.CSSProperties {
  const { top, bottom, start, end } = position;
  return {
    top: top !== undefined ? formatPosition(top) : 'auto',
    bottom: bottom !== undefined ? formatPosition(bottom) : 'auto',
    insetInlineStart: start !== undefined ? formatPosition(start) : 'auto',
    insetInlineEnd: end !== undefined ? formatPosition(end) : 'auto',
  };
}

export interface BAIDialogPortalProps extends Omit<
  DialogProps,
  'ref' | 'isInline'
> {
  /** Ref to the element carrying `role="dialog"` — a `div`, not a `<dialog>`. */
  ref?: React.Ref<HTMLDivElement>;
  /**
   * Explicit stacking override for the portal root, replacing the level the
   * stack assigns and floored at `BAI_Z_INDEX.modalBase`. `style` reaches the
   * inner Dialog surface instead, so `style={{ zIndex }}` does NOT move it.
   */
  zIndex?: number;
}

const BAIDialogPortal: React.FC<BAIDialogPortalProps> = ({
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

  // Resolves topmost-only Escape through its own shared stack, so a popover
  // nested in the modal keeps single-Escape dismissal; it also restores focus
  // to whatever was focused before the trap activated.
  const { containerRef, focusFirst } = useFocusTrap<HTMLDivElement>({
    isActive: isOpen,
    onEscape: handleEscape,
  });

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

  // Written to the DOM rather than to state: the value must be right at first
  // paint, and `--bai-dialog-portal-level` is a property React never manages.
  const rootRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (!isOpen) {
      return;
    }
    const level = claimDialogLevel(rootRef.current);
    rootRef.current?.style.setProperty(
      '--bai-dialog-portal-level',
      String(level),
    );
    return () => {
      releaseDialogLevel(level);
    };
  }, [isOpen]);

  // Set before first paint so the entry keyframe reads the trigger's direction,
  // and cleared on close so a later trigger-less open falls back to the CSS
  // defaults instead of animating in from the previous trigger's corner.
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
      node.style.setProperty('--bai-dialog-portal-dir-x', `${x}px`);
      node.style.setProperty('--bai-dialog-portal-dir-y', `${y}px`);
    }
    return () => {
      node.style.removeProperty('--bai-dialog-portal-dir-x');
      node.style.removeProperty('--bai-dialog-portal-dir-y');
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
      'BAIDialogPortal',
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

  const hasPosition = position != null && variant !== 'fullscreen';

  return createPortal(
    <div
      ref={rootRef}
      className={classNames(
        'bai-dialog-portal',
        !isOpen && 'bai-dialog-portal--closed',
      )}
      style={
        zIndex != null
          ? ({
              '--bai-dialog-portal-z': floorToModalBand(zIndex),
            } as React.CSSProperties)
          : undefined
      }
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      {...{
        [BAI_MODAL_OPEN_ATTRIBUTE]: isOpen ? '' : undefined,
        [dataAttr('theme')]: themeName ?? undefined,
      }}
    >
      <div ref={maskRef} className="bai-dialog-portal__mask" />
      <div
        {...(rest as React.HTMLAttributes<HTMLDivElement>)}
        ref={wrapRef}
        className={classNames(
          'bai-dialog-portal__wrap',
          hasPosition && 'bai-dialog-portal__wrap--positioned',
        )}
        style={hasPosition ? resolveDialogPortalPosition(position) : undefined}
        // A consumer-passed `role` wins: the app-shim's confirm needs
        // `alertdialog` on a `form`-purpose dialog (alertdialog + Escape),
        // which `purpose` alone cannot express.
        role={
          isOpen
            ? (role ?? (purpose === 'required' ? 'alertdialog' : 'dialog'))
            : undefined
        }
        aria-modal={isOpen ? true : undefined}
      >
        <Dialog
          isInline
          isOpen
          onOpenChange={onOpenChange}
          width={width}
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

BAIDialogPortal.displayName = 'BAIDialogPortal';

export default BAIDialogPortal;
