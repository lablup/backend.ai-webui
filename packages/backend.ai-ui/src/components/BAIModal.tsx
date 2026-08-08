/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 to-astryx PHASE 3 / ticket B — `BAIModal` rebuilt on Astryx `Dialog`.

 This is an **in-place frontier rewrite**: the rendering stack underneath is
 entirely Astryx (`Dialog` + `Layout` + `DialogHeader` + `Button`), while the
 prop surface stays antd-`Modal`-shaped so the ~124 call sites that render
 `<BAIModal>` (and the `BAIModalProps`-extending prop interfaces they declare)
 need no edit at all.

 ## What antd supplied that is now re-implemented here

 antd's `Modal` is a *controller*: it owns the header, the OK/Cancel footer,
 `okText`/`okButtonProps`/`confirmLoading`, the mask, the scroll lock and the
 `afterClose` lifecycle. Astryx's `Dialog` is a *surface*: `isOpen`,
 `onOpenChange`, `width`, `purpose`, children. Everything between those two is
 this file.

 | antd `Modal`                       | Astryx                                              |
 |------------------------------------|-----------------------------------------------------|
 | `open`                             | `Dialog.isOpen`                                     |
 | `onCancel` (X / mask / Esc)        | `Dialog.onOpenChange(false)` + `DialogHeader` close |
 | `title` (ReactNode)                | `DialogHeader.title` (see "ReactNode title" below)  |
 | `okText`/`okType`/`okButtonProps`  | `Button variant primary|destructive`                |
 | `confirmLoading`                   | `Button.isLoading`                                  |
 | `cancelText`/`cancelButtonProps`   | `Button variant="secondary"`                        |
 | `footer` node / `null` / render fn | `LayoutFooter` (or nothing)                         |
 | `loading`                          | `Skeleton` in place of the body                     |
 | `maskClosable` / `keyboard`        | `Dialog.purpose` (`info` / `form` / `required`)     |
 | `styles.{header,body,footer,…}`    | inline styles on the matching Astryx slot           |
 | `.ant-modal-*` CSS (BAIModal.css)  | deleted — the slots are Astryx's own                |

 ## PILOT-DECISIONs (recorded in .scratch/astryx-migration/issues/p3-b-modal-family.md)

 1. **`draggable` is dropped.** Astryx `Dialog` is a native `<dialog>` in the
    CSS top layer; `react-draggable` moved antd's positioned wrapper, which no
    longer exists. Repo-wide usage before this change: **zero** outside
    `BAIModal.stories.tsx`. The prop is still accepted (contract) and ignored.
 2. **`centered` is accepted and ignored** — Astryx dialogs are centred unless
    `position` is set (same call as ticket 04 / the app-shim).
 3. **`destroyOnHidden` / `destroyOnClose` are always on.** This component
    renders no children while closed, which is stricter than antd's default.
 4. **A minimized modal stays modal.** antd dropped the mask so the page behind
    stayed interactive; a native `<dialog>` opened with `showModal()` always
    has a backdrop. Minimize therefore collapses the dialog to a title bar
    parked at `minimizedPlacement` but does not release the page.
 5. **`mask={false}`, `zIndex`, `getContainer`, `forceRender`, `wrapClassName`,
    `rootClassName`, `modalRender`, `transitionName`, `mousePosition`,
    `scrollLock`, `focusTriggerAfterClose`, `stickyTitle`** are accepted and
    ignored: each names a mechanism antd owned (a portal target, a stacking
    number, a rendered-but-hidden tree, a CSS-transition name) that the
    platform now owns. `stickyTitle` in particular is unconditionally true —
    Astryx `Layout` keeps the header slot outside the scrolling content.
 6. **`afterClose` fires from an effect on the `open` transition**, not from a
    transition-end event, so it lands a frame earlier than antd's. This is what
    `BAIUnmountAfterClose` subscribes to and it keeps working unchanged.

 ## ReactNode title

 `DialogHeader.title` is typed `string` but renders through `Heading`, whose
 children are `ReactNode`. 146 call sites pass JSX titles (icon + text rows),
 which antd rendered inside `.ant-modal-title`. Passing the node through with a
 documented cast keeps the whole a11y wiring `DialogHeader` owns — the
 `titleId` the parent `Dialog` points `aria-labelledby` at, the open-focus
 target, the close button and the divider — instead of hand-rolling a header
 that reproduces none of it.
*/
import { useBAIi18n } from '../hooks/useBAIi18n';
import { Button } from '@astryxdesign/core/Button';
import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog';
import { IconButton } from '@astryxdesign/core/IconButton';
import {
  Layout,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
} from '@astryxdesign/core/Layout';
import { Skeleton } from '@astryxdesign/core/Skeleton';
import { HStack } from '@astryxdesign/core/Stack';
import {
  SquareStack,
  Square,
  X,
  Minimize,
  Maximize,
  Minus,
} from 'lucide-react';
import React, { isValidElement, useEffect, useRef, useState } from 'react';

/**
 * Kept for API compatibility. Native `<dialog>` renders in the CSS top layer,
 * where stacking is decided by the platform, so no z-index is applied.
 */
export const DEFAULT_BAI_MODAL_Z_INDEX = 1001;

export type WindowState = 'default' | 'minimized' | 'maximized' | 'fullscreen';
export type WindowAction = 'minimize' | 'maximize' | 'fullscreen';
export type MinimizedPlacement =
  'bottomRight' | 'bottomLeft' | 'topRight' | 'topLeft';

/** antd's `onCancel` signature, preserved verbatim for the 110 call sites. */
export type BAIModalCancelEvent =
  React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLElement>;

/**
 * Footer render-function form, re-typed from antd's `ModalProps['footer']`.
 * antd's footer union does not let TypeScript contextually type the render
 * function's parameters (they fall back to implicit `any`), so callers are
 * forced to annotate `(originNode, { OkBtn, CancelBtn }) => ...`. This clean
 * named signature restores parameter inference.
 */
export type BAIModalFooterRender = (
  originNode: React.ReactNode,
  extra: { OkBtn: React.FC; CancelBtn: React.FC },
) => React.ReactNode;

/**
 * The slice of antd `ButtonProps` the Astryx footer can honour. Every key is
 * optional and NO index signature is declared on purpose — that is what lets a
 * value still typed as antd `ButtonProps` (11 call sites spread a
 * `ModalProps`-extending prop bag straight into `<BAIModal>`) stay assignable:
 * extra source keys are allowed, an index signature on the target would not be
 * satisfied by an interface. Keys not listed here are accepted and ignored.
 */
export interface BAIModalActionButtonProps {
  danger?: boolean;
  disabled?: boolean;
  loading?: boolean | { delay?: number };
  icon?: React.ReactNode;
  autoFocus?: boolean;
  /** antd `ButtonType`. Mapped onto the Astryx `Button` variant scale. */
  type?: 'primary' | 'default' | 'dashed' | 'link' | 'text' | 'ghost';
  htmlType?: 'button' | 'submit' | 'reset';
  form?: string;
  style?: React.CSSProperties;
  className?: string;
  id?: string;
  title?: string;
  tabIndex?: number;
  onClick?: React.MouseEventHandler<HTMLElement>;
}

/** antd `ButtonType` → Astryx `ButtonVariant`. */
function toButtonVariant(
  type: BAIModalActionButtonProps['type'],
  fallback: 'primary' | 'secondary',
): 'primary' | 'secondary' | 'ghost' | 'destructive' {
  switch (type) {
    case 'primary':
      return 'primary';
    case 'default':
    case 'dashed':
      return 'secondary';
    case 'text':
    case 'link':
    case 'ghost':
      return 'ghost';
    default:
      return fallback;
  }
}

/** Per-slot inline styles, mirroring antd's `ModalProps['styles']` keys. */
export interface BAIModalSemanticStyles {
  root?: React.CSSProperties;
  wrapper?: React.CSSProperties;
  mask?: React.CSSProperties;
  header?: React.CSSProperties;
  title?: React.CSSProperties;
  body?: React.CSSProperties;
  footer?: React.CSSProperties;
  container?: React.CSSProperties;
  content?: React.CSSProperties;
  close?: React.CSSProperties;
}

/** Per-slot class names, mirroring antd's `ModalProps['classNames']` keys. */
export type BAIModalSemanticClassNames = Partial<
  Record<keyof BAIModalSemanticStyles, string>
>;

/**
 * antd v6 accepted both an object and a `(info) => object` form for `styles` /
 * `classNames`. The function form was already ignored by the antd-era
 * `BAIModal` (it guarded every read with `_.isFunction(...)`), so it is kept in
 * the type purely so a spread `ModalProps` bag still assigns, and ignored.
 */

type SemanticOrFn<T> = T | ((...args: any[]) => any);

/** antd's responsive width form: `{ xs: 320, md: 520 }`. */
export type BAIModalResponsiveWidth = Partial<
  Record<'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl', string | number>
>;

export interface BAIModalProps {
  /* ------------------------------------------------------------ visibility */
  /** Whether the modal is visible. */
  open?: boolean;
  /** Astryx-style alias for `open`, so a call site can use either name. */
  isOpen?: boolean;
  /**
   * Fired when the user dismisses the modal: cancel button, header X, Escape,
   * or a backdrop click. Escape/backdrop have no React event to forward, so
   * the argument is `undefined` there — antd synthesised one, Astryx does not.
   */
  onCancel?: (e: BAIModalCancelEvent) => void;
  /** Astryx-style alias for `onCancel`; called with `false`. */
  onOpenChange?: (isOpen: boolean) => void;
  /** Called after the modal has closed. Drives `BAIUnmountAfterClose`. */
  afterClose?: () => void;
  /** Called with the new visibility right after it changes. */
  afterOpenChange?: (open: boolean) => void;

  /* ---------------------------------------------------------------- header */
  title?: React.ReactNode;
  /** Secondary line under the title. */
  subtitle?: string;
  /**
   * Replaces the whole header row (ticket 16, FolderExplorer). A close button
   * is appended so dismissal stays reachable.
   */
  headerContent?: React.ReactNode;
  /** Accessible name for the close button rendered next to `headerContent`. */
  closeLabel?: string;
  /** `false` removes the header close button. */
  closable?: boolean | { closeIcon?: React.ReactNode };
  /** `false` removes the header close button (antd alias for `closable`). */
  closeIcon?: React.ReactNode | false;
  /** Visual variant that changes the header title colour. */
  type?: 'normal' | 'warning' | 'error';

  /* ------------------------------------------------------------------ body */
  children?: React.ReactNode;
  /** Ref to the body wrapper — used as a file drag-and-drop container. */
  bodyRef?: React.Ref<HTMLDivElement>;
  /** Extra props spread onto the body wrapper element. */
  bodyProps?: React.HTMLAttributes<HTMLDivElement> & {
    ref?: React.Ref<HTMLDivElement>;
  };
  /** Renders a `Skeleton` in place of the body. */
  loading?: boolean;

  /* ---------------------------------------------------------------- footer */
  /**
   * Modal footer. `null` removes it; a render function receives the generated
   * footer plus the `OkBtn` / `CancelBtn` components.
   */
  footer?: React.ReactNode | BAIModalFooterRender;
  onOk?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  okText?: React.ReactNode;
  cancelText?: React.ReactNode;
  okType?:
    'primary' | 'danger' | 'default' | 'dashed' | 'link' | 'text' | 'ghost';
  okButtonProps?: BAIModalActionButtonProps;
  cancelButtonProps?: BAIModalActionButtonProps;
  /** Puts the OK button into its loading state. */
  confirmLoading?: boolean;

  /* ------------------------------------------------------------- dismissal */
  /** Whether a backdrop click closes the modal. Default `true` (antd's). */
  maskClosable?: boolean;
  /** Whether Escape closes the modal. Default `true` (antd's). */
  keyboard?: boolean;
  /**
   * antd's mask config. Only `closable` is honoured (as `maskClosable`); the
   * backdrop itself is owned by the native `<dialog>` and is never removable.
   */
  mask?: boolean | { closable?: boolean; blur?: boolean };

  /* ------------------------------------------------------------ dimensions */
  width?: number | string | BAIModalResponsiveWidth;
  maxHeight?: number | string;

  /* -------------------------------------------------------- window actions */
  /** When non-empty, window controls are rendered in the header. */
  windowActions?: Array<WindowAction>;
  onWindowStateChange?: (state: WindowState) => void;
  /** Placement of the minimized modal bar. Defaults to `bottomRight`. */
  minimizedPlacement?: MinimizedPlacement;

  /* --------------------------------------------------------- close guarding */
  /**
   * When true, calls `onConfirmClose` before closing the modal. If it returns
   * false or rejects, the close is prevented.
   */
  confirmBeforeClose?: boolean;
  onConfirmClose?: () => void | boolean | Promise<boolean>;

  /* ------------------------------------------------------------- passthrough */
  className?: string;
  style?: React.CSSProperties;
  styles?: SemanticOrFn<BAIModalSemanticStyles>;
  classNames?: SemanticOrFn<BAIModalSemanticClassNames>;
  'aria-label'?: string;
  'data-testid'?: string;

  /* ------------------------------------- accepted and ignored (see header) */
  centered?: boolean;
  destroyOnClose?: boolean;
  destroyOnHidden?: boolean;
  draggable?: boolean;
  stickyTitle?: boolean;
  forceRender?: boolean;
  getContainer?: unknown;
  zIndex?: number;
  wrapClassName?: string;
  rootClassName?: string;
  rootStyle?: React.CSSProperties;
  bodyStyle?: React.CSSProperties;
  maskStyle?: React.CSSProperties;
  transitionName?: string;
  maskTransitionName?: string;
  modalRender?: (node: React.ReactNode) => React.ReactNode;
  mousePosition?: unknown;
  scrollLock?: boolean;
  focusTriggerAfterClose?: boolean;
  prefixCls?: string;
  wrapProps?: unknown;
}

/**
 * Best-effort text extraction for the string-typed Astryx slots
 * (`Button.label`). antd accepted a ReactNode everywhere; the visible node is
 * still rendered as the button's children, this only feeds the a11y name.
 */
function toText(node: React.ReactNode): string {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(toText).join('');
  if (isValidElement(node)) {
    return toText((node.props as { children?: React.ReactNode }).children);
  }
  return '';
}

const TYPE_COLOR: Record<'warning' | 'error', string> = {
  warning: 'var(--color-warning)',
  error: 'var(--color-error)',
};

/** Viewport inset (px) kept around a maximized dialog — antd used `marginLG`. */
const MAXIMIZED_INSET = 24;
/** Width (px) of the minimized title bar. */
const MINIMIZED_WIDTH = 320;

const BAIModal: React.FC<BAIModalProps> = ({
  open,
  isOpen,
  onCancel,
  onOpenChange,
  afterClose,
  afterOpenChange,
  title,
  subtitle,
  headerContent,
  closeLabel,
  closable,
  closeIcon,
  type = 'normal',
  children,
  bodyRef,
  bodyProps,
  loading,
  footer,
  onOk,
  okText,
  cancelText,
  okType,
  okButtonProps,
  cancelButtonProps,
  confirmLoading,
  maskClosable,
  keyboard,
  mask,
  width = 520,
  maxHeight,
  windowActions,
  onWindowStateChange,
  minimizedPlacement = 'bottomRight',
  confirmBeforeClose,
  onConfirmClose,
  className,
  style,
  styles: stylesProp,
  classNames: classNamesProp,
  ...rest
}) => {
  'use memo';
  const { t } = useBAIi18n();
  const [windowState, setWindowState] = useState<WindowState>('default');

  const isVisible = open ?? isOpen ?? false;

  // The `(info) => ...` form of `styles` / `classNames` was already inert in
  // the antd-era component; keep it inert rather than half-supported.
  const styles =
    typeof stylesProp === 'function' ? undefined : (stylesProp ?? undefined);
  const classNames =
    typeof classNamesProp === 'function'
      ? undefined
      : (classNamesProp ?? undefined);

  // antd fired `afterClose` when the exit transition ended. Astryx has no exit
  // transition, so the close edge itself is the signal. `BAIUnmountAfterClose`
  // listens to exactly this to drop the subtree.
  const wasVisibleRef = useRef(isVisible);
  useEffect(() => {
    if (wasVisibleRef.current !== isVisible) {
      wasVisibleRef.current = isVisible;
      afterOpenChange?.(isVisible);
      if (!isVisible) afterClose?.();
    }
    // `afterClose` / `afterOpenChange` are stable callbacks at every call site.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]);

  // Reset the window state when the modal is closed programmatically.
  useEffect(() => {
    if (!isVisible && windowState !== 'default') {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- a prop-driven close has no event handler to run in
      setWindowState('default');
      onWindowStateChange?.('default');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]);

  const hasWindowControls = !!windowActions && windowActions.length > 0;
  const activeActions: Array<WindowAction> = windowActions ?? [];
  const effectiveWindowState: WindowState = hasWindowControls
    ? windowState
    : 'default';

  const handleWindowStateChange = (action: WindowAction) => {
    const targetState: WindowState =
      action === 'minimize'
        ? 'minimized'
        : action === 'maximize'
          ? 'maximized'
          : 'fullscreen';
    const newState = windowState === targetState ? 'default' : targetState;
    setWindowState(newState);
    onWindowStateChange?.(newState);
  };

  const handleCancel = async (e?: BAIModalCancelEvent) => {
    if (confirmBeforeClose && onConfirmClose) {
      try {
        const result = await Promise.resolve(onConfirmClose());
        if (result === false) return;
      } catch {
        return;
      }
    }
    if (windowState !== 'default') {
      setWindowState('default');
      onWindowStateChange?.('default');
    }
    onOpenChange?.(false);
    // Escape / backdrop produce no React event; antd synthesised one, we pass
    // `undefined` through the historical (non-optional) signature.
    onCancel?.(e as BAIModalCancelEvent);
  };

  // -------------------------------------------------------------- dismissal
  const resolvedMaskClosable =
    (typeof mask === 'object' ? mask.closable : undefined) ??
    maskClosable ??
    true;
  const allowEscape = keyboard !== false;
  // Astryx cannot express "backdrop closes but Escape does not"; whenever the
  // backdrop is live we use `info`, which enables both.
  const purpose = resolvedMaskClosable
    ? 'info'
    : allowEscape
      ? 'form'
      : 'required';

  const showClose = closable !== false && closeIcon !== false;

  // ----------------------------------------------------------- window sizing
  const isFullscreen = effectiveWindowState === 'fullscreen';
  const isMaximized = effectiveWindowState === 'maximized';
  const isMinimized = effectiveWindowState === 'minimized';

  // antd allowed a per-breakpoint width record. Astryx `Dialog.width` is a
  // single value that already caps at `90vw`, so the record collapses to its
  // largest declared entry (the desktop budget) — see RESPONSIVE-POLICY.
  const resolvedWidth =
    typeof width === 'object' ? (Object.values(width).at(-1) ?? 520) : width;

  const dialogWidth = isMinimized
    ? MINIMIZED_WIDTH
    : isMaximized
      ? `calc(100vw - ${MAXIMIZED_INSET * 2}px)`
      : resolvedWidth;
  const dialogMaxHeight = isMinimized
    ? 'auto'
    : isMaximized
      ? `calc(100vh - ${MAXIMIZED_INSET * 2}px)`
      : maxHeight;

  const minimizedPosition = isMinimized
    ? {
        ...(minimizedPlacement.includes('bottom') ? { bottom: 0 } : { top: 0 }),
        ...(minimizedPlacement.includes('Right')
          ? { end: MAXIMIZED_INSET }
          : { start: MAXIMIZED_INSET }),
      }
    : undefined;

  // ------------------------------------------------------------------ footer
  const isDanger = okType === 'danger' || okButtonProps?.danger === true;
  const okLabel = toText(okText) || 'OK';
  const cancelLabel = toText(cancelText) || t('general.button.Cancel');

  // NOTE: these are *elements*, not components. Rendering the generated footer
  // through inline `React.FC`s gives every render a fresh component identity,
  // which makes React unmount and re-create the buttons on each keystroke — a
  // detached node then keeps the stale `disabled` attribute, exactly the
  // failure `destructiveConfirmFlow.test.tsx` catches. The `OkBtn`/`CancelBtn`
  // component pair below exists only to satisfy antd's `footer` render-function
  // signature (zero call sites use it today).
  const okButtonNode = (
    <Button
      label={okLabel}
      variant={
        isDanger
          ? 'destructive'
          : toButtonVariant(okButtonProps?.type, 'primary')
      }
      isLoading={confirmLoading || okButtonProps?.loading === true}
      isDisabled={okButtonProps?.disabled}
      icon={okButtonProps?.icon}
      type={okButtonProps?.htmlType}
      form={okButtonProps?.form}
      style={okButtonProps?.style}
      className={okButtonProps?.className}
      onClick={(e) => onOk?.(e as React.MouseEvent<HTMLButtonElement>)}
    >
      {typeof okText === 'string' || okText == null ? undefined : okText}
    </Button>
  );

  const cancelButtonNode = (
    <Button
      label={cancelLabel}
      variant={
        cancelButtonProps?.danger
          ? 'destructive'
          : toButtonVariant(cancelButtonProps?.type, 'secondary')
      }
      isDisabled={cancelButtonProps?.disabled}
      isLoading={cancelButtonProps?.loading === true}
      icon={cancelButtonProps?.icon}
      style={cancelButtonProps?.style}
      className={cancelButtonProps?.className}
      onClick={(e) => handleCancel(e as React.MouseEvent<HTMLButtonElement>)}
    >
      {typeof cancelText === 'string' || cancelText == null
        ? undefined
        : cancelText}
    </Button>
  );

  const generatedFooter = (
    <HStack justify="end" gap={2} align="center">
      {cancelButtonNode}
      {okButtonNode}
    </HStack>
  );

  const resolvedFooter =
    footer === undefined
      ? generatedFooter
      : typeof footer === 'function'
        ? (footer as BAIModalFooterRender)(generatedFooter, {
            OkBtn: () => okButtonNode,
            CancelBtn: () => cancelButtonNode,
          })
        : footer;

  // ------------------------------------------------------------------ header
  const windowControls = hasWindowControls ? (
    <>
      {activeActions.includes('minimize') && !isMinimized && (
        <IconButton
          label={t('comp:BAIModal.Minimize')}
          tooltip={t('comp:BAIModal.Minimize')}
          icon={<Minus size="1em" />}
          variant="ghost"
          size="sm"
          onClick={() => handleWindowStateChange('minimize')}
        />
      )}
      {activeActions.includes('maximize') && !isMinimized && (
        <IconButton
          label={
            isMaximized
              ? t('comp:BAIModal.Restore')
              : t('comp:BAIModal.Maximize')
          }
          tooltip={
            isMaximized
              ? t('comp:BAIModal.Restore')
              : t('comp:BAIModal.Maximize')
          }
          icon={
            isMaximized ? <SquareStack size="1em" /> : <Square size="1em" />
          }
          variant="ghost"
          size="sm"
          onClick={() => handleWindowStateChange('maximize')}
        />
      )}
      {activeActions.includes('fullscreen') && !isMinimized && (
        <IconButton
          label={
            isFullscreen
              ? t('comp:BAIModal.ExitFullscreen')
              : t('comp:BAIModal.Fullscreen')
          }
          tooltip={
            isFullscreen
              ? t('comp:BAIModal.ExitFullscreen')
              : t('comp:BAIModal.Fullscreen')
          }
          icon={
            isFullscreen ? <Minimize size="1em" /> : <Maximize size="1em" />
          }
          variant="ghost"
          size="sm"
          onClick={() => handleWindowStateChange('fullscreen')}
        />
      )}
      {isMinimized && (
        <IconButton
          label={t('comp:BAIModal.Restore')}
          tooltip={t('comp:BAIModal.Restore')}
          icon={<SquareStack size="1em" />}
          variant="ghost"
          size="sm"
          onClick={() => handleWindowStateChange('minimize')}
        />
      )}
    </>
  ) : null;

  const decoratedTitle =
    type === 'warning' || type === 'error' ? (
      <span style={{ color: TYPE_COLOR[type], ...styles?.title }}>{title}</span>
    ) : styles?.title ? (
      <span style={styles.title}>{title}</span>
    ) : (
      title
    );

  const headerNode = headerContent ? (
    <LayoutHeader
      hasDivider
      style={styles?.header}
      className={classNames?.header}
    >
      <HStack justify="between" align="center" gap={2} width="100%">
        {headerContent}
        {showClose && (
          <IconButton
            label={closeLabel ?? t('general.button.Close')}
            icon={<X size="1em" />}
            variant="ghost"
            size="sm"
            onClick={(e) =>
              handleCancel(e as unknown as React.MouseEvent<HTMLButtonElement>)
            }
          />
        )}
      </HStack>
    </LayoutHeader>
  ) : (
    <DialogHeader
      hasDivider
      // See the "ReactNode title" note in the file header: `title` is typed
      // `string` but renders through `Heading`, whose children are ReactNode.
      title={(decoratedTitle ?? '') as unknown as string}
      subtitle={subtitle}
      endContent={windowControls}
      onOpenChange={
        showClose
          ? (next) => {
              if (!next) void handleCancel();
            }
          : undefined
      }
      style={styles?.header}
      className={classNames?.header}
    />
  );

  // Nothing is rendered while closed — see PILOT-DECISION 3. Hooks above have
  // already run, so this early return is safe.
  if (!isVisible) return null;

  return (
    <Dialog
      isOpen
      onOpenChange={(next) => {
        if (!next) void handleCancel();
      }}
      width={dialogWidth}
      {...(dialogMaxHeight !== undefined
        ? { maxHeight: dialogMaxHeight }
        : undefined)}
      {...(minimizedPosition ? { position: minimizedPosition } : undefined)}
      variant={isFullscreen ? 'fullscreen' : 'standard'}
      purpose={purpose}
      className={className}
      style={style}
      aria-label={rest['aria-label']}
      data-testid={rest['data-testid']}
    >
      <Layout
        style={styles?.container ?? styles?.content}
        header={headerNode}
        content={
          isMinimized ? undefined : (
            <LayoutContent>
              <div
                {...bodyProps}
                ref={bodyRef ?? bodyProps?.ref}
                className={classNames?.body ?? bodyProps?.className}
                style={{ ...styles?.body, ...bodyProps?.style }}
              >
                {loading ? <Skeleton height={120} /> : children}
              </div>
            </LayoutContent>
          )
        }
        footer={
          isMinimized || !resolvedFooter ? undefined : (
            <LayoutFooter
              hasDivider
              style={styles?.footer}
              className={classNames?.footer}
            >
              {resolvedFooter}
            </LayoutFooter>
          )
        }
      />
    </Dialog>
  );
};

BAIModal.displayName = 'BAIModal';

export default BAIModal;
