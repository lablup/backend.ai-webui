/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 PILOT PHASE 3 (cn-oss-removal / ticket 10, item 3) — `BAIPropertyFilter`
 rebuilt on Astryx `PowerSearch`.

 **Verdict: PowerSearch is a direct structural analog, and a better one than
 expected.** BAIPropertyFilter is a hand-built antd `AutoComplete` + `Input` +
 `Tag` composite that parses a Backend.AI filter DSL string
 (`name ilike "%foo%" & status == "READY"`). PowerSearch models exactly the same
 thing natively: a token = {field, operator, value}, with typed value editors and
 an operator list per field. We stop parsing our own DSL for the UI and only
 SERIALISE to it on the way out.

 Mapping (BAIPropertyFilter -> PowerSearch):

 | BUI `FilterProperty`   | PowerSearch                                       |
 |------------------------|---------------------------------------------------|
 | `key`                  | `field.key`                                       |
 | `propertyLabel`        | `field.label`                                     |
 | `type: 'string'`       | operator `value: {type: 'string'}`                |
 | `options` + `strictSelection` | operator `value: {type:'enum', items}`     |
 | `defaultOperator`      | `field.defaultOperator`                           |
 | (implicit) `ilike`/`==`| explicit `operators[]` per field                  |
 | output DSL string      | `serialiseFilters()` below                        |

 GAINED over BAIPropertyFilter:
 - Operators are declared data, not inferred from `type` + `strictSelection`.
 - Typed value editors for free (enum picker, integer, date/date-range/relative)
   — the repo currently only supports `'string' | 'boolean'`.
 - `resultCount` with a polite live region; keyboard editing of existing tokens;
   `typeaheadAliases` for field discovery.

 LOST / needs work:
 - **i18n.** Operator labels come either from a raw `label` string or an
   `i18nKey` resolved against Astryx's own `InternationalizationProvider`
   catalog — NOT react-i18next. So either we pass pre-translated `label`s from
   `t()` (done below, simplest) or we register a catalog bridge. Field labels
   are plain strings and translate fine.
 - **The DSL is ours, both ways.** PowerSearch has no notion of the Backend.AI
   filter grammar. Serialising out is easy (below); parsing an inbound URL
   filter string back into tokens is NOT implemented here and is the real
   remaining work — BAIPropertyFilter has a parser we would need to reuse.
 - `strictSelection` has no direct flag; it is expressed by choosing an `enum`
   operator value type instead of `string`.

 PILOT-DECISION: this is a **probe**, not swapped into the page. Round-tripping
 the URL filter state needs the inbound parser, and that is a work item of its
 own rather than something to land mid-pilot.
*/
import { PowerSearch } from '@astryxdesign/core/PowerSearch';
import type {
  PowerSearchConfig,
  PowerSearchFilter,
} from '@astryxdesign/core/PowerSearch';
import React from 'react';

export interface BAIPropertyFilterAstryxProperty {
  key: string;
  propertyLabel: string;
  type: 'string' | 'boolean';
  defaultOperator?: string;
  strictSelection?: boolean;
  options?: Array<{ label: string; value: string }>;
}

export interface BAIPropertyFilterAstryxProps {
  filterProperties: Array<BAIPropertyFilterAstryxProperty>;
  filters: ReadonlyArray<PowerSearchFilter>;
  onChangeFilters: (next: ReadonlyArray<PowerSearchFilter>) => void;
  /** Receives the serialised Backend.AI filter DSL string. */
  onChange?: (value: string | undefined) => void;
  resultCount?: number;
  placeholder?: string;
  /** Operator labels, pre-translated by the caller (see the i18n note above). */
  operatorLabels?: { contains: string; equals: string; notEquals: string };
}

/** BUI `FilterProperty[]` -> `PowerSearchConfig`. */
export function toPowerSearchConfig(
  properties: Array<BAIPropertyFilterAstryxProperty>,
  labels: NonNullable<BAIPropertyFilterAstryxProps['operatorLabels']>,
): PowerSearchConfig {
  return {
    name: 'bai-property-filter',
    fields: properties.map((property) => {
      const isEnum = !!property.options && property.strictSelection;
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
 * PowerSearch tokens -> the Backend.AI filter DSL the page already sends to
 * GraphQL. This is the half that makes the swap viable; the inbound parser is
 * the half that is missing.
 */
export function serialiseFilters(
  filters: ReadonlyArray<PowerSearchFilter>,
): string | undefined {
  const parts = filters
    .map((filter) => {
      // Both the string and enum filter-value shapes expose `.value`.
      const raw = filter.value as { type: string; value?: unknown };
      const value = String(raw?.value ?? '');
      if (!value) return null;
      // `ilike` wraps in wildcards, exactly as BAIPropertyFilter does.
      return filter.operator === 'ilike'
        ? `${filter.field} ilike "%${value}%"`
        : `${filter.field} ${filter.operator} "${value}"`;
    })
    .filter((part): part is string => !!part);
  return parts.length ? parts.join(' & ') : undefined;
}

const BAIPropertyFilterAstryx: React.FC<BAIPropertyFilterAstryxProps> = ({
  filterProperties,
  filters,
  onChangeFilters,
  onChange,
  resultCount,
  placeholder,
  operatorLabels = {
    contains: 'contains',
    equals: 'is',
    notEquals: 'is not',
  },
}) => {
  'use memo';
  const config = toPowerSearchConfig(filterProperties, operatorLabels);
  return (
    <PowerSearch
      config={config}
      filters={filters}
      placeholder={placeholder}
      resultCount={resultCount}
      onChange={(next) => {
        onChangeFilters(next);
        onChange?.(serialiseFilters(next));
      }}
    />
  );
};

export default BAIPropertyFilterAstryx;
