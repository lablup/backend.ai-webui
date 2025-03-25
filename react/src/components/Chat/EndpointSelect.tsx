import { useSuspendedBackendaiClient } from '../../hooks';
import {
  EndpointSelectQuery,
  EndpointSelectQuery$data,
} from './__generated__/EndpointSelectQuery.graphql';
import { useControllableValue } from 'ahooks';
import { Select, SelectProps } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import React, { useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { useLazyLoadQuery } from 'react-relay';

interface EndpointSelectProps extends Omit<SelectProps, 'options'> {
  fetchKey?: string;
  lifecycleStageFilter?: LifecycleStage[];
}

export type Endpoint = NonNullableItem<
  EndpointSelectQuery$data['endpoint_list']
>;

type LifecycleStage = 'created' | 'destroying' | 'destroyed';

const EndpointSelect: React.FC<EndpointSelectProps> = ({
  fetchKey,
  lifecycleStageFilter = ['created'],
  loading,
  ...selectPropsWithoutLoading
}) => {
  const { t } = useTranslation();
  const baiClient = useSuspendedBackendaiClient();
  const [controllableValue, setControllableValue] =
    useControllableValue<string>(selectPropsWithoutLoading);
  const [searchStr, setSearchStr] = useState<string>();
  const [isSearchPending, startSearchTransition] = useTransition();

  const lifecycleStageFilterStr = lifecycleStageFilter
    .map((v) => `lifecycle_stage == "${v}"`)
    .join(' | ');

  const { endpoint_list, endpoint } = useLazyLoadQuery<EndpointSelectQuery>(
    graphql`
      query EndpointSelectQuery(
        $offset: Int!
        $limit: Int!
        $projectID: UUID
        $filter: String
        $endpoint_id: UUID!
        $skipEndpoint: Boolean!
      ) {
        endpoint_list(
          offset: $offset
          limit: $limit
          project: $projectID
          filter: $filter
        ) {
          total_count
          items {
            name
            endpoint_id
            url
            ...ChatCard_endpoint
          }
        }
        endpoint(endpoint_id: $endpoint_id) @skipOnClient(if: $skipEndpoint) {
          name
          endpoint_id
          ...ChatCard_endpoint
        }
      }
    `,
    {
      limit: 10,
      offset: 0,
      filter: baiClient.supports('endpoint-lifecycle-stage-filter')
        ? [lifecycleStageFilterStr, searchStr]
            .filter(Boolean)
            .map((v) => `(${v})`)
            .join(' & ')
        : undefined,
      endpoint_id: controllableValue,
      skipEndpoint: !controllableValue,
    },
    {
      fetchKey: fetchKey,
    },
  );

  const selectOptions = endpoint
    ? _.map(
        _.uniqBy(_.concat(endpoint_list?.items, endpoint), 'endpoint_id'),
        (item) => {
          return {
            label: item?.name,
            value: item?.endpoint_id,
            endpoint: item,
          };
        },
      )
    : _.map(endpoint_list?.items, (item) => {
        return {
          label: item?.name,
          value: item?.endpoint_id,
          endpoint: item,
        };
      });

  return (
    <Select
      placeholder={t('chatui.SelectEndpoint')}
      style={{
        fontWeight: 'normal',
      }}
      showSearch
      onSearch={(v) => {
        startSearchTransition(() => {
          setSearchStr(v && `name ilike "%${v}%"`);
        });
      }}
      filterOption={false}
      loading={isSearchPending || loading}
      options={selectOptions}
      {...selectPropsWithoutLoading}
      // override value and onChange
      value={controllableValue}
      onChange={(v, option) => {
        setControllableValue(v, _.castArray(option)?.[0].endpoint);
      }}
    />
  );
};

export default EndpointSelect;
