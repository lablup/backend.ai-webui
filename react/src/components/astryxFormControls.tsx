/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 PILOT (cn-oss-removal / ticket 10) — adapters that let Astryx form controls sit
 inside an antd `Form.Item` (the engine we keep, per ticket 08).

 THREE deltas make raw Astryx controls unusable as direct `Form.Item` children.
 Each one bit during the pilot; each is a codemod / lint-rule candidate:

 1. `value` is REQUIRED and typed non-nullable on every Astryx control
    (`TextInput.value: string`, `Switch.value: boolean`, `RadioList.value:
    string`). antd's `Form.Item` clones its child with `value={undefined}`
    until the field is first touched, which makes React flip the input from
    uncontrolled to controlled and log a warning. The adapters coalesce.

 2. `label` is REQUIRED on every Astryx control and is rendered by the control
    itself. `BAIFormItem` already renders the label. Passing both double-renders
    it; omitting it fails typecheck and drops the accessible name. Every control
    therefore needs `label={<same string>} isLabelHidden`.

 3. `onChange` receives the VALUE, not the event. antd's default
    `getValueFromEvent` reads `e.target.value`, so it happens to work for the
    string case by accident — but not for `Switch` (boolean) and not for any
    control whose second argument matters. The adapters normalise explicitly
    rather than relying on that accident.
*/
import { RadioList, RadioListItem } from '@astryxdesign/core/RadioList';
import { Switch } from '@astryxdesign/core/Switch';
import { TextInput } from '@astryxdesign/core/TextInput';
import React from 'react';

export interface AstryxFormTextInputProps {
  /** Injected by `Form.Item`. */
  value?: string;
  /** Injected by `Form.Item`. */
  onChange?: (value: string) => void;
  /** Accessible name. Visually hidden — `BAIFormItem` renders the visible one. */
  label: string;
  placeholder?: string;
  disabled?: boolean;
}

export const AstryxFormTextInput: React.FC<AstryxFormTextInputProps> = ({
  value,
  onChange,
  label,
  placeholder,
  disabled,
}) => {
  'use memo';
  return (
    <TextInput
      value={value ?? ''}
      onChange={(next) => onChange?.(next)}
      label={label}
      isLabelHidden
      placeholder={placeholder}
      isDisabled={disabled}
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
