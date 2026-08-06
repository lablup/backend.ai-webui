/**
 * SPIKE — Astryx select architecture probe (cn-oss-removal ticket 12).
 * NOT FOR PRODUCTION.
 *
 * The "BAISelect as adapter chokepoint" thesis, built for real: take antd
 * `SelectProps` in, dispatch to one of Astryx's four select components, so
 * the repo's 22 `*Select` wrappers survive unchanged.
 *
 * It compiles and it works for the easy majority. The parts that *cannot*
 * work are marked `UNSHIMMABLE` inline — each one is a place where the shim
 * either silently drops behaviour or has to throw. Those markers are the
 * actual deliverable of this file.
 */
import { MultiSelector } from '@astryxdesign/core/MultiSelector';
import { Selector } from '@astryxdesign/core/Selector';
import type {
  SelectorOptionData,
  SelectorOptionType,
} from '@astryxdesign/core/Selector';
import { Tokenizer } from '@astryxdesign/core/Tokenizer';
import type {
  SearchSource,
  SearchableItem,
} from '@astryxdesign/core/Typeahead';
import type { SelectProps } from 'antd';
import type { DefaultOptionType } from 'antd/es/select';
import * as _ from 'lodash-es';
import React from 'react';

export interface BAISelectAstryxShimProps extends Omit<
  SelectProps,
  'onChange'
> {
  /** Astryx requires an accessible label on every select. antd does not. */
  label: string;
  onChange?: SelectProps['onChange'];
  /**
   * Only needed when `showSearch` is server-driven (`filterOption={false}` +
   * `onSearch`). See UNSHIMMABLE-2.
   */
  searchSource?: SearchSource<SearchableItem>;
}

/** antd option label is `ReactNode`; Astryx demands `string`. */
const labelToString = (label: React.ReactNode): string => {
  if (_.isString(label)) return label;
  if (_.isNumber(label)) return String(label);
  // UNSHIMMABLE-6: a ReactNode label (used by `optionRender` / `labelRender`
  // call sites, 18 in the repo) has no string projection. Astryx needs the
  // string for the trigger text, the typeahead edit-mode buffer, and the
  // screen-reader announcement. Best effort only.
  return '';
};

/** Flatten sections/dividers back to a lookup list of selectable options. */
const flattenOptions = (options: SelectorOptionType[]): SelectorOptionData[] =>
  options.flatMap((o): SelectorOptionData[] => {
    if (_.isString(o)) return [{ value: o, label: o }];
    if ('type' in o && o.type === 'section') return o.options;
    if ('type' in o && o.type === 'divider') return [];
    return [o as SelectorOptionData];
  });

/**
 * antd `options` (incl. one level of `OptGroup` via `{label, options}`) →
 * Astryx `SelectorOptionType[]`.
 *
 * SHIMMABLE. Contrary to the initial coverage read, Astryx *does* have an
 * OptGroup equivalent: `{ type: 'section', title, options }`, plus
 * `{ type: 'divider' }` which antd has no equivalent for.
 */
export const toAstryxOptions = (
  options: SelectProps['options'],
): SelectorOptionType[] =>
  _.map(options ?? [], (o: DefaultOptionType): SelectorOptionType => {
    if (_.isArray(o.options)) {
      const children: SelectorOptionData[] = (
        o.options as DefaultOptionType[]
      ).map((child) => ({
        value: String(child.value),
        label: labelToString(child.label),
        disabled: child.disabled,
      }));
      return {
        type: 'section',
        title: labelToString(o.label),
        options: children,
      };
    }
    return {
      value: String(o.value),
      label: labelToString(o.label),
      disabled: o.disabled,
    };
  });

/**
 * The dispatcher. antd's `mode` + `showSearch` shape decides which of the
 * four Astryx components is instantiated.
 */
export const BAISelectAstryxShim: React.FC<BAISelectAstryxShimProps> = ({
  label,
  mode,
  options,
  value,
  onChange,
  placeholder,
  disabled,
  loading,
  allowClear,
  showSearch,
  labelInValue,
  optionRender,
  searchSource,
  status,
  maxCount,
  ...rest
}) => {
  'use memo';
  const astryxOptions = toAstryxOptions(options);
  const hasSearch = showSearch !== false && showSearch !== undefined;

  // UNSHIMMABLE-1 — server-driven search on a non-typeahead select.
  // `Selector` / `MultiSelector` expose `hasSearch` (a *client-side* filter
  // over `options`) but no `onSearch`, no `searchValue`, no `filterOption`.
  // The repo's 37 `onSearch` + 30 `filterOption` sites that pass
  // `filterOption={false}` are doing server-side search; that shape only
  // exists on `Typeahead` / `Tokenizer`, which take a `searchSource`
  // instead of `options` — a different component, not a different prop.
  const isServerSearch =
    hasSearch && _.isObject(showSearch) && 'onSearch' in showSearch;

  const renderOption = optionRender
    ? (o: SelectorOptionData) =>
        optionRender(
          { label: o.label, value: o.value } as never,
          { index: 0 } as never,
        )
    : undefined;

  if (mode === 'tags') {
    if (!searchSource) {
      // UNSHIMMABLE-2: `Tokenizer` has no `options` prop at all. A tags
      // select cannot be driven from a materialised option array; the caller
      // must supply a `SearchSource`. 19 `mode="tags"` sites need rewriting,
      // not adapting.
      throw new Error(
        'BAISelectAstryxShim: mode="tags" requires a `searchSource`; ' +
          'Astryx Tokenizer has no `options` prop.',
      );
    }
    const items = _.map(_.castArray(value ?? []), (v) => ({
      id: String(_.isObject(v) ? (v as { value: unknown }).value : v),
      label: String(_.isObject(v) ? (v as { label: unknown }).label : v),
    }));
    return (
      <Tokenizer<SearchableItem>
        label={label}
        searchSource={searchSource}
        value={items}
        onChange={(next) =>
          onChange?.(
            (labelInValue
              ? next.map((i) => ({ label: i.label, value: i.id }))
              : next.map((i) => i.id)) as never,
            next as never,
          )
        }
        hasCreate
        maxEntries={maxCount}
        isDisabled={disabled}
        placeholder={_.isString(placeholder) ? placeholder : undefined}
        hasClear={!!allowClear}
      />
    );
  }

  if (mode === 'multiple') {
    const values = _.map(_.castArray(value ?? []), (v) =>
      String(_.isObject(v) ? (v as { value: unknown }).value : v),
    );
    return (
      <MultiSelector
        label={label}
        options={astryxOptions}
        value={values}
        onChange={(next) => {
          // UNSHIMMABLE-3 (partial): `MultiSelector` returns `string[]`, so
          // to honour `labelInValue` the shim has to re-look-up each label in
          // `options`. That works only while every selected value is present
          // in the current option page — which is exactly false for the
          // paginated selects (a selection made on page 1 disappears from
          // `options` after `loadNext` replaces the page). Those call sites
          // must run a separate "resolve selected keys" query.
          const flat = flattenOptions(astryxOptions);
          const withLabels = next.map((v) => ({
            value: v,
            label: flat.find((o) => o.value === v)?.label ?? v,
          }));
          onChange?.(
            (labelInValue ? withLabels : next) as never,
            withLabels as never,
          );
        }}
        isDisabled={disabled}
        isLoading={loading}
        hasClear={!!allowClear}
        hasSearch={hasSearch && !isServerSearch}
        placeholder={_.isString(placeholder) ? placeholder : undefined}
        renderOption={renderOption}
        status={
          status === 'error'
            ? { type: 'error' }
            : status === 'warning'
              ? { type: 'warning' }
              : undefined
        }
        triggerDisplay="badges"
        maxBadges={3}
        {...(rest as object)}
      />
    );
  }

  // single
  const singleValue = _.isObject(value)
    ? String((value as { value: unknown }).value)
    : value === undefined || value === null
      ? null
      : String(value);

  return (
    <Selector
      label={label}
      options={astryxOptions}
      hasClear
      value={singleValue}
      onChange={(next) => {
        const opt = flattenOptions(astryxOptions).find((o) => o.value === next);
        onChange?.(
          (labelInValue
            ? { label: opt?.label ?? next, value: next }
            : next) as never,
          opt as never,
        );
      }}
      isDisabled={disabled}
      isLoading={loading}
      hasSearch={hasSearch && !isServerSearch}
      placeholder={_.isString(placeholder) ? placeholder : undefined}
      renderOption={renderOption}
      status={
        status === 'error'
          ? { type: 'error' }
          : status === 'warning'
            ? { type: 'warning' }
            : undefined
      }
      {...(rest as object)}
    />
  );
};

export default BAISelectAstryxShim;
