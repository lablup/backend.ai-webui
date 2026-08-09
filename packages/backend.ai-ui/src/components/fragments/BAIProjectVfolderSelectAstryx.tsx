/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 BAIProjectVfolderSelectAstryx — ticket-27 Astryx sibling of
 `BAIProjectVfolderSelect`, built on `BAIComplexSelect` (ticket 26).

 FRONTIER RULE (MIGRATION-SPEC §0 "번역 프런티어" / 래퍼 정책): the antd
 `BAIProjectVfolderSelect` is NOT touched. It keeps serving every unmigrated
 call site until this wrapper's last consumer is converted. This file's OUTER
 value contract is deliberately the same plain key (`string | undefined`) the
 antd wrapper exposes today — `labelInValue` lives strictly between this
 wrapper and `BAIComplexSelect`.

 Single-value only: the antd original never handled `mode="multiple"` in its
 `onChange` (its own comment says "Single-value select only"), so this
 sibling keeps that same single-value assumption rather than inventing
 multi-select support that never existed.

 PILOT-DECISIONs:
  - antd `onClickVFolder` made the TRIGGER's rendered label a clickable
    `BAILink`. `BAIComplexSelect`'s trigger only prints `value.label` as plain
    text (P26-3/P26-4), so `onClickVFolder` is dropped entirely from the
    props interface.
  - The secondary monospace "(id)" suffix that `optionRender`/`labelRender`
    appended next to each label moves into each option's `description` slot
    (P26-3 — rich per-row content can no longer live in `label` itself).
  - antd's `notFoundContent={<Skeleton.Input/>}` first-load placeholder is
    dropped (P26-7); the empty state is the shared "No results" text.
*/
import { BAIProjectVfolderSelectAstryxPaginatedQuery } from '../../__generated__/BAIProjectVfolderSelectAstryxPaginatedQuery.graphql';
import { BAIProjectVfolderSelectAstryxValueQuery } from '../../__generated__/BAIProjectVfolderSelectAstryxValueQuery.graphql';
import { convertToUUID, toLocalId } from '../../helper';
import useDebouncedDeferredValue from '../../helper/useDebouncedDeferredValue';
import { useControllableValue, useFetchKey } from '../../hooks';
import { useBAIi18n } from '../../hooks/useBAIi18n';
import { useLazyPaginatedQuery } from '../../hooks/usePaginatedQuery';
import BAIComplexSelect, {
  type BAIComplexSelectProps,
  type BAIComplexSelectValue,
} from '../BAIComplexSelect';
import * as _ from 'lodash-es';
import {
  useDeferredValue,
  useImperativeHandle,
  useState,
  useTransition,
} from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

export type ProjectVfolderNode = NonNullable<
  NonNullable<
    BAIProjectVfolderSelectAstryxPaginatedQuery['response']['projectVfolders']
  >['edges'][number]
>['node'];

export type BAIProjectVfolderSelectAstryxFilter = NonNullable<
  BAIProjectVfolderSelectAstryxPaginatedQuery['variables']['filter']
>;

export interface BAIProjectVfolderSelectAstryxRef {
  refetch: () => void;
}

export interface BAIProjectVfolderSelectAstryxProps extends Omit<
  BAIComplexSelectProps,
  'options' | 'value' | 'onChange' | 'searchValue' | 'onSearch' | 'total'
> {
  /** Plain key, as the antd `BAIProjectVfolderSelect` exposes. */
  value?: string | null;
  onChange?: (value: string | undefined) => void;
  projectId: string;
  filter?: BAIProjectVfolderSelectAstryxFilter | null;
  excludeDeleted?: boolean;
  ref?: React.Ref<BAIProjectVfolderSelectAstryxRef>;
}

const EXCLUDED_DELETION_STATUSES = [
  'DELETE_PENDING',
  'DELETE_ONGOING',
  'DELETE_ERROR',
  'DELETE_COMPLETE',
] as const;

const BAIProjectVfolderSelectAstryx: React.FC<
  BAIProjectVfolderSelectAstryxProps
> = ({ projectId, filter, excludeDeleted, isLoading, ref, ...selectProps }) => {
  'use memo';
  const { t } = useBAIi18n();
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
  const debouncedDeferredValue = useDebouncedDeferredValue(searchStr);
  const [isPendingRefetch, startRefetchTransition] = useTransition();
  const [fetchKey, updateFetchKey] = useFetchKey();
  const deferredFetchKey = useDeferredValue(fetchKey);

  const deferredControllableValue = useDeferredValue(controllableValue);

  // `VFolderFilter` allows each field at most once at the top level, so the
  // caller's `filter` is composed with the search / `excludeDeleted`
  // shortcuts via the `AND` combinator (unchanged from the antd original).
  const subFilters: BAIProjectVfolderSelectAstryxFilter[] = [];
  if (filter) subFilters.push(filter);
  if (excludeDeleted) {
    subFilters.push({
      status: { notIn: EXCLUDED_DELETION_STATUSES },
    });
  }
  if (debouncedDeferredValue) {
    subFilters.push({ name: { iContains: debouncedDeferredValue } });
  }
  const mergedFilter: BAIProjectVfolderSelectAstryxFilter | null =
    subFilters.length === 0
      ? null
      : subFilters.length === 1
        ? subFilters[0]
        : { AND: subFilters };

  // Selected-value name lookup. `VFolderFilter` does not expose an id
  // filter, so the single selected vfolder is resolved via the
  // `vfolderV2(vfolderId:)` point lookup. `@skip` collapses the request when
  // nothing is selected.
  const selectedUuid = deferredControllableValue
    ? convertToUUID(_.toString(deferredControllableValue))
    : '';
  const { vfolderV2: selectedVfolder } =
    useLazyLoadQuery<BAIProjectVfolderSelectAstryxValueQuery>(
      graphql`
        query BAIProjectVfolderSelectAstryxValueQuery(
          $vfolderId: UUID!
          $skip: Boolean!
        ) {
          vfolderV2(vfolderId: $vfolderId) @skip(if: $skip) {
            id
            metadata {
              name
            }
          }
        }
      `,
      {
        vfolderId: selectedUuid,
        skip: !selectedUuid,
      },
      {
        fetchPolicy: selectedUuid ? 'store-or-network' : 'store-only',
        fetchKey: deferredFetchKey,
      },
    );

  const { paginationData, result, loadNext, isLoadingNext } =
    useLazyPaginatedQuery<
      BAIProjectVfolderSelectAstryxPaginatedQuery,
      ProjectVfolderNode
    >(
      graphql`
        query BAIProjectVfolderSelectAstryxPaginatedQuery(
          $offset: Int!
          $limit: Int!
          $projectId: UUID!
          $filter: VFolderFilter
        ) {
          projectVfolders(
            projectId: $projectId
            offset: $offset
            limit: $limit
            filter: $filter
            orderBy: [{ field: CREATED_AT, direction: DESC }]
          ) {
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
        projectId: convertToUUID(projectId),
        filter: mergedFilter,
      },
      {
        fetchPolicy: deferredOpen ? 'network-only' : 'store-only',
        fetchKey: deferredFetchKey,
      },
      {
        getTotal: (r) => r.projectVfolders?.count ?? undefined,
        getItem: (r) => r.projectVfolders?.edges?.map((edge) => edge?.node),
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
      // Emit the raw (dashed) local UUID — matches the
      // `vfolderV2(vfolderId: UUID!)` shape and is what mutation callers feed
      // to `deployVfolderV2` etc.
      const key = item?.id ? toLocalId(item.id) : undefined;
      return key
        ? {
            value: key,
            label: item?.metadata?.name ?? key,
            description: key,
          }
        : null;
    }),
  );

  /** Plain key -> labelInValue, resolving the label where we can. */
  const labeledValue: BAIComplexSelectValue = deferredControllableValue
    ? {
        label:
          selectedVfolder?.metadata?.name ??
          _.toString(deferredControllableValue),
        value: _.toString(deferredControllableValue),
      }
    : null;

  return (
    <BAIComplexSelect
      placeholder={t('comp:BAIProjectVfolderSelect.SelectFolder')}
      {...selectProps}
      isLoading={
        isLoading ||
        controllableValue !== deferredControllableValue ||
        searchStr !== debouncedDeferredValue ||
        isPendingRefetch
      }
      isLoadingNext={isLoadingNext}
      total={result.projectVfolders?.count ?? undefined}
      options={options}
      value={labeledValue}
      onChange={(next) => {
        const v = _.isArray(next) ? next[0] : next;
        setControllableValue(v?.value, undefined);
      }}
      searchValue={searchStr}
      onSearch={setSearchStr}
      onOpenChange={setControllableOpen}
      endReached={loadNext}
    />
  );
};

export default BAIProjectVfolderSelectAstryx;
