/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 `BAICheckbox` on Astryx (to-astryx phase 3, wave 2 / ticket W2-D).

 antd `Checkbox` -> Astryx `CheckboxInput` (MAPPING §4):
 `checked` -> `value` (required, non-nullable), `onChange(e)` ->
 `onChange(checked, e)` (P3), `disabled` -> `isDisabled`, and the antd
 `children` label -> the required `label` string.

 PILOT-DECISION — **the wrapper's whole reason for existing becomes a native
 prop, and its CSS is deleted.** `BAICheckbox` existed because antd's
 `Checkbox` reads only `isFormItemInput` from `FormItemInputContext` and so
 leaves a field error visually unpainted; the wrapper re-read the status and
 painted `.ant-checkbox` / `.ant-checkbox-checked` itself from
 `BAICheckbox.css`. Astryx `CheckboxInput` has a first-class
 `status={{ type: 'error' }}`, so the context read stays (that part IS the
 substance — nothing else knows the field errored) but the hand-painting goes,
 and `BAICheckbox.css` is deleted rather than left compiling against selectors
 Astryx never emits (P6).

 PILOT-DECISION — **the form binding still works, and it was checked, not
 assumed.** Both live call sites sit inside `Form.Item valuePropName="checked"`
 (PARKED antd form engine). That injects `checked={value}` — accepted here and
 mapped onto Astryx's `value` — and reads the new value back through
 rc-field-form's `defaultGetValueFromEvent`, which returns the first argument
 verbatim when it is not an event-like object. Astryx's `onChange(checked, e)`
 passes a boolean first, so the field stores the boolean.

 PILOT-DECISION — **an unlabelled checkbox falls back to a generic accessible
 name.** Astryx requires `label`; the two live call sites are permission-matrix
 cells with no inline label (their meaning comes from the row and column
 headers), so they land on the translated `general.Select` with
 `isLabelHidden`. Same policy as `BAIButton`'s icon-only fallback: visible to
 an audit rather than silently empty, and the real per-cell copy is queued
 (P8), not guessed here.
*/
import { FormItemInputContext } from '../form-engine';
import { nodeToAccessibleLabel } from '../helper/astryxLabel';
import { useBAIi18n } from '../hooks/useBAIi18n';
import { CheckboxInput } from '@astryxdesign/core/CheckboxInput';
import React, { use } from 'react';
import type { ChangeEvent, ReactNode } from 'react';

export interface BAICheckboxProps {
  /** antd's name; `Form.Item valuePropName="checked"` injects this. */
  checked?: boolean;
  /** antd's default `valuePropName`. */
  value?: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  /** antd rendered `children` as the inline label. */
  children?: ReactNode;
  /** Explicit accessible name, when there is no visible inline label. */
  label?: string;
  /** Hide the inline label but keep it as the accessible name. */
  isLabelHidden?: boolean;
  onChange?: (checked: boolean, e: ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  style?: React.CSSProperties;
  [key: `data-${string}`]: string | undefined;
}

const BAICheckbox: React.FC<BAICheckboxProps> = ({
  checked,
  value,
  indeterminate,
  disabled,
  children,
  label,
  isLabelHidden,
  onChange,
  ...restProps
}) => {
  'use memo';
  const { status } = use(FormItemInputContext);
  const { t } = useBAIi18n();

  const inlineLabel = label ?? nodeToAccessibleLabel(children);
  const hasInlineLabel = inlineLabel !== '';

  return (
    <CheckboxInput
      {...restProps}
      value={indeterminate ? 'indeterminate' : (value ?? checked ?? false)}
      label={hasInlineLabel ? inlineLabel : t('general.Select')}
      isLabelHidden={isLabelHidden ?? !hasInlineLabel}
      isDisabled={disabled}
      status={status === 'error' ? { type: 'error' } : undefined}
      onChange={onChange}
    />
  );
};

export default BAICheckbox;
