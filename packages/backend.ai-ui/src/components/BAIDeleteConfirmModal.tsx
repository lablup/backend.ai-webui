/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 to-astryx PHASE 3 / ticket B — `BAIDeleteConfirmModal` rebuilt on Astryx.

 This is the component `.claude/rules/destructive-confirmation.md` names: an
 irreversible delete must be gated behind a modal in which the user TYPES the
 resource name before the danger button enables. **That contract, and the
 antd-shaped prop surface the ~30 call sites pass, are reproduced exactly** —
 only the primitives change. `packages/backend.ai-ui/src/app-shim/
 destructiveConfirmFlow.test.tsx` guards the gate.

 | before (antd)                          | after (Astryx)                       |
 |----------------------------------------|--------------------------------------|
 | `BAIModal` (antd `Modal`)              | `BAIModal` (Astryx `Dialog`)         |
 | `Form` + `Form.Item` + `Form.useWatch` | one `useState` + `TextInput`         |
 | antd `Input autoFocus allowClear`      | `TextInput hasAutoFocus hasClear`    |
 | `Typography.Text`                      | Astryx `Text`                        |
 | `Typography.Text type="danger"`        | `Banner status="error"`              |
 | `BAIText code` inside `<BAITrans>`     | Astryx `Text type="code"`            |

 PILOT-DECISIONs (see .specs/FR-3482-astryx-migration/issues/p3-b-modal-family.md):

 1. **The typed-confirm gate does not need a form engine.** The antd version
    reached for `Form` + `Form.useWatch` purely to observe one input, which is
    also why this file was pulling in the PARKED form-engine. Astryx
    `TextInput` is `value` / `onChange(value)`, so a `useState` is the whole
    mechanism — and the form-engine import disappears with it. The locked
    "Form stays" decision is about form STATE ENGINES; a single gate input is
    not one.
 2. **"This action cannot be undone." becomes a `Banner status="error"`.**
    Astryx `Text` has no danger colour (its `color` set is
    primary/secondary/disabled/placeholder/accent/inherit), and the banner
    restores both the colour and an icon.

 3. **`inputLabel` stays `ReactNode`.** `TextInput.label` is a plain `string`
    that doubles as the accessible name, so a rich label is rendered above the
    field and the field carries the flattened text with `isLabelHidden`.
 4. **The item list keeps a hand-rolled surface.** Astryx has no "boxed,
    scrollable list of arbitrary nodes" primitive; a plain `div` styled from
    theme CSS variables follows the brand/admin themes and both colour schemes.
*/
import { useBAIi18n } from '../hooks/useBAIi18n';
import BAIModal, { type BAIModalProps } from './BAIModal';
import { BAITrans } from './BAITrans';
import { Banner } from '@astryxdesign/core/Banner';
import { VStack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
import { TextInput } from '@astryxdesign/core/TextInput';
import { CircleAlert } from 'lucide-react';
import React, { isValidElement, useState } from 'react';

export interface BAIDeleteConfirmModalItem {
  /** Unique key for React list rendering */
  key: string;
  /** Display label — accepts ReactNode for custom rendering (icons, tags, etc.) */
  label: React.ReactNode;
}

/**
 * The slice of the old antd `InputProps` the confirmation field honours. Every
 * call site in the repo passes `placeholder` only; the index signature keeps
 * the rest accepted-and-ignored so no call site needs an edit.
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
  /** Description shown above the item list. If omitted, falls back to a `target`-based or generic default. */
  description?: React.ReactNode;
  /**
   * Resource type label (e.g. "Credential", "Project"). When provided and `description` is not,
   * the default description becomes "Are you sure you want to permanently delete {target}?".
   */
  target?: React.ReactNode;
  /**
   * Marks the confirmed action as reversible (e.g. revoke a role assignment,
   * remove a permission from a role). When true the modal keeps the exact same
   * header / footer / body design as the irreversible-delete modal, but never
   * renders the typed-confirmation input (even for multiple items or when
   * `requireConfirmInput` is set) and omits the "This action cannot be undone."
   * warning. Use for actions the user can recover from in <30s without
   * contacting support — see `.claude/rules/destructive-confirmation.md`.
   * Default: false
   */
  reversible?: boolean;
  /** Force text-input confirmation even for a single item. Default: false */
  requireConfirmInput?: boolean;
  /**
   * Custom confirmation text the user must type.
   * Defaults: single item → item label as string (falls back to localized "Delete" if label is ReactNode),
   * multiple items → localized "Delete".
   * When using ReactNode labels with requireConfirmInput, provide this prop explicitly.
   */
  confirmText?: string;
  /** Label above the confirmation input. Default: "Type {confirmText} to confirm." */
  inputLabel?: React.ReactNode;
  /** Additional props for the confirmation input. */
  inputProps?: BAIDeleteConfirmModalInputProps;
  /** Content rendered between the input field and "cannot be undone" text (e.g. checkboxes). */
  extraContent?: React.ReactNode;
  /** Override for "This action cannot be undone." Defaults to the localized string. */
  cannotBeUndoneText?: string;
  /** Max height (px) of the scrollable item list. Default: 200. Set 0 for no limit. */
  itemListMaxHeight?: number;
  /**
   * Render items without the default surface (background / border / padding /
   * scroll) container. Use when an item's `label` is already a self-contained
   * block (e.g. a table) so the default box does not create a redundant
   * double border. Default: false
   */
  plainItems?: boolean;
}

function extractTextFromNode(node: React.ReactNode): string | undefined {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  return undefined;
}

/** Flattens a ReactNode label to the plain string the a11y name needs. */
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

const BAIDeleteConfirmModal: React.FC<BAIDeleteConfirmModalProps> = ({
  items,
  title,
  description,
  target,
  reversible = false,
  requireConfirmInput = false,
  confirmText: confirmTextProp,
  inputLabel,
  inputProps,
  extraContent,
  cannotBeUndoneText,
  itemListMaxHeight = 200,
  plainItems = false,
  onOk,
  onCancel,
  okText,
  okButtonProps,
  ...restModalProps
}) => {
  'use memo';

  const { t } = useBAIi18n();
  const [typedText, setTypedText] = useState('');

  // Reset the gate every time the dialog re-opens. Derived-state-from-props via
  // the render-phase compare (React's documented alternative to an effect).
  const isOpen = restModalProps.open ?? restModalProps.isOpen ?? false;
  const [wasOpen, setWasOpen] = useState(isOpen);
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) setTypedText('');
  }

  const resolvedTitle =
    title ??
    (items.length > 1
      ? t('comp:BAIDeleteConfirmModal.DeleteNItems', {
          count: items.length,
        })
      : t('comp:BAIDeleteConfirmModal.DeleteItem'));

  const resolvedConfirmText =
    confirmTextProp ??
    (items.length === 1
      ? (extractTextFromNode(items[0]?.label) ?? t('general.button.Delete'))
      : t('general.button.Delete'));

  // An explicitly empty `confirmText` (e.g. the target row is not resolved
  // yet) must not arm the gate with an already-satisfied empty comparison —
  // and must not enable OK without a gate either, so the input is hidden but
  // the confirm stays disabled until a confirm text exists.
  const wantsInput = !reversible && (items.length > 1 || requireConfirmInput);
  const needsInput = wantsInput && !!resolvedConfirmText;

  const resolvedWarning =
    cannotBeUndoneText ?? t('comp:BAIDeleteConfirmModal.CannotBeUndone');

  const resolvedDescription =
    description ??
    (target
      ? t('comp:BAIDeleteConfirmModal.AreYouSureToPermanentlyDeleteTarget', {
          target,
        })
      : t('comp:BAIDeleteConfirmModal.AreYouSureToDelete'));

  const resolvedOkText = okText ?? t('general.button.Delete');

  const resolvedInputLabel = inputLabel ?? (
    <BAITrans
      i18nKey="comp:BAIDeleteConfirmModal.TypeToConfirm"
      values={{ confirmText: resolvedConfirmText }}
      components={{ code: <Text type="code">{''}</Text> }}
    />
  );

  const modalTitle = (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--spacing-1)',
        overflowWrap: 'anywhere',
        wordBreak: 'break-word',
      }}
    >
      <CircleAlert
        style={{ color: 'var(--color-warning)', flexShrink: 0 }}
        size="1em"
      />
      {resolvedTitle}
    </span>
  );

  const itemListContent =
    items.length > 0 ? (
      <div
        role="list"
        style={
          plainItems
            ? undefined
            : {
                maxHeight: itemListMaxHeight || undefined,
                overflowY: itemListMaxHeight ? 'auto' : undefined,
                backgroundColor: 'var(--color-background-muted)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-inner)',
                padding: 'var(--spacing-2)',
                paddingInline: 'var(--spacing-3)',
              }
        }
      >
        <VStack align="stretch" gap={1}>
          {items.map((item) => (
            <div key={item.key} role="listitem">
              {item.label}
            </div>
          ))}
        </VStack>
      </div>
    ) : null;

  return (
    <BAIModal
      destroyOnHidden
      {...restModalProps}
      title={modalTitle}
      okText={resolvedOkText}
      okButtonProps={{
        danger: true,
        disabled: wantsInput
          ? !resolvedConfirmText || typedText !== resolvedConfirmText
          : items.length === 0,
        ...okButtonProps,
      }}
      onOk={(e) => {
        setTypedText('');
        onOk?.(e);
      }}
      onCancel={(e) => {
        setTypedText('');
        onCancel?.(e);
      }}
    >
      <VStack align="stretch" gap={2}>
        {resolvedDescription ? <Text>{resolvedDescription}</Text> : null}
        {(needsInput ? items.length > 1 : true) ? itemListContent : null}
        {needsInput ? (
          <VStack align="stretch" gap={1}>
            {/* PILOT-DECISION 3: `TextInput.label` is a plain string, so a rich
                ReactNode label is rendered here and the field carries the
                flattened text as its (hidden) accessible name. */}
            <Text type="label">{resolvedInputLabel}</Text>
            <TextInput
              label={
                toText(resolvedInputLabel) ||
                `Type ${resolvedConfirmText} to confirm.`
              }
              isLabelHidden
              value={typedText}
              onChange={(value) => setTypedText(value ?? '')}
              placeholder={inputProps?.placeholder}
              isDisabled={inputProps?.disabled}
              hasAutoFocus
              hasClear
              htmlName="confirmText"
            />
            {/* QA-FINDINGS Q-17: with the input present the warning is a danger
                Text directly under it (legacy position), not a trailing Banner
                below the option checkboxes. */}
            <Text color="danger">{resolvedWarning}</Text>
          </VStack>
        ) : null}
        {extraContent}
        {/* A reversible-tier modal never had a warning; a non-input one has no
            input to sit under, so it keeps the banner. */}
        {!needsInput && !reversible ? (
          <Banner status="error" title={resolvedWarning} />
        ) : null}
      </VStack>
    </BAIModal>
  );
};

BAIDeleteConfirmModal.displayName = 'BAIDeleteConfirmModal';

export default BAIDeleteConfirmModal;
