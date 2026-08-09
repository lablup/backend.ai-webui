/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 to-astryx TICKET 28 — `BAIGraphQLPropertyFilter` rebuilt on Astryx
 `PowerSearch`, alongside its DSL sibling `BAIPropertyFilter`.

 ## The contract that must NOT move

 This filter's `value` is a **GraphQL filter object** (`{ name: { iContains:
 'x' } }`, `{ AND: [...] }`), which pages keep in the URL and hand straight to
 a Relay variable. The two pure functions that define that shape —
 `convertConditionsToGraphQLFilter` (out) and `convertGraphQLFilterToConditions`
 (in) — are UNCHANGED from the antd implementation, so what a shared link
 encoded still decodes to the same conditions and re-encodes byte-identically.

 What ticket 28 replaced is only the layer above them:

   GraphQL object  <->  FilterCondition[]  <->  PowerSearchFilter[]
                        ^^^^ unchanged ^^^^     ^^^^^ new ^^^^^^^^

 `conditionToTokenValue` / `tokenValueToConditionValue` are exact inverses, so
 the round trip through the UI is lossless for every property type the call
 sites use (string, number, boolean, enum, uuid, datetime, and the `in` /
 `notIn` list operators).

 ## PILOT-DECISIONs

 - **Per-property `placeholder`** is dropped: PowerSearch has ONE placeholder
   for the whole control, shown before any token exists — there is no
   per-field input to place it in. The component-level `placeholder` prop
   remains.
 - **`rule.validate` is advisory** — reported through the control's error
   status rather than refusing the value (PowerSearch owns its editor).
 - **`datetime` values round-trip at second precision.** PowerSearch stores
   absolute dates as `unixSeconds`; the antd `DatePicker` produced an ISO
   string. Sub-second components of a hand-written link are lost on the first
   edit. The picker never produced any.
 - **The bespoke "reset filters" button** is gone; PowerSearch ships `hasClear`.
 - `renderInput` controls stage their value and are committed by the popover's
   Apply button (see `BAIPowerSearchAdapters`).
*/
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
  FilterValue,
  OperatorValue,
  PowerSearchConfig,
  PowerSearchField,
  PowerSearchFilter,
} from '@astryxdesign/core/PowerSearch';
import dayjs from 'dayjs';
import type { TFunction } from 'i18next';
import * as _ from 'lodash-es';
import { useRef } from 'react';

// GraphQL Filter Types (matching schema.graphql)
export type StringFilter = {
  contains?: string | null;
  startsWith?: string | null;
  endsWith?: string | null;
  equals?: string | null;
  notContains?: string | null;
  notStartsWith?: string | null;
  notEndsWith?: string | null;
  notEquals?: string | null;
  iContains?: string | null;
  iStartsWith?: string | null;
  iEndsWith?: string | null;
  iEquals?: string | null;
  iNotContains?: string | null;
  iNotStartsWith?: string | null;
  iNotEndsWith?: string | null;
  iNotEquals?: string | null;
};

export type IntFilter = {
  equals?: number | null;
  notEquals?: number | null;
  greaterThan?: number | null;
  greaterThanOrEqual?: number | null;
  lessThan?: number | null;
  lessThanOrEqual?: number | null;
};

export type UUIDFilter = {
  equals?: string | null;
  notEquals?: string | null;
  in?: string[] | null;
  notIn?: string[] | null;
};

export type DateTimeFilter = {
  before?: string | null;
  after?: string | null;
  equals?: string | null;
  notEquals?: string | null;
};

export type BooleanFilter = boolean;

export type EnumFilter<T = string> = {
  equals?: T | null;
  notEquals?: T | null;
  in?: T[] | null;
  notIn?: T[] | null;
};

export type BaseFilter<T = any> = {
  AND?: T[] | T | null;
  OR?: T[] | T | null;
  NOT?: T | null;
};

export type GraphQLFilter = BaseFilter & {
  [key: string]: any;
};

export type FilterPropertyType =
  'string' | 'number' | 'boolean' | 'enum' | 'uuid' | 'datetime';

export type FilterOperator =
  // String operators
  | 'contains'
  | 'startsWith'
  | 'endsWith'
  | 'equals'
  | 'notContains'
  | 'notStartsWith'
  | 'notEndsWith'
  | 'notEquals'
  | 'iContains'
  | 'iStartsWith'
  | 'iEndsWith'
  | 'iEquals'
  | 'iNotContains'
  | 'iNotStartsWith'
  | 'iNotEndsWith'
  | 'iNotEquals'
  // Number/Int operators
  | 'greaterThan'
  | 'greaterThanOrEqual'
  | 'lessThan'
  | 'lessThanOrEqual'
  // UUID operators
  | 'in'
  | 'notIn'
  // DateTime operators
  | 'before'
  | 'after'
  // Allow custom operators
  | (string & NonNullable<unknown>);

type BaseFilterProperty = {
  key: string;
  propertyLabel: string;
  /**
   * Kept for source compatibility; PowerSearch has a single control-level
   * placeholder, so this is no longer rendered (see the PILOT-DECISIONs).
   */
  placeholder?: string;
  type: FilterPropertyType;
  operators?: FilterOperator[];
  options?: Array<FilterPropertyOption>;
  strictSelection?: boolean;
  /**
   * Advisory since ticket 28: a violating token is reported through the
   * control's error status instead of being refused at commit time.
   */
  rule?: {
    message: string;
    validate: (value: any) => boolean;
  };
  // How to serialize this property into GraphQL filter:
  //  - 'scalar': emit the value directly, e.g., { isUrgent: true }
  //  - 'operator': emit as an operator object, e.g., { name: { contains: "x" } }
  // Defaults to 'scalar' for boolean type, otherwise 'operator'.
  valueMode?: 'scalar' | 'operator';
  // For UI/tag display when valueMode='scalar', use this operator symbol (default 'equals').
  implicitOperator?: FilterOperator;
  /**
   * Replaces the built-in value editor with a controlled control (e.g.
   * `BAIUserSelect`). Call `onAddCondition(value, label?)` to stage the value;
   * the popover's Apply button commits it. Pass the human-readable `label`
   * when the committed value is opaque (e.g. a UUID) so the token shows the
   * label while the raw value still serializes into the filter unchanged.
   */
  renderInput?: FilterRenderInput;
};

// fixedOperator and defaultOperator are mutually exclusive
export type FilterProperty = BaseFilterProperty &
  (
    | { fixedOperator: FilterOperator; defaultOperator?: never } // Fixed operator (no selector shown)
    | { defaultOperator?: FilterOperator; fixedOperator?: never } // Default operator (can be changed)
    | { defaultOperator?: never; fixedOperator?: never } // No operator preference
  );

export interface BAIGraphQLPropertyFilterProps<
  TFilter extends GraphQLFilter = GraphQLFilter,
> extends BAIPowerSearchChromeProps {
  value?: TFilter;
  onChange?: (value: TFilter | undefined) => void;
  defaultValue?: TFilter;
  filterProperties: Array<FilterProperty>;
  loading?: boolean;
  combinationMode?: 'AND' | 'OR';
  // Whether each property holds a single condition. When false (the default)
  // each committed value adds a new condition (the historical accumulate
  // behavior). When true, committing a value overrides the existing condition
  // for that property instead of appending another — applied to every
  // property.
  singleCondition?: boolean;
}

interface FilterCondition {
  id: string;
  property: string;
  operator: FilterOperator;
  value: any;
  propertyLabel: string;
  type: FilterPropertyType;
}

const OPERATORS_BY_TYPE: Record<FilterPropertyType, FilterOperator[]> = {
  string: [
    'iContains',
    'iNotContains',
    'iEquals',
    'iNotEquals',
    'iStartsWith',
    'iNotStartsWith',
    'iEndsWith',
    'iNotEndsWith',
  ],
  number: [
    'equals',
    'notEquals',
    'greaterThan',
    'greaterThanOrEqual',
    'lessThan',
    'lessThanOrEqual',
  ],
  boolean: ['equals'],
  enum: ['equals', 'notEquals', 'in', 'notIn'],
  uuid: ['equals', 'notEquals', 'in', 'notIn'],
  datetime: ['equals', 'notEquals', 'before', 'after'],
};

const DEFAULT_OPERATOR_BY_TYPE: Record<FilterPropertyType, FilterOperator> = {
  string: 'iContains',
  number: 'equals',
  boolean: 'equals',
  enum: 'equals',
  uuid: 'equals',
  datetime: 'equals',
};

const LIST_OPERATORS: Array<FilterOperator> = ['in', 'notIn'];

const BOOLEAN_OPTIONS: Array<FilterPropertyOption> = [
  { label: 'True', value: 'true' },
  { label: 'False', value: 'false' },
];

function generateId(): string {
  return `filter-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Builds a nested object from a dot-notation path.
 * e.g., "project.name" with value { eq: "test" } -> { project: { name: { eq: "test" } } }
 */
export function buildNestedFilter(path: string, value: any): GraphQLFilter {
  const keys = path.split('.');
  // Guard against prototype pollution and malformed paths. Property paths come
  // from a developer-defined filter schema and never use these reserved keys or
  // empty segments, but a path segment of `__proto__` / `constructor` /
  // `prototype` would otherwise let the assignments below walk into the object
  // prototype chain, and an empty segment (e.g. `a..b`, `.a`, `a.`) would
  // create a malformed `''` key.
  if (
    keys.some(
      (key) =>
        key === '' ||
        key === '__proto__' ||
        key === 'constructor' ||
        key === 'prototype',
    )
  ) {
    return {};
  }
  if (keys.length === 1) {
    return { [path]: value };
  }

  let result: any = {};
  let current = result;
  for (let i = 0; i < keys.length - 1; i++) {
    current[keys[i]] = {};
    current = current[keys[i]];
  }
  current[keys[keys.length - 1]] = value;
  return result;
}

function convertConditionsToGraphQLFilter(
  conditions: FilterCondition[],
  filterProperties: FilterProperty[],
  combinationMode: 'AND' | 'OR' = 'AND',
): GraphQLFilter | undefined {
  if (conditions.length === 0) return undefined;

  // Build individual filter for each condition (no grouping)
  const filters: GraphQLFilter[] = [];

  conditions.forEach((condition) => {
    const propertyConfig = filterProperties.find(
      (p) => p.key === condition.property,
    );
    let filterValue: any;

    // Convert value based on type and operator
    const valueMode =
      propertyConfig?.valueMode ||
      (propertyConfig?.type === 'boolean' ? 'scalar' : 'operator');

    if (valueMode === 'scalar') {
      // Emit scalar directly. Coerce by type when possible.
      if (propertyConfig?.type === 'boolean') {
        filterValue =
          condition.value === true || condition.value === 'true' ? true : false;
      } else if (propertyConfig?.type === 'number') {
        filterValue = Number(condition.value);
      } else {
        filterValue = condition.value;
      }
    } else if (condition.operator === 'in' || condition.operator === 'notIn') {
      const values = Array.isArray(condition.value)
        ? condition.value
        : condition.value.split(',').map((v: string) => v.trim());
      filterValue = {
        [condition.operator]:
          propertyConfig?.type === 'number' ? values.map(Number) : values,
      };
    } else {
      let value = condition.value;
      if (propertyConfig?.type === 'number') {
        value = Number(value);
      }
      filterValue = { [condition.operator]: value };
    }

    // Create a separate filter object for each condition
    // Supports dot notation for nested objects (e.g., "project.name" -> { project: { name: value } })
    filters.push(buildNestedFilter(condition.property, filterValue));
  });

  // If there's only one filter, return it directly
  if (filters.length === 1) {
    return filters[0];
  }

  // Multiple filters are combined with specified mode (AND or OR)
  return { [combinationMode]: filters };
}

/**
 * Extracts filter conditions from a nested filter object.
 * Supports dot notation keys like "project.name" which map to { project: { name: value } }
 */
function extractNestedConditions(
  filter: GraphQLFilter,
  filterProperties: FilterProperty[],
  currentPath: string = '',
): FilterCondition[] {
  const conditions: FilterCondition[] = [];

  Object.keys(filter).forEach((key) => {
    if (key === 'AND' || key === 'OR' || key === 'NOT' || key === 'DISTINCT')
      return;

    const fullPath = currentPath ? `${currentPath}.${key}` : key;
    const filterValue = filter[key];

    // Check if this path matches a property key
    const propertyConfig = filterProperties.find((p) => p.key === fullPath);

    if (propertyConfig) {
      // Found a matching property, extract conditions
      const propertyValueMode =
        propertyConfig.valueMode ||
        (propertyConfig.type === 'boolean' ? 'scalar' : 'operator');

      if (propertyValueMode === 'scalar' && typeof filterValue !== 'object') {
        conditions.push({
          id: generateId(),
          property: fullPath,
          operator: propertyConfig.implicitOperator || 'equals',
          value: String(filterValue),
          propertyLabel: propertyConfig.propertyLabel || fullPath,
          type: propertyConfig.type || 'string',
        });
      } else if (filterValue && typeof filterValue === 'object') {
        Object.keys(filterValue).forEach((operator) => {
          const value = filterValue[operator];
          if (value !== null && value !== undefined) {
            conditions.push({
              id: generateId(),
              property: fullPath,
              operator: operator as FilterOperator,
              value: Array.isArray(value) ? value.join(', ') : String(value),
              propertyLabel: propertyConfig.propertyLabel || fullPath,
              type: propertyConfig.type || 'string',
            });
          }
        });
      }
    } else if (filterValue && typeof filterValue === 'object') {
      // Check if this is a nested object (not an operator object)
      const keys = Object.keys(filterValue);
      const isOperatorObject = keys.some((k) =>
        [
          'eq',
          'ne',
          'lt',
          'le',
          'gt',
          'ge',
          'contains',
          'notContains',
          'startsWith',
          'endsWith',
          'ilike',
          'in',
          'notIn',
          'isNull',
        ].includes(k),
      );

      if (!isOperatorObject) {
        // Recursively process nested object
        conditions.push(
          ...extractNestedConditions(filterValue, filterProperties, fullPath),
        );
      }
    }
  });

  return conditions;
}

function convertGraphQLFilterToConditions(
  filter: GraphQLFilter | undefined,
  filterProperties: FilterProperty[],
): FilterCondition[] {
  if (!filter) return [];

  const conditions: FilterCondition[] = [];

  // Handle AND/OR operators - flatten conditions from array
  if (filter.AND || filter.OR) {
    const filterArray = filter.AND || filter.OR;
    const filters = Array.isArray(filterArray) ? filterArray : [filterArray];
    filters.forEach((subFilter) => {
      conditions.push(
        ...convertGraphQLFilterToConditions(subFilter, filterProperties),
      );
    });
    return conditions;
  }

  // Process property filters (supports nested objects via dot notation)
  conditions.push(...extractNestedConditions(filter, filterProperties));

  return conditions;
}

const getEffectiveValueMode = (p: FilterProperty | undefined) =>
  p?.valueMode || (p?.type === 'boolean' ? 'scalar' : 'operator');

const effectiveOptions = (
  property: FilterProperty,
): Array<FilterPropertyOption> | undefined =>
  property.options ??
  (property.type === 'boolean' ? BOOLEAN_OPTIONS : undefined);

const effectiveStrictSelection = (property: FilterProperty): boolean =>
  property.strictSelection ?? property.type === 'boolean';

/** Operators offered for a property — the antd rules, unchanged. */
export function availableOperatorsOf(
  property: FilterProperty,
): Array<FilterOperator> {
  if (getEffectiveValueMode(property) === 'scalar') {
    return [property.implicitOperator || 'equals'];
  }
  if (property.fixedOperator) return [property.fixedOperator];
  return property.operators || OPERATORS_BY_TYPE[property.type || 'string'];
}

function defaultOperatorOf(property: FilterProperty): FilterOperator {
  if (getEffectiveValueMode(property) === 'scalar') {
    return property.implicitOperator || 'equals';
  }
  return (
    property.fixedOperator ||
    property.defaultOperator ||
    DEFAULT_OPERATOR_BY_TYPE[property.type]
  );
}

/** `iContains` -> the BUI catalog key `IContains`. */
const operatorLabel = (operator: FilterOperator, t: TFunction): string =>
  t(`comp:BAIGraphQLPropertyFilter.operator.${_.upperFirst(operator)}`, {
    defaultValue: operator,
  });

/**
 * The PowerSearch value editor for one property/operator pair.
 * `custom` (from `renderInput`) always wins — the call site asked for it.
 */
function operatorValueFor(
  property: FilterProperty,
  operator: FilterOperator,
  custom: OperatorValue | undefined,
): OperatorValue {
  if (custom) return custom;
  const options = effectiveOptions(property);
  const strict = effectiveStrictSelection(property);

  if (_.includes(LIST_OPERATORS, operator)) {
    return options && strict
      ? { type: 'enum_list', values: toEnumItems(options) }
      : {
          type: 'string_list',
          searchSource: toSearchSource(options),
          isArbitraryStringAllowed: true,
        };
  }
  if (property.type === 'datetime') {
    return { type: 'date_absolute' };
  }
  if (property.type === 'number') {
    return { type: 'float' };
  }
  if (options && strict) {
    return { type: 'enum', values: toEnumItems(options) };
  }
  const searchSource = toSearchSource(options);
  return searchSource
    ? { type: 'string', searchSource, isArbitraryStringAllowed: true }
    : { type: 'string' };
}

/** FilterCondition -> the token value shape the editor above expects. */
export function conditionToTokenValue(
  condition: FilterCondition,
  property: FilterProperty | undefined,
): FilterValue {
  const raw = condition.value;
  if (_.includes(LIST_OPERATORS, condition.operator)) {
    const values = _.isArray(raw)
      ? _.map(raw, _.toString)
      : _.compact(_.map(_.split(_.toString(raw), ','), _.trim));
    return property &&
      effectiveOptions(property) &&
      effectiveStrictSelection(property)
      ? { type: 'enum_list', value: values }
      : { type: 'string_list', value: values };
  }
  if (property?.type === 'datetime') {
    const parsed = dayjs(_.toString(raw));
    return {
      type: 'date_absolute',
      unixSeconds: parsed.isValid() ? parsed.unix() : dayjs().unix(),
    };
  }
  if (property?.type === 'number') {
    return { type: 'float', value: Number(raw) };
  }
  if (property?.renderInput) {
    return { type: 'custom', value: _.toString(raw) };
  }
  if (
    property &&
    effectiveOptions(property) &&
    effectiveStrictSelection(property)
  ) {
    return { type: 'enum', value: _.toString(raw) };
  }
  return { type: 'string', value: _.toString(raw) };
}

/** Exact inverse of `conditionToTokenValue`. */
export function tokenValueToConditionValue(value: FilterValue): any {
  switch (value.type) {
    case 'empty':
      return '';
    case 'date_absolute':
      return dayjs.unix(value.unixSeconds).toISOString();
    case 'integer':
    case 'float':
      return String(value.value);
    case 'string_list':
    case 'enum_list':
      return [...value.value];
    case 'entity_list':
      return _.map(value.value, (entity) => entity.id);
    case 'date_range':
      return JSON.stringify(value.value);
    default:
      return _.toString((value as { value?: unknown }).value ?? '');
  }
}

/**
 * GraphQL filter object -> PowerSearch tokens. Composed of the (unchanged)
 * object->conditions reverse parser and the token-value mapper, so the URL
 * round trip is testable without mounting the component.
 */
export function graphQLFilterToPowerSearchFilters(
  value: GraphQLFilter | undefined,
  filterProperties: Array<FilterProperty>,
): Array<PowerSearchFilter> {
  const byKey = _.keyBy(filterProperties, 'key');
  return _.map(
    convertGraphQLFilterToConditions(value, filterProperties),
    (condition) => ({
      field: condition.property,
      operator: condition.operator,
      value: conditionToTokenValue(condition, byKey[condition.property]),
    }),
  );
}

/** Exact inverse of `graphQLFilterToPowerSearchFilters`. */
export function powerSearchFiltersToGraphQLFilter(
  filters: ReadonlyArray<PowerSearchFilter>,
  filterProperties: Array<FilterProperty>,
  combinationMode: 'AND' | 'OR' = 'AND',
  singleCondition: boolean = false,
): GraphQLFilter | undefined {
  const byKey = _.keyBy(filterProperties, 'key');
  // `singleCondition` keeps at most one condition per property — the LAST one
  // wins, matching the antd behaviour where committing overrode.
  const kept = singleCondition
    ? _.values(
        _.reduce(
          filters,
          (acc, filter) => ({ ...acc, [filter.field]: filter }),
          {} as Record<string, PowerSearchFilter>,
        ),
      )
    : [...filters];

  const conditions: Array<FilterCondition> = _.map(kept, (filter) => {
    const property = byKey[filter.field];
    return {
      id: generateId(),
      property: filter.field,
      operator: filter.operator,
      value: tokenValueToConditionValue(filter.value),
      propertyLabel: property?.propertyLabel ?? filter.field,
      type: property?.type ?? 'string',
    };
  });

  return convertConditionsToGraphQLFilter(
    conditions,
    filterProperties,
    combinationMode,
  );
}

const BAIGraphQLPropertyFilter = <
  TFilter extends GraphQLFilter = GraphQLFilter,
>({
  filterProperties,
  value: propValue,
  onChange: propOnChange,
  defaultValue,
  combinationMode = 'AND',
  singleCondition = false,
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
}: BAIGraphQLPropertyFilterProps<TFilter>) => {
  'use memo';

  const { t } = useBAIi18n();

  const [value, setValue] = useControllableValue<TFilter | undefined>({
    value: propValue,
    defaultValue: defaultValue,
    onChange: propOnChange,
  });

  // Maps a committed value to the human-readable label a `renderInput` control
  // supplied (e.g. user UUID -> email). Conditions are re-derived from `value`
  // on every render and only carry the raw value, so the label lives here.
  // A mutable ref, not state — see the sibling note in `BAIPropertyFilter`.
  const valueLabelMapRef = useRef<Record<string, string>>({});

  const renderInputEditors = useRenderInputEditors({
    recordLabel: (property, committed, label) => {
      valueLabelMapRef.current[`${property}::${committed}`] = label;
    },
    resolveLabel: (property, committed) =>
      valueLabelMapRef.current[`${property}::${committed}`] ?? committed,
  });

  const byKey = _.keyBy(filterProperties, 'key');
  const conditions = convertGraphQLFilterToConditions(value, filterProperties);
  const filters = graphQLFilterToPowerSearchFilters(value, filterProperties);

  const config: PowerSearchConfig = {
    name: 'bai-graphql-property-filter',
    contentSearchFieldKey:
      contentSearchFieldKey ??
      _.find(
        filterProperties,
        (property) =>
          property.type === 'string' &&
          !effectiveStrictSelection(property) &&
          !property.renderInput,
      )?.key,
    fields: _.map(filterProperties, (property): PowerSearchField => {
      const custom = renderInputEditors.operatorValueFor(
        property.key,
        property.renderInput,
      );
      return {
        key: property.key,
        label: property.propertyLabel,
        defaultOperator: defaultOperatorOf(property),
        operators: _.map(availableOperatorsOf(property), (operator) => ({
          key: operator,
          label: operatorLabel(operator, t),
          value: operatorValueFor(property, operator, custom),
        })),
      };
    }),
  };

  // `rule` is advisory now: report the first violation instead of refusing it.
  const ruleViolation = _.find(
    _.map(conditions, (condition) => {
      const rule = byKey[condition.property]?.rule;
      if (!rule) return undefined;
      return rule.validate(condition.value) ? undefined : rule.message;
    }),
  );

  const handleChange = (next: ReadonlyArray<PowerSearchFilter>) => {
    // The converter emits a loose GraphQLFilter; narrow it back to the caller's
    // concrete filter type. This single internal cast is what lets consumers
    // bind `value`/`onChange` to a real schema filter type without casting at
    // each call site.
    setValue(
      powerSearchFiltersToGraphQLFilter(
        next,
        filterProperties,
        combinationMode,
        singleCondition,
      ) as TFilter | undefined,
    );
  };

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
      onChange={handleChange}
    />
  );
};

export default BAIGraphQLPropertyFilter;
