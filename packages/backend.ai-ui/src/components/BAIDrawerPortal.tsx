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
import { BAI_MODAL_OPEN_ATTRIBUTE, useDialogLevel } from './dialogLevelStack';
import { useFocusTrap, useScrollLock } from '@astryxdesign/core/hooks';
import { dataAttr } from '@astryxdesign/core/naming';
import { useThemeName } from '@astryxdesign/core/theme';
import { mergeRefs } from '@astryxdesign/core/utils';
import { Drawer, type DrawerProps } from '@astryxdesign/lab';
import classNames from 'classnames';
import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

/** Hides the root once the slide-out is over. Driven from the DOM, not React,
    so a closing drawer does not re-render its whole subtree a frame later. */
const HIDDEN_ATTRIBUTE = 'data-bai-drawer-hidden';

/** Everything lab `Drawer` takes; the portal owns the scrim, so not `hasScrim`
    — nor the collapse-to-rail pair its `hasScrim={false}` silently unlocks. */
export type BAIDrawerPortalProps = Omit<
  DrawerProps,
  'hasScrim' | 'isCollapsed' | 'onCollapsedChange'
>;

const BAIDrawerPortal: React.FC<BAIDrawerPortalProps> = ({
  isOpen,
  onClose,
  children,
  ...rest
}) => {
  'use memo';

  // Theme CSS is `@scope`d to `[data-astryx-theme]`, and the portal escapes DOM
  // ancestry — re-emit the nearest theme's NAME as `BAIDialog` does.
  const themeName = useThemeName();

  // Modality restored by hand: `show()` traps nothing. Escape stays lab's — its
  // dialog `keydown` already closes the top drawer, and a second handler here
  // would call `onClose` twice.
  const rootRef = useRef<HTMLDivElement>(null);
  const isTopmost = useDialogLevel(rootRef, isOpen);

  const { containerRef, focusFirst } = useFocusTrap<HTMLDivElement>({
    isActive: isOpen && isTopmost,
  });

  // lab runs `useScrollLock(isOpen && hasScrim)`, and its scrim is off now.
  useScrollLock(isOpen);

  // lab delays its own `dialog.close()` to let the panel slide out, so the
  // portal root outlives `isOpen` until that close lands — no copied duration.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }
    if (isOpen) {
      root.removeAttribute(HIDDEN_ATTRIBUTE);
      return;
    }
    const hide = () => root.setAttribute(HIDDEN_ATTRIBUTE, '');
    const dialog = root.querySelector('dialog');
    if (!dialog?.open) {
      hide();
      return;
    }
    dialog.addEventListener('close', hide, { once: true });
    return () => dialog.removeEventListener('close', hide);
  }, [isOpen]);

  // `show()` moves focus nowhere, unlike `showModal()`. lab may already have
  // focused `[data-autofocus]`; otherwise land on its `tabindex="-1"` panel
  // body, where the dialog focusing steps used to put us.
  useEffect(() => {
    const node = containerRef.current;
    if (!isOpen || !node || node.contains(document.activeElement)) {
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
      ref={mergeRefs<HTMLDivElement>(rootRef, containerRef)}
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
    </div>,
    document.body,
  );
};

BAIDrawerPortal.displayName = 'BAIDrawerPortal';

export default BAIDrawerPortal;
