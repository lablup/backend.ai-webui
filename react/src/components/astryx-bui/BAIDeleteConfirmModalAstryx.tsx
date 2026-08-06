/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 PILOT PHASE 6 (cn-oss-removal / ticket 10, item 2) — `BAIDeleteConfirmModal`
 rebuilt on Astryx.

 This is the component that carries `.claude/rules/destructive-confirmation.md`:
 an irreversible delete must be gated behind a modal in which the user TYPES the
 resource name before the danger button enables. The contract is reproduced
 exactly; only the primitives change.

 BUI original (261 LOC) -> here:

 | BUI (antd)                              | Astryx                              |
 |-----------------------------------------|-------------------------------------|
 | `BAIModal` + `okButtonProps.danger`     | `BAIModalAstryx` + `actionVariant="destructive"` |
 | `Form` + `Form.Item` + `Form.useWatch`  | one `useState` + `TextInput`        |
 | antd `Input autoFocus allowClear`       | `TextInput hasAutoFocus hasClear`   |
 | `Typography.Text type="danger"`         | `Banner status="error"`             |
 | `ExclamationCircleFilled` in the title  | the Banner's own status icon        |
 | `<BAITrans components={{code: …}}>`     | `Text` + `Text type="code"` split   |

 PILOT-DECISIONs (all forced by an Astryx primitive, none by preference):

 1. **The typed-confirm gate does not need a form engine.** BUI reached for
    antd `Form` + `Form.useWatch` purely to observe one input. Astryx
    `TextInput` is `value` / `onChange(value)`, so a `useState` is the whole
    mechanism. This is the one place in the pilot where dropping antd `Form`
    made the code *smaller* — the locked "Form stays" decision is about form
    STATE ENGINES, and a single gate input is not one.
 2. **The warning moves from the title into the body.** Astryx
    `DialogHeader.title` is a plain `string` (P2) with no inline-icon slot, and
    Astryx `Text` has no `danger` colour (P5 — `TextColor` is
    primary/secondary/disabled/placeholder/accent/inherit only). Rendering
    "This action cannot be undone." as a `Banner status="error"` restores both
    the icon and the danger colour, and is the idiomatic Astryx form. Net: the
    warning is *more* prominent than in the antd original.
 3. **`inputLabel` is a `ReactNode` in BUI and a `string` here** (P2 again —
    `TextInput.label` is `string` and doubles as the accessible name). BUI's
    `<Trans>` with an embedded `<code>` chunk is therefore split into a plain
    label plus a separate `Text type="code"` line showing the exact string to
    type. The information is identical; the markup is not.
 4. **The item list keeps a hand-rolled surface.** Astryx has no "boxed,
    scrollable list of arbitrary nodes" primitive (`Item` wants a label/desc
    shape). A plain `div` with theme CSS vars is used, so it follows brand and
    admin themes and both colour schemes.
*/
import BAIModalAstryx from './BAIModalAstryx';
import type { BAIModalAstryxProps } from './BAIModalAstryx';
import { Banner } from '@astryxdesign/core/Banner';
import { VStack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
import { TextInput } from '@astryxdesign/core/TextInput';
import React, { useState } from 'react';

export interface BAIDeleteConfirmModalAstryxItem {
  key: string;
  /** Display label — `ReactNode` so a row can carry icons/badges. */
  label: React.ReactNode;
}

export interface BAIDeleteConfirmModalAstryxProps extends Omit<
  BAIModalAstryxProps,
  'children' | 'actionVariant' | 'isActionDisabled'
> {
  /** Items to be deleted. */
  items: Array<BAIDeleteConfirmModalAstryxItem>;
  /** Description shown above the item list. */
  description?: React.ReactNode;
  /**
   * Marks the action reversible: keeps the identical layout but never renders
   * the typed-confirmation input and omits the "cannot be undone" banner.
   * See `.claude/rules/destructive-confirmation.md`.
   */
  reversible?: boolean;
  /** Force typed confirmation even for a single item. */
  requireConfirmInput?: boolean;
  /** The exact string the user must type. */
  confirmText?: string;
  /** Label above the confirmation input. A STRING (P2) — see the header note. */
  inputLabel?: string;
  inputPlaceholder?: string;
  /** Rendered between the input and the warning banner. */
  extraContent?: React.ReactNode;
  /** "This action cannot be undone." */
  cannotBeUndoneText?: string;
  /** Max height (px) of the scrollable item list. `0` = no limit. */
  itemListMaxHeight?: number;
  /** Render items without the default boxed surface. */
  plainItems?: boolean;
}

const BAIDeleteConfirmModalAstryx: React.FC<
  BAIDeleteConfirmModalAstryxProps
> = ({
  items,
  description,
  reversible = false,
  requireConfirmInput = false,
  confirmText = '',
  inputLabel,
  inputPlaceholder,
  extraContent,
  cannotBeUndoneText,
  itemListMaxHeight = 200,
  plainItems = false,
  isOpen = false,
  onOpenChange,
  onAction,
  actionLabel,
  ...modalProps
}) => {
  'use memo';

  const [typedText, setTypedText] = useState('');

  // Reset the gate every time the dialog re-opens. Derived-state-from-props
  // via the render-phase compare (React's documented alternative to an effect),
  // which also avoids the extra paint an effect-based reset would cause.
  const [wasOpen, setWasOpen] = useState(isOpen);
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) setTypedText('');
  }

  const needsInput =
    !reversible && (items.length > 1 || requireConfirmInput) && !!confirmText;

  const itemList =
    items.length > 0 ? (
      <div
        role="list"
        style={
          plainItems
            ? undefined
            : {
                maxHeight: itemListMaxHeight || undefined,
                overflowY: itemListMaxHeight ? 'auto' : undefined,
                // Theme CSS vars, so this follows the brand / admin accent and
                // flips with the colour scheme like every Astryx surface.
                backgroundColor: 'var(--color-background-secondary)',
                border: '1px solid var(--color-border)',
                // SWEEP: this said `var(--radius-md, 6px)`. There is no
                // `--radius-md` in Astryx — the scale is
                // none/inner/element/container/page/chat/full — so it silently
                // fell through to the 6px literal. Same silent-CSS class as
                // P6/P17: a variable that does not exist fails as a default,
                // not as an error. `--radius-inner` is the token for a nested
                // surface, and happens to be the 6px this was drawing.
                borderRadius: 'var(--radius-inner)',
                padding: 8,
                paddingInline: 12,
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
    <BAIModalAstryx
      {...modalProps}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      actionLabel={actionLabel}
      actionVariant="destructive"
      isActionDisabled={
        needsInput ? typedText !== confirmText : items.length === 0
      }
      onAction={onAction}
    >
      <VStack align="stretch" gap={3}>
        {description ? <Text>{description}</Text> : null}
        {(needsInput ? items.length > 1 : true) ? itemList : null}
        {needsInput ? (
          <VStack align="stretch" gap={1}>
            <TextInput
              label={inputLabel ?? `Type ${confirmText} to confirm.`}
              value={typedText}
              onChange={setTypedText}
              placeholder={inputPlaceholder ?? confirmText}
              hasAutoFocus
              hasClear
              htmlName="confirmText"
            />
            {/* PILOT-DECISION 3: BUI put the exact string inside the label via
                `<Trans>` + `<code>`. `TextInput.label` is a plain string, so
                the code-formatted echo becomes its own line. */}
            <Text type="code" color="secondary">
              {confirmText}
            </Text>
          </VStack>
        ) : null}
        {extraContent}
        {!reversible && cannotBeUndoneText ? (
          <Banner status="error" title={cannotBeUndoneText} />
        ) : null}
      </VStack>
    </BAIModalAstryx>
  );
};

export default BAIDeleteConfirmModalAstryx;
