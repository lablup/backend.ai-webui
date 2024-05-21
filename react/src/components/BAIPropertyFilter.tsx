import Flex from './Flex';
import { CloseCircleOutlined } from '@ant-design/icons';
import { useControllableValue, useDynamicList } from 'ahooks';
import { Button, Input, Select, Tag, Tooltip, theme } from 'antd';
import _ from 'lodash';
import React, { ComponentProps, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

// const OPERATION_LABELS = {
//   '==': 'is',
//   '!=': 'is not',
//   '<': 'less than',
//   '<=': 'less than or equal to',
//   '>': 'greater than',
//   '>=': 'greater than or equal to',
//   '%': 'like',
//   in: 'in',
//   contains: 'contains',
// };
// operators: ['==', '!=', '<', '<=', '>', '>=', '%'],

type FilterProperty = {
  key: string;
  // operators: Array<string>;
  defaultOperator?: string;
  propertyLabel: string;
};
export interface BAIPropertyFilterProps
  extends Omit<ComponentProps<typeof Input.Search>, 'value' | 'onChange'> {
  value?: string;
  onChange?: (value: string) => void;
  defaultValue?: string;
  filterProperties: Array<FilterProperty>;
}

interface FilterInput {
  property: string;
  operator: string;
  value: string;
  propertyLabel: string;
}

const DEFAULT_OPERATOR = 'ilike';

function trimFilterValue(filterValue: string): string {
  return filterValue.replace(/^%|%$/g, '');
}

export function parseFilterValue(filter: string) {
  const [property, ...rest] = filter.split(/\s+(?=(?:(?:[^"]*"){2})*[^"]*$)/);
  const [operator, ...valueParts] = rest
    .join(' ')
    .split(/\s+(?=(?:(?:[^"]*"){2})*[^"]*$)/);
  const value = valueParts.join(' ').replace(/^"|"$/g, '');
  return { property, operator, value };
}

const BAIPropertyFilter: React.FC<BAIPropertyFilterProps> = ({
  filterProperties,
  value: propValue,
  onChange: propOnChange,
  defaultValue,
  ...otherProps
}) => {
  const [search, setSearch] = useControllableValue({});

  const [value, setValue] = useControllableValue<string | undefined>({
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
          return `${item.property} ${item.operator} "${item.value}"`;
        }).join(' & '),
      );
    }
  }, [list, setValue]);

  return (
    <Flex direction="column" gap={'xs'} style={{ flex: 1 }} align="start">
      <Flex>
        <Input.Search
          addonBefore={
            <Select
              popupMatchSelectWidth={false}
              options={options}
              value={selectedProperty.key}
              onChange={(value, options) => {
                setSelectedProperty(_.castArray(options)[0].filter);
              }}
            />
          }
          style={{ minWidth: 250 }}
          onSearch={(value) => {
            if (_.isEmpty(value)) return;
            setSearch('');
            const operator =
              selectedProperty.defaultOperator || DEFAULT_OPERATOR;
            const filterValue =
              operator === 'ilike' || operator === 'like'
                ? `%${value}%`
                : `${value}`;
            push({
              property: selectedProperty.key,
              propertyLabel: selectedProperty.propertyLabel,
              operator,
              value: filterValue,
            });
          }}
          allowClear
          placeholder={t('propertyFilter.placeHolder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          {...otherProps}
        />
      </Flex>
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
              {item.propertyLabel}: {trimFilterValue(item.value)}
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
    </Flex>
  );
};

export default BAIPropertyFilter;
