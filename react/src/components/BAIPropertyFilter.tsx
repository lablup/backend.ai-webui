import { filterEmptyItem } from '../helper';
import Flex from './Flex';
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
  extends Omit<ComponentProps<typeof Flex>, 'value' | 'onChange'> {
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
    _.map(filterEmptyItem(filterStrings), (str) => `(${str})`),
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

  const filtersFromValue = useMemo(() => {
    if (value === undefined || value === '') return [];
    const filters = value.split('&').map((filter) => filter.trim());
    return filters.map((filter, index) => {
      const { property, operator, value } = parseFilterValue(filter);
      return {
        key: index + value,
        property,
        operator,
        value,
        propertyLabel:
          _.find(filterProperties, (f) => f.key === property)?.propertyLabel ||
          property,
        type:
          _.find(filterProperties, (f) => f.key === property)?.type || 'string',
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
    push({
      property: selectedProperty.key,
      propertyLabel: selectedProperty.propertyLabel,
      operator,
      value: filterValue,
      label: selectedProperty.options?.find((o) => o.value === value)?.label,
      type: selectedProperty.type,
    });
  };

  return (
    <Flex direction="column" gap={'xs'} align="start" {...containerProps}>
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
            onDropdownVisibleChange={setIsOpenAutoComplete}
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
            placeholder={t('propertyFilter.PlaceHolder')}
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
        <Flex
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
              {item.propertyLabel}: {trimFilterValue(item.value)}
            </Tag>
          ))}
          {filtersFromValue.length > 1 && (
            <Tooltip title={t('propertyFilter.ResetFilter')}>
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
        </Flex>
      )}
    </Flex>
  );
};

export default BAIPropertyFilter;
