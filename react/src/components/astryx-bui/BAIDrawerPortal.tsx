/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 `BAIDrawerPortal` — a scrimmed lab `Drawer` rendered through a `document.body`
 portal instead of `showModal()`. A `showModal()` dialog inerts everything
 outside its flat tree, which included the portalled modals FR-3578 introduced;
 the inner drawer therefore takes `hasScrim={false}` and opens with `show()`,
 which promotes nothing (FR-3585).
*/
import './BAIDrawerPortal.css';
import { useFocusTrap, useScrollLock } from '@astryxdesign/core/hooks';
import { dataAttr } from '@astryxdesign/core/naming';
import { useThemeName } from '@astryxdesign/core/theme';
import { Drawer, type DrawerProps } from '@astryxdesign/lab';
import {
  BAI_MODAL_OPEN_ATTRIBUTE,
  claimDialogLevel,
  releaseDialogLevel,
} from 'backend.ai-ui';
import classNames from 'classnames';
import React, {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

// lab delays its own `dialog.close()` by these to let the panel slide out
// (`@astryxdesign/lab/src/Drawer/Drawer.tsx`); the portal root has to outlive
// `isOpen` by the same amount or the exit is cut off.
const EXIT_DURATION_MS = 250;
const REDUCED_MOTION_EXIT_DURATION_MS = 10;

/** Hides the root once the slide-out is over. Driven from the DOM, not React,
    so a closing drawer does not re-render its whole subtree a frame later. */
const HIDDEN_ATTRIBUTE = 'data-bai-drawer-hidden';

/** Everything lab `Drawer` takes; the portal owns the scrim, so not `hasScrim`. */
export type BAIDrawerPortalProps = Omit<DrawerProps, 'hasScrim'>;

const BAIDrawerPortal: React.FC<BAIDrawerPortalProps> = ({
  isOpen,
  onClose,
  children,
  ...rest
}) => {
  'use memo';

  // Theme CSS is `@scope`d to `[data-astryx-theme]`, and the portal escapes DOM
  // ancestry — re-emit the nearest theme's NAME as `BAIDialogPortal` does.
  const themeName = useThemeName();

  // Modality restored by hand: `show()` traps nothing. Escape stays lab's — its
  // dialog `keydown` already closes the top drawer, and a second handler here
  // would call `onClose` twice.
  // A covered surface drops its trap; see `syncCoveredDialogs`.
  const [isTopmost, setIsTopmost] = useState(true);

  const { containerRef, focusFirst } = useFocusTrap<HTMLDivElement>({
    isActive: isOpen && isTopmost,
  });

  // lab runs `useScrollLock(isOpen && hasScrim)`, and its scrim is off now.
  useScrollLock(isOpen);

  const rootRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (!isOpen) {
      return;
    }
    const level = claimDialogLevel(rootRef.current, setIsTopmost);
    rootRef.current?.style.setProperty(
      '--bai-drawer-portal-level',
      String(level),
    );
    return () => {
      releaseDialogLevel(level);
    };
  }, [isOpen]);

  const hasBeenOpenRef = useRef(false);
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }
    if (isOpen) {
      hasBeenOpenRef.current = true;
      root.removeAttribute(HIDDEN_ATTRIBUTE);
      return;
    }
    if (!hasBeenOpenRef.current) {
      root.setAttribute(HIDDEN_ATTRIBUTE, '');
      return;
    }
    const timer = setTimeout(
      () => root.setAttribute(HIDDEN_ATTRIBUTE, ''),
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? REDUCED_MOTION_EXIT_DURATION_MS
        : EXIT_DURATION_MS,
    );
    return () => clearTimeout(timer);
  }, [isOpen]);

  // `show()` moves focus nowhere, unlike `showModal()`. lab has already honoured
  // `[data-autofocus]`; otherwise land on its `tabindex="-1"` panel body, where
  // the dialog focusing steps used to put us.
  useEffect(() => {
    const node = containerRef.current;
    if (!isOpen || !node || node.querySelector('[data-autofocus]')) {
      return;
    }
    const panel = node.querySelector<HTMLElement>('dialog > [tabindex="-1"]');
    if (panel) {
      panel.focus();
    } else {
      focusFirst();
    }
  }, [isOpen, containerRef, focusFirst]);

  const maskRef = useRef<HTMLDivElement>(null);
  const isPointerDownOnMaskRef = useRef(false);
  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    isPointerDownOnMaskRef.current = event.target === maskRef.current;
  };
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    // A drag that started inside the panel must not dismiss it.
    const isMaskClick =
      isPointerDownOnMaskRef.current && event.target === maskRef.current;
    isPointerDownOnMaskRef.current = false;
    if (isMaskClick) {
      onClose();
    }
  };

  return createPortal(
    <div
      ref={rootRef}
      className={classNames(
        'bai-drawer-portal',
        !isOpen && 'bai-drawer-portal--closed',
      )}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      {...{
        [BAI_MODAL_OPEN_ATTRIBUTE]: isOpen ? '' : undefined,
        [dataAttr('theme')]: themeName ?? undefined,
      }}
    >
      <div ref={maskRef} className="bai-drawer-portal__mask" />
      <div ref={containerRef} className="bai-drawer-portal__wrap">
        <Drawer
          {...rest}
          isOpen={isOpen}
          onClose={onClose}
          hasScrim={false}
          // lab omits it without a scrim, but the portal restores modality.
          aria-modal={isOpen ? 'true' : undefined}
        >
          {children}
        </Drawer>
      </div>
    </div>,
    document.body,
  );
};

BAIDrawerPortal.displayName = 'BAIDrawerPortal';

export default BAIDrawerPortal;
