import { useBAIi18n } from '../hooks/useBAIi18n';
import BAIFlex from './BAIFlex';
import BAISelect from './BAISelect';
import { CloseCircleOutlined } from '@ant-design/icons';
import { useControllableValue } from 'ahooks';
import {
  AutoComplete,
  Button,
  DatePicker,
  Input,
  Space,
  Tag,
  Tooltip,
  theme,
} from 'antd';
import type { AutoCompleteProps, GetRef } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import * as _ from 'lodash-es';
import React, {
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ComponentProps } from 'react';

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
  | 'string'
  | 'number'
  | 'boolean'
  | 'enum'
  | 'uuid'
  | 'datetime'
  // First-class custom input. A `custom` property MUST supply `renderInput`
  // (e.g. a domain-specific Select like a user picker). Operators, `valueMode`,
  // and tag label rendering are driven by the same property fields as the
  // built-in types.
  | 'custom';

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
  // Placeholder for this property's value input (AutoComplete / DatePicker)
  // shown when the property is selected. Falls back to the component's generic
  // default (`comp:BAIPropertyFilter.PlaceHolder`, or the datetime-specific
  // default for `type: 'datetime'`) when omitted.
  placeholder?: string;
  type: FilterPropertyType;
  operators?: FilterOperator[];
  options?: AutoCompleteProps['options'];
  strictSelection?: boolean;
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
  // When true, committing a new condition for this property replaces any
  // existing condition with the same property key instead of appending another
  // tag. Use for single-value pickers (e.g. "filter by user") where stacking
  // multiple conditions for the same key would be confusing. Defaults to false
  // (the historical multi-condition behavior).
  singleValue?: boolean;
  // Custom input renderer. Required for `type: 'custom'`; when provided for any
  // type it replaces the default AutoComplete input.
  //  - `value` / `setValue`: the controlled draft value of the input, owned by
  //    the filter. A controlled control (e.g. `BAIUserSelect`) binds to these.
  //  - `onConfirm(value, label?)`: commit the draft as a filter condition. The
  //    optional `label` is a human-readable tag label (e.g. a user's email) so
  //    the tag shows it instead of the raw confirmed value (e.g. a UUID).
  //  - `isValid` / `errorMessage`: reflect the latest `rule.validate` outcome so
  //    the custom input can surface the same error UX the default AutoComplete
  //    shows via Tooltip.
  renderInput?: (props: {
    value: string | undefined;
    setValue: (value: string | undefined) => void;
    onConfirm: (value: string, label?: string) => void;
    isValid: boolean;
    errorMessage?: string;
  }) => React.ReactNode;
};

// fixedOperator and defaultOperator are mutually exclusive
export type FilterProperty = BaseFilterProperty &
  (
    | { fixedOperator: FilterOperator; defaultOperator?: never } // Fixed operator (no selector shown)
    | { defaultOperator?: FilterOperator; fixedOperator?: never } // Default operator (can be changed)
    | { defaultOperator?: never; fixedOperator?: never } // No operator preference
  );

export interface BAIGraphQLPropertyFilterProps extends Omit<
  ComponentProps<typeof BAIFlex>,
  'value' | 'onChange' | 'defaultValue'
> {
  value?: GraphQLFilter;
  onChange?: (value: GraphQLFilter | undefined) => void;
  defaultValue?: GraphQLFilter;
  filterProperties: Array<FilterProperty>;
  loading?: boolean;
  combinationMode?: 'AND' | 'OR';
}

interface FilterCondition {
  id: string;
  property: string;
  operator: FilterOperator;
  value: any;
  propertyLabel: string;
  type: FilterPropertyType;
}

// Resolves the value-display key used to look up a human-readable tag label
// for a confirmed condition. Keyed by property + raw value so the same UUID
// confirmed under two properties stays independent.
const valueLabelKey = (property: string, value: any): string =>
  `${property}::${String(value)}`;

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
  // Custom inputs typically pin a single operator via `fixedOperator`, but fall
  // back to the UUID-style set when they don't.
  custom: ['equals', 'notEquals', 'in', 'notIn'],
};

const OPERATOR_SHORT_LABELS: Partial<Record<FilterOperator, string>> = {
  // Common operators
  equals: '=',
  notEquals: '≠',
  // String operators
  contains: '⊃',
  notContains: '⊅',
  startsWith: '^',
  notStartsWith: '!^',
  endsWith: '$',
  notEndsWith: '!$',
  iEquals: '=',
  iNotEquals: '≠',
  iContains: '⊃',
  iNotContains: '⊅',
  iStartsWith: '^',
  iNotStartsWith: '!^',
  iEndsWith: '$',
  iNotEndsWith: '!$',
  // Number/Int operators
  greaterThan: '>',
  greaterThanOrEqual: '≥',
  lessThan: '<',
  lessThanOrEqual: '≤',
  // UUID operators
  in: '∈',
  notIn: '∉',
  // DateTime operators
  before: '<',
  after: '>',
};

const DEFAULT_OPERATOR_BY_TYPE: Record<FilterPropertyType, FilterOperator> = {
  string: 'iContains',
  number: 'equals',
  boolean: 'equals',
  enum: 'equals',
  uuid: 'equals',
  datetime: 'equals',
  custom: 'equals',
};

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
      const values = condition.value.split(',').map((v: string) => v.trim());
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

const BAIGraphQLPropertyFilter: React.FC<BAIGraphQLPropertyFilterProps> = ({
  filterProperties,
  value: propValue,
  onChange: propOnChange,
  defaultValue,
  combinationMode = 'AND',
  ...containerProps
}) => {
  'use memo';

  const { token } = theme.useToken();
  const { t } = useBAIi18n();

  t('comp:BAIGraphQLPropertyFilter.operator.IContains');

  // Helper function to get translated operator label
  const getOperatorLabel = (operator: FilterOperator): string => {
    // Convert camelCase operator to PascalCase for i18n key
    const pascalCaseKey = _.upperFirst(operator);
    return t(`comp:BAIGraphQLPropertyFilter.operator.${pascalCaseKey}`, {
      defaultValue: operator,
    });
  };

  const [value, setValue] = useControllableValue<GraphQLFilter | undefined>({
    value: propValue,
    defaultValue: defaultValue,
    onChange: propOnChange,
  });

  // Reassign sequential ids: the converter generates random ids per call,
  // which would change every render and remount every Tag.
  // NOTE: these ids are positional, so closing a tag re-keys the survivors.
  // The Tag's `onClose` therefore calls `e.preventDefault()` to stop antd's
  // internal self-hide — otherwise the hidden instance would be reused for a
  // surviving condition (see `renderConditionTag`). Positional (not
  // content-based) ids are intentional: duplicate conditions are allowed, so
  // content-based keys would collide.
  const conditions = convertGraphQLFilterToConditions(
    value,
    filterProperties,
  ).map((c, i) => ({ ...c, id: `cond-${i}` }));

  const [search, setSearch] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<FilterProperty>(
    filterProperties[0],
  );
  const getEffectiveValueMode = (p: FilterProperty | undefined) =>
    p?.valueMode || (p?.type === 'boolean' ? 'scalar' : 'operator');

  const [selectedOperator, setSelectedOperator] = useState<FilterOperator>(
    () => {
      const mode = getEffectiveValueMode(selectedProperty);
      if (mode === 'scalar')
        return selectedProperty?.implicitOperator || 'equals';
      return (
        selectedProperty?.fixedOperator ||
        selectedProperty?.defaultOperator ||
        DEFAULT_OPERATOR_BY_TYPE[selectedProperty?.type || 'string']
      );
    },
  );

  const autoCompleteRef = useRef<GetRef<typeof AutoComplete>>(null);
  const [isOpenAutoComplete, setIsOpenAutoComplete] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const [isFocused, setIsFocused] = useState(false);
  // Controlled draft value handed to a `custom` property's `renderInput`. The
  // input owns its display via these; on confirm the value is committed as a
  // condition and the draft is cleared.
  const [customDraftValue, setCustomDraftValue] = useState<
    string | undefined
  >();
  // Human-readable tag labels keyed by `valueLabelKey(property, value)`.
  // Conditions are derived from `value` on every render, so a label captured at
  // confirm time cannot live on the condition itself — it is stored here and
  // resolved in `renderConditionTag`. Labels are session-scoped: a filter
  // restored from a URL/programmatic value falls back to the raw value until
  // re-selected.
  const [labelByValue, setLabelByValue] = useState<Record<string, string>>({});

  const propertyOptions = filterProperties.map((property) => ({
    label: property.propertyLabel,
    value: property.key,
    filter: property,
  }));

  const availableOperators = useMemo(() => {
    const mode = getEffectiveValueMode(selectedProperty);
    if (mode === 'scalar') return [] as FilterOperator[];
    if (selectedProperty?.fixedOperator) {
      return [selectedProperty.fixedOperator];
    }
    return (
      selectedProperty?.operators ||
      OPERATORS_BY_TYPE[selectedProperty?.type || 'string']
    );
  }, [selectedProperty]);

  const operatorOptions = useMemo(() => {
    return availableOperators.map((op) => ({
      label: getOperatorLabel(op),
      value: op,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableOperators, t]);

  const updateConditions = (newConditions: FilterCondition[]) => {
    const filter = convertConditionsToGraphQLFilter(
      newConditions,
      filterProperties,
      combinationMode,
    );
    setValue(filter);
  };

  // Get effective options and strictSelection based on property type
  const effectiveOptions = useMemo(() => {
    // Use provided options if available
    if (selectedProperty?.options) {
      return selectedProperty.options;
    }
    // Default options for boolean type
    if (selectedProperty?.type === 'boolean') {
      return [
        { label: 'True', value: 'true' },
        { label: 'False', value: 'false' },
      ];
    }
    return undefined;
  }, [selectedProperty]);

  const effectiveStrictSelection = useMemo(() => {
    // Use provided strictSelection if explicitly set
    if (selectedProperty?.strictSelection !== undefined) {
      return selectedProperty.strictSelection;
    }
    // Default strictSelection for boolean type
    if (selectedProperty?.type === 'boolean') {
      return true;
    }
    return false;
  }, [selectedProperty]);

  const addCondition = (value: string, label?: string) => {
    if (_.isEmpty(value)) return;

    if (effectiveStrictSelection && effectiveOptions) {
      const option = effectiveOptions.find((o) => o.value === value);
      if (!option) return;
    }

    const isValid =
      !selectedProperty.rule?.validate || selectedProperty.rule.validate(value);
    setIsValid(isValid);
    if (!isValid) return;

    // Decide operator to store for UI display
    const mode = getEffectiveValueMode(selectedProperty);
    const operatorToUse =
      mode === 'scalar'
        ? selectedProperty.implicitOperator || 'equals'
        : selectedProperty.fixedOperator || selectedOperator;

    const newCondition: FilterCondition = {
      id: generateId(),
      property: selectedProperty.key,
      operator: operatorToUse,
      value: value,
      propertyLabel: selectedProperty.propertyLabel,
      type: selectedProperty.type,
    };

    // Remember the human-readable label for this confirmed value so the tag can
    // show it instead of the raw value (e.g. user email instead of UUID).
    if (label !== undefined) {
      setLabelByValue((prev) => ({
        ...prev,
        [valueLabelKey(selectedProperty.key, value)]: label,
      }));
    }

    // Single-value properties replace any existing condition for the same key
    // instead of stacking another tag.
    const base = selectedProperty.singleValue
      ? conditions.filter((c) => c.property !== selectedProperty.key)
      : conditions;
    updateConditions([...base, newCondition]);
    setSearch('');
    setCustomDraftValue(undefined);
  };

  const removeCondition = (id: string) => {
    const removed = conditions.find((c) => c.id === id);
    const newConditions = conditions.filter((c) => c.id !== id);
    // Drop the cached tag label for the removed condition so `labelByValue`
    // doesn't grow unbounded across a long session of selections/removals.
    if (removed) {
      const key = valueLabelKey(removed.property, removed.value);
      setLabelByValue((prev) => {
        if (!(key in prev)) return prev;
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
    updateConditions(newConditions);
  };

  const resetConditions = () => {
    updateConditions([]);
  };

  const renderConditionTag = (
    condition: FilterCondition,
  ): React.ReactElement => {
    const operatorShortLabel =
      OPERATOR_SHORT_LABELS[condition.operator] || condition.operator;
    // Prefer a human-readable label captured at confirm time (e.g. user email)
    // over the raw confirmed value (e.g. UUID), falling back to the value.
    const resolvedLabel =
      labelByValue[valueLabelKey(condition.property, condition.value)];
    const displayValue =
      resolvedLabel ??
      (condition.operator === 'in' || condition.operator === 'notIn'
        ? `[${condition.value}]`
        : condition.type === 'datetime' && dayjs(condition.value).isValid()
          ? dayjs(condition.value).format('YYYY-MM-DD HH:mm')
          : condition.value);

    return (
      <Tag
        key={condition.id}
        closable
        onClose={(e) => {
          // antd Tag self-hides via its internal `visible` state on close
          // unless the close event is prevented. Because tags are re-keyed
          // positionally (`cond-${i}`), the self-hidden instance gets reused
          // for the surviving condition after the re-render, making the wrong
          // tag (or every tag) vanish. Prevent the default self-hide and let
          // removal be driven purely by the conditions array.
          e.preventDefault();
          removeCondition(condition.id);
        }}
        style={{ margin: 0 }}
        title={`${condition.propertyLabel} ${getOperatorLabel(condition.operator)} ${resolvedLabel ?? condition.value}`}
      >
        {condition.propertyLabel} {operatorShortLabel} {displayValue}
      </Tag>
    );
  };

  const updateSelectedDateEvent = useEffectEvent((date: Dayjs) => {
    if (date) {
      addCondition(dayjs(date).toISOString());
      setSelectedDate(null);
    }
  });

  useEffect(() => {
    if (selectedDate) {
      updateSelectedDateEvent(selectedDate);
    }
  }, [selectedDate]);

  return (
    <BAIFlex direction="column" gap="xs" align="start" {...containerProps}>
      <Space.Compact>
        <BAISelect
          popupMatchSelectWidth={false}
          options={propertyOptions}
          value={selectedProperty.key}
          onChange={(_value, options) => {
            const property = _.castArray(options)[0].filter;
            setSelectedProperty(property);
            // Clear any in-progress custom draft when switching properties.
            setCustomDraftValue(undefined);
            const mode =
              property.valueMode ||
              (property.type === 'boolean' ? 'scalar' : 'operator');
            setSelectedOperator(
              mode === 'scalar'
                ? property.implicitOperator || 'equals'
                : property.fixedOperator ||
                    property.defaultOperator ||
                    DEFAULT_OPERATOR_BY_TYPE[property.type],
            );
          }}
          onSelect={() => {
            autoCompleteRef.current?.focus();
            setIsOpenAutoComplete(true);
            setIsValid(true);
          }}
          showSearch={{
            optionFilterProp: 'label',
          }}
          style={{ minWidth: 150 }}
        />
        {/* Hide operator selector if there's only one operator available or fixedOperator is set */}
        {availableOperators.length > 1 && !selectedProperty?.fixedOperator && (
          <BAISelect
            options={operatorOptions}
            popupMatchSelectWidth={false}
            value={selectedOperator}
            onChange={setSelectedOperator}
          />
        )}
        {selectedProperty?.renderInput ? (
          selectedProperty.renderInput({
            value: customDraftValue,
            setValue: setCustomDraftValue,
            onConfirm: addCondition,
            isValid,
            errorMessage: selectedProperty.rule?.message,
          })
        ) : selectedProperty?.type ===
          'custom' ? // than falling through to the free-text AutoComplete. // A `custom` property must supply `renderInput`; render nothing rather
        null : selectedProperty?.type === 'datetime' ? (
          <DatePicker
            value={selectedDate}
            showTime
            style={{ minWidth: 200 }}
            onChange={(date) => setSelectedDate(date)}
            placeholder={
              selectedProperty?.placeholder ??
              t('comp:BAIGraphQLPropertyFilter.SelectDateTime')
            }
          />
        ) : (
          <Tooltip
            title={isValid || !isFocused ? '' : selectedProperty.rule?.message}
            open={!isValid && isFocused}
            color={token.colorError}
          >
            <AutoComplete
              ref={autoCompleteRef}
              value={search}
              open={isOpenAutoComplete}
              onOpenChange={setIsOpenAutoComplete}
              onSelect={(value) => addCondition(value)}
              onChange={(value) => {
                setIsValid(true);
                setSearch(value);
              }}
              style={{ minWidth: 200 }}
              options={effectiveOptions?.filter((option) =>
                !search ? true : option.label?.toString().includes(search),
              )}
              placeholder={
                selectedProperty?.placeholder ??
                t('comp:BAIPropertyFilter.PlaceHolder')
              }
              onBlur={() => setIsFocused(false)}
              onFocus={() => setIsFocused(true)}
            >
              <Input.Search
                onSearch={(value) => addCondition(value)}
                allowClear
                status={!isValid && isFocused ? 'error' : undefined}
              />
            </AutoComplete>
          </Tooltip>
        )}
      </Space.Compact>

      {conditions.length > 0 && (
        <BAIFlex
          direction="row"
          gap="xs"
          wrap="wrap"
          style={{ alignSelf: 'stretch' }}
        >
          {conditions.map(renderConditionTag)}
          {conditions.length > 1 && (
            <Tooltip title={t('comp:BAIPropertyFilter.ResetFilter')}>
              <Button
                size="small"
                icon={
                  <CloseCircleOutlined
                    style={{ color: token.colorTextSecondary }}
                  />
                }
                type="text"
                onClick={resetConditions}
              />
            </Tooltip>
          )}
        </BAIFlex>
      )}
    </BAIFlex>
  );
};

BAIGraphQLPropertyFilter.displayName = 'BAIGraphQLPropertyFilter';

export default BAIGraphQLPropertyFilter;
