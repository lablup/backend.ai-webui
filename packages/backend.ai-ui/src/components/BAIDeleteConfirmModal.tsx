/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 `BAIDeleteConfirmModal` — adapter over ui-common `DeleteConfirmModal`
 (FR-4087). It is the irreversible tier `.claude/rules/destructive-confirmation.md`
 names; ui-common owns the typed-confirm gate, and
 `app-shim/destructiveConfirmFlow.test.tsx` guards it through this adapter.

 The props keep the frozen `BAIModal` vocabulary the ~35 call sites pass
 (some spread a `BAIModalProps` bag):

 | BAIDeleteConfirmModal                     | ui-common `DeleteConfirmModal`      |
 |-------------------------------------------|-------------------------------------|
 | `open` / `isOpen`                         | `isOpen`                            |
 | `onCancel` / `onOpenChange`               | `onOpenChange(false)`, via the guard |
 | `afterClose` / `afterOpenChange`          | `afterOpenChange`                   |
 | `onOk`, `okText`, `cancelText`            | `onAction`, `actionLabel`, `cancelLabel` |
 | `confirmLoading` / `okButtonProps.loading` | `isActionLoading`                  |
 | `okButtonProps.disabled`                  | `isActionDisabled` (cannot open the gate) |
 | `maskClosable` / `mask.closable` / `keyboard` | `purpose`                       |
 | `width` (incl. responsive record, `auto`) | `width`, default 520 as `BAIModal`  |
 | `closable={false}` / `closeIcon={false}`  | `hasCloseButton={false}`            |
 | `reversible`, `requireConfirmInput`, `plainItems`, `cannotBeUndoneText` | `isReversible`, `isConfirmInputRequired`, `hasPlainItems`, `warningText` |
 | `inputProps.placeholder` / `.disabled`    | `inputPlaceholder` / `isInputDisabled` |

 Accepted and ignored: the rest of `okButtonProps`, `cancelButtonProps`,
 `okType`, `type`, `footer`, `headerContent`, `closeLabel`, `loading`,
 `bodyRef`, `bodyProps`, window actions, `styles`, `classNames` and the antd
 mechanisms `BAIModal` also ignores. None of the call sites passes them.
*/
import type {
  BAIModalActionButtonProps,
  BAIModalProps,
  BAIModalResponsiveWidth,
} from './BAIModal';
import './BAIModal.css';
import {
  DeleteConfirmModal,
  type DeleteConfirmModalItem,
} from '@lablup/ui-common/components/DeleteConfirmModal';
import { CircleAlert } from 'lucide-react';
import React from 'react';

export type BAIDeleteConfirmModalItem = DeleteConfirmModalItem;

/**
 * The slice of the old antd `InputProps` the confirmation field honours. The
 * index signature keeps the rest accepted-and-ignored.
 */
export interface BAIDeleteConfirmModalInputProps {
  placeholder?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  maxLength?: number;
  [key: string]: unknown;
}

export interface BAIDeleteConfirmModalProps extends Omit<
  BAIModalProps,
  'title' | 'children'
> {
  /** Items to be deleted. */
  items: BAIDeleteConfirmModalItem[];
  /** Custom modal title. Defaults to "Delete" / "Delete N items". */
  title?: React.ReactNode;
  /** Description shown above the item list. Defaults to a `target`-based or generic question. */
  description?: React.ReactNode;
  /** Resource type label ("Credential"), named in the default description. */
  target?: React.ReactNode;
  /**
   * The action is reversible: no typed confirmation, no "cannot be undone"
   * warning. Default: false
   */
  reversible?: boolean;
  /** Force text-input confirmation even for a single item. Default: false */
  requireConfirmInput?: boolean;
  /**
   * Text the user must type. Defaults to a single item's plain-text label,
   * else the localized "Delete". Pass it when the label is a ReactNode.
   */
  confirmText?: string;
  /** Label above the confirmation input. Default: "Type {confirmText} to confirm." */
  inputLabel?: React.ReactNode;
  /** Additional props for the confirmation input. */
  inputProps?: BAIDeleteConfirmModalInputProps;
  /** Content rendered after the input field (e.g. checkboxes). */
  extraContent?: React.ReactNode;
  /** Override for "This action cannot be undone." */
  cannotBeUndoneText?: string;
  /** Max height (px) of the scrollable item list. Default: 200. Set 0 for no limit. */
  itemListMaxHeight?: number;
  /** Render items without the boxed surface. Default: false */
  plainItems?: boolean;
}

function resolveWidth(
  width: number | string | BAIModalResponsiveWidth | undefined,
): number | string {
  if (width === undefined) return 520;
  if (typeof width === 'object') return Object.values(width).at(-1) ?? 520;
  return width === 'auto' ? 'fit-content' : width;
}

const plainLabel = (node: React.ReactNode) =>
  typeof node === 'string' ? node : undefined;

const BAIDeleteConfirmModal: React.FC<BAIDeleteConfirmModalProps> = ({
  items,
  title,
  description,
  target,
  reversible,
  requireConfirmInput,
  confirmText,
  inputLabel,
  inputProps,
  extraContent,
  cannotBeUndoneText,
  itemListMaxHeight,
  plainItems,
  open,
  isOpen,
  onCancel,
  onOpenChange,
  afterClose,
  afterOpenChange,
  onOk,
  okText,
  cancelText,
  okButtonProps,
  confirmLoading,
  maskClosable,
  keyboard,
  mask,
  width,
  closable,
  closeIcon,
  confirmBeforeClose,
  onConfirmClose,
  // Accepted and ignored; see the file header.
  cancelButtonProps: _cancelButtonProps,
  okType: _okType,
  type: _type,
  footer: _footer,
  headerContent: _headerContent,
  closeLabel: _closeLabel,
  loading: _loading,
  bodyRef: _bodyRef,
  bodyProps: _bodyProps,
  windowActions: _windowActions,
  onWindowStateChange: _onWindowStateChange,
  minimizedPlacement: _minimizedPlacement,
  styles: _styles,
  classNames: _classNames,
  centered: _centered,
  draggable: _draggable,
  stickyTitle: _stickyTitle,
  forceRender: _forceRender,
  getContainer: _getContainer,
  wrapClassName: _wrapClassName,
  rootClassName: _rootClassName,
  rootStyle: _rootStyle,
  bodyStyle: _bodyStyle,
  maskStyle: _maskStyle,
  transitionName: _transitionName,
  maskTransitionName: _maskTransitionName,
  modalRender: _modalRender,
  mousePosition: _mousePosition,
  scrollLock: _scrollLock,
  focusTriggerAfterClose: _focusTriggerAfterClose,
  prefixCls: _prefixCls,
  wrapProps: _wrapProps,
  ...modalProps
}) => {
  'use memo';

  const handleClose = async () => {
    if (confirmBeforeClose && onConfirmClose) {
      try {
        if ((await Promise.resolve(onConfirmClose())) === false) return;
      } catch {
        return;
      }
    }
    onOpenChange?.(false);
    // Escape and the backdrop have no React event; BAIModal passes none either.
    onCancel?.(
      undefined as unknown as Parameters<NonNullable<typeof onCancel>>[0],
    );
  };

  const isMaskClosable =
    (typeof mask === 'object' ? mask.closable : undefined) ??
    maskClosable ??
    true;
  const purpose = isMaskClosable
    ? 'info'
    : keyboard !== false
      ? 'form'
      : 'required';

  const actionButtonProps: BAIModalActionButtonProps = okButtonProps ?? {};

  return (
    <DeleteConfirmModal
      {...modalProps}
      isOpen={open ?? isOpen ?? false}
      onOpenChange={(next) => {
        if (!next) void handleClose();
      }}
      afterOpenChange={(next) => {
        afterOpenChange?.(next);
        if (!next) afterClose?.();
      }}
      purpose={purpose}
      width={resolveWidth(width)}
      hasCloseButton={closable !== false && closeIcon !== false}
      // BAIModal's header and footer row height (FR-4069).
      headerClassName="bai-modal__header"
      footerClassName="bai-modal__footer"
      items={items}
      title={title}
      titleIcon={<CircleAlert size="1em" />}
      description={description}
      target={target}
      isReversible={reversible}
      isConfirmInputRequired={requireConfirmInput}
      confirmText={confirmText}
      inputLabel={inputLabel}
      inputPlaceholder={inputProps?.placeholder}
      isInputDisabled={inputProps?.disabled}
      extraContent={extraContent}
      warningText={cannotBeUndoneText}
      itemListMaxHeight={itemListMaxHeight}
      hasPlainItems={plainItems}
      // Not awaited: BAIModal's OK never showed a pending state of its own.
      onAction={() => {
        onOk?.(undefined as unknown as React.MouseEvent<HTMLButtonElement>);
      }}
      actionLabel={plainLabel(okText)}
      cancelLabel={plainLabel(cancelText)}
      isActionLoading={
        confirmLoading || actionButtonProps.loading === true || undefined
      }
      isActionDisabled={actionButtonProps.disabled}
    />
  );
};

BAIDeleteConfirmModal.displayName = 'BAIDeleteConfirmModal';

export default BAIDeleteConfirmModal;
