/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 BAIAdminModelServiceSelect — ticket-27 Astryx sibling of
 `BAIAdminModelServiceSelect`, built on `BAIComplexSelect` (ticket 26).

 FRONTIER RULE: the antd `BAIAdminModelServiceSelect` is NOT touched by this
 file and keeps serving every unmigrated call site until ticket 27 moves
 them. The OUTER value contract stays the same plain key (`string` /
 `string[]`, the deployment UUID) the antd wrapper exposes today —
 `labelInValue` lives strictly between this wrapper and `BAIComplexSelect`.

 CLASS: B (id-valued) — stored value is always the node's `entityId`.

 PILOT-DECISIONs:
  - `notFoundContent={<Skeleton.Input/>}` first-load placeholder dropped
    (P26-7).
  - This wrapper never used `optionRender`/`labelRender`.
*/
import { BAIAdminModelServiceSelectPaginatedQuery } from '../../__generated__/BAIAdminModelServiceSelectPaginatedQuery.graphql';
import { BAIAdminModelServiceSelectValueQuery } from '../../__generated__/BAIAdminModelServiceSelectValueQuery.graphql';
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

export type AstryxModelServiceNode = NonNullable<
  NonNullable<
    BAIAdminModelServiceSelectPaginatedQuery['response']['adminDeployments']
  >['edges'][number]
>['node'];

export interface BAIAdminModelServiceSelectRef {
  refetch: () => void;
}

export interface BAIAdminModelServiceSelectProps extends Omit<
  BAIComplexSelectProps,
  'options' | 'value' | 'onChange' | 'searchValue' | 'onSearch' | 'total'
> {
  /** Plain key(s), as the antd `BAIAdminModelServiceSelect` exposes. */
  value?: string | Array<string> | null;
  onChange?: (value: string | Array<string> | undefined) => void;
  open?: boolean;
  defaultOpen?: boolean;
  ref?: React.Ref<BAIAdminModelServiceSelectRef>;
}

const BAIAdminModelServiceSelect: React.FC<BAIAdminModelServiceSelectProps> = ({
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

  const deferredControllableValue = useDeferredValue(controllableValue);
  const selectedKeys = _.compact(_.castArray(deferredControllableValue ?? []));

  const { adminDeployments: selectedDeployments } =
    useLazyLoadQuery<BAIAdminModelServiceSelectValueQuery>(
      graphql`
        query BAIAdminModelServiceSelectValueQuery(
          $selectedFilter: DeploymentFilter
          $skipSelected: Boolean!
        ) {
          adminDeployments(filter: $selectedFilter) @skip(if: $skipSelected) {
            edges {
              node {
                id
                entityId
                metadata {
                  name
                }
              }
            }
          }
        }
      `,
      {
        selectedFilter: { entityId: { in: selectedKeys } },
        skipSelected: selectedKeys.length === 0,
      },
      {
        fetchPolicy: selectedKeys.length ? 'store-or-network' : 'store-only',
        fetchKey: deferredFetchKey,
      },
    );

  const { paginationData, result, loadNext, isLoadingNext } =
    useLazyPaginatedQuery<
      BAIAdminModelServiceSelectPaginatedQuery,
      AstryxModelServiceNode
    >(
      graphql`
        query BAIAdminModelServiceSelectPaginatedQuery(
          $offset: Int!
          $limit: Int!
          $filter: DeploymentFilter
        ) {
          adminDeployments(offset: $offset, limit: $limit, filter: $filter) {
            count
            edges {
              node {
                id
                entityId
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
          ? { name: { contains: debouncedDeferredValue } }
          : null,
      },
      {
        fetchPolicy: deferredOpen ? 'network-only' : 'store-only',
        fetchKey: deferredFetchKey,
      },
      {
        getTotal: (result) => result.adminDeployments?.count ?? undefined,
        getItem: (result) =>
          result.adminDeployments?.edges?.map((edge) => edge?.node),
        getId: (item) => item?.entityId,
      },
    );

  // Expose refetch function through ref
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
      const key = item?.entityId;
      return key ? { value: key, label: item?.metadata?.name ?? key } : null;
    }),
  );

  const labeledValue: BAIComplexSelectValue = (() => {
    const labeled: Array<BAILabeledValue> = _.map(selectedKeys, (key) => {
      const selected = _.find(
        selectedDeployments?.edges,
        (edge) => edge?.node?.entityId === key,
      )?.node;
      return { label: selected?.metadata?.name ?? key, value: key };
    });
    if (multiple) return labeled;
    return labeled[0] ?? null;
  })();

  return (
    <BAIComplexSelect
      placeholder={t('comp:BAIAdminModelServiceSelect.SelectModelService')}
      {...selectProps}
      multiple={multiple}
      isLoading={
        isLoading ||
        // The open-driven `network-only` refetch is a deferred update and
        // raises no pending flag of its own (FR-3724). Only the opening
        // half counts; closing would flash the spinner for nothing.
        (!!controllableOpen && !deferredOpen) ||
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

export default BAIAdminModelServiceSelect;
