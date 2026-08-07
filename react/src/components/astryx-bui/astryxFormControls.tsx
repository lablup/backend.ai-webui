/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Astryx form-control adapters (to-astryx ticket 18, generalised from the
 cn-oss-removal pilot's `astryxFormControls.tsx`) — let Astryx controls sit
 inside the antd `Form.Item` / `BAIFormItem` state engine we keep (ticket 08).

 THREE deltas make raw Astryx controls unusable as direct `Form.Item`
 children (each one bit during the pilot):

 1. `value` is REQUIRED and typed non-nullable on most Astryx controls
    (`TextInput.value: string`, `Switch.value: boolean`). antd's `Form.Item`
    clones its child with `value={undefined}` until the field is first
    touched, which flips the input from uncontrolled to controlled and logs a
    React warning. The adapters coalesce.

 2. `label` is REQUIRED on every Astryx control and rendered by the control
    itself. `BAIFormItem` already renders the visible label, so every control
    needs `label={sameString} isLabelHidden` — omitting `label` fails
    typecheck and drops the accessible name (P2/P8).

 3. `onChange` receives the VALUE, not the event. antd's default
    `getValueFromEvent` reads `e.target.value` — for Astryx controls the
    first argument IS the value, so the engine keeps working, but the
    adapters normalise explicitly instead of relying on that accident (P3).

 The prop surfaces below were grepped from the deployment-area call sites
 (P1: never narrow from memory) and extended per consumer as pages migrate.
*/
import { CheckboxInput } from '@astryxdesign/core/CheckboxInput';
import { NumberInput } from '@astryxdesign/core/NumberInput';
import { Selector } from '@astryxdesign/core/Selector';
import { Switch } from '@astryxdesign/core/Switch';
import { TextArea } from '@astryxdesign/core/TextArea';
import { TextInput } from '@astryxdesign/core/TextInput';
import type { SizeValue } from '@astryxdesign/core/utils';
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
  hasClear?: boolean;
  hasAutoFocus?: boolean;
  width?: SizeValue;
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
  hasAutoFocus,
  width = '100%',
  onBlur,
  ...rest
}) => {
  'use memo';
  return (
    <TextInput
      value={value ?? ''}
      onChange={(next) => onChange?.(next)}
      label={label}
      isLabelHidden
      type={type}
      placeholder={placeholder}
      isDisabled={disabled}
      hasClear={hasClear}
      hasAutoFocus={hasAutoFocus}
      width={width}
      onBlur={onBlur}
      {...(rest as object)}
    />
  );
};

export interface AstryxFormTextAreaProps {
  value?: string;
  onChange?: (value: string) => void;
  label: string;
  placeholder?: string;
  disabled?: boolean;
  /** antd `Input.TextArea rows`. */
  rows?: number;
  width?: SizeValue;
  'data-testid'?: string;
}

export const AstryxFormTextArea: React.FC<AstryxFormTextAreaProps> = ({
  value,
  onChange,
  label,
  placeholder,
  disabled,
  rows,
  width = '100%',
  ...rest
}) => {
  'use memo';
  return (
    <TextArea
      value={value ?? ''}
      onChange={(next) => onChange?.(next)}
      label={label}
      isLabelHidden
      placeholder={placeholder}
      isDisabled={disabled}
      rows={rows}
      width={width}
      {...(rest as object)}
    />
  );
};

export interface AstryxFormNumberInputProps {
  /** Injected by `Form.Item`. antd `InputNumber` was nullable too. */
  value?: number | null;
  onChange?: (value: number | null) => void;
  label: string;
  placeholder?: string;
  disabled?: boolean;
  min?: number | null;
  max?: number | null;
  step?: number | null;
  /** antd `InputNumber suffix` unit strings land here (MAPPING §3.17). */
  units?: string | null;
  isIntegerOnly?: boolean;
  width?: SizeValue;
  'data-testid'?: string;
}

export const AstryxFormNumberInput: React.FC<AstryxFormNumberInputProps> = ({
  value,
  onChange,
  label,
  placeholder,
  disabled,
  min,
  max,
  step,
  units,
  isIntegerOnly,
  width = '100%',
  ...rest
}) => {
  'use memo';
  return (
    <NumberInput
      // `hasClear` gives the nullable `onChange(value | null)` overload,
      // matching antd `InputNumber`'s nullable model.
      hasClear
      value={value}
      onChange={(next) => onChange?.(next)}
      label={label}
      isLabelHidden
      placeholder={placeholder}
      isDisabled={disabled}
      min={min}
      max={max}
      step={step}
      units={units}
      isIntegerOnly={isIntegerOnly}
      width={width}
      {...(rest as object)}
    />
  );
};

export interface AstryxFormSelectorOption {
  value: string;
  label: string;
  description?: string;
  isDisabled?: boolean;
}

export interface AstryxFormSelectorProps {
  value?: string;
  onChange?: (value: string) => void;
  label: string;
  options: Array<AstryxFormSelectorOption>;
  placeholder?: string;
  disabled?: boolean;
  /** antd `showSearch`. */
  hasSearch?: boolean;
  isLoading?: boolean;
  width?: SizeValue;
  'data-testid'?: string;
}

/**
 * Static-options selector (MAPPING §3.1 "everything else" branch). Relay /
 * infinite-scroll selects are NOT this — they stay on the BUI frontier until
 * the ComplexSelector rebuild (tickets 26/27).
 */
export const AstryxFormSelector: React.FC<AstryxFormSelectorProps> = ({
  value,
  onChange,
  label,
  options,
  placeholder,
  disabled,
  hasSearch,
  isLoading,
  width = '100%',
  ...rest
}) => {
  'use memo';
  return (
    <Selector
      value={value}
      onChange={(next) => onChange?.(next)}
      label={label}
      isLabelHidden
      options={options}
      placeholder={placeholder}
      isDisabled={disabled}
      hasSearch={hasSearch}
      isLoading={isLoading}
      width={width}
      {...(rest as object)}
    />
  );
};

export interface AstryxFormSwitchProps {
  /** Injected by `Form.Item valuePropName="checked"` or default `value`. */
  value?: boolean;
  checked?: boolean;
  onChange?: (value: boolean) => void;
  label: string;
  disabled?: boolean;
  'data-testid'?: string;
}

export const AstryxFormSwitch: React.FC<AstryxFormSwitchProps> = ({
  value,
  checked,
  onChange,
  label,
  disabled,
  ...rest
}) => {
  'use memo';
  return (
    <Switch
      value={value ?? checked ?? false}
      onChange={(next) => onChange?.(next)}
      label={label}
      isLabelHidden
      isDisabled={disabled}
      {...(rest as object)}
    />
  );
};

export interface AstryxFormCheckboxProps {
  /** Injected by `Form.Item valuePropName="checked"` or default `value`. */
  value?: boolean;
  checked?: boolean;
  onChange?: (value: boolean) => void;
  /** Rendered BY the checkbox (unlike the other adapters): antd `Checkbox`
   *  renders its children label inline, and the area call sites keep that. */
  label: string;
  disabled?: boolean;
  isLabelHidden?: boolean;
  'data-testid'?: string;
}

export const AstryxFormCheckbox: React.FC<AstryxFormCheckboxProps> = ({
  value,
  checked,
  onChange,
  label,
  disabled,
  isLabelHidden,
  ...rest
}) => {
  'use memo';
  return (
    <CheckboxInput
      value={value ?? checked ?? false}
      onChange={(next) => onChange?.(next)}
      label={label}
      isLabelHidden={isLabelHidden}
      isDisabled={disabled}
      {...(rest as object)}
    />
  );
};
