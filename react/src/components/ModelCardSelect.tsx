/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 ModelCardSelect — a Relay-paginated, id-valued single select over the model
 store's `projectModelCardsV2`, built on `BAIComplexSelect` (the same recipe as
 `BAIAvailablePresetSelect` / `AgentSelect`). The OUTER value contract is
 a plain card local id (`string`); labelInValue lives strictly between this
 wrapper and `BAIComplexSelect`.
 */
import {
  ModelCardSelectQuery,
  ModelCardSelectQuery$data,
} from '../__generated__/ModelCardSelectQuery.graphql';
import { ModelCardSelectValueQuery } from '../__generated__/ModelCardSelectValueQuery.graphql';
import { useModelStoreProject } from '../hooks/useModelStoreProject';
import { useLazyPaginatedQuery } from '../hooks/usePaginatedQuery';
import ModelBrandIcon from './ModelBrandIcon';
import {
  BAIComplexSelect,
  toLocalId,
  useControllableValue,
  type BAIComplexSelectOption,
  type BAIComplexSelectProps,
  type BAIComplexSelectValue,
} from 'backend.ai-ui';
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
  BAIComplexSelectProps,
  | 'options'
  | 'value'
  | 'onChange'
  | 'searchValue'
  | 'onSearch'
  | 'total'
  | 'multiple'
> {
  /** Plain card local id (raw UUID). */
  value?: string | null;
  onChange?: (value: string | undefined) => void;
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
  isLoading,
  isDisabled,
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
    string | null | undefined
  >(selectProps as Record<string, unknown>, {
    valuePropName: 'value',
    trigger: 'onChange',
  });
  const [controllableOpen, setControllableOpen] = useControllableValue<boolean>(
    selectProps as Record<string, unknown>,
    {
      valuePropName: 'open',
      trigger: 'onOpenChange',
      defaultValuePropName: 'defaultOpen',
    },
  );
  const deferredOpen = useDeferredValue(controllableOpen);
  const [searchStr, setSearchStr] = useState<string>('');
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

  // id-valued: the raw UUID (`toLocalId`), never the Relay global id. The card
  // node rides along on the option so `onChange` can surface its `vfolderId`.
  const cardByKey: Record<string, ModelCardItem> = {};
  const options: Array<BAIComplexSelectOption> = _.compact(
    _.map(paginationData, (item) => {
      if (!item?.id) return null;
      const key = toLocalId(item.id) ?? item.id;
      cardByKey[key] = item;
      // Cards with no compatible preset cannot be deployed — disable them,
      // mirroring the dimmed cards on the Model Store list page.
      const hasNoPresets = item.availablePresets?.count === 0;
      return {
        // P26-3: `label` must be a string (trigger text + accessible name);
        // the brand icon rides in the `extra` slot.
        label: item.metadata?.title || item.name || key,
        value: key,
        disabled: hasNoPresets,
        extra: item.name ? <ModelBrandIcon modelName={item.name} /> : undefined,
      };
    }),
  );

  // Cache labels for values the user has picked so the closed select shows the
  // title instantly (before `ModelCardSelectValueQuery` resolves), without
  // snapshotting the value into local state. The displayed value is always
  // derived from the injected `controllableValue`, so an external Form reset
  // (e.g. switching the model source) stays in sync.
  const [optimisticLabels, setOptimisticLabels] = useState<
    Record<string, string>
  >({});

  const labeledValue: BAIComplexSelectValue = controllableValue
    ? {
        label:
          optimisticLabels[controllableValue] ??
          selectedCard?.metadata?.title ??
          selectedCard?.name ??
          controllableValue,
        value: controllableValue,
      }
    : null;

  return (
    <BAIComplexSelect
      placeholder={t('deployment.SelectModelCard')}
      {...selectProps}
      multiple={false}
      isDisabled={isDisabled || !modelStoreProjectId}
      isLoading={isLoading || searchStr !== deferredSearchStr}
      isLoadingNext={isLoadingNext}
      total={result.projectModelCardsV2?.count ?? undefined}
      options={options}
      value={labeledValue}
      onChange={(next) => {
        const picked = _.compact(_.castArray(next ?? []))[0];
        if (picked?.value) {
          setOptimisticLabels((prev) => ({
            ...prev,
            [picked.value]: picked.label,
          }));
        }
        // `setControllableValue` forwards to the Form-injected `onChange`,
        // so the bound `modelCardId` field updates from here.
        setControllableValue(picked?.value, undefined);
        const card = picked?.value ? cardByKey[picked.value] : undefined;
        onSelectCard?.(
          picked?.value && card?.vfolderId
            ? { id: picked.value, vfolderId: card.vfolderId }
            : null,
        );
      }}
      searchValue={searchStr}
      onSearch={setSearchStr}
      onOpenChange={setControllableOpen}
      endReached={loadNext}
    />
  );
};

export default ModelCardSelect;
