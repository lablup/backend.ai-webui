import useControllableState from '../hooks/useControllableState';
import Flex from './Flex';
import { CloseCircleOutlined } from '@ant-design/icons';
import { useDynamicList } from 'ahooks';
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
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';

//github.com/lablup/backend.ai/blob/main/src/ai/backend/manager/models/minilang/queryfilter.py
https: type FilterProperty = {
  key: string;
  // operators: Array<string>;
  defaultOperator?: string;
  propertyLabel: string;
  // TODO: support array, number
  type: 'string' | 'boolean';
  options?: AutoCompleteProps['options'];
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

function trimFilterValue(filterValue: string): string {
  return filterValue.replace(/^%|%$/g, '');
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

const BAIPropertyFilter: React.FC<BAIPropertyFilterProps> = ({
  filterProperties,
  value: propValue,
  onChange: propOnChange,
  defaultValue,
  loading,
  ...containerProps
}) => {
  const [search, setSearch] = useControllableState({});
  const autoCompleteRef = useRef<GetRef<typeof AutoComplete>>(null);
  const [isOpenAutoComplete, setIsOpenAutoComplete] = useState(false);

  const [value, setValue] = useControllableState<string | undefined>({
    value: propValue,
    defaultValue: defaultValue,
    onChange: propOnChange,
  });
  const filtersFromValue = useMemo(() => {
    if (value === undefined) return [];
    const filters = value.split('&').map((filter) => filter.trim());
    return filters.map((filter) => {
      const { property, operator, value } = parseFilterValue(filter);
      return {
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
  const options = _.map(filterProperties, (filterProperty) => {
    return {
      label: filterProperty.propertyLabel,
      value: filterProperty.key,
      filter: filterProperty,
    };
  });
  const [selectedProperty, setSelectedProperty] = useState(options[0].filter);
  const { list, remove, push, resetList, getKey } =
    useDynamicList<FilterInput>(filtersFromValue);

  const { token } = theme.useToken();

  useEffect(() => {
    if (list.length === 0) {
      setValue(undefined);
    } else {
      setValue(
        _.map(list, (item) => {
          const valueStringInResult =
            item.type === 'string' ? `"${item.value}"` : item.value;
          return `${item.property} ${item.operator} ${valueStringInResult}`;
        }).join(' & '),
      );
    }
  }, [list, setValue]);

  const onSearch = (value: string) => {
    if (_.isEmpty(value)) return;
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
    <Flex direction="column" gap={'xs'} style={{ flex: 1 }} align="start">
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
          }}
          showSearch
          optionFilterProp="label"
        />
        <AutoComplete
          ref={autoCompleteRef}
          value={search}
          open={isOpenAutoComplete}
          onDropdownVisibleChange={setIsOpenAutoComplete}
          // https://ant.design/components/auto-complete#why-doesnt-the-text-composition-system-work-well-with-onsearch-in-controlled-mode
          // onSearch={(value) => {}}
          onSelect={onSearch}
          onChange={(value) => {
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
              return _.isEmpty(search)
                ? true
                : option.label?.toString().includes(search);
            },
          )}
          placeholder={t('propertyFilter.placeHolder')}
          allowClear
        >
          <Input.Search onSearch={onSearch} />
        </AutoComplete>
      </Space.Compact>
      {list.length > 0 && (
        <Flex
          direction="row"
          gap={'xs'}
          wrap="wrap"
          style={{ alignSelf: 'stretch' }}
        >
          {_.map(list, (item, index) => {
            return (
              <Tag
                key={getKey(index)}
                closable
                onClose={() => {
                  remove(index);
                }}
                style={{ margin: 0 }}
              >
                {item.propertyLabel}:{' '}
                {item.label || trimFilterValue(item.value)}
              </Tag>
            );
          })}
          {list.length > 1 && (
            <Tooltip title={t('propertyFilter.ResetFilter')}>
              <Button
                size="small"
                icon={
                  <CloseCircleOutlined
                    style={{ color: token.colorTextSecondary }}
                  />
                }
                type="text"
                onClick={() => {
                  resetList([]);
                }}
              />
            </Tooltip>
          )}
        </Flex>
      )}
    </Flex>
  );
};

export default BAIPropertyFilter;
