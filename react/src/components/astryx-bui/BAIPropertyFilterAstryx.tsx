/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 PILOT PHASE 3 probe -> PHASE 6 SWAP-IN (cn-oss-removal / ticket 10, item 1) —
 `BAIPropertyFilter` rebuilt on Astryx `PowerSearch`.

 **Verdict: PowerSearch is a direct structural analog, and a better one than
 expected.** BAIPropertyFilter is a hand-built antd `AutoComplete` + `Input` +
 `Tag` composite that parses a Backend.AI filter DSL string
 (`name ilike "%foo%" & status == "READY"`). PowerSearch models exactly the same
 thing natively: a token = {field, operator, value}, with typed value editors
 and an operator list per field.

 Mapping (BAIPropertyFilter -> PowerSearch):

 | BUI `FilterProperty`          | PowerSearch                                |
 |-------------------------------|--------------------------------------------|
 | `key`                         | `field.key`                                |
 | `propertyLabel`               | `field.label`                              |
 | `type: 'string'`              | operator `value: {type: 'string'}`         |
 | `options` + `strictSelection` | operator `value: {type:'enum', values}`    |
 | `defaultOperator`             | `field.defaultOperator`                    |
 | (implicit) `ilike`/`==`       | explicit `operators[]` per field           |
 | output DSL string             | `serialiseFilters()` below                 |
 | inbound DSL string            | `parseFilters()` below <- PHASE 6          |

 PHASE 6 — both halves now exist, so this is a real drop-in for
 `BAIPropertyFilter` on a page whose filter lives in the URL:

 - `serialiseFilters(tokens) -> string`     (outbound, ~15 lines, Phase 3)
 - `parseFilters(string, props) -> tokens`  (inbound, this phase)

 `parseFilters` is the exact inverse. It carries a COPY of BUI's quote-aware,
 ReDoS-safe linear-scan tokenizer rather than importing `parseFilterValue` from
 `BAIPropertyFilter.tsx`. That import compiles and renders no antd — it is a
 pure string function — but it drags the whole antd-importing module (and the
 BUI barrel) into this file's dependency graph, which defeats the point of the
 sweep and blocks the isolation harness from mounting the component. Cost of
 the copy: 30 lines and a duplicated grammar; recorded in the residue table as
 the one place the sweep chose duplication over reuse.

 The component keeps an **antd-shaped external contract** (`value: string`,
 `onChange(value?: string)`) on purpose — the translating-frontier rule. The
 page stores the filter in the URL as a DSL string and hands the same string to
 GraphQL, and `VFolderNodeListPage` (unmigrated) uses the identical contract.
 PowerSearch's token array is an internal representation derived on every render
 from the URL, so there is no second source of truth to keep in sync.

 i18n — what we own vs what stays on Astryx's catalog:
 - OURS (react-i18next `t()`): field labels, operator labels (passed as raw
   `label` strings), the accessible `label`, `placeholder`, the popover's Apply
   button (`popoverSaveButtonLabel`), and `resultCount` (passed as a **string**
   so our own pluralisation applies instead of Astryx's "N results").
 - ASTRYX'S catalog (`InternationalizationProvider`, NOT react-i18next): the
   typeahead's own chrome — empty-result text, the operator menu's aria strings,
   the token remove button's label, and every date / relative-date editor label.
   Bridging those needs a catalog registration, not a prop; the `i18nKey`
   operator variant is the documented path if we ever want operator labels to
   come from Astryx's shipped defaults instead of ours.
*/
import { PowerSearch } from '@astryxdesign/core/PowerSearch';
import type {
  PowerSearchConfig,
  PowerSearchFilter,
} from '@astryxdesign/core/PowerSearch';
import * as _ from 'lodash-es';
import React from 'react';

export interface BAIPropertyFilterAstryxProperty {
  key: string;
  propertyLabel: string;
  type: 'string' | 'boolean';
  defaultOperator?: string;
  strictSelection?: boolean;
  options?: Array<{ label: string; value: string }>;
}

export interface BAIPropertyFilterAstryxOperatorLabels {
  contains: string;
  equals: string;
  notEquals: string;
}

export interface BAIPropertyFilterAstryxProps {
  filterProperties: Array<BAIPropertyFilterAstryxProperty>;
  /** The Backend.AI filter DSL string (URL state). */
  value?: string;
  /** Receives the serialised Backend.AI filter DSL string. */
  onChange?: (value: string | undefined) => void;
  /**
   * Pre-formatted result count. A STRING, not a number: Astryx formats numbers
   * as "N results" from its own catalog, and we want react-i18next to own that
   * sentence.
   */
  resultCount?: string;
  placeholder?: string;
  label?: string;
  applyLabel?: string;
  /** Field free text is routed to (PowerSearch `contentSearchFieldKey`). */
  contentSearchFieldKey?: string;
  /** Operator labels, pre-translated by the caller (see the i18n note above). */
  operatorLabels?: BAIPropertyFilterAstryxOperatorLabels;
  style?: React.CSSProperties;
  'data-testid'?: string;
}

const DEFAULT_OPERATOR_LABELS: BAIPropertyFilterAstryxOperatorLabels = {
  contains: 'contains',
  equals: 'is',
  notEquals: 'is not',
};

/** Enum-valued fields are the `strictSelection` + `options` combination. */
const isEnumProperty = (property: BAIPropertyFilterAstryxProperty) =>
  !!property.options && !!property.strictSelection;

/** BUI `FilterProperty[]` -> `PowerSearchConfig`. */
export function toPowerSearchConfig(
  properties: Array<BAIPropertyFilterAstryxProperty>,
  labels: BAIPropertyFilterAstryxOperatorLabels,
  contentSearchFieldKey?: string,
): PowerSearchConfig {
  return {
    name: 'bai-property-filter',
    ...(contentSearchFieldKey ? { contentSearchFieldKey } : {}),
    fields: properties.map((property) => {
      const isEnum = isEnumProperty(property);
      return {
        key: property.key,
        label: property.propertyLabel,
        defaultOperator: property.defaultOperator ?? (isEnum ? '==' : 'ilike'),
        operators: isEnum
          ? [
              {
                key: '==',
                label: labels.equals,
                value: {
                  type: 'enum' as const,
                  values: property.options ?? [],
                },
              },
              {
                key: '!=',
                label: labels.notEquals,
                value: {
                  type: 'enum' as const,
                  values: property.options ?? [],
                },
              },
            ]
          : [
              {
                key: 'ilike',
                label: labels.contains,
                value: { type: 'string' as const },
              },
              {
                key: '==',
                label: labels.equals,
                value: { type: 'string' as const },
              },
            ],
      };
    }),
  };
}

/**
 * Splits on runs of whitespace that fall OUTSIDE double quotes, one character
 * at a time so it is linear and cannot backtrack. Copied from BUI's
 * `splitOutsideDoubleQuotes` (see the header note on why it is copied).
 */
function splitOutsideDoubleQuotes(input: string): Array<string> {
  const tokens: Array<string> = [];
  let current = '';
  let inQuotes = false;
  let hasToken = false;
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
      current += ch;
      hasToken = true;
    } else if (!inQuotes && /\s/.test(ch)) {
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
  if (hasToken) tokens.push(current);
  return tokens;
}

/** `property operator "value"` -> its three parts. BUI's `parseFilterValue`. */
function parseFilterValue(filter: string) {
  const [property, operator, ...valueParts] = splitOutsideDoubleQuotes(filter);
  const value = valueParts.join(' ').replace(/^"|"$/g, '');
  return { property, operator, value };
}

/** `%foo%` -> `foo`, exactly as BUI's `trimFilterValue`. */
const trimWildcards = (value: string) => value.replace(/^%|%$/g, '');

/**
 * PowerSearch tokens -> the Backend.AI filter DSL the page already sends to
 * GraphQL. Inverse of `parseFilters`.
 */
export function serialiseFilters(
  filters: ReadonlyArray<PowerSearchFilter>,
): string | undefined {
  const parts = _.compact(
    _.map(filters, (filter) => {
      // Both the string and enum filter-value shapes expose `.value`.
      const raw = filter.value as { type: string; value?: unknown };
      const value = _.isArray(raw?.value)
        ? String(_.first(raw.value) ?? '')
        : String(raw?.value ?? '');
      if (!value) return null;
      // `ilike` wraps in wildcards, exactly as BAIPropertyFilter does.
      return filter.operator === 'ilike' || filter.operator === 'like'
        ? `${filter.field} ${filter.operator} "%${value}%"`
        : `${filter.field} ${filter.operator} "${value}"`;
    }),
  );
  return parts.length ? parts.join(' & ') : undefined;
}

/**
 * PHASE 6 — the inbound half. Backend.AI filter DSL -> PowerSearch tokens.
 *
 * The exact inverse of `serialiseFilters`, and the reason this component can
 * finally replace `BAIPropertyFilter` on a URL-backed page: the token array is
 * DERIVED from `value` on every render, so reload / back / share all round-trip
 * with no local state.
 *
 * Conditions naming a field that is not in `filterProperties` are dropped
 * rather than rendered as an unconfigurable token — PowerSearch cannot edit a
 * token whose field it does not know, and a silently uneditable token is worse
 * than a dropped one. (BAIPropertyFilter rendered them as a raw tag.)
 */
export function parseFilters(
  value: string | undefined,
  properties: Array<BAIPropertyFilterAstryxProperty>,
): Array<PowerSearchFilter> {
  if (!value) return [];
  const byKey = _.keyBy(properties, 'key');
  return _.compact(
    _.map(value.split('&'), (part) => {
      const trimmed = part.trim();
      if (!trimmed) return null;
      const { property, operator, value: rawValue } = parseFilterValue(trimmed);
      const filterProperty = byKey[property];
      if (!filterProperty || !operator) return null;
      const unwrapped =
        operator === 'ilike' || operator === 'like'
          ? trimWildcards(rawValue)
          : rawValue;
      if (!unwrapped) return null;
      return {
        field: property,
        operator,
        value: isEnumProperty(filterProperty)
          ? { type: 'enum' as const, value: unwrapped }
          : { type: 'string' as const, value: unwrapped },
      };
    }),
  );
}

const BAIPropertyFilterAstryx: React.FC<BAIPropertyFilterAstryxProps> = ({
  filterProperties,
  value,
  onChange,
  resultCount,
  placeholder,
  label = 'Search',
  applyLabel,
  contentSearchFieldKey,
  operatorLabels = DEFAULT_OPERATOR_LABELS,
  style,
  'data-testid': dataTestId,
}) => {
  'use memo';
  const config = toPowerSearchConfig(
    filterProperties,
    operatorLabels,
    contentSearchFieldKey,
  );
  const filters = parseFilters(value, filterProperties);
  return (
    <PowerSearch
      config={config}
      filters={filters}
      label={label}
      placeholder={placeholder}
      resultCount={resultCount}
      popoverSaveButtonLabel={applyLabel}
      style={style}
      data-testid={dataTestId}
      onChange={(next) => {
        onChange?.(serialiseFilters(next));
      }}
    />
  );
};

export default BAIPropertyFilterAstryx;
