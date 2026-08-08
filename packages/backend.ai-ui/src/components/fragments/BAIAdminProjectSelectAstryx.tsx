/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 BAIAdminProjectSelectAstryx — ticket-27 Astryx sibling of the antd
 `BAIAdminProjectSelect` (Relay-paginated, id-valued select pattern B, see
 `.scratch/astryx-migration/shots/26/CONVERSION-BRIEF.md` §2.B).

 FRONTIER RULE (MIGRATION-SPEC §0 "번역 프런티어" / 래퍼 정책): the antd
 `BAIAdminProjectSelect` is NOT touched by this file. It keeps serving every
 unmigrated call site until a later ticket moves them over. This file is the
 Astryx-native sibling, and its OUTER value contract is deliberately the same
 plain key (`string` / `string[]`) the antd wrapper exposes — labelInValue
 lives strictly between the wrapper and `BAIComplexSelect`, exactly as it
 does between `BAIUserSelect`/`BAIUserSelectAstryx` and `BAISelect`.

 PILOT-DECISIONs:
  - P26-6 The `open ? 'network-only' : 'store-only'` fetchPolicy switch is
    kept — `BAIComplexSelect.onOpenChange` re-exposes the open state that
    `ComplexSelector` otherwise keeps private.
  - P26-7 antd's `notFoundContent={<Skeleton.Input/>}` first-load placeholder
    is dropped: the empty state is the shared "No results" text.
  - This wrapper's antd original had no `optionRender`/`labelRender`, so
    there is no rich-content-to-`description` migration to record here.
*/
import { BAIAdminProjectSelectAstryxPaginatedQuery } from '../../__generated__/BAIAdminProjectSelectAstryxPaginatedQuery.graphql';
import { BAIAdminProjectSelectAstryxValueQuery } from '../../__generated__/BAIAdminProjectSelectAstryxValueQuery.graphql';
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

export type AstryxAdminProjectNode = NonNullable<
  NonNullable<
    BAIAdminProjectSelectAstryxPaginatedQuery['response']['adminProjectsV2']
  >['edges'][number]
>['node'];

export interface BAIAdminProjectSelectAstryxRef {
  refetch: () => void;
}

export interface BAIAdminProjectSelectAstryxProps extends Omit<
  BAIComplexSelectProps,
  'options' | 'value' | 'onChange' | 'searchValue' | 'onSearch' | 'total'
> {
  /** Plain key(s), as the antd `BAIAdminProjectSelect` exposes. */
  value?: string | Array<string> | null;
  /**
   * P3C-1: like `BAIUserSelectAstryx`, this wrapper keeps antd's second
   * `option` argument because it is used inside
   * `BAIGraphQLPropertyFilter.renderInput`, where the filter chip must show
   * the project NAME while the raw UUID goes into the GraphQL filter.
   */
  onChange?: (
    value: string | Array<string> | undefined,
    option?: BAILabeledValue | Array<BAILabeledValue>,
  ) => void;
  filter?: {
    type?: { equals?: 'GENERAL' | 'MODEL_STORE' };
  };
  ref?: React.Ref<BAIAdminProjectSelectAstryxRef>;
}

const BAIAdminProjectSelectAstryx: React.FC<
  BAIAdminProjectSelectAstryxProps
> = ({
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

  // Deferred so a fresh selection does not immediately re-run the value query.
  const deferredControllableValue = useDeferredValue(controllableValue);
  const selectedIds = _.compact(_.castArray(deferredControllableValue ?? []));

  /**
   * The selected-id -> label resolution query. Mandatory on Astryx (the
   * trigger reads its text from the VALUE, and a value chosen on page 1 is
   * not in `options` after `loadNext` has paged past it).
   */
  const { adminProjectsV2: selectedProjects } =
    useLazyLoadQuery<BAIAdminProjectSelectAstryxValueQuery>(
      graphql`
        query BAIAdminProjectSelectAstryxValueQuery(
          $projectIds: [UUID!]!
          $skipSelected: Boolean!
        ) {
          adminProjectsV2(filter: { id: { in: $projectIds } }, limit: 100)
            @skip(if: $skipSelected) {
            edges {
              node {
                id
                basicInfo {
                  name
                }
              }
            }
          }
        }
      `,
      {
        projectIds: selectedIds,
        skipSelected: selectedIds.length === 0,
      },
      {
        fetchPolicy: selectedIds.length > 0 ? 'store-or-network' : 'store-only',
        fetchKey: deferredFetchKey,
      },
    );

  const { paginationData, result, loadNext, isLoadingNext } =
    useLazyPaginatedQuery<
      BAIAdminProjectSelectAstryxPaginatedQuery,
      AstryxAdminProjectNode
    >(
      graphql`
        query BAIAdminProjectSelectAstryxPaginatedQuery(
          $offset: Int!
          $limit: Int!
          $filter: ProjectV2Filter
        ) {
          adminProjectsV2(
            offset: $offset
            limit: $limit
            filter: $filter
            orderBy: [{ field: NAME, direction: ASC }]
          ) {
            count
            edges {
              node {
                id
                basicInfo {
                  name
                }
              }
            }
          }
        }
      `,
      { limit: 10 },
      {
        filter: {
          ...(filterFromProps ?? {}),
          ...(debouncedDeferredValue
            ? { name: { contains: debouncedDeferredValue } }
            : {}),
        },
      },
      {
        // P26-6: the open state comes back out of the Astryx popup.
        fetchPolicy: deferredOpen ? 'network-only' : 'store-only',
        fetchKey: deferredFetchKey,
      },
      {
        getTotal: (r) => r.adminProjectsV2?.count ?? undefined,
        getItem: (r) => r.adminProjectsV2?.edges?.map((edge) => edge?.node),
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

  // id-valued (class B): the raw UUID (`toLocalId`), never the Relay global id.
  const keyOfNode = (
    node: { id: string } | null | undefined,
  ): string | undefined => (node?.id ? toLocalId(node.id) : undefined);

  const options = _.compact(
    _.map(paginationData, (item) => {
      const key = keyOfNode(item);
      return key
        ? {
            value: key,
            label: item?.basicInfo?.name ?? key,
          }
        : null;
    }),
  );

  /** Plain keys -> labelInValue, resolving each label where we can. */
  const labeledValue: BAIComplexSelectValue = (() => {
    const labeled: Array<BAILabeledValue> = _.map(selectedIds, (key) => {
      const edge = _.find(
        selectedProjects?.edges,
        (e) => keyOfNode(e?.node) === key,
      );
      // Echoing the key as its own label is the antd fallback, made explicit.
      return { label: edge?.node?.basicInfo?.name ?? key, value: key };
    });
    if (multiple) return labeled;
    return labeled[0] ?? null;
  })();

  return (
    <BAIComplexSelect
      placeholder={t('comp:BAIProjectSelect.SelectProject')}
      {...selectProps}
      multiple={multiple}
      isLoading={
        isLoading ||
        controllableValue !== deferredControllableValue ||
        searchStr !== debouncedDeferredValue ||
        isPendingRefetch
      }
      isLoadingNext={isLoadingNext}
      total={result.adminProjectsV2?.count ?? undefined}
      options={options}
      value={labeledValue}
      onChange={(next) => {
        const labeled = _.compact(_.castArray(next ?? []));
        const keys = _.map(labeled, (v) => v.value);
        // P3C-1: second argument carries the labelInValue pair(s).
        setControllableValue(
          multiple ? keys : keys[0],
          multiple ? labeled : labeled[0],
        );
      }}
      searchValue={searchStr}
      onSearch={setSearchStr}
      onOpenChange={setControllableOpen}
      endReached={loadNext}
    />
  );
};

export default BAIAdminProjectSelectAstryx;
