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

interface Props extends SelectProps {
  autoSelectDefault?: boolean;
  fetchKey?: string;
  resourceGroup?: string | null;
}

const AgentSelector: React.FC<Props> = ({
  fetchKey,
  resourceGroup,
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
      filter: 'schedulable is true', // true, false, null
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
    } = JSON.parse(agent?.available_slots);
    const occupiedSlotsInfo: {
      [key in string]: string;
    } = JSON.parse(agent?.occupied_slots);
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

  console.log(agentOptions);

  return (
    <Select
      onChange={(value, option) => {
        setValue(value, option);
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
