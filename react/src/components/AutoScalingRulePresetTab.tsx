/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { AutoScalingRulePresetTabDeleteMutation } from '../__generated__/AutoScalingRulePresetTabDeleteMutation.graphql';
import {
  AutoScalingRulePresetTabQuery,
  AutoScalingRulePresetTabQuery$variables,
  QueryDefinitionFilter,
} from '../__generated__/AutoScalingRulePresetTabQuery.graphql';
import { PrometheusQueryPresetEditorModalFragment$key } from '../__generated__/PrometheusQueryPresetEditorModalFragment.graphql';
import { useBAIPaginationOptionStateOnSearchParamLegacy } from '../hooks/reactPaginationQueryOptions';
import PrometheusQueryPresetEditorModal from './PrometheusQueryPresetEditorModal';
import PrometheusQueryPresetList from './PrometheusQueryPresetList';
import { PlusOutlined } from '@ant-design/icons';
import { Alert, App, Button, Skeleton, Typography, theme } from 'antd';
import {
  BAIConfirmModalWithInput,
  BAIFetchKeyButton,
  BAIFlex,
  BAIGraphQLPropertyFilter,
  type GraphQLFilter,
  useUpdatableState,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { parseAsJson, parseAsString, useQueryStates } from 'nuqs';
import React, {
  Suspense,
  useDeferredValue,
  useMemo,
  useState,
  useTransition,
} from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery, useMutation } from 'react-relay';

type DeletingPresetTarget = { id: string; name: string };

const AutoScalingRulePresetTab: React.FC = () => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { message } = App.useApp();

  const [queryParam, setQueryParam] = useQueryStates(
    {
      filter: parseAsJson<GraphQLFilter>((value) => value as GraphQLFilter),
      order: parseAsString,
    },
    { history: 'push' },
  );

  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionStateOnSearchParamLegacy({
    current: 1,
    pageSize: 10,
  });

  const [fetchKey, updateFetchKey] = useUpdatableState('initial-fetch');
  const [, startRefetchTransition] = useTransition();
  const [isCreatingPreset, setIsCreatingPreset] = useState(false);
  const [editingPreset, setEditingPreset] =
    useState<PrometheusQueryPresetEditorModalFragment$key | null>(null);
  const [deletingPreset, setDeletingPreset] =
    useState<DeletingPresetTarget | null>(null);

  const [commitDeleteMutation, isInflightDelete] =
    useMutation<AutoScalingRulePresetTabDeleteMutation>(graphql`
      mutation AutoScalingRulePresetTabDeleteMutation($id: ID!) {
        adminDeletePrometheusQueryPreset(id: $id) {
          id
        }
      }
    `);

  // QueryDefinitionFilter only supports a flat `name` filter today, so collapse
  // any AND/OR wrapper produced by BAIGraphQLPropertyFilter back to a flat object.
  const flattenGraphQLFilter = (
    filter: GraphQLFilter | null | undefined,
  ): QueryDefinitionFilter | null => {
    if (!filter) return null;
    if (filter.AND && Array.isArray(filter.AND)) {
      return Object.assign({}, ...filter.AND) as QueryDefinitionFilter;
    }
    if (filter.OR && Array.isArray(filter.OR)) {
      return Object.assign({}, ...filter.OR) as QueryDefinitionFilter;
    }
    return filter as QueryDefinitionFilter;
  };

  const orderBy = useMemo(() => {
    if (!queryParam.order) return null;
    const isDesc = queryParam.order.startsWith('-');
    const field = isDesc ? queryParam.order.slice(1) : queryParam.order;
    const fieldMap: Record<string, string> = {
      name: 'NAME',
      createdAt: 'CREATED_AT',
      updatedAt: 'UPDATED_AT',
    };
    const gqlField = fieldMap[field];
    if (!gqlField) return null;
    return [{ field: gqlField, direction: isDesc ? 'DESC' : 'ASC' }];
  }, [queryParam.order]);

  const queryVariables: AutoScalingRulePresetTabQuery$variables = useMemo(
    () => ({
      offset: baiPaginationOption.offset,
      limit: baiPaginationOption.limit,
      filter: flattenGraphQLFilter(queryParam.filter),
      orderBy: orderBy as AutoScalingRulePresetTabQuery$variables['orderBy'],
    }),
    [baiPaginationOption, queryParam.filter, orderBy],
  );

  const deferredQueryVariables = useDeferredValue(queryVariables);
  const deferredFetchKey = useDeferredValue(fetchKey);

  const { prometheusQueryPresets } =
    useLazyLoadQuery<AutoScalingRulePresetTabQuery>(
      graphql`
        query AutoScalingRulePresetTabQuery(
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
                ...PrometheusQueryPresetListFragment
              }
            }
          }
        }
      `,
      deferredQueryVariables,
      {
        fetchPolicy:
          deferredFetchKey === 'initial-fetch'
            ? 'store-and-network'
            : 'network-only',
        fetchKey:
          deferredFetchKey === 'initial-fetch' ? undefined : deferredFetchKey,
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
        <BAIFlex gap="sm" align="start" wrap="wrap" style={{ flexShrink: 1 }}>
          <BAIGraphQLPropertyFilter
            combinationMode="AND"
            value={queryParam.filter ?? undefined}
            onChange={(value) => {
              setQueryParam({ filter: value ?? null });
              setTablePaginationOption({ current: 1 });
            }}
            filterProperties={[
              {
                key: 'name',
                propertyLabel: t('prometheusQueryPreset.Name'),
                type: 'string',
              },
            ]}
          />
        </BAIFlex>
        <BAIFlex gap="xs">
          <BAIFetchKeyButton
            value={fetchKey}
            onChange={updateFetchKey}
            loading={isPending}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsCreatingPreset(true)}
          >
            {t('prometheusQueryPreset.AddPreset')}
          </Button>
        </BAIFlex>
      </BAIFlex>
      <Suspense fallback={<Skeleton active />}>
        <PrometheusQueryPresetList
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
            setQueryParam({ order: order ?? null });
            setTablePaginationOption({ current: 1 });
          }}
          onEditPreset={(preset) => {
            setEditingPreset(preset);
          }}
          onDeletePreset={(preset) => {
            setDeletingPreset({ id: preset.id, name: preset.name });
          }}
        />
      </Suspense>
      <PrometheusQueryPresetEditorModal
        open={isCreatingPreset}
        onRequestClose={(success) => {
          setIsCreatingPreset(false);
          if (success) {
            startRefetchTransition(() => {
              updateFetchKey();
            });
          }
        }}
      />
      <PrometheusQueryPresetEditorModal
        open={!!editingPreset}
        presetFrgmt={editingPreset}
        onRequestClose={(success) => {
          setEditingPreset(null);
          if (success) {
            startRefetchTransition(() => {
              updateFetchKey();
            });
          }
        }}
        onComplete={() => {
          startRefetchTransition(() => {
            updateFetchKey();
          });
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
              <Typography.Text style={{ marginRight: token.marginXXS }}>
                {t('dialog.TypeNameToConfirmDeletion')}
              </Typography.Text>
              (<Typography.Text code>{deletingPreset?.name}</Typography.Text>)
            </BAIFlex>
          </BAIFlex>
        }
        confirmText={deletingPreset?.name ?? ''}
        inputProps={{ placeholder: deletingPreset?.name ?? '' }}
        okText={t('button.Delete')}
        okButtonProps={{ loading: isInflightDelete, danger: true }}
        onOk={() => {
          if (!deletingPreset) return;
          commitDeleteMutation({
            variables: {
              id: deletingPreset.id,
            },
            onCompleted: (_res, errors) => {
              if (errors && errors.length > 0) {
                _.forEach(errors, (err) => message.error(err.message));
                setDeletingPreset(null);
                return;
              }
              message.success(t('prometheusQueryPreset.SuccessfullyDeleted'));
              setDeletingPreset(null);
              startRefetchTransition(() => {
                updateFetchKey();
              });
            },
            onError: (error) => {
              message.error(error.message);
              setDeletingPreset(null);
            },
          });
        }}
        onCancel={() => setDeletingPreset(null)}
      />
    </BAIFlex>
  );
};

export default AutoScalingRulePresetTab;
