import BAIFlex from './BAIFlex';
import { CloseCircleOutlined } from '@ant-design/icons';
import { useControllableValue } from 'ahooks';
import {
  AutoComplete,
  AutoCompleteProps,
  Button,
  GetRef,
  Input,
  Select,
  Space,
  Tag,
  Tooltip,
  theme,
} from 'antd';
import _ from 'lodash';
import React, { ComponentProps, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

// GraphQL Filter Types
export type StringFilter = {
  eq?: string | null;
  ne?: string | null;
  contains?: string | null;
  startsWith?: string | null;
  endsWith?: string | null;
  in?: string[] | null;
  notIn?: string[] | null;
};

export type NumberFilter = {
  eq?: number | null;
  ne?: number | null;
  gt?: number | null;
  gte?: number | null;
  lt?: number | null;
  lte?: number | null;
  in?: number[] | null;
  notIn?: number[] | null;
};

export type BooleanFilter = boolean;

export type EnumFilter<T = string> = {
  eq?: T | null;
  ne?: T | null;
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

export type FilterPropertyType = 'string' | 'number' | 'boolean' | 'enum';

export type FilterOperator =
  | 'eq'
  | 'ne'
  | 'contains'
  | 'startsWith'
  | 'endsWith'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'in'
  | 'notIn';

type BaseFilterProperty = {
  key: string;
  propertyLabel: string;
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
  // For UI/tag display when valueMode='scalar', use this operator symbol (default 'eq').
  implicitOperator?: FilterOperator;
};

// fixedOperator and defaultOperator are mutually exclusive
export type FilterProperty = BaseFilterProperty &
  (
    | { fixedOperator: FilterOperator; defaultOperator?: never } // Fixed operator (no selector shown)
    | { defaultOperator?: FilterOperator; fixedOperator?: never } // Default operator (can be changed)
    | { defaultOperator?: never; fixedOperator?: never } // No operator preference
  );

export interface BAIGraphQLPropertyFilterProps
  extends Omit<
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

const OPERATORS_BY_TYPE: Record<FilterPropertyType, FilterOperator[]> = {
  string: ['eq', 'ne', 'contains', 'startsWith', 'endsWith', 'in', 'notIn'],
  number: ['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'in', 'notIn'],
  boolean: ['eq'],
  enum: ['eq', 'ne', 'in', 'notIn'],
};

const OPERATOR_LABELS: Record<FilterOperator, string> = {
  eq: 'equals',
  ne: 'not equals',
  contains: 'contains',
  startsWith: 'starts with',
  endsWith: 'ends with',
  gt: 'greater than',
  gte: 'greater or equal',
  lt: 'less than',
  lte: 'less or equal',
  in: 'in',
  notIn: 'not in',
};

const OPERATOR_SHORT_LABELS: Record<FilterOperator, string> = {
  eq: '=',
  ne: '≠',
  contains: ':',
  startsWith: '^',
  endsWith: '$',
  gt: '>',
  gte: '≥',
  lt: '<',
  lte: '≤',
  in: '∈',
  notIn: '∉',
};

const DEFAULT_OPERATOR_BY_TYPE: Record<FilterPropertyType, FilterOperator> = {
  string: 'contains',
  number: 'eq',
  boolean: 'eq',
  enum: 'eq',
};

function generateId(): string {
  return `filter-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
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
    filters.push({
      [condition.property]: filterValue,
    });
  });

  // If there's only one filter, return it directly
  if (filters.length === 1) {
    return filters[0];
  }

  // Multiple filters are combined with specified mode (AND or OR)
  return { [combinationMode]: filters };
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

  // Process property filters
  Object.keys(filter).forEach((key) => {
    if (key === 'AND' || key === 'OR' || key === 'NOT' || key === 'DISTINCT')
      return;

    const propertyConfig = filterProperties.find((p) => p.key === key);
    const filterValue = filter[key];

    const propertyValueMode =
      propertyConfig?.valueMode ||
      (propertyConfig?.type === 'boolean' ? 'scalar' : 'operator');

    if (propertyValueMode === 'scalar' && typeof filterValue !== 'object') {
      // Scalar value directly
      conditions.push({
        id: generateId(),
        property: key,
        operator: propertyConfig?.implicitOperator || 'eq',
        value: String(filterValue),
        propertyLabel: propertyConfig?.propertyLabel || key,
        type: propertyConfig?.type || 'string',
      });
    } else if (filterValue && typeof filterValue === 'object') {
      Object.keys(filterValue).forEach((operator) => {
        const value = filterValue[operator];
        if (value !== null && value !== undefined) {
          conditions.push({
            id: generateId(),
            property: key,
            operator: operator as FilterOperator,
            value: Array.isArray(value) ? value.join(', ') : String(value),
            propertyLabel: propertyConfig?.propertyLabel || key,
            type: propertyConfig?.type || 'string',
          });
        }
      });
    }
  });

  return conditions;
}

const BAIGraphQLPropertyFilter: React.FC<BAIGraphQLPropertyFilterProps> = ({
  filterProperties,
  value: propValue,
  onChange: propOnChange,
  defaultValue,
  loading,
  combinationMode = 'AND',
  ...containerProps
}) => {
  const { token } = theme.useToken();
  const { t } = useTranslation();
  const [value, setValue] = useControllableValue<GraphQLFilter | undefined>({
    value: propValue,
    defaultValue: defaultValue,
    onChange: propOnChange,
  });

  const [conditions, setConditions] = useState<FilterCondition[]>(() =>
    convertGraphQLFilterToConditions(value, filterProperties),
  );

  const [search, setSearch] = useState<string>('');
  const [selectedProperty, setSelectedProperty] = useState<FilterProperty>(
    filterProperties[0],
  );
  const getEffectiveValueMode = (p: FilterProperty | undefined) =>
    p?.valueMode || (p?.type === 'boolean' ? 'scalar' : 'operator');

  const [selectedOperator, setSelectedOperator] = useState<FilterOperator>(
    () => {
      const mode = getEffectiveValueMode(selectedProperty);
      if (mode === 'scalar') return selectedProperty?.implicitOperator || 'eq';
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

  const propertyOptions = useMemo(
    () =>
      filterProperties.map((property) => ({
        label: property.propertyLabel,
        value: property.key,
        filter: property,
      })),
    [filterProperties],
  );

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
      label: OPERATOR_LABELS[op],
      value: op,
    }));
  }, [availableOperators]);

  const updateConditions = (newConditions: FilterCondition[]) => {
    setConditions(newConditions);
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

  const addCondition = (value: string) => {
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
        ? selectedProperty.implicitOperator || 'eq'
        : selectedProperty.fixedOperator || selectedOperator;

    const newCondition: FilterCondition = {
      id: generateId(),
      property: selectedProperty.key,
      operator: operatorToUse,
      value: value,
      propertyLabel: selectedProperty.propertyLabel,
      type: selectedProperty.type,
    };

    updateConditions([...conditions, newCondition]);
    setSearch('');
  };

  const removeCondition = (id: string) => {
    const newConditions = conditions.filter((c) => c.id !== id);
    updateConditions(newConditions);
  };

  const resetConditions = () => {
    updateConditions([]);
  };

  const renderConditionTag = (
    condition: FilterCondition,
  ): React.ReactElement => {
    const operatorShortLabel = OPERATOR_SHORT_LABELS[condition.operator];
    const displayValue =
      condition.operator === 'in' || condition.operator === 'notIn'
        ? `[${condition.value}]`
        : condition.value;

    return (
      <Tag
        key={condition.id}
        closable
        onClose={() => removeCondition(condition.id)}
        style={{ margin: 0 }}
        title={`${condition.propertyLabel} ${OPERATOR_LABELS[condition.operator]} ${condition.value}`}
      >
        {condition.propertyLabel} {operatorShortLabel} {displayValue}
      </Tag>
    );
  };

  return (
    <BAIFlex direction="column" gap="xs" align="start" {...containerProps}>
      <Space.Compact>
        <Select
          popupMatchSelectWidth={false}
          options={propertyOptions}
          value={selectedProperty.key}
          onChange={(_value, options) => {
            const property = _.castArray(options)[0].filter;
            setSelectedProperty(property);
            const mode =
              property.valueMode ||
              (property.type === 'boolean' ? 'scalar' : 'operator');
            setSelectedOperator(
              mode === 'scalar'
                ? property.implicitOperator || 'eq'
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
          showSearch
          optionFilterProp="label"
          style={{ minWidth: 150 }}
        />
        {/* Hide operator selector if there's only one operator available or fixedOperator is set */}
        {availableOperators.length > 1 && !selectedProperty?.fixedOperator && (
          <Select
            options={operatorOptions}
            value={selectedOperator}
            onChange={setSelectedOperator}
            style={{ minWidth: 120 }}
          />
        )}
        <Tooltip
          title={isValid || !isFocused ? '' : selectedProperty.rule?.message}
          open={!isValid && isFocused}
          color={token.colorError}
        >
          <AutoComplete
            ref={autoCompleteRef}
            value={search}
            open={isOpenAutoComplete}
            onDropdownVisibleChange={setIsOpenAutoComplete}
            onSelect={addCondition}
            onChange={(value) => {
              setIsValid(true);
              setSearch(value);
            }}
            style={{ minWidth: 200 }}
            options={effectiveOptions?.filter((option) =>
              !search ? true : option.label?.toString().includes(search),
            )}
            placeholder={t('comp:BAIPropertyFilter.PlaceHolder')}
            onBlur={() => setIsFocused(false)}
            onFocus={() => setIsFocused(true)}
          >
            <Input.Search
              onSearch={addCondition}
              allowClear
              status={!isValid && isFocused ? 'error' : undefined}
            />
          </AutoComplete>
        </Tooltip>
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
