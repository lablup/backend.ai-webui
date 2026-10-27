/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 `BAICheckbox` keeps antd's `Checkbox` surface (`checked`, `children` as the
 inline label, `disabled`) over ui-common's `CheckboxInput`, which reads the
 enclosing `Form.Item`'s status itself.

 PILOT-DECISION — an unlabelled checkbox (a permission-matrix cell) falls back
 to the translated `general.Select` as its `aria-label`, as `BAIButton`'s
 icon-only fallback does.
*/
import { nodeToAccessibleLabel } from '../helper/astryxLabel';
import { useBAIi18n } from '../hooks/useBAIi18n';
import { CheckboxInput } from '@lablup/ui-common/CheckboxInput';
import React from 'react';
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
  /** Box size; `sm` for dense grids. */
  size?: 'sm' | 'md';
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
  const { t } = useBAIi18n();

  const inlineLabel = label ?? nodeToAccessibleLabel(children);
  const hasInlineLabel = inlineLabel !== '';
  const hideLabel = isLabelHidden ?? !hasInlineLabel;

  return (
    <CheckboxInput
      {...restProps}
      value={indeterminate ? 'indeterminate' : (value ?? checked ?? false)}
      aria-label={
        hideLabel
          ? hasInlineLabel
            ? inlineLabel
            : t('general.Select')
          : undefined
      }
      disabled={disabled}
      onChange={onChange}
    >
      {hideLabel ? undefined : inlineLabel}
    </CheckboxInput>
  );
};

export default BAICheckbox;
