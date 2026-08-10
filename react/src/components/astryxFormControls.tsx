/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Adapters that let Astryx form controls sit inside an antd `Form.Item` /
 `BAIFormItem` (the antd form ENGINE we keep, per MIGRATION-SPEC §0; visuals
 come from BAIFormItem).

 ## Why there is exactly one of these now (ticket 30)

 Two copies of this module grew in parallel: the pilot's
 (`components/astryxFormControls.tsx`, ported in ticket 10 and extended by
 tickets 16/17/19/23) and the page-group tickets'
 (`components/astryx-bui/astryxFormControls.tsx`, ticket 18, extended by 20).
 They exported the SAME seven component names with quietly different prop
 surfaces — `allowClear` vs `hasClear`, `number | string | null` vs
 `number | null`, one with `startIcon`/`onValueChange`, the other with
 `width`/`onBlur`/`data-testid`. Nothing failed, because each call site
 imported from whichever file its ticket happened to touch; but "which
 `AstryxFormTextInput` is this?" had become a per-file question and the two
 drifted further with every page migrated.

 This file is now the single implementation, carrying the UNION of both prop
 surfaces. `astryx-bui/astryxFormControls.tsx` re-exports it verbatim so the
 ~30 call sites on that path keep working; new code should import from here.

 ## THREE deltas make raw Astryx controls unusable as direct `Form.Item`
 children (pilot patterns P3/P4; each is a codemod / lint-rule candidate):

 1. `value` is REQUIRED and typed non-nullable on most Astryx controls
    (`TextInput.value: string`, `Switch.value: boolean`). antd's `Form.Item`
    clones its child with `value={undefined}` until the field is first
    touched, which flips the input from uncontrolled to controlled and logs a
    React warning. The adapters coalesce.

 2. `label` is REQUIRED on every Astryx control and rendered by the control
    itself. `BAIFormItem` already renders the visible label, so the adapters
    pass `label={sameString} isLabelHidden` to keep the accessible name
    without double-rendering. (`AstryxFormCheckbox` is the exception — antd
    `Checkbox` renders its children inline and the call sites keep that.)

 3. `onChange` receives the VALUE, not the event. antd's default
    `getValueFromEvent` happens to pass a non-event first argument through
    unchanged, but the adapters normalise explicitly instead of relying on
    that accident (and it does NOT hold for booleans read via
    `e.target.checked`).
*/
import { FormItemInputContext } from '../form-engine';
import { CheckboxInput } from '@astryxdesign/core/CheckboxInput';
import { MultiSelector } from '@astryxdesign/core/MultiSelector';
import { NumberInput } from '@astryxdesign/core/NumberInput';
import { RadioList, RadioListItem } from '@astryxdesign/core/RadioList';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import type { SelectorOptionType } from '@astryxdesign/core/Selector';
import { Selector } from '@astryxdesign/core/Selector';
import { Switch } from '@astryxdesign/core/Switch';
import { TextArea } from '@astryxdesign/core/TextArea';
import type { TextInputProps } from '@astryxdesign/core/TextInput';
import { TextInput } from '@astryxdesign/core/TextInput';
import { Tokenizer } from '@astryxdesign/core/Tokenizer';
import type {
  SearchableItem,
  SearchSource,
} from '@astryxdesign/core/Typeahead';
import type { SizeValue } from '@astryxdesign/core/utils';
import * as _ from 'lodash-es';
import React from 'react';

/**
 * RESTORED (input-parity pass) — **the control paints the field's validation
 * status again.**
 *
 * antd's `Form.Item` published its merged status on `FormItemInputContext` and
 * every antd control read it, which is how an invalid field got a red border
 * without a single call site passing anything. None of the Astryx adapters read
 * that context, so after the migration a failed rule printed a red MESSAGE
 * under a field that still looked pristine — on every `rules=`-bearing item in
 * the app.
 *
 * `statusVariant="detached"` with no `message` is deliberate: it is the one
 * combination that paints the border and NOTHING else. `'attached'` (Astryx's
 * default) would add an in-field status glyph antd never drew unless
 * `hasFeedback` was set — and where `hasFeedback` IS set, the form item already
 * renders that glyph itself, so the field would carry two.
 *
 * `'validating'` / `'success'` are intentionally not forwarded: antd painted
 * neither on the control (they drive the `hasFeedback` icon, which the item
 * owns).
 *
 * **`statusVariant` is CONSTANT — never conditional on `status`.** Astryx's
 * `Field` renders `{children}` inside an extra `<div>` when
 * `statusVariant === 'attached'` (its default) and as a bare fragment
 * otherwise. Returning `{}` while pristine and `{statusVariant: 'detached'}`
 * once a rule fails therefore changed the ELEMENT STRUCTURE at the control's
 * position, so React unmounted the whole control subtree and mounted a fresh
 * one — the `<input>` node was replaced and **focus was lost on the very first
 * keystroke** of any field carrying `rules` (measured on the login screen's
 * `api_endpoint`: character 1 landed, the node was swapped,
 * `document.activeElement` fell back to `<body>`, and characters 2..n went
 * nowhere). Pinning the variant keeps `Field`'s tree stable; with no
 * `status.message` the detached branch renders exactly `{children}`, so the
 * only thing dropped is that wrapper div (`display:flex;flex-direction:column`
 * inside a `Field` container that is already `flex column`) — layout-neutral.
 * `astryxFormControls.test.tsx` locks this in.
 */
const useFormControlStatusProps = (): {
  status?: { type: 'error' | 'warning' };
  statusVariant: 'detached';
} => {
  'use memo';
  const { status } = React.useContext(FormItemInputContext);
  if (status !== 'error' && status !== 'warning')
    return { statusVariant: 'detached' };
  return { status: { type: status }, statusVariant: 'detached' };
};

/**
 * Status without `statusVariant`, for the controls that are NOT built on
 * Astryx's `Field` (`Switch`, `CheckboxInput`): they accept `status` but do
 * not declare `statusVariant`, so passing it would only land an unknown
 * attribute on the DOM. They render no structural branch on status either, so
 * they never had the remount problem the hook above fixes.
 */
const useFormControlStatusOnly = (): {
  status?: { type: 'error' | 'warning' };
} => {
  'use memo';
  const { status } = React.useContext(FormItemInputContext);
  if (status !== 'error' && status !== 'warning') return {};
  return { status: { type: status } };
};

export interface AstryxFormTextInputProps {
  /** Injected by `Form.Item`. */
  value?: string;
  /** Injected by `Form.Item`. */
  onChange?: (value: string) => void;
  /** Accessible name. Visually hidden — `BAIFormItem` renders the visible one. */
  label: string;
  type?: 'text' | 'password' | 'email';
  placeholder?: string;
  disabled?: boolean;
  /** Astryx spelling. */
  hasClear?: boolean;
  /** antd spelling of `hasClear`, kept so migrated call sites read naturally. */
  allowClear?: boolean;
  /** antd `prefix` icon -> Astryx `startIcon` (icon component, not element). */
  startIcon?: TextInputProps['startIcon'];
  /** Astryx `TextInput.hasAutoFocus` passthrough (inline edit flows). */
  hasAutoFocus?: boolean;
  width?: SizeValue;
  /**
   * Astryx `TextInput.size`. Inline editors want `lg`, in-row fields want
   * `sm`; without it those call sites had to hand-roll a local adapter (D10).
   */
  size?: TextInputProps['size'];
  /**
   * antd `Input.onPressEnter` is Astryx's `onEnter` — with one difference the
   * adapter papers over: antd guarded the callback with
   * `!e.nativeEvent.isComposing`, Astryx does not. Without the guard the Enter
   * that CONFIRMS an IME candidate (Hangul, Kana, Pinyin …) also submits the
   * field, so a CJK user can never finish a word. See `handleKeyDown` below.
   */
  onEnter?: () => void;
  /**
   * antd `Input.maxLength` — the native attribute, hard-truncating input.
   * Astryx does not declare it, but it spreads unknown props onto the
   * `<input>`, so DECLARING it here is enough to make it work again.
   */
  maxLength?: number;
  /**
   * Native `autocomplete`. Same mechanism as `maxLength` — Astryx does not
   * declare it but spreads it onto the `<input>`, and without it browsers and
   * password managers lose the login form's field roles.
   */
  autoComplete?: string;
  /**
   * The key event Astryx exposes. antd's `onKeyUp`-based Escape-to-cancel
   * becomes `onKeyDown` here; inline editors are the only users.
   */
  onKeyDown?: TextInputProps['onKeyDown'];
  /** Native `name` attribute (autofill / password-manager hints). */
  htmlName?: string;
  /**
   * Fired with the new value AFTER `Form.Item`'s injected `onChange`. This is
   * the reason several call sites forked their own adapter: they need a side
   * effect (mark dirty, clear a resolved lookup) alongside the form write,
   * and `onChange` itself is owned by `Form.Item`.
   */
  onValueChange?: (value: string) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  'data-testid'?: string;
}

export const AstryxFormTextInput: React.FC<AstryxFormTextInputProps> = ({
  value,
  onChange,
  label,
  type,
  placeholder,
  disabled,
  hasClear,
  allowClear,
  startIcon,
  hasAutoFocus,
  width = '100%',
  size,
  onEnter,
  onKeyDown,
  htmlName,
  onValueChange,
  onBlur,
  ...rest
}) => {
  'use memo';
  const statusProps = useFormControlStatusProps();
  // antd's IME guard, reinstated. Astryx runs `onEnter` from its own keydown
  // handler BEFORE it calls ours, so the guard cannot live in `onKeyDown` — it
  // has to wrap `onEnter` itself, and `onEnter` carries no event. A composition
  // flag is the substitute: browsers deliver the confirming `keydown`
  // (`isComposing`/`keyCode === 229`) while the composition is still open, so
  // the flag is still set when `onEnter` fires.
  const composingRef = React.useRef(false);
  return (
    <TextInput
      type={type}
      value={value ?? ''}
      onChange={(next) => {
        onChange?.(next);
        onValueChange?.(next);
      }}
      label={label}
      isLabelHidden
      placeholder={placeholder}
      isDisabled={disabled}
      hasClear={hasClear ?? allowClear}
      startIcon={startIcon}
      hasAutoFocus={hasAutoFocus}
      width={width}
      size={size}
      onEnter={
        onEnter &&
        (() => {
          if (composingRef.current) return;
          onEnter();
        })
      }
      onKeyDown={onKeyDown}
      htmlName={htmlName}
      onBlur={onBlur}
      {...statusProps}
      {...(rest as object)}
      onCompositionStart={() => {
        composingRef.current = true;
      }}
      onCompositionEnd={() => {
        composingRef.current = false;
      }}
    />
  );
};

export interface AstryxFormTextAreaProps {
  /** Injected by `Form.Item`. */
  value?: string;
  /** Injected by `Form.Item`. */
  onChange?: (value: string) => void;
  /** Accessible name. Visually hidden — `BAIFormItem` renders the visible one. */
  label: string;
  /** antd `Input.TextArea rows`. */
  rows?: number;
  placeholder?: string;
  disabled?: boolean;
  width?: SizeValue;
  /**
   * antd `Input.TextArea maxLength`. Astryx declares it natively AND renders
   * antd's `showCount` counter from it, so the two antd props collapse to one.
   */
  maxLength?: number;
  'data-testid'?: string;
}

export const AstryxFormTextArea: React.FC<AstryxFormTextAreaProps> = ({
  value,
  onChange,
  label,
  rows,
  placeholder,
  disabled,
  width = '100%',
  maxLength,
  ...rest
}) => {
  'use memo';
  const statusProps = useFormControlStatusProps();
  return (
    <TextArea
      value={value ?? ''}
      onChange={(next) => onChange?.(next)}
      label={label}
      isLabelHidden
      rows={rows}
      placeholder={placeholder}
      isDisabled={disabled}
      width={width}
      maxLength={maxLength}
      {...statusProps}
      {...(rest as object)}
    />
  );
};

export interface AstryxFormSwitchProps {
  /** Injected by `Form.Item` (default `valuePropName`, i.e. `value`). */
  value?: boolean;
  /** Injected by `Form.Item valuePropName="checked"`. */
  checked?: boolean;
  onChange?: (value: boolean) => void;
  label: string;
  disabled?: boolean;
  /** Astryx `Switch.isLoading` — the toggle is awaiting a server round-trip. */
  isLoading?: boolean;
  size?: 'sm' | 'md';
  /**
   * Keep the control's own label visible instead of relying on `BAIFormItem`
   * to render it. Needed where the switch has no form-item label of its own.
   */
  isLabelHidden?: boolean;
  /**
   * Fired with the new value AFTER `Form.Item`'s injected `onChange` — same
   * role as on `AstryxFormTextInput`.
   */
  onValueChange?: (value: boolean) => void;
  'data-testid'?: string;
}

export const AstryxFormSwitch: React.FC<AstryxFormSwitchProps> = ({
  value,
  checked,
  onChange,
  label,
  disabled,
  isLoading,
  size,
  isLabelHidden = true,
  onValueChange,
  ...rest
}) => {
  'use memo';
  const statusProps = useFormControlStatusOnly();
  return (
    <Switch
      value={value ?? checked ?? false}
      onChange={(next) => {
        onChange?.(next);
        onValueChange?.(next);
      }}
      label={label}
      isLabelHidden={isLabelHidden}
      isDisabled={disabled}
      isLoading={isLoading}
      size={size}
      {...statusProps}
      {...(rest as object)}
    />
  );
};

export interface AstryxFormRadioOption {
  value: string;
  label: string;
  disabled?: boolean;
  /** Trailing slot — e.g. a question-mark tooltip icon. */
  endContent?: React.ReactNode;
  'data-testid'?: string;
}

export interface AstryxFormRadioListProps {
  value?: string;
  onChange?: (value: string) => void;
  label: string;
  options: Array<AstryxFormRadioOption>;
  disabled?: boolean;
  orientation?: 'vertical' | 'horizontal';
  /**
   * Side effect to run alongside the Form-injected `onChange` (e.g. cross-field
   * revalidation). antd's `Form.Item` wraps and preserves a child's own
   * `onChange`; since the adapter owns that slot, the escape hatch is explicit.
   */
  onValueChange?: (value: string) => void;
}

export const AstryxFormRadioList: React.FC<AstryxFormRadioListProps> = ({
  value,
  onChange,
  label,
  options,
  disabled,
  orientation = 'horizontal',
  onValueChange,
}) => {
  'use memo';
  const statusProps = useFormControlStatusProps();
  return (
    <RadioList
      value={value ?? ''}
      onChange={(next) => {
        onChange?.(next);
        onValueChange?.(next);
      }}
      label={label}
      isLabelHidden
      isDisabled={disabled}
      orientation={orientation}
      {...statusProps}
    >
      {options.map((option) => (
        <RadioListItem
          key={option.value}
          value={option.value}
          label={option.label}
          isDisabled={option.disabled}
          endContent={option.endContent}
          // Astryx spreads unknown props onto the item's container element but
          // does NOT declare them in its TS types, so the cast is required.
          // The e2e suite selects on these, and they land on the wrapping
          // <label> instead of antd's <input> — selectors survive, but any
          // assertion on the matched element's tag/role does not.
          {...({ 'data-testid': option['data-testid'] } as object)}
        />
      ))}
    </RadioList>
  );
};

export interface AstryxFormSegmentedOption {
  value: string;
  label: string;
}

export interface AstryxFormSegmentedProps {
  value?: string;
  onChange?: (value: string) => void;
  label: string;
  options: Array<AstryxFormSegmentedOption>;
  disabled?: boolean;
}

// antd `Radio.Group` with `Radio.Button` children -> `SegmentedControl`
// (MAPPING.md §3.10).
export const AstryxFormSegmented: React.FC<AstryxFormSegmentedProps> = ({
  value,
  onChange,
  label,
  options,
  disabled,
}) => {
  'use memo';
  return (
    <SegmentedControl
      value={value ?? ''}
      onChange={(next) => onChange?.(next)}
      label={label}
      isDisabled={disabled}
    >
      {options.map((option) => (
        <SegmentedControlItem
          key={option.value}
          value={option.value}
          label={option.label}
        />
      ))}
    </SegmentedControl>
  );
};

export interface AstryxFormNumberInputProps {
  /** Injected by `Form.Item`. antd InputNumber values may arrive as strings. */
  value?: number | string | null;
  onChange?: (value: number | null) => void;
  label: string;
  min?: number | null;
  max?: number | null;
  step?: number | null;
  /** antd `InputNumber suffix` (a unit string) → Astryx `units`. */
  units?: string | null;
  isIntegerOnly?: boolean;
  placeholder?: string;
  disabled?: boolean;
  /**
   * Defaults to `true`: it is what gives Astryx's `onChange` the nullable
   * overload, which is the model antd `InputNumber` had (a cleared field is
   * `null`, not `0`) and what every call site's `onChange` is already typed
   * for. Pass `false` for a field that must never hold "no value".
   */
  hasClear?: boolean;
  width?: SizeValue;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  'data-testid'?: string;
}

export const AstryxFormNumberInput: React.FC<AstryxFormNumberInputProps> = ({
  value,
  onChange,
  label,
  min,
  max,
  step,
  units,
  isIntegerOnly,
  placeholder,
  disabled,
  hasClear = true,
  width = '100%',
  onBlur,
  ...rest
}) => {
  'use memo';
  const statusProps = useFormControlStatusProps();
  // antd `InputNumber` handed strings through in some call sites; coalesce
  // before Astryx sees it, and treat an unparseable string as "no value"
  // rather than letting NaN reach the input.
  const numericValue =
    value === undefined || value === null || value === ''
      ? null
      : Number(value);
  const safeValue = Number.isNaN(numericValue as number) ? null : numericValue;

  /**
   * RESTORED — **an out-of-range entry is clamped on blur.**
   *
   * antd's `InputNumber` ran `getRangeValue` on blur and on Enter, so typing
   * `70000` into a `max={65535}` port field left `65535` behind. Astryx's
   * `parseNumberInput` REJECTS anything past a bound (returns `null`), so
   * `onChange` never fires and the pending text is discarded on blur — the
   * field snaps back to its old value and the user's intent is lost, silently.
   * 35 bounded fields in this repo were affected (ports, MTU, replica counts,
   * resource-policy maxima).
   *
   * The raw field text is the only place the rejected entry still exists, so
   * the clamp is computed from there. React 19 does not pool events.
   */
  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const rawText = event.target.value;
    const typed = rawText.trim() === '' ? NaN : Number(rawText);
    if (
      Number.isFinite(typed) &&
      typed !== safeValue &&
      (typeof min === 'number' || typeof max === 'number')
    ) {
      let clamped = typed;
      if (typeof min === 'number' && clamped < min) clamped = min;
      if (typeof max === 'number' && clamped > max) clamped = max;
      if (isIntegerOnly) clamped = Math.round(clamped);
      if (clamped !== safeValue && clamped !== typed) {
        onChange?.(clamped);
      }
    }
    onBlur?.(event);
  };

  return hasClear ? (
    <NumberInput
      hasClear
      value={safeValue}
      onChange={(next) => onChange?.(next)}
      label={label}
      isLabelHidden
      min={min}
      max={max}
      step={step}
      units={units || undefined}
      isIntegerOnly={isIntegerOnly}
      placeholder={placeholder}
      isDisabled={disabled}
      width={width}
      onBlur={handleBlur}
      {...statusProps}
      {...(rest as object)}
    />
  ) : (
    <NumberInput
      value={safeValue}
      onChange={(next: number) => onChange?.(next)}
      label={label}
      isLabelHidden
      min={min}
      max={max}
      step={step}
      units={units || undefined}
      isIntegerOnly={isIntegerOnly}
      placeholder={placeholder}
      isDisabled={disabled}
      width={width}
      onBlur={handleBlur}
      {...statusProps}
      {...(rest as object)}
    />
  );
};

export interface AstryxFormCheckboxProps {
  /** Injected by `Form.Item` (default `valuePropName`, i.e. `value`). */
  value?: boolean;
  /** Injected by `Form.Item valuePropName="checked"`. */
  checked?: boolean;
  onChange?: (value: boolean) => void;
  /** The visible checkbox label (antd `<Checkbox>{children}</Checkbox>`). */
  label: string;
  disabled?: boolean;
  /** Opt out of the inline label when `BAIFormItem` already renders one. */
  isLabelHidden?: boolean;
  /**
   * Side effect to run alongside the Form-injected `onChange` (e.g. clearing
   * a sibling field). The adapter owns the `onChange` slot, so the escape
   * hatch is explicit (same convention as AstryxFormRadioList).
   */
  onValueChange?: (value: boolean) => void;
  'data-testid'?: string;
}

export const AstryxFormCheckbox: React.FC<AstryxFormCheckboxProps> = ({
  value,
  checked,
  onChange,
  label,
  disabled,
  isLabelHidden,
  onValueChange,
  ...rest
}) => {
  'use memo';
  const statusProps = useFormControlStatusOnly();
  return (
    <CheckboxInput
      value={value ?? checked ?? false}
      onChange={(next) => {
        onChange?.(next);
        onValueChange?.(next);
      }}
      label={label}
      isLabelHidden={isLabelHidden}
      isDisabled={disabled}
      {...statusProps}
      {...(rest as object)}
    />
  );
};

/**
 * Option shape accepted by `AstryxFormSelector` / `AstryxFormMultiSelector`.
 *
 * A superset of what the two former modules declared. `description` and
 * `isDisabled` came from the ticket-18 variant and are accepted (Astryx's
 * `Selector` ignores what it does not know); `label`, `disabled` and plain
 * strings / dividers / sections come from Astryx's own `SelectorOptionType`.
 */
export interface AstryxFormSelectorOption {
  value: string;
  label?: string;
  description?: string;
  disabled?: boolean;
  isDisabled?: boolean;
}

export type AstryxFormSelectorOptions = ReadonlyArray<
  AstryxFormSelectorOption | SelectorOptionType
>;

export interface AstryxFormSelectorProps {
  /** Injected by `Form.Item`. */
  value?: string;
  onChange?: (value: string | null) => void;
  /** Accessible name. Visually hidden — `BAIFormItem` renders the visible one. */
  label: string;
  options: AstryxFormSelectorOptions;
  placeholder?: string;
  disabled?: boolean;
  hasClear?: boolean;
  /** antd `showSearch`. */
  hasSearch?: boolean;
  isLoading?: boolean;
  width?: SizeValue;
  'data-testid'?: string;
}

/**
 * Small static-option select inside a `Form.Item` — the plain `Selector`
 * branch of MAPPING §3.1 (no remote source, no multiple, few options).
 * Anything Relay-backed or large keeps the ComplexSelector track (tickets
 * 26/27), not this adapter.
 */
export const AstryxFormSelector: React.FC<AstryxFormSelectorProps> = ({
  value,
  onChange,
  label,
  options,
  placeholder,
  disabled,
  hasClear,
  hasSearch,
  isLoading,
  width = '100%',
  ...rest
}) => {
  'use memo';
  const statusProps = useFormControlStatusProps();
  // `hasClear` is a discriminated union on Selector (with it, value/onChange
  // become nullable) — branch instead of passing `boolean | undefined`.
  const selectorOptions = options as SelectorOptionType[];
  return hasClear ? (
    <Selector
      hasClear
      value={value ?? null}
      onChange={(next: string | null) => onChange?.(next)}
      label={label}
      isLabelHidden
      options={selectorOptions}
      placeholder={placeholder}
      isDisabled={disabled}
      hasSearch={hasSearch}
      isLoading={isLoading}
      width={width}
      {...statusProps}
      {...(rest as object)}
    />
  ) : (
    <Selector
      value={value ?? undefined}
      onChange={(next: string) => onChange?.(next)}
      label={label}
      isLabelHidden
      options={selectorOptions}
      placeholder={placeholder}
      isDisabled={disabled}
      hasSearch={hasSearch}
      isLoading={isLoading}
      width={width}
      {...statusProps}
      {...(rest as object)}
    />
  );
};

export interface AstryxFormMultiSelectorProps {
  /** Injected by `Form.Item`; antd `Select mode="multiple"` also nullable
   *  until first touch. */
  value?: string[];
  onChange?: (value: string[]) => void;
  label: string;
  options: AstryxFormSelectorOptions;
  placeholder?: string;
  disabled?: boolean;
  hasSearch?: boolean;
  isLoading?: boolean;
  width?: SizeValue;
  /**
   * Trigger rendering. Defaults to `'labels'` (QA2-B-1) — Astryx's own default
   * is `'count'` ("3 selected"), which hides the selection antd showed inline.
   */
  triggerDisplay?: 'count' | 'labels' | 'badges';
  'data-testid'?: string;
}

/**
 * Static-options multi-select (MAPPING §3.1 `mode="multiple"` branch).
 * Relay / infinite-scroll multi-selects are NOT this — those stay on the BUI
 * frontier until the ComplexSelector rebuild (tickets 26/27).
 *
 * PILOT-DECISION (QA2-B-1): `triggerDisplay` defaults to `'labels'`, matching
 * `BAISelect`'s multiple branch and `BAIComplexSelect`, so every multi-select
 * in the app names its selection in the trigger instead of counting it. Astryx
 * caps the labels list at three and appends `, +N`.
 */
export const AstryxFormMultiSelector: React.FC<
  AstryxFormMultiSelectorProps
> = ({
  value,
  onChange,
  label,
  options,
  placeholder,
  disabled,
  hasSearch,
  isLoading,
  width = '100%',
  triggerDisplay = 'labels',
  ...rest
}) => {
  'use memo';
  const statusProps = useFormControlStatusProps();
  return (
    <MultiSelector
      value={value ?? []}
      onChange={(next) => onChange?.(next)}
      label={label}
      isLabelHidden
      options={options as SelectorOptionType[]}
      placeholder={placeholder}
      isDisabled={disabled}
      hasSearch={hasSearch}
      isLoading={isLoading}
      width={width}
      triggerDisplay={triggerDisplay}
      {...statusProps}
      {...(rest as object)}
    />
  );
};

/**
 * Free-tag entry has no options to search — the source is intentionally empty
 * and `hasCreate` is what commits typed text as a new token. Module-level so
 * the Tokenizer never sees a fresh identity per render.
 */
const EMPTY_TAG_SEARCH_SOURCE: SearchSource<SearchableItem> = {
  search: () => [],
  bootstrap: () => [],
};

export interface AstryxFormTagsInputProps {
  /** Injected by `Form.Item`; nullable until the field is first touched. */
  value?: string[];
  /** Injected by `Form.Item`. */
  onChange?: (value: string[]) => void;
  /** Accessible name. Visually hidden — `BAIFormItem` renders the visible one. */
  label: string;
  placeholder?: string;
  disabled?: boolean;
  /** antd `allowClear` — clears every token at once. */
  hasClear?: boolean;
  /** antd `maxCount`. */
  maxEntries?: number;
  /**
   * antd `tokenSeparators` — the characters that split one entry into several
   * tokens. Restored because the UI still PROMISES it: `PortSelectFormItem`
   * renders "Enter multiple values separated by either a comma (,) or a
   * space", `UserSettingModal` says "Enter GIDs separated by commas or
   * spaces", and `AppLauncherModal` labels its field "(comma-separated)".
   *
   * The split happens on commit rather than on the keystroke: Astryx's
   * `Tokenizer` exposes no paste/input hook, so `"a,b,c"` is committed as one
   * token by `hasCreate` and taken apart here. Typing or pasting separated
   * text and pressing Enter therefore behaves as antd did; the only lost nuance
   * is antd's split at the instant of the paste, before Enter.
   */
  tokenSeparators?: Array<string>;
  width?: SizeValue;
  'data-testid'?: string;
}

/**
 * Free-form chip input — antd `Select mode="tags"` (MAPPING §3.1 tags branch).
 * The form field holds `string[]`; the Tokenizer works on `SearchableItem[]`
 * (`{id, label}`), so the shapes are translated here.
 *
 * PILOT-DECISION: antd `Select mode="tags"` → Astryx `Tokenizer` with
 * `hasCreate` over an empty search source (there are no suggestions to
 * search). `tokenSeparators` (comma/space splitting one paste into several
 * tags) has no Tokenizer equivalent and is dropped — tags are committed one at
 * a time with Enter. `allowClear` → `hasClear`; `maxTagCount` (how many chips
 * render before a "+N" collapse) is dropped — Tokenizer owns that through
 * `tokenOverflowBehavior`. `notFoundContent` maps to nothing: the empty search
 * source simply yields no dropdown.
 */
export const AstryxFormTagsInput: React.FC<AstryxFormTagsInputProps> = ({
  value,
  onChange,
  label,
  placeholder,
  disabled,
  hasClear,
  maxEntries,
  tokenSeparators,
  width = '100%',
  ...rest
}) => {
  'use memo';
  const statusProps = useFormControlStatusProps();
  const splitOnSeparators = (label: string): Array<string> => {
    if (!tokenSeparators?.length) return [label];
    const pattern = new RegExp(
      tokenSeparators.map((s) => _.escapeRegExp(s)).join('|'),
    );
    return label
      .split(pattern)
      .map((part) => part.trim())
      .filter(Boolean);
  };
  return (
    <Tokenizer
      value={(value ?? []).map((tag) => ({ id: tag, label: tag }))}
      onChange={(items) =>
        // antd tags mode deduplicated entries; keep that behavior.
        onChange?.(
          Array.from(
            new Set(items.flatMap((item) => splitOnSeparators(item.label))),
          ).filter(Boolean),
        )
      }
      label={label}
      isLabelHidden
      searchSource={EMPTY_TAG_SEARCH_SOURCE}
      hasCreate
      hasClear={hasClear}
      maxEntries={maxEntries}
      placeholder={placeholder}
      isDisabled={disabled}
      width={width}
      {...statusProps}
      {...(rest as object)}
    />
  );
};
