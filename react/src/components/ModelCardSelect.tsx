/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  ModelCardSelectQuery,
  ModelCardSelectQuery$data,
} from '../__generated__/ModelCardSelectQuery.graphql';
import { ModelCardSelectValueQuery } from '../__generated__/ModelCardSelectValueQuery.graphql';
import { useModelStoreProject } from '../hooks/useModelStoreProject';
import { useLazyPaginatedQuery } from '../hooks/usePaginatedQuery';
import ModelBrandIcon from './ModelBrandIcon';
import TotalFooter from './TotalFooter';
import { useControllableValue } from 'ahooks';
import { type SelectProps, Skeleton, Typography } from 'antd';
import { BAIFlex, BAISelect, toLocalId } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

export type ModelCardItem = NonNullable<
  NonNullable<
    NonNullable<
      ModelCardSelectQuery$data['projectModelCardsV2']
    >['edges'][number]
  >['node']
>;

/** Minimal shape surfaced to the caller when a card is selected. */
export interface SelectedModelCard {
  /** Model card local id (raw UUID). */
  id: string;
  /**
   * The VFolder that backs this model card. Callers reuse this as the model
   * mount source so a model-card selection resolves to the same `vfolderId`
   * a model-folder selection would.
   */
  vfolderId: string;
}

export interface ModelCardSelectProps extends Omit<
  SelectProps,
  'options' | 'labelInValue'
> {
  fetchKey?: string;
  /**
   * Fired alongside `onChange` with the resolved card (id + vfolderId), or
   * `null` when the selection is cleared. Lets the caller reuse the card's
   * backing vfolder as the model mount source.
   */
  onSelectCard?: (card: SelectedModelCard | null) => void;
}

const ModelCardSelect: React.FC<ModelCardSelectProps> = ({
  fetchKey,
  onSelectCard,
  loading,
  ...selectProps
}) => {
  'use memo';

  const { t } = useTranslation();
  const modelStoreProject = useModelStoreProject();
  // `useModelStoreProject().id` is `null` in domains without an active
  // MODEL_STORE project. The card scope requires a UUID, so firing the
  // paginated query with an empty `projectId` would raise a GraphQL coercion
  // error. When absent, keep the query store-only (never network) and disable
  // the control so the user gets an empty/disabled state instead.
  const modelStoreProjectId = modelStoreProject.id;

  const [controllableValue, setControllableValue] = useControllableValue<
    string | undefined
  >(selectProps);
  const [controllableOpen, setControllableOpen] = useControllableValue<boolean>(
    selectProps,
    {
      valuePropName: 'open',
      trigger: 'onOpenChange',
      defaultValuePropName: 'defaultOpen',
    },
  );
  const deferredOpen = useDeferredValue(controllableOpen);
  const [searchStr, setSearchStr] = useState<string>();
  const deferredSearchStr = useDeferredValue(searchStr);

  // Resolve the label of the currently selected card so the closed select
  // shows its title even before the option list has loaded that page.
  const { modelCardV2: selectedCard } =
    useLazyLoadQuery<ModelCardSelectValueQuery>(
      graphql`
        query ModelCardSelectValueQuery($id: UUID!) {
          modelCardV2(id: $id) {
            id
            name
            vfolderId
            metadata {
              title
            }
          }
        }
      `,
      { id: controllableValue ?? '' },
      {
        fetchPolicy: controllableValue ? 'store-or-network' : 'store-only',
      },
    );

  const nameFilter = deferredSearchStr
    ? { name: { iContains: deferredSearchStr } }
    : null;

  const { paginationData, result, loadNext, isLoadingNext } =
    useLazyPaginatedQuery<ModelCardSelectQuery, ModelCardItem>(
      graphql`
        query ModelCardSelectQuery(
          $scope: ProjectModelCardV2Scope!
          $filter: ModelCardV2Filter
          $limit: Int!
          $offset: Int!
        ) {
          projectModelCardsV2(
            scope: $scope
            filter: $filter
            orderBy: [{ field: CREATED_AT, direction: "DESC" }]
            limit: $limit
            offset: $offset
          ) {
            count
            edges {
              node {
                id
                name
                vfolderId
                metadata {
                  title
                }
                availablePresets(orderBy: [{ field: RANK, direction: "ASC" }]) {
                  count
                }
              }
            }
          }
        }
      `,
      { limit: 10 },
      {
        scope: { projectId: modelStoreProjectId ?? '' },
        filter: nameFilter,
      },
      {
        fetchKey,
        fetchPolicy:
          modelStoreProjectId && deferredOpen ? 'network-only' : 'store-only',
      },
      {
        getTotal: (r) => r.projectModelCardsV2?.count ?? undefined,
        getItem: (r) => r.projectModelCardsV2?.edges?.map((edge) => edge?.node),
        getId: (item) => item?.id,
      },
    );

  type ModelCardOption = {
    label: string;
    value: string;
    card: ModelCardItem;
    disabled?: boolean;
  };
  const selectOptions: ModelCardOption[] = _.compact(
    _.map(paginationData, (item) => {
      if (!item?.id) return null;
      // Cards with no compatible preset cannot be deployed — disable them,
      // mirroring the dimmed cards on the Model Store list page.
      const hasNoPresets = item.availablePresets?.count === 0;
      return {
        label: item.metadata?.title || item.name,
        value: toLocalId(item.id) ?? item.id,
        card: item,
        disabled: hasNoPresets,
      };
    }),
  );

  // Cache labels for values the user has picked so the closed select shows the
  // title instantly (before `ModelCardSelectValueQuery` resolves), without
  // snapshotting the value into local state. The displayed value is always
  // derived from the injected `controllableValue`, so an external Form reset
  // (e.g. switching the model source) stays in sync — mirroring how
  // `BAIAvailablePresetSelect` derives its labeled value.
  const [optimisticLabels, setOptimisticLabels] = useState<
    Record<string, string>
  >({});
  const displayLabel = controllableValue
    ? (optimisticLabels[controllableValue] ??
      selectedCard?.metadata?.title ??
      selectedCard?.name ??
      controllableValue)
    : undefined;
  const displayValue = controllableValue
    ? { label: displayLabel, value: controllableValue }
    : undefined;

  return (
    <BAISelect
      placeholder={t('deployment.SelectModelCard')}
      style={{ flex: 1 }}
      showSearch={{
        searchValue: searchStr,
        onSearch: (v) => {
          setSearchStr(v);
        },
        autoClearSearchValue: true,
        filterOption: false,
      }}
      loading={searchStr !== deferredSearchStr || loading}
      options={selectOptions}
      optionRender={(option) => (
        <BAIFlex direction="row" align="center" gap="xs">
          <ModelBrandIcon modelName={option.data.card?.name} />
          <Typography.Text ellipsis style={{ flex: 1 }}>
            {option.label}
          </Typography.Text>
        </BAIFlex>
      )}
      {...selectProps}
      disabled={selectProps.disabled || !modelStoreProjectId}
      labelInValue
      value={displayValue}
      onChange={(v, option) => {
        const card = _.castArray(option)?.[0]?.card as
          | ModelCardItem
          | undefined;
        if (v?.value && typeof v.label === 'string') {
          setOptimisticLabels((prev) => ({
            ...prev,
            [v.value]: v.label as string,
          }));
        }
        // `setControllableValue` forwards to the Form-injected `onChange`,
        // so the bound `modelCardId` field updates from here.
        setControllableValue(v?.value, option);
        const localId = card?.id ? toLocalId(card.id) : undefined;
        onSelectCard?.(
          localId && card?.vfolderId
            ? { id: localId, vfolderId: card.vfolderId }
            : null,
        );
      }}
      endReached={() => {
        loadNext();
      }}
      open={controllableOpen}
      onOpenChange={setControllableOpen}
      notFoundContent={
        _.isUndefined(paginationData) ? (
          <Skeleton.Input active size="small" block />
        ) : undefined
      }
      footer={
        _.isNumber(result.projectModelCardsV2?.count) &&
        result.projectModelCardsV2.count > 0 ? (
          <TotalFooter
            loading={isLoadingNext}
            total={result.projectModelCardsV2.count}
          />
        ) : undefined
      }
    />
  );
};

export default ModelCardSelect;
