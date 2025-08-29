import {
  DeploymentSelectQuery,
  DeploymentSelectQuery$data,
  DeploymentFilter,
} from '../../__generated__/DeploymentSelectQuery.graphql';
import { DeploymentSelectValueQuery } from '../../__generated__/DeploymentSelectValueQuery.graphql';
import BAILink from '../BAILink';
import BAISelect from '../BAISelect';
import TotalFooter from '../TotalFooter';
import { useControllableValue } from 'ahooks';
import { GetRef, SelectProps, Skeleton, Tooltip } from 'antd';
import { BAIFlex, toLocalId } from 'backend.ai-ui';
import _ from 'lodash';
import { InfoIcon } from 'lucide-react';
import React, { useDeferredValue, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { useRelayCursorPaginatedQuery } from 'src/hooks/useRelayCursorPaginatedQuery';

export type Deployment = NonNullableNodeOnEdges<
  DeploymentSelectQuery$data['deployments']
>;

export interface DeploymentSelectProps
  extends Omit<SelectProps, 'options' | 'labelInValue'> {
  fetchKey?: string;
  filter?: DeploymentFilter;
}

const DeploymentSelect: React.FC<DeploymentSelectProps> = ({
  fetchKey,
  filter,
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

  // Query for selected deployment details
  const { deployment: selectedDeployment } =
    useLazyLoadQuery<DeploymentSelectValueQuery>(
      graphql`
        query DeploymentSelectValueQuery($id: ID!) {
          deployment(id: $id) {
            id
            metadata {
              name
              status
              createdAt
            }
          }
        }
      `,
      {
        id: controllableValue ?? '',
      },
      {
        // to skip the query when controllableValue is empty
        fetchPolicy: controllableValue ? 'store-or-network' : 'store-only',
      },
    );

  // Paginated deployments query (cursor-based)
  const {
    paginationData,
    result: { deployments },
    loadNext,
    isLoadingNext,
  } = useRelayCursorPaginatedQuery<DeploymentSelectQuery, Deployment>(
    graphql`
      query DeploymentSelectQuery(
        $first: Int
        $after: String
        $filter: DeploymentFilter
        $orderBy: [DeploymentOrderBy!]
      ) {
        deployments(
          first: $first
          after: $after
          filter: $filter
          orderBy: $orderBy
        ) {
          count
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            node {
              id
              metadata {
                name
                status
                createdAt
              }
            }
          }
        }
      }
    `,
    { first: 10 },
    {
      filter,
      ...(deferredSearchStr
        ? {
            filter: {
              ...filter,
              name: { iContains: `%${deferredSearchStr}%` },
            },
          }
        : {}),
    },
    {
      fetchKey,
      fetchPolicy: deferredOpen ? 'network-only' : 'store-only',
    },
    {
      // getTotal: (result) => result.deployments?.count,
      getItem: (result) => result.deployments?.edges?.map((e) => e.node),
      getPageInfo: (result) => {
        const pageInfo = result.deployments?.pageInfo;
        return {
          hasNextPage: pageInfo?.hasNextPage ?? false,
          endCursor: pageInfo?.endCursor ?? undefined,
        };
      },
      getId: (item: Deployment) => item?.id,
    },
  );

  const selectOptions = _.map(paginationData, (item: Deployment) => {
    return {
      label: item?.metadata?.name,
      value: item?.id,
      deployment: item,
    };
  });

  const [optimisticValueWithLabel, setOptimisticValueWithLabel] = useState(
    selectedDeployment
      ? {
          label: selectedDeployment?.metadata?.name || undefined,
          value: selectedDeployment?.id || undefined,
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
      selectRef.current?.scrollTo(0);
    }
  }, [isValueMatched]);

  return (
    <BAISelect
      ref={selectRef}
      placeholder={t('deployment.SelectDeployment')}
      style={{ minWidth: 100 }}
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
              <BAILink
                to={`/deployment/${toLocalId(selectedDeployment?.id || '')}`}
              >
                <InfoIcon />
              </BAILink>
            </Tooltip>
          </BAIFlex>
        ) : (
          label
        );
      }}
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
        setControllableValue(v.value, option);
        selectPropsWithoutLoading.onChange?.(v.value || '', option);
      }}
      endReached={() => {
        loadNext();
      }}
      open={controllableOpen}
      onDropdownVisibleChange={setControllableOpen}
      notFoundContent={
        _.isUndefined(paginationData) ? (
          <Skeleton.Input active size="small" block />
        ) : undefined
      }
      footer={
        _.isNumber(deployments?.count) && deployments.count > 0 ? (
          <TotalFooter loading={isLoadingNext} total={deployments?.count} />
        ) : undefined
      }
    />
  );
};

export default DeploymentSelect;
