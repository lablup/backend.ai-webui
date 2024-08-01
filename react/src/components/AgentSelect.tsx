import { useBAIPaginationOptionState } from '../hooks/reactPaginationQueryOptions';
import Flex from './Flex';
import ResourceNumber from './ResourceNumber';
import { AgentSelectorQuery } from './__generated__/AgentSelectorQuery.graphql';
import { useControllableValue } from 'ahooks';
import { Select, SelectProps } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLazyLoadQuery } from 'react-relay';

type AgentInfo = {
  label: string;
  value: string;
};

interface Props extends SelectProps {
  onSelectAgent?: (agentInfo: AgentInfo) => void;
  autoSelectDefault?: boolean;
  fetchKey?: string;
}

const AgentSelector: React.FC<Props> = ({
  onSelectAgent,
  fetchKey,
  ...selectProps
}) => {
  const { t } = useTranslation();
  const [value, setValue] = useControllableValue(selectProps);

  const { baiPaginationOption } = useBAIPaginationOptionState({
    current: 1,
    pageSize: 20,
  });

  const { agent_summary_list } = useLazyLoadQuery<AgentSelectorQuery>(
    graphql`
      query AgentSelectorQuery(
        $limit: Int!
        $offset: Int!
        $status: String
        $filter: String
      ) {
        agent_summary_list(
          limit: $limit
          offset: $offset
          status: $status
          filter: $filter
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
      filter: 'schedulable is true', // true, false, null
    },
    {
      fetchPolicy: 'network-only',
      fetchKey,
    },
  );

  const agentOptions = _.map(agent_summary_list?.items, (agent) => {
    const availableSlotsInfo: {
      [key in string]: string;
    } = JSON.parse(agent?.available_slots);
    const occupiedSlotsInfo: {
      [key in string]: string;
    } = JSON.parse(agent?.occupied_slots);
    const remainingSlotsInfo: {
      [key in string]: number;
    } = _.chain(availableSlotsInfo)
      .mapValues((value, key) => {
        if (key.endsWith('.shares')) {
          return parseFloat(value) - parseFloat(occupiedSlotsInfo[key]);
        } else {
          return parseInt(value) - parseInt(occupiedSlotsInfo[key]);
        }
      })
      .value();
    return {
      label: (
        <Flex direction="row" justify="between">
          {agent?.id}
          <Flex direction="row" gap={'xxs'}>
            {_.map(remainingSlotsInfo, (slot, key) => {
              return (
                <ResourceNumber
                  key={key}
                  // @ts-ignore
                  type={key}
                  value={slot.toString()}
                  hideTooltip
                />
              );
            })}
          </Flex>
        </Flex>
      ),
      value: agent?.id,
    };
  });

  return (
    <Select
      onChange={(value, option) => {
        setValue(value);
        onSelectAgent?.(option as AgentInfo);
      }}
      {...selectProps}
      value={value}
      options={[
        { label: t('session.launcher.autoSelect'), value: 'auto' },
        ...agentOptions,
      ]}
    />
  );
};

export default AgentSelector;
