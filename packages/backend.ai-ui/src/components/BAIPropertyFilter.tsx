import { filterOutEmpty } from '../helper';
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
import React, {
  ComponentProps,
  ReactNode,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';

//github.com/lablup/backend.ai/blob/main/src/ai/backend/manager/models/minilang/queryfilter.py
export type FilterProperty = {
  key: string;
  // operators: Array<string>;
  defaultOperator?: string;
  propertyLabel: string;
  // TODO: support array, number
  type: 'string' | 'boolean';
  options?: AutoCompleteProps['options'];
  strictSelection?: boolean;
  rule?: {
    message: string;
    validate: (value: string) => boolean;
  };
};

export interface BAIPropertyFilterProps
  extends Omit<ComponentProps<typeof BAIFlex>, 'value' | 'onChange'> {
  value?: string;
  onChange?: (value: string) => void;
  defaultValue?: string;
  filterProperties: Array<FilterProperty>;
  loading?: boolean;
}

interface FilterInput {
  property: string;
  operator: string;
  value: string;
  label?: ReactNode;
  valueLabel?: string;
  type: FilterProperty['type'];
  propertyLabel: string;
}

const DEFAULT_OPERATOR_OF_TYPES = {
  string: 'ilike',
  boolean: '==',
};

const DEFAULT_OPTIONS_OF_TYPES: {
  [key: string]: AutoCompleteProps['options'] | undefined;
} = {
  boolean: [
    {
      label: 'True',
      value: 'true',
    },
    {
      label: 'False',
      value: 'false',
    },
  ],
  string: undefined,
};

const DEFAULT_STRICT_SELECTION_OF_TYPES: {
  [key: string]: boolean | undefined;
} = {
  boolean: true,
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
  return !!mergedFilter ? mergedFilter : undefined;
}

/**
 * Parses the filter value and returns an object containing the property, operator, and value.
 * @param filter - The filter string to parse.
 * @returns An object containing the parsed property, operator, and value.
 */
export function parseFilterValue(filter: string) {
  // Split the filter string into an array of strings using a regular expression.
  // The regular expression splits the string at whitespace characters, but ignores whitespace within double quotes.
  const [property, ...rest] = filter.split(/\s+(?=(?:(?:[^"]*"){2})*[^"]*$)/);

  // Join the remaining strings in the array and split them again using the same regular expression.
  // This extracts the operator and the value from the filter string.
  const [operator, ...valueParts] = rest
    .join(' ')
    .split(/\s+(?=(?:(?:[^"]*"){2})*[^"]*$)/);

  // Join the value parts into a single string and remove any leading or trailing double quotes.
  const value = valueParts.join(' ').replace(/^"|"$/g, '');

  // Return an object containing the parsed property, operator, and value.
  return { property, operator, value };
}

/**
 * Combines filter strings with the specified logical operator.
 * @param filters - The array of filter strings to combine.
 * @param operator - The logical operator to use ('and' or 'or').
 * @returns The combined filter string.
 */
function combineFilters(filters: string[], operator: '&' | '|'): string {
  return filters.join(` ${operator} `);
}

/**
 * BAIPropertyFilter component - Advanced property filtering interface for Backend.AI applications.
 *
 * Provides a sophisticated filtering interface for constructing complex filter queries with support for:
 * - Multiple property types (string and boolean) with type-specific operators
 * - Dynamic query building through a visual interface
 * - Autocomplete support with predefined options and suggestions
 * - Custom validation rules for property values
 * - Backend.AI query filter minilang compatibility
 *
 * The component generates filter query strings compatible with Backend.AI's query system,
 * enabling powerful data filtering capabilities across the platform.
 *
 * @param props - BAIPropertyFilterProps configuration object
 * @returns React functional component
 *
 * @example
 * ```tsx
 * // Basic usage with string and boolean properties
 * <BAIPropertyFilter
 *   filterProperties={[
 *     {
 *       key: 'name',
 *       propertyLabel: 'Name',
 *       type: 'string',
 *       defaultOperator: 'ilike',
 *     },
 *     {
 *       key: 'active',
 *       propertyLabel: 'Active Status',
 *       type: 'boolean',
 *     },
 *   ]}
 *   value="name ilike %test% & active == true"
 *   onChange={(value) => setFilterValue(value)}
 * />
 *
 * // With custom validation and options
 * <BAIPropertyFilter
 *   filterProperties={[
 *     {
 *       key: 'email',
 *       propertyLabel: 'Email',
 *       type: 'string',
 *       rule: {
 *         message: 'Please enter a valid email address',
 *         validate: (value) => /\S+@\S+\.\S+/.test(value),
 *       },
 *     },
 *     {
 *       key: 'status',
 *       propertyLabel: 'Status',
 *       type: 'string',
 *       options: [
 *         { label: 'Active', value: 'active' },
 *         { label: 'Inactive', value: 'inactive' },
 *       ],
 *       strictSelection: true,
 *     },
 *   ]}
 *   onChange={handleFilterChange}
 * />
 * ```
 */
const BAIPropertyFilter: React.FC<BAIPropertyFilterProps> = ({
  filterProperties,
  value: propValue,
  onChange: propOnChange,
  defaultValue,
  loading,
  ...containerProps
}) => {
  const [search, setSearch] = useState<string>();
  const autoCompleteRef = useRef<GetRef<typeof AutoComplete>>(null);
  const [isOpenAutoComplete, setIsOpenAutoComplete] = useState(false);

  const [value, setValue] = useControllableValue<string | undefined>({
    value: propValue,
    defaultValue: defaultValue,
    onChange: propOnChange,
  });

  const generateValueLabel = (label: ReactNode) => {
    // Generate a label for the filter value,
    // if the label is a string or number, return its string representation.
    // Otherwise, return undefined.
    return _.isString(label) || _.isNumber(label)
      ? _.toString(label)
      : undefined;
  };

  const filtersFromValue = useMemo(() => {
    if (value === undefined || value === '') return [];
    const filters = value.split('&').map((filter) => filter.trim());
    return filters.map((filter, index) => {
      const { property, operator, value } = parseFilterValue(filter);
      const filterProperty = _.find(
        filterProperties,
        (f) => f.key === property,
      );
      const option = _.find(
        filterProperty?.options,
        (o) => o.value === trimFilterValue(value),
      );
      return {
        key: index + value,
        property,
        operator,
        value,
        valueLabel: generateValueLabel(option?.label),
        propertyLabel: filterProperty?.propertyLabel || property,
        type: filterProperty?.type || 'string',
      };
    });
  }, [value, filterProperties]);

  const { t } = useTranslation();
  const options = _.map(filterProperties, (filterProperty) => ({
    label: filterProperty.propertyLabel,
    value: filterProperty.key,
    filter: filterProperty,
  }));
  const [selectedProperty, setSelectedProperty] = useState(options[0].filter);

  const { token } = theme.useToken();

  const [isValid, setIsValid] = useState(true);
  const [isFocused, setIsFocused] = useState(false);

  const updateFiltersValue = (filters: FilterInput[]) => {
    if (filters.length === 0) {
      setValue(undefined);
    } else {
      const newFilterString = _.map(filters, (item) => {
        const valueStringInResult =
          item.type === 'string' ? `"${item.value}"` : item.value;
        return `${item.property} ${item.operator} ${valueStringInResult}`;
      });
      setValue(combineFilters(newFilterString, '&'));
    }
  };

  const push = (item: FilterInput) => {
    updateFiltersValue([...filtersFromValue, item]);
  };

  const remove = (key: string) => {
    const newFilters = filtersFromValue.filter((item) => item.key !== key);
    updateFiltersValue(newFilters);
  };

  const resetList = () => {
    updateFiltersValue([]);
  };

  const onSearch = (value: string) => {
    if (_.isEmpty(value)) return;
    if (
      selectedProperty.strictSelection ||
      DEFAULT_STRICT_SELECTION_OF_TYPES[selectedProperty.type]
    ) {
      const option = _.find(
        selectedProperty.options ||
          DEFAULT_OPTIONS_OF_TYPES[selectedProperty.type],
        (o) => o.value === value,
      );
      if (!option) return;
    }
    const isValid =
      !selectedProperty.rule?.validate || selectedProperty.rule.validate(value);
    setIsValid(isValid);
    if (!isValid) return;

    setSearch('');
    const operator =
      selectedProperty.defaultOperator ||
      DEFAULT_OPERATOR_OF_TYPES[selectedProperty.type];
    const filterValue =
      operator === 'ilike' || operator === 'like' ? `%${value}%` : `${value}`;
    const option = _.find(selectedProperty.options, (o) => o.value === value);
    push({
      property: selectedProperty.key,
      propertyLabel: selectedProperty.propertyLabel,
      operator,
      value: filterValue,
      label: option?.label,
      valueLabel: generateValueLabel(option?.label),
      type: selectedProperty.type,
    });
  };

  return (
    <BAIFlex direction="column" gap={'xs'} align="start" {...containerProps}>
      <Space.Compact>
        <Select
          popupMatchSelectWidth={false}
          options={options}
          value={selectedProperty.key}
          onChange={(value, options) => {
            setSelectedProperty(_.castArray(options)[0].filter);
          }}
          onSelect={() => {
            autoCompleteRef.current?.focus();
            setIsOpenAutoComplete(true);
            setIsValid(true);
          }}
          showSearch
          optionFilterProp="label"
        />
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
            onSelect={onSearch}
            onChange={(value) => {
              setIsValid(true);
              setSearch(value);
            }}
            style={{
              minWidth: 200,
            }}
            // @ts-ignore
            options={_.filter(
              selectedProperty.options ||
                DEFAULT_OPTIONS_OF_TYPES[selectedProperty.type],
              (option) => {
                return !search
                  ? true
                  : option.label?.toString().includes(search);
              },
            )}
            placeholder={t('comp:BAIPropertyFilter.PlaceHolder')}
            onBlur={() => {
              setIsFocused(false);
            }}
            onFocus={() => {
              setIsFocused(true);
            }}
          >
            <Input.Search
              onSearch={onSearch}
              allowClear
              status={!isValid && isFocused ? 'error' : undefined}
            />
          </AutoComplete>
        </Tooltip>
      </Space.Compact>
      {filtersFromValue.length > 0 && (
        <BAIFlex
          direction="row"
          gap={'xs'}
          wrap="wrap"
          style={{ alignSelf: 'stretch' }}
        >
          {_.map(filtersFromValue, (item) => (
            <Tag
              key={item.key}
              closable
              onClose={() => remove(item.key)}
              style={{ margin: 0 }}
            >
              {item.propertyLabel}:{' '}
              {item.valueLabel ?? trimFilterValue(item.value)}
            </Tag>
          ))}
          {filtersFromValue.length > 1 && (
            <Tooltip title={t('comp:BAIPropertyFilter.ResetFilter')}>
              <Button
                size="small"
                icon={
                  <CloseCircleOutlined
                    style={{ color: token.colorTextSecondary }}
                  />
                }
                type="text"
                onClick={resetList}
              />
            </Tooltip>
          )}
        </BAIFlex>
      )}
    </BAIFlex>
  );
};

BAIPropertyFilter.displayName = 'BAIPropertyFilter';

export default BAIPropertyFilter;
