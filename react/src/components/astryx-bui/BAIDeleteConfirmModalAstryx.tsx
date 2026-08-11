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
 | `Typography.Text type="danger"`         | `Text color="danger"` (see PD 2)    |
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
    `DialogHeader.title` is a plain `string` (P2) with no inline-icon slot, so
    the warning cannot ride along with the title and has to live in the body.
    That half stands.

    ~~and Astryx `Text` has no `danger` colour (P5 — `TextColor` is
    primary/secondary/disabled/placeholder/accent/inherit only), so it is a
    `Banner status="error"`~~ — **SUPERSEDED (QA-FINDINGS Q-17).** The brand
    theme registers `STATUS_TEXT_COLORS` (`react/src/astryx-theme/
    backendAiTheme.ts`), which maps `color:danger` to `var(--color-error)` and
    emits the `TextColorMap` augmentation, so `Text color="danger"` type-checks
    and paints antd's `colorError` (#FF4D4F / #BE3D3F) in both modes. With the
    input present the warning is therefore a plain danger `Text` directly under
    it, which is where legacy put it and what the QA report asks for; the
    `Banner` is kept only for the no-input variant, which has nothing to sit
    under. The trade is real and deliberate: the Banner WAS more prominent, but
    it also rendered below the option checkboxes — after the thing it warns
    about.
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
                // P19 SWEEP (ticket 16): `--color-background-secondary` is not
                // a declared Astryx variable; `--color-background-muted` is the
                // declared muted-surface tier this box was drawing.
                backgroundColor: 'var(--color-background-muted)',
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
            {/* PILOT-DECISION 2 — SUPERSEDED. It moved the "cannot be undone"
                warning out from under the input into a trailing `Banner`,
                because "Astryx `Text` has no `danger` colour (P5 — `TextColor`
                is primary/secondary/disabled/placeholder/accent/inherit only)".
                That is no longer true: the brand theme registers
                `STATUS_TEXT_COLORS` (`backendAiTheme.ts`), which adds
                `color:danger` -> `var(--color-error)` and emits the
                `TextColorMap` augmentation, so `color="danger"` type-checks and
                paints antd's `colorError` (#FF4D4F / #BE3D3F) in both modes.
                `TerminateSessionModalV2.tsx` already uses it.

                Reported as: "WARNING: this cannot be undone! 이 input 하단에
                나오는 것이 아니라 별도의 alert 로 추가됨. input 하단에 있는
                Permanently Delete text 대신 error text color 로 warning 을
                추가해야 함." QA-FINDINGS Q-17. Legacy rendered exactly this —
                `<Text type="danger">` immediately under the input, above the
                option checkboxes (`git show origin/main:packages/backend.ai-ui/
                src/components/BAIDeleteConfirmModal.tsx`).

                It takes the slot of PILOT-DECISION 3's code echo, which is
                redundant: the input's own label already carries the string
                (`Please type "Permanently Delete".`), so only the monospace
                emphasis is lost.

                Trade recorded honestly: PILOT-DECISION 2 argued the Banner was
                MORE prominent than antd's text. It was — but it also sat BELOW
                the two option checkboxes, i.e. after the thing it warns about.
                Restoring the legacy position fixes that ordering; the typed
                confirmation gate (`requireConfirmInput` / `isActionDisabled`)
                is untouched, so `.claude/rules/destructive-confirmation.md`
                still holds. */}
            {!reversible && cannotBeUndoneText ? (
              <Text color="danger">{cannotBeUndoneText}</Text>
            ) : null}
          </VStack>
        ) : null}
        {extraContent}
        {/* A reversible-tier modal never had a warning; a non-input one has no
            input to sit under, so it keeps the banner. */}
        {!needsInput && !reversible && cannotBeUndoneText ? (
          <Banner status="error" title={cannotBeUndoneText} />
        ) : null}
      </VStack>
    </BAIModalAstryx>
  );
};

export default BAIDeleteConfirmModalAstryx;
