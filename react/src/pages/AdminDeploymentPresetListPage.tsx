/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { AdminDeploymentPresetListPageDeleteMutation } from '../__generated__/AdminDeploymentPresetListPageDeleteMutation.graphql';
import type {
  AdminDeploymentPresetListPageQuery,
  DeploymentRevisionPresetFilter,
  DeploymentRevisionPresetOrderBy,
} from '../__generated__/AdminDeploymentPresetListPageQuery.graphql';
import AdminDeploymentPresetNodes, {
  availablePresetSorterValues,
  type DeploymentPresetNodeInList,
} from '../components/AdminDeploymentPresetNodes';
import { convertToOrderBy } from '../helper';
import { useSuspendedBackendaiClient, useWebUINavigate } from '../hooks';
import { useBAIPaginationOptionStateOnSearchParam } from '../hooks/reactPaginationQueryOptions';
import { useBAISettingUserState } from '../hooks/useBAISetting';
import { App, theme } from 'antd';
import {
  BAIButton,
  BAIDeleteConfirmModal,
  BAIFetchKeyButton,
  BAIFlex,
  BAIGraphQLPropertyFilter,
  type GraphQLFilter,
  INITIAL_FETCH_KEY,
  toLocalId,
  useBAILogger,
  useFetchKey,
  filterOutNullAndUndefined,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { PlusIcon } from 'lucide-react';
import { parseAsJson, parseAsString, useQueryStates } from 'nuqs';
import React, { useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery, useMutation } from 'react-relay';

const AdminDeploymentPresetListPage: React.FC = () => {
  'use memo';

  const { t } = useTranslation();
  const { message } = App.useApp();
  const { logger } = useBAILogger();
  const { token } = theme.useToken();
  const baiClient = useSuspendedBackendaiClient();
  const webuiNavigate = useWebUINavigate();

  const [columnOverrides, setColumnOverrides] = useBAISettingUserState(
    'table_column_overrides.AdminDeploymentPresetListPage',
  );

  const [deletingPreset, setDeletingPreset] =
    useState<DeploymentPresetNodeInList | null>(null);

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
      order: parseAsString.withDefault('-createdAt'),
      filter: parseAsJson<GraphQLFilter>((value) => value as GraphQLFilter),
    },
    {
      history: 'replace',
    },
  );

  const [fetchKey, updateFetchKey] = useFetchKey();

  const queryVariables = {
    filter: (queryParams.filter ?? undefined) as
      | DeploymentRevisionPresetFilter
      | undefined,
    orderBy: convertToOrderBy<DeploymentRevisionPresetOrderBy>(
      queryParams.order,
    ),
    limit: baiPaginationOption.limit,
    offset: baiPaginationOption.offset,
  };

  const deferredQueryVariables = useDeferredValue(queryVariables);
  const deferredFetchKey = useDeferredValue(fetchKey);

  const queryRef = useLazyLoadQuery<AdminDeploymentPresetListPageQuery>(
    graphql`
      query AdminDeploymentPresetListPageQuery(
        $filter: DeploymentRevisionPresetFilter
        $orderBy: [DeploymentRevisionPresetOrderBy!]
        $limit: Int
        $offset: Int
      ) {
        deploymentRevisionPresets(
          filter: $filter
          orderBy: $orderBy
          limit: $limit
          offset: $offset
        ) {
          count
          edges {
            node {
              id
              name
              ...AdminDeploymentPresetNodesFragment
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

  const [commitDeletePreset] =
    useMutation<AdminDeploymentPresetListPageDeleteMutation>(graphql`
      mutation AdminDeploymentPresetListPageDeleteMutation($id: UUID!) {
        adminDeleteDeploymentRevisionPreset(id: $id) {
          id
        }
      }
    `);

  const handleDeletePreset = (preset: DeploymentPresetNodeInList) => {
    setDeletingPreset(preset);
  };

  const handleEditPreset = (preset: DeploymentPresetNodeInList) => {
    webuiNavigate(
      `/admin-deployments/deployment-presets/${toLocalId(preset.id)}/edit`,
    );
  };

  const handleOpenCreateModal = () => {
    webuiNavigate('/admin-deployments/deployment-presets/new');
  };

  const isSupported = baiClient.supports('deployment-preset');

  const isLoading =
    deferredQueryVariables !== queryVariables || deferredFetchKey !== fetchKey;

  return (
    <BAIFlex direction="column" align="stretch" gap={'sm'}>
      <BAIFlex justify="between" wrap="wrap" gap={'sm'}>
        <BAIFlex gap={'sm'} align="start" wrap="wrap" style={{ flexShrink: 1 }}>
          <BAIGraphQLPropertyFilter
            filterProperties={[
              {
                key: 'name',
                propertyLabel: t('adminDeploymentPreset.Name'),
                type: 'string',
              },
              {
                key: 'runtimeVariantId',
                propertyLabel: t('adminDeploymentPreset.RuntimeVariantId'),
                type: 'uuid',
                fixedOperator: 'equals',
              },
            ]}
            value={queryParams.filter ?? undefined}
            onChange={(value) => {
              setQueryParams({ filter: value ?? null });
              setTablePaginationOption({ current: 1 });
            }}
          />
        </BAIFlex>
        <BAIFlex gap={'sm'}>
          <BAIFetchKeyButton
            loading={isLoading}
            value={fetchKey}
            onChange={(newFetchKey) => {
              updateFetchKey(newFetchKey);
            }}
          />
          <BAIButton
            type="primary"
            onClick={handleOpenCreateModal}
            icon={<PlusIcon />}
          >
            {t('adminDeploymentPreset.CreatePreset')}
          </BAIButton>
        </BAIFlex>
      </BAIFlex>
      {isSupported ? (
        <AdminDeploymentPresetNodes
          presetsFrgmt={filterOutNullAndUndefined(
            _.map(queryRef.deploymentRevisionPresets?.edges, 'node'),
          )}
          loading={isLoading}
          onEdit={handleEditPreset}
          onDelete={handleDeletePreset}
          tableSettings={{
            columnOverrides: columnOverrides,
            onColumnOverridesChange: setColumnOverrides,
          }}
          pagination={{
            pageSize: tablePaginationOption.pageSize,
            current: tablePaginationOption.current,
            total: queryRef.deploymentRevisionPresets?.count ?? 0,
            onChange: (current, pageSize) => {
              setTablePaginationOption({ current, pageSize });
            },
          }}
          onChangeOrder={(order) => {
            setQueryParams({
              order:
                (order as (typeof availablePresetSorterValues)[number]) || null,
            });
          }}
        />
      ) : (
        <BAIFlex justify="center" style={{ padding: token.paddingXL }}>
          {t('adminDeploymentPreset.NotSupported')}
        </BAIFlex>
      )}
      <BAIDeleteConfirmModal
        open={!!deletingPreset}
        requireConfirmInput
        items={
          deletingPreset
            ? [{ key: deletingPreset.id, label: deletingPreset.name }]
            : []
        }
        onOk={async () => {
          if (deletingPreset) {
            await new Promise<void>((resolve, reject) => {
              commitDeletePreset({
                variables: { id: toLocalId(deletingPreset.id) },
                onCompleted: (_data, errors) => {
                  if (errors && errors.length > 0) {
                    logger.error(errors[0]);
                    message.error(
                      errors[0]?.message || t('general.ErrorOccurred'),
                    );
                    reject();
                    return;
                  }
                  message.success(t('adminDeploymentPreset.PresetDeleted'));
                  setDeletingPreset(null);
                  updateFetchKey();
                  resolve();
                },
                onError: (error) => {
                  logger.error(error);
                  message.error(error?.message || t('general.ErrorOccurred'));
                  reject();
                },
              });
            });
          }
        }}
        onCancel={() => setDeletingPreset(null)}
      />
    </BAIFlex>
  );
};

export default AdminDeploymentPresetListPage;
