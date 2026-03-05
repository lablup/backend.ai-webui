/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { AgentSelectQuery } from '../__generated__/AgentSelectQuery.graphql';
import { useBAIPaginationOptionState } from '../hooks/reactPaginationQueryOptions';
import { useControllableValue } from 'ahooks';
import { Select, type SelectProps, theme } from 'antd';
import {
  filterOutEmpty,
  BAIFlex,
  mergeFilterValues,
  BAIResourceNumberWithIcon,
} from 'backend.ai-ui';
import _ from 'lodash';
import React, {
  useDeferredValue,
  useEffect,
  useEffectEvent,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

interface Props extends Omit<SelectProps, 'options'> {
  fallbackToAuto?: boolean;
  fetchKey?: string;
  resourceGroup?: string | null;
}

const AgentSelect: React.FC<Props> = ({
  fetchKey,
  resourceGroup,
  fallbackToAuto,
  ...selectProps
}) => {
  const { t } = useTranslation();
  const [value, setValue] = useControllableValue(selectProps);
  const [searchStr, setSearchStr] = useState<string | undefined>(undefined);
  const deferredSearchStr = useDeferredValue(searchStr);
  const { token } = theme.useToken();

  const { baiPaginationOption } = useBAIPaginationOptionState({
    current: 1,
    pageSize: 50,
  });

  const { agent_summary_list } = useLazyLoadQuery<AgentSelectQuery>(
    graphql`
      query AgentSelectQuery(
        $limit: Int!
        $offset: Int!
        $status: String
        $filter: String
        $scaling_group: String
      ) {
        agent_summary_list(
          limit: $limit
          offset: $offset
          status: $status
          filter: $filter
          scaling_group: $scaling_group
        ) {
          items {
            id
            status
            schedulable
            available_slots
            occupied_slots
            architecture
          }
          total_count
        }
      }
    `,
    {
      limit: baiPaginationOption.limit,
      offset: baiPaginationOption.offset,
      status: 'ALIVE',
      filter: mergeFilterValues([
        'schedulable is true',
        deferredSearchStr ? `id ilike "%${deferredSearchStr}%"` : null,
      ]),
      scaling_group: resourceGroup,
    },
    {
      fetchPolicy: 'network-only',
      fetchKey,
    },
  );

  const agentOptions = _.map(agent_summary_list?.items, (agent) => {
    const availableSlotsInfo: {
      [key in string]: string;
    } = JSON.parse(agent?.available_slots ?? '{}');
    const occupiedSlotsInfo: {
      [key in string]: string;
    } = JSON.parse(agent?.occupied_slots ?? '{}');
    const remainingSlotsInfo: {
      [key in string]: number;
    } = _.chain(availableSlotsInfo)
      .mapValues((value, key) => {
        if (key.endsWith('.shares')) {
          return parseFloat(value) - parseFloat(occupiedSlotsInfo[key] ?? 0);
        } else {
          return parseInt(value) - parseInt(occupiedSlotsInfo[key] ?? 0);
        }
      })
      .value();

    return {
      label: (
        <BAIFlex
          direction="row"
          justify="between"
          style={{
            marginRight: token.marginXS,
          }}
        >
          {agent?.id}
          <BAIFlex direction="row" gap={'xxs'}>
            {_.map(remainingSlotsInfo, (slot, key) => {
              return (
                <BAIResourceNumberWithIcon
                  key={key}
                  // @ts-ignore
                  type={key}
                  value={slot.toString()}
                  hideTooltip
                />
              );
            })}
          </BAIFlex>
        </BAIFlex>
      ),
      value: agent?.id,
    };
  });

  const autoSelectIfMatch = _.includes(
    _.toLower(t('session.launcher.AutoSelect')),
    _.toLower(deferredSearchStr) ?? '',
  )
    ? { label: t('session.launcher.AutoSelect'), value: 'auto' }
    : undefined;

  const changeToAutoWhenInvalidValueEffectEvent = useEffectEvent(() => {
    // skip while searching
    if (_.isEmpty(searchStr) && fallbackToAuto && value) {
      const valueArray = _.castArray(value);
      const validValues = agentOptions.map((option) => option.value);
      const newValue = valueArray.filter((v) =>
        validValues.includes(v as string),
      );
      if (!_.isEqual(valueArray, newValue)) {
        setValue('auto');
      }
    }
  });

  useEffect(() => {
    changeToAutoWhenInvalidValueEffectEvent();
  }, [value, agentOptions]);

  return (
    <Select
      loading={searchStr !== deferredSearchStr}
      showSearch={{
        searchValue: searchStr,
        onSearch: (v) => {
          setSearchStr(v);
        },
        filterOption: false,
      }}
      options={filterOutEmpty([autoSelectIfMatch, ...agentOptions])}
      //override props.onChange and props.value, it is handled by useControllableValue
      {...selectProps}
      onChange={(value: unknown, option) => {
        if (
          selectProps.mode === 'multiple' &&
          _.isArray(value) &&
          _.isArray(option)
        ) {
          if (_.last(value) === 'auto' || value.length === 0) {
            value = ['auto'];
            option = _.last(option);
          } else if (value[0] === 'auto' && value.length > 1) {
            value = value.slice(1);
            option = option.slice(1);
          }
        }
        setValue(value, option);
      }}
      value={value}
    />
  );
};

export default AgentSelect;
