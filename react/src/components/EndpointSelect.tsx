import { useSuspendedBackendaiClient } from '../hooks';
import {
  EndpointSelectQuery,
  EndpointSelectQuery$data,
} from './__generated__/EndpointSelectQuery.graphql';
import { useControllableValue } from 'ahooks';
import { Select, SelectProps } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import React, { useState, useTransition } from 'react';
import { useLazyLoadQuery } from 'react-relay';

interface EndpointSelectProps extends Omit<SelectProps, 'options'> {
  fetchKey?: string;
}

export type Endpoint = NonNullableItem<
  EndpointSelectQuery$data['endpoint_list']
>;

const EndpointSelect: React.FC<EndpointSelectProps> = ({
  fetchKey,
  ...selectProps
}) => {
  const baiClient = useSuspendedBackendaiClient();
  const [controllableValue, setControllableValue] =
    useControllableValue(selectProps);
  const [searchStr, setSearchStr] = useState<string>();
  const [isSearchPending, startSearchTransition] = useTransition();

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
            ...EndpointLLMChatCard_endpoint
          }
        }
        endpoint(endpoint_id: $endpoint_id) @skip(if: $skipEndpoint) {
          name
          endpoint_id
          ...EndpointLLMChatCard_endpoint
        }
      }
    `,
    {
      limit: 10,
      offset: 0,
      filter: baiClient.supports('endpoint-lifecycle-stage-filter')
        ? [
            `(lifecycle_stage == "created")`,
            searchStr && `(name ilike "%${searchStr}%")`,
          ]
            .filter(Boolean)
            .join(' & ')
        : undefined,
      endpoint_id: controllableValue,
      skipEndpoint: !!!controllableValue,
    },
    {
      fetchKey: fetchKey,
    },
  );

  // useEffect(() => {
  //   if (autoSelectDefault && _.isEmpty(controllableValue)) {
  //     setControllableValue(
  //       endpoint_list?.items?.[0]?.endpoint_id,
  //       endpoint_list?.items?.[0],
  //     );
  //   }
  // }, []);

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
      showSearch
      loading={isSearchPending}
      onSearch={(v) => {
        startSearchTransition(() => {
          setSearchStr(v);
        });
      }}
      optionFilterProp="label"
      {...selectProps}
      options={selectOptions}
      value={controllableValue}
      onChange={(v, option) => {
        setControllableValue(v, _.castArray(option)?.[0].endpoint);
      }}
    />
  );
};

export default EndpointSelect;
