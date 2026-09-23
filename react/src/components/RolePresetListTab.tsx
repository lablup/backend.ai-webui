/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  RolePresetFilter,
  RolePresetListTabQuery,
  RolePresetOrderBy,
} from '../__generated__/RolePresetListTabQuery.graphql';
import { convertToOrderBy } from '../helper';
import { useBAIPaginationOptionStateOnSearchParam } from '../hooks/reactPaginationQueryOptions';
import BAIRadioGroup from './BAIRadioGroup';
import RolePresetDetailDrawer from './RolePresetDetailDrawer';
import RolePresetNodes, {
  type RolePresetNodeInList,
  availableRolePresetSorterValues,
} from './RolePresetNodes';
import {
  BAIFetchKeyButton,
  BAIFlex,
  BAIGraphQLPropertyFilter,
  BAINameActionCell,
  INITIAL_FETCH_KEY,
  useFetchKey,
} from 'backend.ai-ui';
import {
  parseAsJson,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from 'nuqs';
import React, { useDeferredValue } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

const statusFilterValues = ['ACTIVE', 'DELETED'] as const;

const RolePresetListTab: React.FC = () => {
  'use memo';
  const { t } = useTranslation();
  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionStateOnSearchParam({
    current: 1,
    pageSize: 10,
  });

  const [queryParams, setQueryParams] = useQueryStates(
    {
      status: parseAsStringLiteral(statusFilterValues).withDefault('ACTIVE'),
      order: parseAsStringLiteral(availableRolePresetSorterValues),
      filter: parseAsJson<RolePresetFilter>(
        (value) => value as RolePresetFilter,
      ),
    },
    { history: 'replace' },
  );
  const [{ presetDetail: selectedRolePresetId }, setPresetDetailParam] =
    useQueryStates({ presetDetail: parseAsString }, { history: 'push' });

  const [fetchKey, updateFetchKey] = useFetchKey();

  const queryVariables = {
    filter: {
      ...queryParams.filter,
      // Soft-deleted presets are excluded unless `deleted` is set explicitly.
      deleted: queryParams.status === 'DELETED',
    },
    orderBy: convertToOrderBy<RolePresetOrderBy>(queryParams.order),
    limit: baiPaginationOption.limit,
    offset: baiPaginationOption.offset,
  };

  const deferredQueryVariables = useDeferredValue(queryVariables);
  const deferredFetchKey = useDeferredValue(fetchKey);

  const { adminRolePresets } = useLazyLoadQuery<RolePresetListTabQuery>(
    graphql`
      query RolePresetListTabQuery(
        $filter: RolePresetFilter
        $orderBy: [RolePresetOrderBy!]
        $limit: Int
        $offset: Int
      ) {
        adminRolePresets(
          filter: $filter
          orderBy: $orderBy
          limit: $limit
          offset: $offset
        ) {
          count
          edges {
            node {
              id
              ...RolePresetNodesFragment
              ...RolePresetDetailDrawerFragment
            }
          }
        }
      }
    `,
    deferredQueryVariables,
    {
      fetchPolicy:
        deferredFetchKey === INITIAL_FETCH_KEY
          ? 'store-and-network'
          : 'network-only',
      fetchKey: deferredFetchKey,
    },
  );

  const rolePresetNodes =
    adminRolePresets?.edges?.map((edge) => edge.node) ?? [];
  const selectedRolePreset = rolePresetNodes.find(
    (rolePreset) => rolePreset.id === selectedRolePresetId,
  );

  return (
    <BAIFlex direction="column" align="stretch" gap={'sm'}>
      <BAIFlex justify="between" wrap="wrap" gap={'sm'}>
        <BAIFlex gap={'sm'} align="start" wrap="wrap" style={{ flexShrink: 1 }}>
          <BAIRadioGroup
            optionType="button"
            value={queryParams.status}
            onChange={(e) => {
              setQueryParams({ status: e.target.value });
              setTablePaginationOption({ current: 1 });
            }}
            options={[
              { label: t('rbac.Active'), value: 'ACTIVE' },
              { label: t('rbac.Deleted'), value: 'DELETED' },
            ]}
          />
          <BAIGraphQLPropertyFilter<RolePresetFilter>
            filterProperties={[
              {
                key: 'name',
                propertyLabel: t('rbac.PresetName'),
                type: 'string',
              },
              {
                key: 'scopeType',
                propertyLabel: t('rbac.ScopeType'),
                type: 'string',
              },
            ]}
            value={queryParams.filter ?? undefined}
            onChange={(value) => {
              setQueryParams({ filter: value ?? null });
              setTablePaginationOption({ current: 1 });
            }}
          />
        </BAIFlex>
        <BAIFetchKeyButton
          loading={
            deferredQueryVariables !== queryVariables ||
            deferredFetchKey !== fetchKey
          }
          value={fetchKey}
          onChange={(newFetchKey) => {
            updateFetchKey(newFetchKey);
          }}
        />
      </BAIFlex>
      <RolePresetNodes
        rolePresetsFrgmt={rolePresetNodes}
        loading={deferredQueryVariables !== queryVariables}
        order={queryParams.order}
        onChangeOrder={(order) => {
          setQueryParams({ order });
        }}
        customizeColumns={(columns) =>
          columns.map((col) =>
            col.key === 'name'
              ? {
                  ...col,
                  render: (name: string, rolePreset: RolePresetNodeInList) => (
                    <BAINameActionCell
                      title={name}
                      onTitleClick={() =>
                        setPresetDetailParam({ presetDetail: rolePreset.id })
                      }
                    />
                  ),
                }
              : col,
          )
        }
        pagination={{
          pageSize: tablePaginationOption.pageSize,
          current: tablePaginationOption.current,
          total: adminRolePresets?.count ?? 0,
          onChange: (current, pageSize) => {
            setTablePaginationOption({ current, pageSize });
          },
        }}
      />
      <RolePresetDetailDrawer
        open={!!selectedRolePreset}
        rolePresetFrgmt={selectedRolePreset}
        onClose={() => setPresetDetailParam({ presetDetail: null })}
      />
    </BAIFlex>
  );
};

export default RolePresetListTab;
