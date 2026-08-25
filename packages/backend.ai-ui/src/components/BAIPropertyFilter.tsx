/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 to-astryx TICKET 28 — `BAIPropertyFilter` rebuilt on Astryx `PowerSearch`,
 generalising the Data/VFolder pilot (ticket 16) to every consumer.

 ## The contract that must NOT move

 This component's `value` is a **Backend.AI queryfilter minilang string**
 (`name ilike "%foo%" & status == "READY"`) — see
 https://github.com/lablup/backend.ai/blob/main/src/ai/backend/manager/models/minilang/queryfilter.py
 It is simultaneously the GraphQL `filter` variable AND the page's URL state.
 Shared links therefore depend on this file being able to parse back exactly
 what it emitted, and on emitting exactly what the previous antd
 implementation emitted:

   - `` `${property} ${operator} ${value}` ``, values of `string` properties
     double-quoted, `boolean` properties bare;
   - `ilike` / `like` values wrapped in `%…%`;
   - conditions joined with `` ` & ` ``.

 `parseFilterString` / `serializeFilters` below are exact inverses, and the
 component derives its tokens from `value` on EVERY render — there is no local
 copy of the filter to drift.

 Two round-trip hazards are handled explicitly rather than approximated:

 1. **Unknown fields / operators.** A hand-written or older link can name a
    property that is not in `filterProperties`, or an operator this build does
    not offer (`>=`, `in`, …). Those are synthesised into the config from the
    inbound string instead of being dropped, so the token stays visible,
    removable and byte-identical on re-serialisation.
 2. **Asymmetric wildcards.** `ilike "%foo"` (suffix match) unwraps to `foo`
    for display; naively re-wrapping would emit `"%foo%"` and silently widen
    the query. `parseFilterString` records the original raw fragment per
    token so `serializeFilters` can re-emit it verbatim.

 ## PILOT-DECISIONs

 - `rule.validate` no longer BLOCKS a value — PowerSearch owns its editor, so
   there is no keystroke seam to reject on. Violations now surface as the
   component's `status` message instead (feedback kept, gate dropped).
 - `renderInput` controls stage their value and are committed by the popover's
   Apply button (see `BAIPowerSearchAdapters`).
 - The bespoke "reset filters" button is gone; PowerSearch ships `hasClear`.
*/
import { filterOutEmpty } from '../helper';
import { useControllableValue } from '../hooks';
import { useBAIi18n } from '../hooks/useBAIi18n';
import {
  toEnumItems,
  toSearchSource,
  useRenderInputEditors,
  type BAIPowerSearchChromeProps,
  type FilterPropertyOption,
  type FilterRenderInput,
} from './BAIPowerSearchAdapters';
import { PowerSearch } from '@astryxdesign/core/PowerSearch';
import type {
  OperatorValue,
  PowerSearchConfig,
  PowerSearchField,
  PowerSearchFilter,
} from '@astryxdesign/core/PowerSearch';
import dayjs from 'dayjs';
import type { TFunction } from 'i18next';
import * as _ from 'lodash-es';
import React, { useRef } from 'react';

export type { FilterPropertyOption } from './BAIPowerSearchAdapters';

export type FilterProperty = {
  key: string;
  defaultOperator?: string;
  propertyLabel: string;
  /**
   * Decides quoting and the operator menu. `number` values are emitted bare so
   * the DSL parses them as numbers; `datetime` and `uuid` stay quoted. `uuid`
   * offers equality only — a UUID column has no `ilike`.
   * TODO: support array.
   */
  type: 'string' | 'boolean' | 'number' | 'datetime' | 'uuid';
  options?: Array<FilterPropertyOption>;
  strictSelection?: boolean;
  /**
   * Advisory since ticket 28: a violating token is reported through the
   * control's error status instead of being refused at commit time.
   */
  rule?: {
    message: string;
    validate: (value: string) => boolean;
  };
  /**
   * Replaces the built-in value editor with a controlled control (e.g.
   * `BAIUserSelect`). Call `onAddCondition(value, label?)` to stage the value;
   * the popover's Apply button commits it. Pass the human-readable `label`
   * when the committed value is opaque (e.g. a UUID) so the token shows the
   * label while the raw value still serializes unchanged.
   */
  renderInput?: FilterRenderInput;
};

export interface BAIPropertyFilterProps extends BAIPowerSearchChromeProps {
  value?: string;
  onChange?: (value: string) => void;
  defaultValue?: string;
  filterProperties: Array<FilterProperty>;
  loading?: boolean;
}

const DEFAULT_OPERATOR_OF_TYPES = {
  string: 'ilike',
  boolean: '==',
  number: '==',
  datetime: '>=',
  uuid: '==',
} as const;

/** Operators offered per type. Enum-like fields use `ENUM_OPERATORS` instead. */
const OPERATORS_OF_TYPES: Record<FilterProperty['type'], Array<string>> = {
  string: ['ilike', '=='],
  boolean: ['==', '!='],
  number: ['==', '!=', '>', '>=', '<', '<='],
  datetime: ['>=', '<=', '==', '!='],
  uuid: ['==', '!='],
};

const ENUM_OPERATORS = ['==', '!='];

/** `number` and `boolean` values are bare in the DSL; everything else quoted. */
const shouldQuote = (type: FilterProperty['type']) =>
  type !== 'number' && type !== 'boolean';

const BOOLEAN_OPTIONS: Array<FilterPropertyOption> = [
  { label: 'True', value: 'true' },
  { label: 'False', value: 'false' },
];

/** Operators the wildcard convention applies to. */
const WILDCARD_OPERATORS = ['ilike', 'like'];

/**
 * DSL operator -> BUI catalog key. Operators outside this table (`>=`, `in`,
 * … — reachable only through a hand-written link) fall back to their own
 * symbol as the label, which is what the antd tag showed too.
 */
const OPERATOR_I18N_KEYS: Record<string, string> = {
  ilike: 'Contains',
  like: 'Contains',
  '==': 'Equals',
  '!=': 'NotEquals',
  '>': 'GreaterThan',
  '>=': 'GreaterThanOrEqual',
  '<': 'LessThan',
  '<=': 'LessThanOrEqual',
  in: 'In',
};

function trimFilterValue(filterValue: string): string {
  return filterValue.replace(/^%|%$/g, '');
}

export function mergeFilterValues(
  filterStrings: Array<string | undefined | null>,
  operator: string = '&',
) {
  const mergedFilter = _.join(
    _.map(filterOutEmpty(filterStrings), (str) => `(${str})`),
    operator,
  );
  return mergedFilter ? mergedFilter : undefined;
}

// Matches a single whitespace character. Applied per-character (never against
// the full input), so it is constant-time and cannot backtrack — it preserves
// the full `\s` semantics of the original split (including Unicode whitespace
// such as a non-breaking space) without the ReDoS risk of a quantified regex.
const WHITESPACE_CHAR = /\s/;

/**
 * Splits a string on runs of whitespace, but treats whitespace inside
 * double-quoted spans as literal. Consecutive whitespace is collapsed (empty
 * tokens are dropped). Whitespace is matched with the full `\s` class
 * (including Unicode whitespace), applied one character at a time so it runs
 * in linear time with no backtracking.
 */
function splitOutsideDoubleQuotes(input: string): string[] {
  const tokens: string[] = [];
  let current = '';
  let inQuotes = false;
  let hasToken = false;
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
      current += ch;
      hasToken = true;
    } else if (!inQuotes && WHITESPACE_CHAR.test(ch)) {
      if (hasToken) {
        tokens.push(current);
        current = '';
        hasToken = false;
      }
    } else {
      current += ch;
      hasToken = true;
    }
  }
  if (hasToken) {
    tokens.push(current);
  }
  return tokens;
}

/**
 * Parses `property operator value` into its three parts, dropping the value's
 * surrounding double quotes.
 */
export function parseFilterValue(filter: string) {
  const [property, operator, ...valueParts] = splitOutsideDoubleQuotes(filter);
  const value = valueParts.join(' ').replace(/^"|"$/g, '');
  return { property, operator, value };
}

/** Same split, but keeps whether the value arrived double-quoted. */
function parseFilterValueWithQuoting(filter: string) {
  const [property, operator, ...valueParts] = splitOutsideDoubleQuotes(filter);
  const raw = valueParts.join(' ');
  return {
    property,
    operator,
    value: raw.replace(/^"|"$/g, ''),
    wasQuoted: raw.startsWith('"') && raw.endsWith('"') && raw.length >= 2,
  };
}

/**
 * How one field serializes. Derived from `filterProperties` for configured
 * properties, and from the inbound string for anything else.
 */
interface FieldSpec {
  key: string;
  label: string;
  /** Picks the value editor. Synthesised fields are always `string`. */
  type: FilterProperty['type'];
  /** `number` and `boolean` values are bare; everything else double-quoted. */
  quote: boolean;
  isEnum: boolean;
  options?: Array<FilterPropertyOption>;
  strictSelection?: boolean;
  renderInput?: FilterRenderInput;
  operators: Array<string>;
  defaultOperator: string;
  rule?: FilterProperty['rule'];
  /** True when the field was invented from `value`, not declared by the page. */
  synthetic: boolean;
}

/** A field is enum-like when it constrains input to a fixed option list. */
const isEnumProperty = (property: FilterProperty) =>
  property.type === 'boolean' ||
  (!!property.options && !!property.strictSelection);

function specForProperty(property: FilterProperty): FieldSpec {
  const isEnum = isEnumProperty(property);
  const defaultOperator =
    property.defaultOperator ?? DEFAULT_OPERATOR_OF_TYPES[property.type];
  const operators = _.uniq([
    defaultOperator,
    ...(isEnum ? ENUM_OPERATORS : OPERATORS_OF_TYPES[property.type]),
  ]);
  return {
    key: property.key,
    label: property.propertyLabel,
    type: property.type,
    quote: shouldQuote(property.type),
    isEnum,
    options: property.type === 'boolean' ? BOOLEAN_OPTIONS : property.options,
    strictSelection:
      property.type === 'boolean' ? true : property.strictSelection,
    renderInput: property.renderInput,
    operators,
    defaultOperator,
    rule: property.rule,
    synthetic: false,
  };
}

/**
 * Builds the field table used for BOTH parsing and serialising: the declared
 * properties, widened by whatever the inbound `value` actually contains.
 * Widening (rather than dropping) is what keeps an old shared link editable
 * and byte-stable.
 */
export function buildFieldSpecs(
  filterProperties: Array<FilterProperty>,
  value: string | undefined,
): Array<FieldSpec> {
  const specs = _.map(filterProperties, specForProperty);
  if (!value) return specs;

  const byKey = _.keyBy(specs, 'key');
  _.forEach(_.split(value, '&'), (part) => {
    const trimmed = _.trim(part);
    if (!trimmed) return;
    const { property, operator, wasQuoted } =
      parseFilterValueWithQuoting(trimmed);
    if (!property || !operator) return;
    let spec = byKey[property];
    if (!spec) {
      spec = {
        key: property,
        label: property,
        type: 'string',
        quote: wasQuoted,
        isEnum: false,
        operators: [operator],
        defaultOperator: operator,
        synthetic: true,
      };
      byKey[property] = spec;
      specs.push(spec);
      return;
    }
    if (!_.includes(spec.operators, operator)) {
      spec.operators = [...spec.operators, operator];
    }
  });
  return specs;
}

const operatorLabel = (operator: string, t: TFunction): string => {
  const key = OPERATOR_I18N_KEYS[operator];
  return key
    ? t(`comp:BAIPropertyFilter.operator.${key}`, { defaultValue: operator })
    : operator;
};

function operatorValueForSpec(
  spec: FieldSpec,
  custom: OperatorValue | undefined,
): OperatorValue {
  if (custom) return custom;
  if (spec.isEnum || (spec.options && spec.strictSelection)) {
    return { type: 'enum', values: toEnumItems(spec.options) };
  }
  // Typed editors, so a `number`/`datetime` token cannot commit text the
  // backend's grammar rejects (mirrors `BAIGraphQLPropertyFilter`).
  if (spec.type === 'datetime') return { type: 'date_absolute' };
  if (spec.type === 'number') return { type: 'float' };
  const searchSource = toSearchSource(spec.options);
  return searchSource
    ? { type: 'string', searchSource, isArbitraryStringAllowed: true }
    : { type: 'string' };
}

/**
 * Field key that bare typed text is committed against. Mirrors the antd
 * filter, whose property `Select` started on the first entry.
 */
export function defaultContentSearchFieldKey(
  filterProperties: Array<FilterProperty>,
): string | undefined {
  return _.find(
    filterProperties,
    (property) =>
      property.type === 'string' &&
      !property.strictSelection &&
      !property.renderInput,
  )?.key;
}

/** Key under which a token's original raw (wildcards included) value is kept. */
const rawKey = (field: string, operator: string, value: string) =>
  `${field} ${operator} ${value}`;

export interface ParsedFilterString {
  filters: Array<PowerSearchFilter>;
  /** Original, still-wrapped value fragments, keyed by `rawKey`. */
  rawValues: Record<string, string>;
}

/**
 * Backend.AI filter DSL -> PowerSearch tokens. Exact inverse of
 * `serializeFilters` (given the same field specs).
 */
export function parseFilterString(
  value: string | undefined,
  specs: Array<FieldSpec>,
): ParsedFilterString {
  const rawValues: Record<string, string> = {};
  if (!value) return { filters: [], rawValues };
  const byKey = _.keyBy(specs, 'key');

  const filters = _.compact(
    _.map(_.split(value, '&'), (part) => {
      const trimmed = _.trim(part);
      if (!trimmed) return null;
      const {
        property,
        operator,
        value: rawValue,
      } = parseFilterValueWithQuoting(trimmed);
      const spec = byKey[property];
      if (!spec || !operator) return null;
      const display = _.includes(WILDCARD_OPERATORS, operator)
        ? trimFilterValue(rawValue)
        : rawValue;
      if (display === '') return null;
      const token = {
        field: property,
        operator,
        value: tokenValueForSpec(spec, display),
      } satisfies PowerSearchFilter;
      // Keyed by what `serializeFilters` will read back, not by the inbound
      // text: a `date_absolute` token round-trips through a unix stamp, so
      // only the normalised form can match an untouched token to its raw.
      rawValues[rawKey(property, operator, tokenValueToString(token))] =
        rawValue;
      return token;
    }),
  );
  return { filters, rawValues };
}

/** The token value shape the editor chosen by `operatorValueForSpec` expects. */
function tokenValueForSpec(
  spec: FieldSpec,
  display: string,
): PowerSearchFilter['value'] {
  if (spec.renderInput) return { type: 'custom', value: display };
  if (spec.isEnum) return { type: 'enum', value: display };
  if (spec.type === 'datetime') {
    const parsed = dayjs(display);
    return {
      type: 'date_absolute',
      unixSeconds: parsed.isValid() ? parsed.unix() : dayjs().unix(),
    };
  }
  if (spec.type === 'number') return { type: 'float', value: Number(display) };
  return { type: 'string', value: display };
}

/** Reads the display string out of any of the token value shapes we produce. */
function tokenValueToString(filter: PowerSearchFilter): string {
  const value = filter.value as {
    type: string;
    value?: unknown;
    unixSeconds?: number;
  };
  if (value?.type === 'date_absolute') {
    return dayjs.unix(value.unixSeconds ?? 0).toISOString();
  }
  if (_.isArray(value?.value)) return _.toString(_.first(value.value) ?? '');
  if (_.isNil(value?.value)) return '';
  return _.toString(value.value);
}

/**
 * PowerSearch tokens -> the Backend.AI filter DSL. `rawValues` (from the
 * parse of the current `value`) lets an untouched token re-emit its original
 * wildcard shape verbatim.
 */
export function serializeFilters(
  filters: ReadonlyArray<PowerSearchFilter>,
  specs: Array<FieldSpec>,
  rawValues: Record<string, string> = {},
): string | undefined {
  const byKey = _.keyBy(specs, 'key');
  const parts = _.compact(
    _.map(filters, (filter) => {
      const display = tokenValueToString(filter);
      if (display === '') return null;
      const spec = byKey[filter.field];
      const raw =
        rawValues[rawKey(filter.field, filter.operator, display)] ??
        (_.includes(WILDCARD_OPERATORS, filter.operator)
          ? `%${display}%`
          : display);
      const quote = spec ? spec.quote : true;
      return `${filter.field} ${filter.operator} ${quote ? `"${raw}"` : raw}`;
    }),
  );
  return parts.length ? _.join(parts, ' & ') : undefined;
}

/**
 * BAIPropertyFilter — token-based filter bar over the Backend.AI queryfilter
 * minilang. Emits (and accepts) the filter string that the page keeps in its
 * URL and forwards to GraphQL.
 *
 * @example
 * ```tsx
 * <BAIPropertyFilter
 *   filterProperties={[
 *     { key: 'name', propertyLabel: 'Name', type: 'string' },
 *     { key: 'active', propertyLabel: 'Active', type: 'boolean' },
 *   ]}
 *   value={filter}
 *   onChange={setFilter}
 * />
 * ```
 */
const BAIPropertyFilter: React.FC<BAIPropertyFilterProps> = ({
  filterProperties,
  value: propValue,
  onChange: propOnChange,
  defaultValue,
  label,
  placeholder,
  applyLabel,
  resultCount,
  contentSearchFieldKey,
  isDisabled,
  size,
  style,
  className,
  loading,
  'data-testid': dataTestId,
}) => {
  'use memo';
  const { t } = useBAIi18n();

  const [value, setValue] = useControllableValue<string | undefined>({
    value: propValue,
    defaultValue: defaultValue,
    onChange: propOnChange as ((value: string | undefined) => void) | undefined,
  });

  // Maps a committed value to the human-readable label a `renderInput` control
  // supplied (e.g. user UUID -> email). Tokens are re-derived from `value` on
  // every render and only carry the raw value, so the label lives here and is
  // looked up when the token renders. Deliberately a mutable ref rather than
  // state: it is written from the editor's commit callback and read from the
  // token renderer, never during this component's render, and the commit that
  // records a label is immediately followed by the `onChange` that repaints.
  const valueLabelMapRef = useRef<Record<string, string>>({});

  const renderInputEditors = useRenderInputEditors({
    recordLabel: (property, committed, label) => {
      valueLabelMapRef.current[`${property}::${committed}`] = label;
    },
    resolveLabel: (property, committed) =>
      valueLabelMapRef.current[`${property}::${committed}`] ?? committed,
  });

  const specs = buildFieldSpecs(filterProperties, value);
  const { filters, rawValues } = parseFilterString(value, specs);

  const config: PowerSearchConfig = {
    name: 'bai-property-filter',
    contentSearchFieldKey:
      contentSearchFieldKey ?? defaultContentSearchFieldKey(filterProperties),
    fields: _.map(specs, (spec): PowerSearchField => {
      const custom = renderInputEditors.operatorValueFor(
        spec.key,
        spec.renderInput,
      );
      const operatorValue = operatorValueForSpec(spec, custom);
      return {
        key: spec.key,
        label: spec.label,
        defaultOperator: spec.defaultOperator,
        operators: _.map(spec.operators, (operator) => ({
          key: operator,
          label: operatorLabel(operator, t),
          value: operatorValue,
        })),
      };
    }),
  };

  // `rule` is advisory now: report the first violation instead of refusing it.
  const ruleViolation = _.find(
    _.map(filters, (filter) => {
      const spec = _.find(specs, (candidate) => candidate.key === filter.field);
      if (!spec?.rule) return undefined;
      return spec.rule.validate(tokenValueToString(filter))
        ? undefined
        : spec.rule.message;
    }),
  );

  return (
    <PowerSearch
      config={config}
      filters={filters}
      label={label ?? t('comp:BAIPropertyFilter.SearchLabel')}
      placeholder={placeholder ?? t('comp:BAIPropertyFilter.PlaceHolder')}
      popoverSaveButtonLabel={applyLabel ?? t('comp:BAIPropertyFilter.Apply')}
      resultCount={resultCount}
      isDisabled={isDisabled || loading}
      size={size}
      style={style}
      className={className}
      data-testid={dataTestId}
      status={
        ruleViolation ? { type: 'error', message: ruleViolation } : undefined
      }
      onChange={(next) => {
        setValue(serializeFilters(next, specs, rawValues));
      }}
    />
  );
};

BAIPropertyFilter.displayName = 'BAIPropertyFilter';

export default BAIPropertyFilter;
