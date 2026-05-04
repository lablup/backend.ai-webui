/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { PrometheusPresetTabDeleteMutation } from '../__generated__/PrometheusPresetTabDeleteMutation.graphql';
import {
  PrometheusPresetTabQuery,
  PrometheusPresetTabQuery$variables,
} from '../__generated__/PrometheusPresetTabQuery.graphql';
import { PrometheusQueryPresetEditorModalFragment$key } from '../__generated__/PrometheusQueryPresetEditorModalFragment.graphql';
import { convertToOrderBy } from '../helper';
import { useBAIPaginationOptionStateOnSearchParam } from '../hooks/reactPaginationQueryOptions';
import { useBAISettingUserState } from '../hooks/useBAISetting';
import PrometheusQueryPresetEditorModal from './PrometheusQueryPresetEditorModal';
import PrometheusQueryPresetNodes from './PrometheusQueryPresetNodes';
import { PlusOutlined } from '@ant-design/icons';
import { Alert, App, theme } from 'antd';
import {
  BAIButton,
  BAIConfirmModalWithInput,
  BAIFetchKeyButton,
  BAIFlex,
  BAIGraphQLPropertyFilter,
  BAIText,
  type GraphQLFilter,
  INITIAL_FETCH_KEY,
  toLocalId,
  useFetchKey,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { parseAsJson, parseAsString, useQueryStates } from 'nuqs';
import React, { useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery, useMutation } from 'react-relay';

type DeletingPresetTarget = { id: string; name: string };

const PrometheusPresetTab: React.FC = () => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { message } = App.useApp();

  const [queryParam, setQueryParam] = useQueryStates(
    {
      filter: parseAsJson<GraphQLFilter>((value) => value as GraphQLFilter),
      order: parseAsString,
    },
    { history: 'replace' },
  );

  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionStateOnSearchParam({
    current: 1,
    pageSize: 10,
  });

  const [fetchKey, updateFetchKey] = useFetchKey();
  const [isOpenEditorModal, setIsOpenEditorModal] = useState(false);
  const [editingPreset, setEditingPreset] =
    useState<PrometheusQueryPresetEditorModalFragment$key | null>(null);
  const [deletingPreset, setDeletingPreset] =
    useState<DeletingPresetTarget | null>(null);
  const [columnOverrides, setColumnOverrides] = useBAISettingUserState(
    'table_column_overrides.PrometheusPresetTab',
  );

  const [commitDeleteMutation, isInflightDelete] =
    useMutation<PrometheusPresetTabDeleteMutation>(graphql`
      mutation PrometheusPresetTabDeleteMutation($id: ID!) {
        adminDeletePrometheusQueryPreset(id: $id) {
          id
        }
      }
    `);

  const queryVariables: PrometheusPresetTabQuery$variables = {
    offset: baiPaginationOption.offset,
    limit: baiPaginationOption.limit,
    filter: queryParam.filter,
    orderBy: convertToOrderBy(queryParam.order),
  };

  const deferredQueryVariables = useDeferredValue(queryVariables);
  const deferredFetchKey = useDeferredValue(fetchKey);

  const { prometheusQueryPresets } = useLazyLoadQuery<PrometheusPresetTabQuery>(
    graphql`
      query PrometheusPresetTabQuery(
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
              ...PrometheusQueryPresetNodesFragment
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
      fetchKey:
        deferredFetchKey === INITIAL_FETCH_KEY ? undefined : deferredFetchKey,
    },
  );

  const isPending =
    deferredQueryVariables !== queryVariables || deferredFetchKey !== fetchKey;

  const presetNodes = _.compact(
    _.map(prometheusQueryPresets?.edges, (edge) => edge?.node),
  );

  return (
    <BAIFlex direction="column" align="stretch" gap="sm">
      <BAIFlex direction="row" justify="between" wrap="wrap" gap="sm">
        <BAIGraphQLPropertyFilter
          combinationMode="AND"
          value={queryParam.filter ?? undefined}
          onChange={(value) => {
            setQueryParam({ filter: value ?? null });
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
          <BAIFetchKeyButton
            value={fetchKey}
            onChange={updateFetchKey}
            loading={isPending}
          />
          <BAIButton
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsOpenEditorModal(true)}
          >
            {t('prometheusQueryPreset.AddPreset')}
          </BAIButton>
        </BAIFlex>
      </BAIFlex>
      <PrometheusQueryPresetNodes
        presetsFrgmt={presetNodes}
        loading={isPending}
        pagination={{
          pageSize: tablePaginationOption.pageSize,
          current: tablePaginationOption.current,
          total: prometheusQueryPresets?.count,
          onChange(current, pageSize) {
            if (_.isNumber(current) && _.isNumber(pageSize)) {
              setTablePaginationOption({ current, pageSize });
            }
          },
        }}
        order={queryParam.order}
        onChangeOrder={(order) => {
          setQueryParam({ order: order });
        }}
        tableSettings={{
          columnOverrides,
          onColumnOverridesChange: setColumnOverrides,
        }}
        onEditPreset={(preset) => {
          setIsOpenEditorModal(true);
          setEditingPreset(preset);
        }}
        onDeletePreset={(preset) => {
          setDeletingPreset({ id: preset.id, name: preset.name });
        }}
      />
      <PrometheusQueryPresetEditorModal
        open={isOpenEditorModal}
        presetFrgmt={editingPreset}
        onRequestClose={(success) => {
          setIsOpenEditorModal(false);
          setEditingPreset(null);
          if (success) {
            updateFetchKey();
          }
        }}
      />
      <BAIConfirmModalWithInput
        open={!!deletingPreset}
        title={t('prometheusQueryPreset.PermanentlyDeletePreset', {
          name: deletingPreset?.name,
        })}
        content={
          <BAIFlex direction="column" gap="md" align="stretch">
            <Alert
              type="warning"
              title={t('prometheusQueryPreset.DeleteWarning')}
            />
            <BAIFlex>
              <BAIText style={{ marginRight: token.marginXXS }}>
                {t('dialog.TypeNameToConfirmDeletion')}
              </BAIText>
              (<BAIText code>{deletingPreset?.name}</BAIText>)
            </BAIFlex>
          </BAIFlex>
        }
        confirmText={deletingPreset?.name ?? ''}
        inputProps={{ placeholder: deletingPreset?.name ?? '' }}
        okText={t('button.Delete')}
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
              updateFetchKey();
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

export default PrometheusPresetTab;
