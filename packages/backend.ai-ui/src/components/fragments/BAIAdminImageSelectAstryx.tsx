/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 BAIAdminImageSelectAstryx — ticket-27 Astryx sibling of
 `BAIAdminImageSelect`, built on `BAIComplexSelect` (ticket 26).

 FRONTIER RULE: the antd `BAIAdminImageSelect` is NOT touched by this file
 and keeps serving every unmigrated call site until ticket 27 moves them.
 The OUTER value contract stays the same plain key (`string` / `string[]`,
 the image UUID) the antd wrapper exposes today — `labelInValue` lives
 strictly between this wrapper and `BAIComplexSelect`.

 CLASS: B (id-valued) — stored value is always `toLocalId(node.id)`, exactly
 as the antd original.

 PILOT-DECISIONs:
  - The antd original layered a `labelCache` (UUID -> label, populated on
    every `onChange`) plus a `useOptimistic` overlay on top of the value
    query, to avoid a label flash while the deferred value query catches up.
    `BAIComplexSelect`'s trigger reads straight off `value.label`, and the
    established ticket-26 template (`BAIUserSelectAstryx`) does not carry
    this overlay, so it is dropped here too — the resolution query's
    `label: resolved ?? key` fallback (mandatory per the ticket-27 brief) is
    the only label source, matching every other converted wrapper.
  - `notFoundContent={<Skeleton.Input/>}` first-load placeholder dropped
    (P26-7).
  - This wrapper never used `optionRender`/`labelRender`; the antd version
    already composed a single formatted string label
    (`"<canonicalName>@<architecture>"`), which carries over unchanged.
*/
import {
  BAIAdminImageSelectAstryxPaginatedQuery,
  ImageV2Filter,
} from '../../__generated__/BAIAdminImageSelectAstryxPaginatedQuery.graphql';
import { BAIAdminImageSelectAstryxValueQuery } from '../../__generated__/BAIAdminImageSelectAstryxValueQuery.graphql';
import { toLocalId } from '../../helper';
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
import { graphql, useLazyLoadQuery } from 'react-relay';

export type AstryxImageV2Node = NonNullable<
  NonNullable<
    BAIAdminImageSelectAstryxPaginatedQuery['response']['adminImagesV2']
  >['edges'][number]
>['node'];

export interface BAIAdminImageSelectAstryxRef {
  refetch: () => void;
}

export interface BAIAdminImageSelectAstryxProps extends Omit<
  BAIComplexSelectProps,
  'options' | 'value' | 'onChange' | 'searchValue' | 'onSearch' | 'total'
> {
  /** Plain key(s), as the antd `BAIAdminImageSelect` exposes. */
  value?: string | Array<string> | null;
  onChange?: (value: string | Array<string> | undefined) => void;
  /** Additional GraphQL filter to narrow the image list. */
  filter?: ImageV2Filter;
  open?: boolean;
  defaultOpen?: boolean;
  ref?: React.Ref<BAIAdminImageSelectAstryxRef>;
}

/**
 * Paginated image selector backed by `adminImagesV2` (ImageV2).
 * Stored value is the image UUID so callers can pass it directly to
 * mutation inputs that expect `UUID`.
 */
const BAIAdminImageSelectAstryx: React.FC<BAIAdminImageSelectAstryxProps> = ({
  filter: filterFromProps,
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

  // Resolve labels for the currently selected value(s) via adminImagesV2 so
  // admin users can see images that may be filtered by user-level permissions.
  const { adminImagesV2: selectedImageResult } =
    useLazyLoadQuery<BAIAdminImageSelectAstryxValueQuery>(
      graphql`
        query BAIAdminImageSelectAstryxValueQuery(
          $ids: [UUID!]
          $skipSelected: Boolean!
        ) {
          adminImagesV2(filter: { id: { in: $ids } }, limit: 100)
            @skip(if: $skipSelected) {
            edges {
              node {
                id
                identity {
                  canonicalName
                  architecture
                }
              }
            }
          }
        }
      `,
      {
        ids: selectedKeys,
        skipSelected: selectedKeys.length === 0,
      },
      {
        fetchPolicy: selectedKeys.length ? 'store-or-network' : 'store-only',
        fetchKey: deferredFetchKey,
      },
    );
  const selectedImageMap = _.keyBy(
    _.compact(_.map(selectedImageResult?.edges, (e) => e?.node)),
    (node) => toLocalId(node.id),
  );

  const { paginationData, result, loadNext, isLoadingNext } =
    useLazyPaginatedQuery<
      BAIAdminImageSelectAstryxPaginatedQuery,
      AstryxImageV2Node
    >(
      graphql`
        query BAIAdminImageSelectAstryxPaginatedQuery(
          $offset: Int!
          $limit: Int!
          $filter: ImageV2Filter
        ) {
          adminImagesV2(
            offset: $offset
            limit: $limit
            filter: $filter
            orderBy: [{ field: NAME, direction: ASC }]
          ) {
            count
            edges {
              node {
                id
                identity {
                  canonicalName
                  architecture
                }
              }
            }
          }
        }
      `,
      { limit: 20 },
      {
        filter: {
          ...(filterFromProps ?? {}),
          ...(debouncedDeferredValue
            ? { name: { contains: debouncedDeferredValue } }
            : {}),
        },
      },
      {
        fetchPolicy: deferredOpen ? 'network-only' : 'store-only',
        fetchKey: deferredFetchKey,
      },
      {
        getTotal: (r) => r.adminImagesV2?.count ?? undefined,
        getItem: (r) => r.adminImagesV2?.edges?.map((e) => e?.node),
        // Store UUID (via toLocalId) so callers can pass the value directly to UUID! mutation inputs
        getId: (item) => (item?.id ? toLocalId(item.id) : item?.id),
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

  // Compose the option label as "<canonicalName>@<architecture>" (Backend.AI's
  // canonical image reference format) so admins can distinguish images by CPU
  // architecture (e.g. aarch64 vs x86_64) when nodes of mixed architectures are present.
  const getImageLabel = (identity?: {
    canonicalName: string;
    architecture: string;
  }) => (identity ? `${identity.canonicalName}@${identity.architecture}` : '');

  const options = _.compact(
    _.map(paginationData, (item) => {
      const key = item?.id ? toLocalId(item.id) : undefined;
      return key ? { value: key, label: getImageLabel(item?.identity) } : null;
    }),
  );

  /** Plain keys -> labelInValue, resolving each label where we can. */
  const labeledValue: BAIComplexSelectValue = (() => {
    const labeled: Array<BAILabeledValue> = _.map(selectedKeys, (key) => {
      const resolved = selectedImageMap[key];
      return {
        label: resolved ? getImageLabel(resolved.identity) : key,
        value: key,
      };
    });
    if (multiple) return labeled;
    return labeled[0] ?? null;
  })();

  return (
    <BAIComplexSelect
      placeholder={t('comp:BAIImageSelect.SelectImage')}
      {...selectProps}
      multiple={multiple}
      isLoading={
        isLoading ||
        controllableValue !== deferredControllableValue ||
        searchStr !== debouncedDeferredValue ||
        isPendingRefetch
      }
      isLoadingNext={isLoadingNext}
      total={result.adminImagesV2?.count ?? undefined}
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

export default BAIAdminImageSelectAstryx;
