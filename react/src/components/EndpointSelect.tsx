import { useBAIPaginationOptionState } from '../hooks/reactPaginationQueryOptions';
import {
  EndpointSelectQuery,
  EndpointSelectQuery$data,
} from './__generated__/EndpointSelectQuery.graphql';
import { useControllableValue } from 'ahooks';
import { Select, SelectProps } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import React from 'react';
import { useLazyLoadQuery } from 'react-relay';

interface EndpointSelectProps extends Omit<SelectProps, 'options'> {
  autoSelectDefault?: boolean;
}

export type Endpoint = NonNullableItem<
  EndpointSelectQuery$data['endpoint_list']
>;

const EndpointSelect: React.FC<EndpointSelectProps> = ({
  autoSelectDefault,
  ...selectProps
}) => {
  const { baiPaginationOption } = useBAIPaginationOptionState({
    current: 1,
    pageSize: 100,
  });
  const { endpoint_list } = useLazyLoadQuery<EndpointSelectQuery>(
    graphql`
      query EndpointSelectQuery($offset: Int!, $limit: Int!, $projectID: UUID) {
        endpoint_list(
          offset: $offset
          limit: $limit
          project: $projectID
          filter: "name != 'koalpaca-test'"
        ) {
          total_count
          items {
            name
            endpoint_id
            url
          }
        }
      }
    `,
    {
      limit: baiPaginationOption.limit,
      offset: baiPaginationOption.offset,
    },
  );
  const [controllableValue, setControllableValue] = useControllableValue(
    selectProps,
    autoSelectDefault
      ? {
          defaultValue: endpoint_list?.items?.[0]?.endpoint_id,
        }
      : undefined,
  );

  return (
    <Select
      showSearch
      {...selectProps}
      options={_.map(endpoint_list?.items, (item) => {
        return {
          label: item?.name,
          value: item?.endpoint_id,
          endpoint: item,
        };
      })}
      value={controllableValue}
      onChange={(v, option) => {
        setControllableValue(v, _.castArray(option)?.[0].endpoint);
      }}
    />
  );
};

export default EndpointSelect;
