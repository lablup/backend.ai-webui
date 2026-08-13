/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 BAIDeploymentSelectAstryx — ticket-27 Astryx sibling of `BAIDeploymentSelect`,
 built on `BAIComplexSelect` (ticket 26), following pattern A of the
 recipe used across the Astryx migration (copy of `BAIUserSelectAstryx.tsx`,
 the worked example).

 FRONTIER RULE (MIGRATION-SPEC §0 "번역 프런티어" / 래퍼 정책): the antd
 `BAIDeploymentSelect` is NOT touched by this change. It keeps serving every
 unmigrated call site until ticket 27 moves them. This file is the
 Astryx-native sibling, and its OUTER value contract is deliberately the same
 plain key (`string` / `string[]`) the antd wrapper exposes — labelInValue
 lives strictly between this wrapper and `BAIComplexSelect`.

 CLASS B (id-valued): the key is the deployment's raw GraphQL `id` (no
 `toLocalId` conversion — the antd original used the raw id directly as both
 the option value and the `deployment(id: ID!)` lookup key, and this file
 preserves that exactly).

 PILOT-DECISIONs:
  - Carries over the antd original's own TODO/limitation verbatim: the
    selected-value resolution query is a single-item `deployment(id: ID!)`
    lookup (there is no `adminDeployments(filter: { id: { in: [...] } })`-
    style batch lookup available), so in `multiple` mode only the FIRST
    selected key resolves to a real label — the rest fall back to printing
    their own key. This is an existing backend limitation, not something
    introduced by this migration.
  - P26-7 antd's `notFoundContent={<Skeleton.Input/>}` first-load placeholder
    is dropped (see `BAIComplexSelect` header, general policy).
*/
import { BAIDeploymentSelectAstryxPaginatedQuery } from '../../__generated__/BAIDeploymentSelectAstryxPaginatedQuery.graphql';
import { BAIDeploymentSelectAstryxValueQuery } from '../../__generated__/BAIDeploymentSelectAstryxValueQuery.graphql';
import useDebouncedDeferredValue from '../../helper/useDebouncedDeferredValue';
import { useControllableValue, useFetchKey } from '../../hooks';
import { useBAIi18n } from '../../hooks/useBAIi18n';
import { useLazyPaginatedQuery } from '../../hooks/usePaginatedQuery';
import BAIComplexSelect, {
  type BAIComplexSelectProps,
  type BAIComplexSelectValue,
  type BAILabeledValue,
} from '../BAIComplexSelect';
import * as _ from 'lodash-es';
import {
  useDeferredValue,
  useImperativeHandle,
  useState,
  useTransition,
} from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

export type AstryxDeploymentNode = NonNullable<
  NonNullable<
    BAIDeploymentSelectAstryxPaginatedQuery['response']['adminDeployments']
  >['edges'][number]
>['node'];

export interface BAIDeploymentSelectAstryxRef {
  refetch: () => void;
}

export interface BAIDeploymentSelectAstryxProps extends Omit<
  BAIComplexSelectProps,
  'options' | 'value' | 'onChange' | 'searchValue' | 'onSearch' | 'total'
> {
  /** Plain key(s), as the antd `BAIDeploymentSelect` exposes. */
  value?: string | Array<string> | null;
  onChange?: (value: string | Array<string> | undefined) => void;
  ref?: React.Ref<BAIDeploymentSelectAstryxRef>;
}

const BAIDeploymentSelectAstryx: React.FC<BAIDeploymentSelectAstryxProps> = ({
  multiple = false,
  isLoading,
  ref,
  ...selectProps
}) => {
  'use memo';
  const { t } = useBAIi18n();
  const [controllableValue, setControllableValue] = useControllableValue<
    string | Array<string> | null | undefined
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
  const debouncedDeferredValue = useDebouncedDeferredValue(searchStr);
  const [isPendingRefetch, startRefetchTransition] = useTransition();
  const [fetchKey, updateFetchKey] = useFetchKey();
  const deferredFetchKey = useDeferredValue(fetchKey);

  // Deferred so a fresh selection does not immediately re-run the value query.
  const deferredControllableValue = useDeferredValue(controllableValue);
  const selectedKeys = _.compact(_.castArray(deferredControllableValue ?? []));

  // TODO: This single-item lookup does not work in multi-select mode.
  //       Multi-select support is pending backend deployment API
  //       implementation (carried over from the antd `BAIDeploymentSelect`).
  const skipSelected = selectedKeys.length === 0;
  const selectedId = skipSelected ? undefined : selectedKeys[0];

  const { deployment: selectedDeployment } =
    useLazyLoadQuery<BAIDeploymentSelectAstryxValueQuery>(
      graphql`
        query BAIDeploymentSelectAstryxValueQuery(
          $id: ID!
          $skipSelected: Boolean!
        ) {
          deployment(id: $id) @skip(if: $skipSelected) {
            id
            metadata {
              name
            }
          }
        }
      `,
      {
        id: selectedId ?? '',
        skipSelected,
      },
      {
        fetchPolicy: !skipSelected ? 'store-or-network' : 'store-only',
        fetchKey: deferredFetchKey,
      },
    );

  const { paginationData, result, loadNext, isLoadingNext } =
    useLazyPaginatedQuery<
      BAIDeploymentSelectAstryxPaginatedQuery,
      AstryxDeploymentNode
    >(
      graphql`
        query BAIDeploymentSelectAstryxPaginatedQuery(
          $offset: Int!
          $limit: Int!
          $filter: DeploymentFilter
        ) {
          adminDeployments(offset: $offset, limit: $limit, filter: $filter) {
            count
            edges {
              node {
                id
                metadata {
                  name
                }
              }
            }
          }
        }
      `,
      { limit: 10 },
      {
        filter: debouncedDeferredValue
          ? { name: { iContains: debouncedDeferredValue } }
          : null,
      },
      {
        fetchPolicy: deferredOpen ? 'network-only' : 'store-only',
        fetchKey: deferredFetchKey,
      },
      {
        getTotal: (r) => r.adminDeployments?.count ?? undefined,
        getItem: (r) => r.adminDeployments?.edges?.map((edge) => edge?.node),
        getId: (item) => item?.id,
      },
    );

  useImperativeHandle(
    ref,
    () => ({
      refetch: () => {
        startRefetchTransition(() => {
          updateFetchKey();
        });
      },
    }),
    [updateFetchKey, startRefetchTransition],
  );

  const options = _.compact(
    _.map(paginationData, (item) => {
      const key = item?.id;
      return key
        ? {
            value: key,
            label: item?.metadata?.name ?? key,
          }
        : null;
    }),
  );

  const labeledValue: BAIComplexSelectValue = (() => {
    const labeled: Array<BAILabeledValue> = _.map(selectedKeys, (key) => ({
      label:
        selectedDeployment?.id === key
          ? (selectedDeployment?.metadata?.name ?? key)
          : key,
      value: key,
    }));
    if (multiple) return labeled;
    return labeled[0] ?? null;
  })();

  return (
    <BAIComplexSelect
      placeholder={t('comp:BAIDeploymentSelect.SelectDeployment')}
      {...selectProps}
      multiple={multiple}
      isLoading={
        isLoading ||
        controllableValue !== deferredControllableValue ||
        searchStr !== debouncedDeferredValue ||
        isPendingRefetch
      }
      isLoadingNext={isLoadingNext}
      total={result.adminDeployments?.count ?? undefined}
      options={options}
      value={labeledValue}
      onChange={(next) => {
        const keys = _.map(_.compact(_.castArray(next ?? [])), (v) => v.value);
        setControllableValue(multiple ? keys : keys[0], undefined);
      }}
      searchValue={searchStr}
      onSearch={setSearchStr}
      onOpenChange={setControllableOpen}
      endReached={loadNext}
    />
  );
};

export default BAIDeploymentSelectAstryx;
