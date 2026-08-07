/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Adapters that let Astryx form controls sit inside an antd `Form.Item` /
 `BAIFormItem` (the antd form ENGINE we keep, per MIGRATION-SPEC §0; visuals
 come from BAIFormItem). Ported from the pilot (cn-oss-removal ticket 10) and
 extended by the page-group tickets (16/17: TextInput/Switch/RadioList/
 Selector; 19: password/startIcon TextInput, NumberInput, Checkbox, hasClear
 Selector).

 THREE deltas make raw Astryx controls unusable as direct `Form.Item`
 children (pilot patterns P3/P4; each is a codemod / lint-rule candidate):

 1. `value` is REQUIRED and typed non-nullable on most Astryx controls.
    antd's `Form.Item` clones its child with `value={undefined}` until the
    field is first touched, which flips the input from uncontrolled to
    controlled and logs a warning. The adapters coalesce.

 2. `label` is REQUIRED on every Astryx control and rendered by the control
    itself. `BAIFormItem` already renders the visible label, so the adapters
    pass `label={sameString} isLabelHidden` to keep the accessible name
    without double-rendering.

 3. `onChange` receives the VALUE, not the event. antd's default
    `getValueFromEvent` happens to pass a non-event first argument through
    unchanged, but the adapters normalise explicitly instead of relying on
    that accident (and it does NOT hold for booleans read via
    `e.target.checked`).
*/
import { CheckboxInput } from '@astryxdesign/core/CheckboxInput';
import { NumberInput } from '@astryxdesign/core/NumberInput';
import { RadioList, RadioListItem } from '@astryxdesign/core/RadioList';
import type { SelectorOptionType } from '@astryxdesign/core/Selector';
import { Selector } from '@astryxdesign/core/Selector';
import { Switch } from '@astryxdesign/core/Switch';
import type { TextInputProps } from '@astryxdesign/core/TextInput';
import { TextInput } from '@astryxdesign/core/TextInput';
import React from 'react';

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
  allowClear?: boolean;
  /** antd `prefix` icon -> Astryx `startIcon` (icon component, not element). */
  startIcon?: TextInputProps['startIcon'];
  /** Astryx `TextInput.hasAutoFocus` passthrough (inline edit flows). */
  hasAutoFocus?: boolean;
}

export const AstryxFormTextInput: React.FC<AstryxFormTextInputProps> = ({
  value,
  onChange,
  label,
  type = 'text',
  placeholder,
  disabled,
  allowClear,
  startIcon,
  hasAutoFocus,
}) => {
  'use memo';
  return (
    <TextInput
      type={type}
      value={value ?? ''}
      onChange={(next) => onChange?.(next)}
      label={label}
      isLabelHidden
      placeholder={placeholder}
      isDisabled={disabled}
      hasClear={allowClear}
      startIcon={startIcon}
      hasAutoFocus={hasAutoFocus}
      width="100%"
    />
  );
};

export interface AstryxFormSwitchProps {
  value?: boolean;
  onChange?: (value: boolean) => void;
  label: string;
  disabled?: boolean;
}

export const AstryxFormSwitch: React.FC<AstryxFormSwitchProps> = ({
  value,
  onChange,
  label,
  disabled,
}) => {
  'use memo';
  return (
    <Switch
      value={value ?? false}
      onChange={(next) => onChange?.(next)}
      label={label}
      isLabelHidden
      isDisabled={disabled}
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

export interface AstryxFormNumberInputProps {
  /** Injected by `Form.Item`. antd InputNumber values may arrive as strings. */
  value?: number | string | null;
  onChange?: (value: number | null) => void;
  label: string;
  min?: number;
  max?: number;
  step?: number;
  /** antd `suffix` (a unit string) → Astryx `units`. */
  units?: string;
  placeholder?: string;
  disabled?: boolean;
}

export const AstryxFormNumberInput: React.FC<AstryxFormNumberInputProps> = ({
  value,
  onChange,
  label,
  min,
  max,
  step,
  units,
  placeholder,
  disabled,
}) => {
  'use memo';
  const numericValue =
    value === undefined || value === null || value === ''
      ? null
      : Number(value);
  return (
    <NumberInput
      value={Number.isNaN(numericValue as number) ? null : numericValue}
      onChange={(next) => onChange?.(next)}
      label={label}
      isLabelHidden
      min={min}
      max={max}
      step={step}
      units={units || undefined}
      placeholder={placeholder}
      isDisabled={disabled}
      width="100%"
    />
  );
};

export interface AstryxFormCheckboxProps {
  /** Injected by `Form.Item` (default `valuePropName`, i.e. `value`). */
  value?: boolean;
  onChange?: (value: boolean) => void;
  /** The visible checkbox label (antd `<Checkbox>{children}</Checkbox>`). */
  label: string;
  disabled?: boolean;
  /**
   * Side effect to run alongside the Form-injected `onChange` (e.g. clearing
   * a sibling field). The adapter owns the `onChange` slot, so the escape
   * hatch is explicit (same convention as AstryxFormRadioList).
   */
  onValueChange?: (value: boolean) => void;
}

export const AstryxFormCheckbox: React.FC<AstryxFormCheckboxProps> = ({
  value,
  onChange,
  label,
  disabled,
  onValueChange,
}) => {
  'use memo';
  return (
    <CheckboxInput
      value={value ?? false}
      onChange={(checked) => {
        onChange?.(checked);
        onValueChange?.(checked);
      }}
      label={label}
      isDisabled={disabled}
    />
  );
};

export interface AstryxFormSelectorProps {
  /** Injected by `Form.Item`. */
  value?: string;
  onChange?: (value: string | null) => void;
  /** Accessible name. Visually hidden — `BAIFormItem` renders the visible one. */
  label: string;
  options: SelectorOptionType[];
  placeholder?: string;
  disabled?: boolean;
  hasClear?: boolean;
  width?: number | string;
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
  width = '100%',
}) => {
  'use memo';
  // `hasClear` is a discriminated union on Selector (with it, value/onChange
  // become nullable) — branch instead of passing `boolean | undefined`.
  return hasClear ? (
    <Selector
      hasClear
      value={value ?? null}
      onChange={(next: string | null) => onChange?.(next)}
      label={label}
      isLabelHidden
      options={options}
      placeholder={placeholder}
      isDisabled={disabled}
      width={width}
    />
  ) : (
    <Selector
      value={value ?? undefined}
      onChange={(next: string) => onChange?.(next)}
      label={label}
      isLabelHidden
      options={options}
      placeholder={placeholder}
      isDisabled={disabled}
      width={width}
    />
  );
};
