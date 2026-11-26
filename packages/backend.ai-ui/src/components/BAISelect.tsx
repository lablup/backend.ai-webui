/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 ui-common `Selector` under the BAI name (ADR 0042): its props are
 `SelectorProps` plus `ghost` and `autoSelectOption`. The wrapper sets the
 project defaults only — search on, the translated search placeholder, and an
 accessible name when neither `aria-label` nor the enclosing Form.Item gives one.
 This file is the only one in `backend.ai-ui` that imports ui-common `Selector`.
*/
import { FormItemInputContext } from '../form-engine';
import { useBAIi18n } from '../hooks/useBAIi18n';
import './BAISelect.css';
import {
  Selector,
  type SelectorOptionType,
  type SelectorProps,
} from '@lablup/ui-common/Selector';
import classNames from 'classnames';
import React from 'react';

/** `SelectorProps`' clearable branch, so one interface covers both and can be extended. */
type SelectorClearableProps<T extends SelectorOptionType> = Extract<
  SelectorProps<T>,
  { hasClear: true }
>;

export interface BAISelectProps<
  T extends SelectorOptionType = SelectorOptionType,
> extends Omit<SelectorClearableProps<T>, 'hasClear'> {
  hasClear?: boolean;
  /** The on-dark treatment of the select on the header's brand band. */
  ghost?: boolean;
  /**
   * While no value is set, select the first option and report it through
   * `onChange`, so the enclosing Form.Item or the parent state receives it.
   */
  autoSelectOption?: boolean;
}

/** The first selectable value, sections included and dividers skipped. */
const firstOptionValue = (
  options: ReadonlyArray<SelectorOptionType>,
): string | undefined => {
  for (const option of options) {
    if (typeof option === 'string') return option;
    if ('type' in option && option.type === 'divider') continue;
    if ('type' in option && option.type === 'section') {
      const value = firstOptionValue(option.options);
      if (value !== undefined) return value;
      continue;
    }
    if ('value' in option) return option.value;
  }
  return undefined;
};

function BAISelect<T extends SelectorOptionType = SelectorOptionType>({
  ghost,
  autoSelectOption,
  ...selectorProps
}: BAISelectProps<T>): React.ReactElement {
  'use memo';
  const { t } = useBAIi18n();
  const formItemLabel =
    React.useContext(FormItemInputContext).label || undefined;
  const { value, defaultValue, placeholder, controlClassName } = selectorProps;
  const ariaLabel = selectorProps['aria-label']?.trim()
    ? selectorProps['aria-label']
    : undefined;

  const autoSelectedValue =
    autoSelectOption &&
    (value === undefined || value === null || value === '') &&
    (defaultValue === undefined || defaultValue === null)
      ? firstOptionValue(selectorProps.options)
      : undefined;
  const emitAutoSelection = React.useEffectEvent(() => {
    if (autoSelectedValue === undefined) return;
    selectorProps.onChange?.(autoSelectedValue);
  });
  React.useLayoutEffect(() => {
    emitAutoSelection();
  }, [autoSelectedValue]);

  const props = {
    hasSearch: true,
    searchPlaceholder: t('general.Search'),
    ...selectorProps,
    ...(autoSelectedValue !== undefined && { value: autoSelectedValue }),
    // `Selector` shows its clear button for `''` too, which call sites use as "none".
    ...(selectorProps.hasClear && value === '' && { hasClear: false }),
    'aria-label':
      ariaLabel ??
      (formItemLabel ? undefined : placeholder || t('general.Select')),
    controlClassName: classNames(
      'bai-select',
      ghost && 'bai-select-ghost',
      controlClassName,
    ),
  } as unknown as SelectorProps<T>;
  return <Selector {...props} />;
}

export default BAISelect;
