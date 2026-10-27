/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 BAIComplexSelect — the BUI adapter over ui-common's `PagedSelector`, which
 is this component's former body, moved to ui-common in 0.2.0-alpha.14
 (ADR 0009, FR-4098). The adapter keeps the frozen antd-shaped surface the
 Relay `*Select` wrappers are written against: a `{ label, value }`
 (`labelInValue`) value, `multiple`, `allowClear`, `endReached`, … and maps
 it onto PagedSelector's props (`component-props-extension.md`).
*/
import './BAIComplexSelect.css';
import {
  PagedSelector,
  type PagedSelectorOption,
  type PagedSelectorSingleProps,
} from '@lablup/ui-common/components/PagedSelector';
import React from 'react';

/** antd `labelInValue` shape. */
export interface BAILabeledValue {
  label: string;
  value: string;
}

export type BAIComplexSelectValue =
  BAILabeledValue | Array<BAILabeledValue> | null;

/** How the trigger renders a `multiple` selection. */
export type BAIComplexSelectTriggerDisplay = 'labels' | 'badges';

export interface BAIComplexSelectOption {
  value: string;
  /** The trigger text and the row's accessible name. */
  label: string;
  /** Drawn in the row in place of `label`. */
  labelContent?: React.ReactNode;
  /** Leading visual (avatar, glyph). */
  icon?: React.ReactNode;
  /** Secondary line under the label. */
  description?: React.ReactNode;
  /** Trailing content (tokens, meta). */
  extra?: React.ReactNode;
  disabled?: boolean;
}

/** PagedSelector props this adapter renames or owns. */
type OwnedPagedSelectorKey =
  | 'isMultiple'
  | 'value'
  | 'onChange'
  | 'options'
  | 'labels'
  | 'onSearchChange'
  | 'hasClear'
  | 'onEndReached'
  | 'endReachedThreshold'
  | 'onAtEndChange'
  | 'isLoadingMore'
  | 'totalCount'
  | 'emptyText'
  | 'maxTriggerItems'
  | 'selectionIndicator'
  | 'triggerDisplay';

export interface BAIComplexSelectProps extends Omit<
  PagedSelectorSingleProps,
  OwnedPagedSelectorKey
> {
  /** `labelInValue`-shaped. Array iff `multiple`. */
  value?: BAIComplexSelectValue;
  onChange?: (value: BAIComplexSelectValue) => void;
  options?: Array<BAIComplexSelectOption>;
  multiple?: boolean;
  /** Fires on every keystroke; debounce upstream. */
  onSearch?: (value: string) => void;
  /** Fired once each time the list is scrolled to within `atBottomThreshold` px of its end. */
  endReached?: () => void;
  atBottomThreshold?: number;
  atBottomStateChange?: (atBottom: boolean) => void;
  /** Spinner next to the count while the next page is in flight. */
  isLoadingNext?: boolean;
  /** Total row count from the connection — renders the "Total N items" foot. */
  total?: number;
  /** Replaces the empty list's content, the loading row included. */
  emptyContent?: React.ReactNode;
  triggerDisplay?: BAIComplexSelectTriggerDisplay;
  maxTriggerTokens?: number;
  allowClear?: boolean;
  selectionMark?: 'check' | 'checkbox';
}

const toArray = (value: BAIComplexSelectValue | undefined) =>
  value == null ? [] : Array.isArray(value) ? value : [value];

const toPagedOption = (option: BAIComplexSelectOption): PagedSelectorOption => {
  const { extra, disabled, ...rest } = option;
  return { ...rest, endContent: extra, isDisabled: disabled };
};

const BAIComplexSelect: React.FC<BAIComplexSelectProps> = ({
  value,
  onChange,
  options = [],
  multiple = false,
  onSearch,
  endReached,
  atBottomThreshold,
  atBottomStateChange,
  isLoadingNext,
  total,
  emptyContent,
  triggerDisplay,
  maxTriggerTokens,
  allowClear = false,
  selectionMark,
  width = '100%',
  ...pagedSelectorProps
}) => {
  'use memo';
  const selected = toArray(value);
  const shared = {
    ...pagedSelectorProps,
    width,
    options: options.map(toPagedOption),
    labels: Object.fromEntries(
      selected.map((item) => [item.value, item.label]),
    ),
    onSearchChange: onSearch,
    hasClear: allowClear,
    onEndReached: endReached,
    endReachedThreshold: atBottomThreshold,
    onAtEndChange: atBottomStateChange,
    isLoadingMore: isLoadingNext,
    totalCount: total,
    emptyText: emptyContent,
    triggerDisplay,
    maxTriggerItems: maxTriggerTokens,
    selectionIndicator: selectionMark,
  };

  return multiple ? (
    <PagedSelector
      {...shared}
      isMultiple
      value={selected.map((item) => item.value)}
      onChange={(_values, items) => onChange?.(items)}
    />
  ) : (
    <PagedSelector
      {...shared}
      value={selected[0]?.value ?? null}
      onChange={(_value, item) => onChange?.(item)}
    />
  );
};

export default BAIComplexSelect;
