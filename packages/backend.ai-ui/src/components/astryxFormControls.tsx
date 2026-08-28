/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 BUI-side Astryx form-control adapters (to-astryx phase 3, wave 2 / W2-D).

 The host app has had these since ticket 10
 (`react/src/components/astryxFormControls.tsx`); this is the BUI counterpart,
 deliberately the same shape so the two stay recognisable as one pattern. BUI
 cannot import the host module — it is a published package — and duplicating
 a handful of thin adapters is far cheaper than fixing Astryx's three universal
 contracts at every call site (SKILL.md: "Normalise at a wrapper or adapter,
 never at 187 call sites").

 What each adapter reconciles, per contract:

 1. **`label` is a required string the control renders itself.** Every control
    here sits inside a `Form.Item` / `BAIFormItem` that ALREADY prints the
    label, so each passes `isLabelHidden` — otherwise the label renders twice.
 2. **`onChange` takes the VALUE, not the event.** antd's `Form.Item` injects
    `onChange` and reads the new value back through rc-field-form's
    `defaultGetValueFromEvent`, which returns the first argument verbatim when
    it is not an event-like object — so passing Astryx's value straight through
    is correct, and is what these adapters do.
 3. **`value` is required and non-nullable on text controls.** A field that has
    never been touched arrives as `undefined`, hence `value ?? ''`.

 The form ENGINE is the self-hosted one (`../form-engine`, ticket 35) — an
 antd-identical API, which is why the reconciliations above still read against
 antd's semantics. These adapters are only the control layer.
*/
import { CheckboxInput } from '@astryxdesign/core/CheckboxInput';
import { NumberInput } from '@astryxdesign/core/NumberInput';
import { Switch } from '@astryxdesign/core/Switch';
import { TextArea } from '@astryxdesign/core/TextArea';
import { TextInput } from '@astryxdesign/core/TextInput';
import type { SizeValue } from '@astryxdesign/core/utils';
import React from 'react';
import type { CSSProperties } from 'react';

export interface AstryxFormTextInputProps {
  /** Injected by `Form.Item`. */
  value?: string;
  /** Injected by `Form.Item`. */
  onChange?: (value: string) => void;
  /** Accessible name. Visually hidden — the `Form.Item` renders the visible one. */
  label: string;
  type?: 'text' | 'password' | 'email';
  placeholder?: string;
  disabled?: boolean;
  hasAutoFocus?: boolean;
  hasClear?: boolean;
  status?: 'error' | 'warning' | '';
  width?: SizeValue;
  style?: CSSProperties;
  [key: `data-${string}`]: string | undefined;
}

export const AstryxFormTextInput: React.FC<AstryxFormTextInputProps> = ({
  value,
  onChange,
  label,
  type,
  placeholder,
  disabled,
  hasAutoFocus,
  hasClear,
  status,
  width = '100%',
  ...rest
}) => {
  'use memo';
  return (
    <TextInput
      {...(rest as object)}
      type={type}
      value={value ?? ''}
      onChange={(next) => onChange?.(next)}
      label={label}
      isLabelHidden
      placeholder={placeholder}
      isDisabled={disabled}
      hasAutoFocus={hasAutoFocus}
      hasClear={hasClear}
      status={
        status === 'error' || status === 'warning'
          ? { type: status }
          : undefined
      }
      width={width}
    />
  );
};

export interface AstryxFormTextAreaProps {
  value?: string;
  onChange?: (value: string) => void;
  label: string;
  /** antd `Input.TextArea rows`. */
  rows?: number;
  placeholder?: string;
  disabled?: boolean;
  width?: SizeValue;
  [key: `data-${string}`]: string | undefined;
}

export const AstryxFormTextArea: React.FC<AstryxFormTextAreaProps> = ({
  value,
  onChange,
  label,
  rows,
  placeholder,
  disabled,
  width = '100%',
  ...rest
}) => {
  'use memo';
  return (
    <TextArea
      {...(rest as object)}
      value={value ?? ''}
      onChange={(next) => onChange?.(next)}
      label={label}
      isLabelHidden
      rows={rows}
      placeholder={placeholder}
      isDisabled={disabled}
      width={width}
    />
  );
};

/**
 * Mirrors the host adapter of the same name
 * (`react/src/components/astryxFormControls.tsx`) — see the file header for why
 * the two exist side by side. Kept to the surface BUI actually needs: no
 * `isLoading` / `onValueChange` until a BUI call site wants them.
 */
export interface AstryxFormSwitchProps {
  /** Injected by `Form.Item` (default `valuePropName`, i.e. `value`). */
  value?: boolean;
  /** Injected by `Form.Item valuePropName="checked"`. */
  checked?: boolean;
  onChange?: (value: boolean) => void;
  label: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
  [key: `data-${string}`]: string | undefined;
}

export const AstryxFormSwitch: React.FC<AstryxFormSwitchProps> = ({
  value,
  checked,
  onChange,
  label,
  disabled,
  size,
  ...rest
}) => {
  'use memo';
  return (
    <Switch
      {...(rest as object)}
      // Contract 3 again, in boolean form: an untouched `valuePropName="checked"`
      // field arrives as `undefined`, and Astryx's `Switch.value` is required.
      value={value ?? checked ?? false}
      onChange={(next) => onChange?.(next)}
      label={label}
      isLabelHidden
      isDisabled={disabled}
      size={size}
    />
  );
};

/**
 * Mirrors the host adapter of the same name
 * (`react/src/components/astryxFormControls.tsx`), minus its `onValueChange`
 * escape hatch — no BUI call site needs one yet.
 */
export interface AstryxFormCheckboxProps {
  /** Injected by `Form.Item` (default `valuePropName`, i.e. `value`). */
  value?: boolean;
  /** Injected by `Form.Item valuePropName="checked"`. */
  checked?: boolean;
  onChange?: (value: boolean) => void;
  label: string;
  /** Opt out of the inline label when the `Form.Item` already renders one. */
  isLabelHidden?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md';
  [key: `data-${string}`]: string | undefined;
}

export const AstryxFormCheckbox: React.FC<AstryxFormCheckboxProps> = ({
  value,
  checked,
  onChange,
  label,
  isLabelHidden,
  disabled,
  size,
  ...rest
}) => {
  'use memo';
  return (
    <CheckboxInput
      {...(rest as object)}
      // Contract 3 in boolean form, as in `AstryxFormSwitch`.
      value={value ?? checked ?? false}
      onChange={(next) => onChange?.(next)}
      label={label}
      isLabelHidden={isLabelHidden}
      isDisabled={disabled}
      size={size}
    />
  );
};

export interface AstryxFormNumberInputProps {
  value?: number | null;
  onChange?: (value: number | null) => void;
  label: string;
  min?: number;
  max?: number;
  step?: number;
  /**
   * antd `InputNumber suffix` — a unit string. MAPPING §3.17 calls Astryx's
   * `units` "genuinely better than antd's suffix slot", so a non-string suffix
   * is not accepted here.
   */
  units?: string;
  placeholder?: string;
  disabled?: boolean;
  width?: SizeValue;
  [key: `data-${string}`]: string | undefined;
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
  width = '100%',
  ...rest
}) => {
  'use memo';
  return (
    <NumberInput
      {...(rest as object)}
      value={value ?? null}
      onChange={(next) => onChange?.(next)}
      label={label}
      isLabelHidden
      min={min}
      max={max}
      step={step}
      units={units}
      placeholder={placeholder}
      isDisabled={disabled}
      width={width}
    />
  );
};
