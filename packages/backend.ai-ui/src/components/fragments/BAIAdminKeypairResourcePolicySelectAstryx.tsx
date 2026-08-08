/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 BAIAdminKeypairResourcePolicySelectAstryx — ticket-27 Astryx sibling of
 `BAIAdminKeypairResourcePolicySelect`, built on `BAIComplexSelect`
 (ticket 26).

 FRONTIER RULE: the antd `BAIAdminKeypairResourcePolicySelect` is NOT
 touched by this file and keeps serving every unmigrated call site until
 ticket 27 moves them. The OUTER value contract stays the same plain key
 (`string` / `string[]`, the policy name) the antd wrapper exposes today —
 `labelInValue` lives strictly between this wrapper and `BAIComplexSelect`.

 CLASS: A (name-valued) — `name` is both the identifier and the display
 label.

 PILOT-DECISIONs:
  - No selected-value resolution query, unlike every other converted
    wrapper. This mirrors the antd original exactly: KRP `name` IS the
    label, so `{ label: key, value: key }` is correct for every key, not
    just a fallback — adding a query here would be pure round-trip churn
    with no label it could ever improve on.
  - `notFoundContent={<Skeleton.Input/>}` first-load placeholder dropped
    (P26-7).
  - This wrapper never used `optionRender`/`labelRender`.
  - Supports `multiple` (`UserFolderPermissionPanel` uses `mode="multiple"`
    on the antd original today).
*/
import { BAIAdminKeypairResourcePolicySelectAstryxPaginatedQuery } from '../../__generated__/BAIAdminKeypairResourcePolicySelectAstryxPaginatedQuery.graphql';
import useDebouncedDeferredValue from '../../helper/useDebouncedDeferredValue';
import { useFetchKey } from '../../hooks';
import { useBAIi18n } from '../../hooks/useBAIi18n';
import { useLazyPaginatedQuery } from '../../hooks/usePaginatedQuery';
import BAIComplexSelect, {
  type BAIComplexSelectProps,
  type BAIComplexSelectValue,
  type BAILabeledValue,
} from '../BAIComplexSelect';
import { useControllableValue } from 'ahooks';
import * as _ from 'lodash-es';
import {
  useDeferredValue,
  useImperativeHandle,
  useState,
  useTransition,
} from 'react';
import { graphql } from 'react-relay';

export type AstryxAdminKeypairResourcePolicyNode = NonNullable<
  NonNullable<
    BAIAdminKeypairResourcePolicySelectAstryxPaginatedQuery['response']['adminKeypairResourcePoliciesV2']
  >['edges'][number]
>['node'];

export interface BAIAdminKeypairResourcePolicySelectAstryxRef {
  refetch: () => void;
}

export interface BAIAdminKeypairResourcePolicySelectAstryxProps extends Omit<
  BAIComplexSelectProps,
  'options' | 'value' | 'onChange' | 'searchValue' | 'onSearch' | 'total'
> {
  /** Plain key(s), as the antd `BAIAdminKeypairResourcePolicySelect` exposes. */
  value?: string | Array<string> | null;
  onChange?: (value: string | Array<string> | undefined) => void;
  open?: boolean;
  defaultOpen?: boolean;
  ref?: React.Ref<BAIAdminKeypairResourcePolicySelectAstryxRef>;
}

const BAIAdminKeypairResourcePolicySelectAstryx: React.FC<
  BAIAdminKeypairResourcePolicySelectAstryxProps
> = ({ multiple = false, isLoading, ref, ...selectProps }) => {
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

  const { paginationData, result, loadNext, isLoadingNext } =
    useLazyPaginatedQuery<
      BAIAdminKeypairResourcePolicySelectAstryxPaginatedQuery,
      AstryxAdminKeypairResourcePolicyNode
    >(
      graphql`
        query BAIAdminKeypairResourcePolicySelectAstryxPaginatedQuery(
          $offset: Int!
          $limit: Int!
          $filter: KeypairResourcePolicyV2Filter
        ) {
          adminKeypairResourcePoliciesV2(
            offset: $offset
            limit: $limit
            filter: $filter
            orderBy: [{ field: NAME, direction: ASC }]
          ) {
            count
            edges {
              node {
                id
                name
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
        getTotal: (result) =>
          result.adminKeypairResourcePoliciesV2?.count ?? undefined,
        getItem: (result) =>
          result.adminKeypairResourcePoliciesV2?.edges?.map(
            (edge) => edge?.node,
          ),
        getId: (item) => item?.name,
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
    _.map(paginationData, (item) =>
      item?.name ? { value: item.name, label: item.name } : null,
    ),
  );

  // KRP `name` is both the identifier and the display label (see the header
  // comment), so labels resolve without a query — no fallback needed since
  // the key IS the label.
  const labeledValue: BAIComplexSelectValue = (() => {
    const labeled: Array<BAILabeledValue> = _.map(selectedKeys, (key) => ({
      label: key,
      value: key,
    }));
    if (multiple) return labeled;
    return labeled[0] ?? null;
  })();

  return (
    <BAIComplexSelect
      placeholder={t(
        'comp:BAIAdminKeypairResourcePolicySelect.SelectKeypairResourcePolicy',
      )}
      {...selectProps}
      multiple={multiple}
      isLoading={
        isLoading ||
        controllableValue !== deferredControllableValue ||
        searchStr !== debouncedDeferredValue ||
        isPendingRefetch
      }
      isLoadingNext={isLoadingNext}
      total={result.adminKeypairResourcePoliciesV2?.count ?? undefined}
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

export default BAIAdminKeypairResourcePolicySelectAstryx;
