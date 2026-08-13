/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 GAP COMPONENT 3/5 (to-astryx ticket 08) — `BAIPopconfirm`.

 MAPPING.md §2: antd `Popconfirm` (11 files / 13 sites) is verdict **NONE** —
 "`Popover` + buttons, or escalate to `AlertDialog`". This builds the first
 option, because the tier matters: `.claude/rules/destructive-confirmation.md`
 reserves the modal-with-typed-string (`BAIDeleteConfirmModalAstryx`, brought
 in with the modal family) for IRREVERSIBLE actions, and keeps the anchored
 one-click
 confirmation for the REVERSIBLE tier — deactivate a keypair, set-as-main,
 restore, reset a form, leave a shared folder. Escalating all 13 sites to
 `AlertDialog` would break that distinction and make every reversible action
 feel destructive.

 MEASURED usage (prop-profiles.json) and its destination:

   title x12        -> `title`               (ReactNode; rendered as the heading)
   onConfirm x12    -> `onConfirm`           (async-aware via Astryx `clickAction`)
   description x9   -> `description`
   okText x8        -> `okText`
   cancelText x6    -> `cancelText`
   okButtonProps x4 -> `isDanger` / `isOkDisabled`. Grepped, not guessed: every
                       Popconfirm site passes exactly `{ danger: true }`
                       (ShellScriptEditModal, InviteFolderSettingModal,
                       DeploymentRevisionHistoryTab), so the full antd
                       `ButtonProps` surface has no consumer. `loading` is not
                       needed either — `clickAction` drives the spinner itself.
   placement x3     -> `placement` + `alignment`. All three are `"left"`, which
                       is Astryx `placement="before"` (logical, RTL-aware).
   okType x1        -> `isDanger` (the one site passes `"danger"`).
   open x1          -> `isOpen` (+ `onOpenChange`); the component is controlled
                       when `isOpen` is supplied and self-managed otherwise.
   onCancel x1      -> `onCancel`
   icon x1          -> `icon`, rendered beside the title.

 DROPPED, with no consumer measured: `disabled`, `showCancel`,
 `cancelButtonProps`, `okButtonProps` beyond danger/disabled, `arrow`,
 `trigger`, `getPopupContainer`, `overlayClassName`, `onPopupClick`.

 A11y / focus (P8): Astryx `Popover` traps focus and auto-focuses the first
 focusable node. Cancel is rendered BEFORE confirm in the DOM, so the safe
 action takes focus — and we assert it explicitly rather than relying on that
 ordering. Focus is restored to the trigger on close, which `Popover` does not
 do for the controlled case. Escape closes via `hasEscapeDismiss` (default on,
 and with light dismiss also on the browser's own dismiss handles it too).

 Props extend Astryx `PopoverProps` (`children` is the trigger, `placement`,
 `alignment`, `width`, `isModal`, `hasLightDismiss`, … all pass through).
 `content` is Omitted because this component OWNS the content.
*/
import { Button } from '@astryxdesign/core/Button';
import { Popover } from '@astryxdesign/core/Popover';
import type { PopoverProps } from '@astryxdesign/core/Popover';
import { HStack, VStack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface BAIPopconfirmAstryxProps extends Omit<
  PopoverProps,
  'content' | 'label'
> {
  /** The question. antd `title`. */
  title: React.ReactNode;
  /** Supporting line under the title. antd `description`. */
  description?: React.ReactNode;
  /** Confirm button label. Defaults to the shared `button.Confirm` string. */
  okText?: string;
  /** Cancel button label. Defaults to the shared `button.Cancel` string. */
  cancelText?: string;
  /**
   * Confirm styled as destructive — antd's `okType="danger"` and
   * `okButtonProps={{ danger: true }}` collapse into this one flag.
   */
  isDanger?: boolean;
  /** antd `okButtonProps={{ disabled }}`. */
  isOkDisabled?: boolean;
  /**
   * Confirm handler. May return a promise — it is handed to Astryx's
   * `clickAction`, which renders the button's own pending state and blocks
   * re-entry until it settles. The popover closes when it resolves, and stays
   * open when it rejects so the user can see the error and retry.
   */
  onConfirm?: (e: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;
  /** Cancel handler. The popover closes regardless. */
  onCancel?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  /** Leading icon beside the title (antd `icon`). */
  icon?: React.ReactNode;
  /** Accessible name for the popover dialog; defaults to a string `title`. */
  label?: string;
}

const BAIPopconfirmAstryx: React.FC<BAIPopconfirmAstryxProps> = ({
  title,
  description,
  okText,
  cancelText,
  isDanger = false,
  isOkDisabled = false,
  onConfirm,
  onCancel,
  icon,
  label,
  isOpen: controlledIsOpen,
  onOpenChange,
  children,
  width = 260,
  ...popoverProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const [uncontrolledIsOpen, setUncontrolledIsOpen] = useState(false);
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : uncontrolledIsOpen;

  const cancelRef = useRef<HTMLButtonElement>(null);
  // The element that had focus when the popover opened. Astryx's Popover traps
  // focus but does not hand it back, so keyboard users would otherwise land at
  // the top of the document after confirming.
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  const setIsOpen = (next: boolean) => {
    if (!isControlled) setUncontrolledIsOpen(next);
    onOpenChange?.(next);
  };

  useEffect(() => {
    if (isOpen) {
      restoreFocusRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      // Focus the SAFE action, not the destructive one: an accidental Enter
      // right after opening must cancel, never confirm.
      cancelRef.current?.focus();
      return;
    }
    const toRestore = restoreFocusRef.current;
    restoreFocusRef.current = null;
    // Only reclaim focus if it fell back to the body when the popover
    // unmounted — never steal it from wherever the user moved on to.
    if (toRestore && document.activeElement === document.body) {
      toRestore.focus();
    }
  }, [isOpen]);

  const accessibleLabel =
    label ?? (typeof title === 'string' ? title : t('button.Confirm'));

  return (
    <Popover
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      label={accessibleLabel}
      width={width}
      content={
        <VStack gap={3} align="stretch">
          <HStack gap={2} align="start">
            {icon}
            <VStack gap={1} align="stretch">
              {typeof title === 'string' ? (
                <Text weight="semibold">{title}</Text>
              ) : (
                title
              )}
              {description ? (
                typeof description === 'string' ? (
                  <Text type="supporting" color="secondary">
                    {description}
                  </Text>
                ) : (
                  description
                )
              ) : null}
            </VStack>
          </HStack>
          <HStack gap={2} justify="end">
            {/* Cancel first in DOM order: it takes the popover's auto-focus. */}
            <Button
              ref={cancelRef}
              size="sm"
              variant="secondary"
              label={cancelText ?? t('button.Cancel')}
              onClick={(e) => {
                onCancel?.(e);
                setIsOpen(false);
              }}
            />
            <Button
              size="sm"
              variant={isDanger ? 'destructive' : 'primary'}
              isDisabled={isOkDisabled}
              label={okText ?? t('button.Confirm')}
              // `clickAction` IS antd-BAIButton's hand-rolled `action` prop,
              // native: pending state, re-entry guard, and error propagation.
              clickAction={async (e) => {
                await onConfirm?.(e);
                setIsOpen(false);
              }}
            />
          </HStack>
        </VStack>
      }
      {...popoverProps}
    >
      {children}
    </Popover>
  );
};

export default BAIPopconfirmAstryx;
