/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { AdminPrometheusPresetDeleteMutation } from '../__generated__/AdminPrometheusPresetDeleteMutation.graphql';
import { AdminPrometheusPresetQuery as AdminPrometheusPresetQueryType } from '../__generated__/AdminPrometheusPresetQuery.graphql';
import { App } from '../app-shim';
import { convertFirstOrderByToString, convertToOrderBy } from '../helper';
import AutoUpdateFetchKeyButton, {
  LONG_AUTO_UPDATE_DELAY_OPTIONS,
} from './AutoUpdateFetchKeyButton';
import PrometheusQueryPresetEditorModal from './PrometheusQueryPresetEditorModal';
import PrometheusQueryPresetTable, {
  PrometheusQueryPresetNodeInList,
} from './PrometheusQueryPresetTable';
import {
  BAIButton,
  BAIDeleteConfirmModal,
  BAIFlex,
  BAIGraphQLPropertyFilter,
  BAIUnmountAfterClose,
  type BAITableSettings,
  toLocalId,
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

export const AdminPrometheusPresetQuery = graphql`
  query AdminPrometheusPresetQuery(
    $offset: Int
    $limit: Int
    $filter: QueryDefinitionFilter
    $orderBy: [QueryDefinitionOrderBy!]
  ) {
    prometheusQueryPresets(
      offset: $offset
      limit: $limit
      filter: $filter
      orderBy: $orderBy
    ) {
      count
      edges {
        node {
          id
          ...PrometheusQueryPresetTableFragment
        }
      }
    }
  }
`;

type DeletingPresetTarget = { id: string; name: string };

export interface AdminPrometheusPresetProps {
  queryRef: PreloadedQuery<AdminPrometheusPresetQueryType>;
  onReload: (
    variables: AdminPrometheusPresetQueryType['variables'],
    options?: UseQueryLoaderLoadQueryOptions,
  ) => void;
  tableSettings: BAITableSettings;
}

const AdminPrometheusPreset = ({
  queryRef,
  onReload,
  tableSettings,
}: AdminPrometheusPresetProps) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();

  const [isOpenEditorModal, setIsOpenEditorModal] = useState(false);
  const [editingPreset, setEditingPreset] =
    useState<PrometheusQueryPresetNodeInList | null>(null);
  const [deletingPreset, setDeletingPreset] =
    useState<DeletingPresetTarget | null>(null);

  const filter = queryRef.variables.filter ?? undefined;
  const order = convertFirstOrderByToString(queryRef.variables.orderBy);
  const pageSize = queryRef.variables.limit ?? 10;
  const offset = queryRef.variables.offset ?? 0;
  const current = pageSize ? Math.floor(offset / pageSize) + 1 : 1;

  const deferredQueryRef = useDeferredValue(queryRef);
  const isRefetching = deferredQueryRef !== queryRef;

  const { prometheusQueryPresets } =
    usePreloadedQuery<AdminPrometheusPresetQueryType>(
      AdminPrometheusPresetQuery,
      deferredQueryRef,
    );

  // The editor's category picker (`PrometheusCategorySelect`) fetches its own
  // query inside its own Suspense boundary, so opening is a plain state update —
  // no preloading, and the surrounding preset list never suspends.
  const openEditor = (preset?: PrometheusQueryPresetNodeInList | null) => {
    setEditingPreset(preset ?? null);
    setIsOpenEditorModal(true);
  };

  const [commitDeleteMutation, isInflightDelete] =
    useMutation<AdminPrometheusPresetDeleteMutation>(graphql`
      mutation AdminPrometheusPresetDeleteMutation($id: ID!) {
        adminDeletePrometheusQueryPreset(id: $id) {
          id
        }
      }
    `);

  const presetNodes = _.compact(
    _.map(prometheusQueryPresets?.edges, (edge) => edge?.node),
  );

  return (
    <BAIFlex direction="column" align="stretch" gap="sm">
      <BAIFlex direction="row" justify="between" wrap="wrap" gap="sm">
        <BAIGraphQLPropertyFilter
          combinationMode="AND"
          value={filter}
          onChange={(value) => {
            onReload(
              { ...queryRef.variables, filter: value ?? undefined, offset: 0 },
              { fetchPolicy: 'network-only' },
            );
          }}
          filterProperties={[
            {
              key: 'name',
              propertyLabel: t('prometheusQueryPreset.Name'),
              type: 'string',
            },
            {
              key: 'categoryId',
              propertyLabel: t('prometheusQueryPreset.CategoryId'),
              type: 'uuid',
            },
          ]}
        />
        <BAIFlex gap="xs">
          <AutoUpdateFetchKeyButton
            settingId="prometheus-preset"
            autoUpdateDelayOptions={LONG_AUTO_UPDATE_DELAY_OPTIONS}
            onChange={() =>
              onReload(queryRef.variables, { fetchPolicy: 'network-only' })
            }
            loading={isRefetching}
          />
          <BAIButton
            type="primary"
            icon={<PlusIcon />}
            onClick={() => openEditor()}
          >
            {t('prometheusQueryPreset.CreatePreset')}
          </BAIButton>
        </BAIFlex>
      </BAIFlex>
      <PrometheusQueryPresetTable
        presetsFrgmt={presetNodes}
        loading={isRefetching}
        pagination={{
          pageSize,
          current,
          total: prometheusQueryPresets?.count,
          onChange(nextCurrent, nextPageSize) {
            if (_.isNumber(nextCurrent) && _.isNumber(nextPageSize)) {
              onReload(
                {
                  ...queryRef.variables,
                  limit: nextPageSize,
                  offset:
                    nextCurrent > 1 ? (nextCurrent - 1) * nextPageSize : 0,
                },
                { fetchPolicy: 'network-only' },
              );
            }
          },
        }}
        order={order}
        onChangeOrder={(nextOrder) => {
          onReload(
            {
              ...queryRef.variables,
              orderBy: convertToOrderBy(nextOrder ?? undefined),
              offset: 0,
            },
            { fetchPolicy: 'network-only' },
          );
        }}
        tableSettings={tableSettings}
        onEditPreset={(preset) => openEditor(preset)}
        onDeletePreset={(preset) => {
          setDeletingPreset({ id: preset.id, name: preset.name });
        }}
      />
      <BAIUnmountAfterClose>
        <PrometheusQueryPresetEditorModal
          open={isOpenEditorModal}
          presetFrgmt={editingPreset}
          onRequestClose={(success) => {
            setIsOpenEditorModal(false);
            setEditingPreset(null);
            // A create adds a new row the offset query can't know about, so it
            // needs a refetch. An update returns every field, so Relay merges
            // the record by id into the store and the list reflects it
            // without one.
            if (success && editingPreset === null) {
              onReload(queryRef.variables, { fetchPolicy: 'network-only' });
            }
          }}
        />
      </BAIUnmountAfterClose>
      <BAIDeleteConfirmModal
        open={!!deletingPreset}
        title={t('prometheusQueryPreset.PermanentlyDeletePreset', {
          name: deletingPreset?.name,
        })}
        target={t('webui.menu.PrometheusPreset')}
        items={
          deletingPreset
            ? [{ key: deletingPreset.id, label: deletingPreset.name }]
            : []
        }
        confirmText={deletingPreset?.name ?? ''}
        requireConfirmInput
        inputProps={{ placeholder: deletingPreset?.name ?? '' }}
        confirmLoading={isInflightDelete}
        onOk={() => {
          if (!deletingPreset) return;
          commitDeleteMutation({
            variables: {
              id: toLocalId(deletingPreset.id),
            },
            onCompleted: (_res, errors) => {
              if (errors && errors.length > 0) {
                _.forEach(errors, (err) => message.error(err.message));
                setDeletingPreset(null);
                return;
              }
              message.success(t('prometheusQueryPreset.SuccessfullyDeleted'));
              setDeletingPreset(null);
              onReload(queryRef.variables, { fetchPolicy: 'network-only' });
            },
            onError: (error) => {
              message.error(error.message);
            },
          });
        }}
        onCancel={() => setDeletingPreset(null)}
      />
    </BAIFlex>
  );
};

export default AdminPrometheusPreset;
