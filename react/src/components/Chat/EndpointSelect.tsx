/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { EndpointSelectQuery } from '../../__generated__/EndpointSelectQuery.graphql';
import {
  EndpointSelectValueQuery,
  EndpointSelectValueQuery$data,
} from '../../__generated__/EndpointSelectValueQuery.graphql';
import { useSuspendedBackendaiClient, useWebUINavigate } from '../../hooks';
import { useLazyPaginatedQuery } from '../../hooks/usePaginatedQuery';
import TotalFooter from '../TotalFooter';
import { useControllableValue } from 'ahooks';
import {
  Button,
  type GetRef,
  type SelectProps,
  Skeleton,
  Space,
  Tooltip,
} from 'antd';
import { BAIEndpointsIcon, BAIFlex, BAISelect, toLocalId } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { InfoIcon } from 'lucide-react';
import React, { useDeferredValue, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

export type Endpoint = NonNullable<EndpointSelectValueQuery$data['endpoint']>;

export interface EndpointSelectProps extends Omit<
  SelectProps,
  'options' | 'labelInValue'
> {
  fetchKey?: string;
  showDetailPageButton?: boolean;
}

const EndpointSelect: React.FC<EndpointSelectProps> = ({
  fetchKey,
  showDetailPageButton: showInfoButton,
  loading,
  ...selectPropsWithoutLoading
}) => {
  'use memo';
  const { t } = useTranslation();
  const baiClient = useSuspendedBackendaiClient();

  const [controllableValue, setControllableValue] = useControllableValue<
    string | undefined
  >(selectPropsWithoutLoading);
  const [controllableOpen, setControllableOpen] = useControllableValue<boolean>(
    selectPropsWithoutLoading,
    {
      valuePropName: 'open',
      trigger: 'onOpenChange',
      defaultValuePropName: 'defaultOpen',
    },
  );
  const deferredOpen = useDeferredValue(controllableOpen);
  const [searchStr, setSearchStr] = useState<string>();
  const deferredSearchStr = useDeferredValue(searchStr);

  const selectRef = useRef<GetRef<typeof BAISelect> | null>(null);

  // Select deployments with an actively-serving replica. When the manager
  // supports the nested replica filter, filter on replica traffic status;
  // otherwise (25.19.0–<26.8.0) fall back to excluding terminated deployments
  // (the interim FR-3303 behavior). The version gate lives in the client
  // `deployment-replica-nested-filter` support flag rather than a hardcoded
  // version compare here. The whole deployment-selection surface targets the
  // Strawberry v2 Deployments API (myDeployments/DeploymentFilter, manager
  // ≥25.19.0), same baseline as the FR-2664 Deployments UI.
  //
  // NOTE: This is intentionally left without a current-project scope. The legacy
  // endpoint_list query wasn't project-scoped either — it declared a `project`
  // arg but never passed a value (always null) — so this preserves the prior
  // behavior rather than changing it here. It does diverge from
  // DeploymentListPage, which scopes myDeployments by
  // `projectId: { equals: currentProject.id }`.
  // TODO(FR-3332): investigate why Chat endpoint selection has never been
  // project-scoped and decide whether it should align with the new Deployments UI.
  const nameFilter = deferredSearchStr
    ? { name: { iContains: deferredSearchStr } }
    : undefined;
  const deploymentFilter: EndpointSelectQuery['variables']['filter'] =
    baiClient.supports('deployment-replica-nested-filter')
      ? {
          replicas: { some: { trafficStatus: { equals: 'ACTIVE' } } },
          ...nameFilter,
        }
      : { status: { notIn: ['STOPPING', 'STOPPED'] }, ...nameFilter };

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
    result: { myDeployments },
    loadNext,
    isLoadingNext,
  } = useLazyPaginatedQuery<
    EndpointSelectQuery,
    NonNullable<
      NonNullable<
        EndpointSelectQuery['response']['myDeployments']
      >['edges'][number]
    >['node']
  >(
    graphql`
      query EndpointSelectQuery(
        $offset: Int!
        $limit: Int!
        $filter: DeploymentFilter
      ) {
        myDeployments(offset: $offset, limit: $limit, filter: $filter) {
          count
          edges {
            node {
              id
              metadata {
                name
              }
              networkAccess {
                endpointUrl
              }
            }
          }
        }
      }
    `,
    {
      limit: 10,
    },
    {
      filter: deploymentFilter,
    },
    // TODO: skip fetch when the option popover is closed
    {
      fetchKey,
      fetchPolicy: deferredOpen ? 'network-only' : 'store-only',
    },
    {
      getTotal: (result) => result.myDeployments?.count,
      getItem: (result) =>
        result.myDeployments?.edges?.map((edge) => edge?.node),
      getId: (node) => (node?.id ? toLocalId(node.id) : undefined),
    },
  );

  const selectOptions = _.map(paginationData, (node) => {
    const endpointId = node?.id ? toLocalId(node.id) : undefined;
    return {
      label: node?.metadata.name,
      value: endpointId,
      endpoint: {
        name: node?.metadata.name,
        endpoint_id: endpointId,
        url: node?.networkAccess.endpointUrl,
      },
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

  const webuiNavigate = useWebUINavigate();

  const isValueMatched = searchStr === deferredSearchStr;
  useEffect(() => {
    if (isValueMatched) {
      // Scroll dropdown to top position when search completes (search value matches deferred value)
      // This ensures users see the top results immediately after search processing
      selectRef.current?.scrollTo(0);
    }
  }, [isValueMatched]);
  return (
    <BAIFlex direction="row" gap="xs">
      <Space.Compact>
        <BAISelect
          ref={selectRef}
          placeholder={t('chatui.SelectEndpoint')}
          prefix={<BAIEndpointsIcon />}
          header={t('chatui.Deployment')}
          style={{
            minWidth: 100,
            fontWeight: 'normal',
          }}
          showSearch={{
            searchValue: searchStr,
            onSearch: (v) => {
              setSearchStr(v);
            },
            autoClearSearchValue: true,
            filterOption: false,
          }}
          // TODO: Need to make it work properly when autoClearSearchValue is not specified
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
          onOpenChange={setControllableOpen}
          notFoundContent={
            _.isUndefined(paginationData) ? (
              // For the first loading options
              <Skeleton.Input active size="small" block />
            ) : undefined
          }
          footer={
            _.isNumber(myDeployments?.count) && myDeployments.count > 0 ? (
              <TotalFooter
                loading={isLoadingNext}
                total={myDeployments?.count}
              />
            ) : undefined
          }
        />
        {showInfoButton ? (
          <Tooltip title={t('deployment.GoToDetailPage')}>
            <Button
              icon={<InfoIcon />}
              disabled={!controllableValue}
              onClick={() => {
                webuiNavigate(`/serving/${controllableValue}`);
              }}
            />
          </Tooltip>
        ) : null}
      </Space.Compact>
    </BAIFlex>
  );
};

export default EndpointSelect;
