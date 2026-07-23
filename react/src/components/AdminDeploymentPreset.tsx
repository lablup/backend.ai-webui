/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { AdminDeploymentPresetDeleteMutation } from '../__generated__/AdminDeploymentPresetDeleteMutation.graphql';
import type {
  AdminDeploymentPresetQuery as AdminDeploymentPresetQueryType,
  DeploymentRevisionPresetFilter,
  DeploymentRevisionPresetOrderBy,
} from '../__generated__/AdminDeploymentPresetQuery.graphql';
import AdminDeploymentPresetTable, {
  type DeploymentPresetNodeInList,
} from '../components/AdminDeploymentPresetTable';
import { convertToOrderBy } from '../helper';
import { useSuspendedBackendaiClient, useWebUINavigate } from '../hooks';
import { App, theme } from 'antd';
import {
  BAIButton,
  BAIDeleteConfirmModal,
  BAIFetchKeyButton,
  BAIFlex,
  BAIGraphQLPropertyFilter,
  type BAITableSettings,
  toLocalId,
  useBAILogger,
  filterOutNullAndUndefined,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { PlusIcon } from 'lucide-react';
import { useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  graphql,
  PreloadedQuery,
  useMutation,
  usePreloadedQuery,
  UseQueryLoaderLoadQueryOptions,
} from 'react-relay';

export const AdminDeploymentPresetQuery = graphql`
  query AdminDeploymentPresetQuery(
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
          ...AdminDeploymentPresetTableFragment
        }
      }
    }
  }
`;

export interface AdminDeploymentPresetProps {
  queryRef: PreloadedQuery<AdminDeploymentPresetQueryType>;
  onReload: (
    variables: AdminDeploymentPresetQueryType['variables'],
    options?: UseQueryLoaderLoadQueryOptions,
  ) => void;
  tableSettings: BAITableSettings;
}

const AdminDeploymentPreset = ({
  queryRef,
  onReload,
  tableSettings,
}: AdminDeploymentPresetProps) => {
  'use memo';

  const { t } = useTranslation();
  const { message } = App.useApp();
  const { logger } = useBAILogger();
  const { token } = theme.useToken();
  const baiClient = useSuspendedBackendaiClient();
  const webuiNavigate = useWebUINavigate();

  const [deletingPreset, setDeletingPreset] =
    useState<DeploymentPresetNodeInList | null>(null);

  const filter = queryRef.variables.filter ?? undefined;
  const pageSize = queryRef.variables.limit ?? 10;
  const offset = queryRef.variables.offset ?? 0;
  const current = pageSize ? Math.floor(offset / pageSize) + 1 : 1;

  const deferredQueryRef = useDeferredValue(queryRef);
  const isRefetching = deferredQueryRef !== queryRef;

  const { deploymentRevisionPresets } =
    usePreloadedQuery<AdminDeploymentPresetQueryType>(
      AdminDeploymentPresetQuery,
      deferredQueryRef,
    );

  const [commitDeletePreset] =
    useMutation<AdminDeploymentPresetDeleteMutation>(graphql`
      mutation AdminDeploymentPresetDeleteMutation($id: UUID!) {
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

  return (
    <BAIFlex direction="column" align="stretch" gap={'sm'}>
      <BAIFlex justify="between" wrap="wrap" gap={'sm'}>
        <BAIFlex gap={'sm'} align="start" wrap="wrap" style={{ flexShrink: 1 }}>
          <BAIGraphQLPropertyFilter<DeploymentRevisionPresetFilter>
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
            value={filter as DeploymentRevisionPresetFilter | undefined}
            onChange={(value) => {
              onReload(
                { ...queryRef.variables, filter: value ?? undefined, offset: 0 },
                { fetchPolicy: 'network-only' },
              );
            }}
          />
        </BAIFlex>
        <BAIFlex gap={'xs'}>
          <BAIFetchKeyButton
            loading={isRefetching}
            onChange={() =>
              onReload(queryRef.variables, { fetchPolicy: 'network-only' })
            }
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
        <AdminDeploymentPresetTable
          presetsFrgmt={filterOutNullAndUndefined(
            _.map(deploymentRevisionPresets?.edges, 'node'),
          )}
          loading={isRefetching}
          onEdit={handleEditPreset}
          onDelete={handleDeletePreset}
          tableSettings={tableSettings}
          pagination={{
            pageSize,
            current,
            total: deploymentRevisionPresets?.count ?? 0,
            onChange: (nextCurrent, nextPageSize) => {
              onReload(
                {
                  ...queryRef.variables,
                  limit: nextPageSize,
                  offset:
                    nextCurrent > 1 ? (nextCurrent - 1) * nextPageSize : 0,
                },
                { fetchPolicy: 'network-only' },
              );
            },
          }}
          onChangeOrder={(order) => {
            onReload(
              {
                ...queryRef.variables,
                orderBy: convertToOrderBy<DeploymentRevisionPresetOrderBy>(
                  order ?? undefined,
                ),
                offset: 0,
              },
              { fetchPolicy: 'network-only' },
            );
          }}
        />
      ) : (
        <BAIFlex justify="center" style={{ padding: token.paddingXL }}>
          {t('adminDeploymentPreset.NotSupported')}
        </BAIFlex>
      )}
      <BAIDeleteConfirmModal
        open={!!deletingPreset}
        target={t('deployment.ResourcePreset')}
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
                  onReload(queryRef.variables, { fetchPolicy: 'network-only' });
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

export default AdminDeploymentPreset;
