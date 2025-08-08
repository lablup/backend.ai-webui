import {
  EndpointSelectQuery,
  EndpointSelectQuery$data,
} from '../../__generated__/EndpointSelectQuery.graphql';
import { EndpointSelectValueQuery } from '../../__generated__/EndpointSelectValueQuery.graphql';
import { useLazyPaginatedQuery } from '../../hooks/usePaginatedQuery';
import BAISelect from '../BAISelect';
import TotalFooter from '../TotalFooter';
import { useControllableValue } from 'ahooks';
import { GetRef, SelectProps, Skeleton, Tooltip } from 'antd';
import { BAIFlex, BAILink } from 'backend.ai-ui';
import _ from 'lodash';
import { InfoIcon } from 'lucide-react';
import React, { useDeferredValue, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

export type Endpoint = NonNullable<
  NonNullableItem<EndpointSelectQuery$data['endpoint_list']>
>;

export interface EndpointSelectProps
  extends Omit<SelectProps, 'options' | 'labelInValue'> {
  fetchKey?: string;
  lifecycleStageFilter?: LifecycleStage[];
}

type LifecycleStage = 'created' | 'destroying' | 'destroyed';

const EndpointSelect: React.FC<EndpointSelectProps> = ({
  fetchKey,
  lifecycleStageFilter = ['created'],
  loading,
  ...selectPropsWithoutLoading
}) => {
  const { t } = useTranslation();
  const [controllableValue, setControllableValue] = useControllableValue<
    string | undefined
  >(selectPropsWithoutLoading);
  const [controllableOpen, setControllableOpen] = useControllableValue<boolean>(
    selectPropsWithoutLoading,
    {
      valuePropName: 'open',
      trigger: 'onDropdownVisibleChange',
    },
  );
  const deferredOpen = useDeferredValue(controllableOpen);
  const [searchStr, setSearchStr] = useState<string>();
  const deferredSearchStr = useDeferredValue(searchStr);

  const selectRef = useRef<GetRef<typeof BAISelect> | null>(null);

  const lifecycleStageFilterStr = lifecycleStageFilter
    .map((v) => `lifecycle_stage == "${v}"`)
    .join(' | ');

  const { endpoint: selectedEndpoint } =
    useLazyLoadQuery<EndpointSelectValueQuery>(
      graphql`
        query EndpointSelectValueQuery($endpoint_id: UUID!) {
          endpoint(endpoint_id: $endpoint_id) {
            name
            endpoint_id @required(action: NONE)
            url
          }
        }
      `,
      {
        endpoint_id: controllableValue ?? '',
      },
      {
        // to skip the query when controllableValue is empty
        fetchPolicy: controllableValue ? 'store-or-network' : 'store-only',
      },
    );

  const {
    paginationData,
    result: { endpoint_list },
    loadNext,
    isLoadingNext,
  } = useLazyPaginatedQuery<
    EndpointSelectQuery,
    NonNullable<
      EndpointSelectQuery['response']['endpoint_list']
    >['items'][number]
  >(
    graphql`
      query EndpointSelectQuery(
        $offset: Int!
        $limit: Int!
        $projectID: UUID
        $filter: String
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
            endpoint_id @required(action: NONE)
            url
          }
        }
      }
    `,
    {
      limit: 10,
    },
    {
      filter: [
        lifecycleStageFilterStr,
        deferredSearchStr ? `name ilike "%${deferredSearchStr}%"` : undefined,
      ]
        .filter(Boolean)
        .map((v) => `(${v})`)
        .join(' & '),
    },
    // TODO: skip fetch when the option popover is closed
    {
      fetchKey,
      fetchPolicy: deferredOpen ? 'network-only' : 'store-only',
    },
    {
      getTotal: (result) => result.endpoint_list?.total_count,
      getItem: (result) => result.endpoint_list?.items,
      getId: (item) => item?.endpoint_id,
    },
  );

  const selectOptions = _.map(paginationData, (item) => {
    return {
      label: item?.name,
      value: item?.endpoint_id,
      endpoint: item,
    };
  });

  const [optimisticValueWithLabel, setOptimisticValueWithLabel] = useState(
    selectedEndpoint
      ? {
          label: selectedEndpoint?.name || undefined,
          value: selectedEndpoint?.endpoint_id || undefined,
        }
      : controllableValue
        ? {
            label: controllableValue,
            value: controllableValue,
          }
        : controllableValue,
  );

  const isValueMatched = searchStr === deferredSearchStr;
  useEffect(() => {
    if (isValueMatched) {
      // Scroll dropdown to top position when search completes (search value matches deferred value)
      // This ensures users see the top results immediately after search processing
      selectRef.current?.scrollTo(0);
    }
  }, [isValueMatched]);
  return (
    <BAISelect
      ref={selectRef}
      placeholder={t('chatui.SelectEndpoint')}
      style={{
        minWidth: 100,
      }}
      showSearch
      searchValue={searchStr}
      onSearch={(v) => {
        setSearchStr(v);
      }}
      labelRender={({ label }: { label: React.ReactNode }) => {
        return label ? (
          <BAIFlex gap="xxs">
            {label}
            <Tooltip title={t('general.NavigateToDetailPage')}>
              <BAILink to={`/serving/${selectedEndpoint?.endpoint_id}`}>
                <InfoIcon />
              </BAILink>
            </Tooltip>
          </BAIFlex>
        ) : (
          label
        );
      }}
      // TODO: Need to make it work properly when autoClearSearchValue is not specified
      autoClearSearchValue
      filterOption={false}
      loading={searchStr !== deferredSearchStr || loading}
      options={selectOptions}
      {...selectPropsWithoutLoading}
      // override value and onChange
      labelInValue // use labelInValue to display the selected option label
      value={optimisticValueWithLabel}
      onChange={(v, option) => {
        setOptimisticValueWithLabel(v);
        setControllableValue(v.value, _.castArray(option)?.[0].endpoint);
        selectPropsWithoutLoading.onChange?.(v.value || '', option);
      }}
      endReached={() => {
        loadNext();
      }}
      open={controllableOpen}
      onDropdownVisibleChange={setControllableOpen}
      notFoundContent={
        _.isUndefined(paginationData) ? (
          // For the first loading options
          <Skeleton.Input active size="small" block />
        ) : undefined
      }
      footer={
        _.isNumber(endpoint_list?.total_count) &&
        endpoint_list.total_count > 0 ? (
          <TotalFooter
            loading={isLoadingNext}
            total={endpoint_list?.total_count}
          />
        ) : undefined
      }
    />
  );
};

export default EndpointSelect;
