/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 BAIAdminResourceGroupSelectAstryx — ticket-27 Astryx sibling of
 `BAIAdminResourceGroupSelect`.

 CLASS C (CONVERSION-BRIEF §2.C): the only wrapper in this repo built on
 `usePaginationFragment` (cursor pagination via a `queryRef` fragment key)
 rather than `useLazyPaginatedQuery` (offset pagination). Per the brief,
 `endReached` maps to `loadNext(pageSize)` and `isLoadingNext` to the hook's
 own flag; nothing else about the recipe changes. The `queryRef` prop is
 unchanged — parents still supply the fragment data the same way.

 FRONTIER RULE: the antd `BAIAdminResourceGroupSelect` is NOT touched; it
 keeps serving every unmigrated call site until callers move to this sibling.

 PILOT-DECISIONs:
  - resourceGroups use `name` as BOTH their primary key and display label
    (see the original's own comment: "since scaling group uses name as
    primary key, use name as value"). Because label and value are always
    identical for this domain object, there is no separate "selected value
    -> label" resolution query to keep (unlike the Relay-offset wrappers,
    where the display name is a different field than the key and can go
    missing from `options` after paging). `label: key, value: key` is not a
    fallback here, it is definitionally correct.
  - P26-7 antd's `notFoundContent={<Skeleton.Input/>}` first-load
    placeholder is dropped — shared "No results" text instead.
*/
import { BAIAdminResourceGroupSelectAstryxPaginationQuery } from '../../__generated__/BAIAdminResourceGroupSelectAstryxPaginationQuery.graphql';
import { BAIAdminResourceGroupSelectAstryx_resourceGroupsFragment$key } from '../../__generated__/BAIAdminResourceGroupSelectAstryx_resourceGroupsFragment.graphql';
import { useControllableValue } from '../../hooks';
import { useBAIi18n } from '../../hooks/useBAIi18n';
import BAIComplexSelect, {
  type BAIComplexSelectProps,
  type BAIComplexSelectValue,
  type BAILabeledValue,
} from '../BAIComplexSelect';
import * as _ from 'lodash-es';
import { useState } from 'react';
import { usePaginationFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

export interface BAIAdminResourceGroupSelectAstryxProps extends Omit<
  BAIComplexSelectProps,
  'options' | 'value' | 'onChange' | 'searchValue' | 'onSearch' | 'total'
> {
  /**
   * P3C-6: this is the ASTRYX fragment key. Ticket 27 typed it as the legacy
   * `BAIAdminResourceGroupSelect_resourceGroupsFragment$key` while the
   * `graphql` tag below declares `BAIAdminResourceGroupSelectAstryx_...` — the
   * two happen to be structurally identical, so tsc accepted a consumer that
   * spread the LEGACY fragment into this component, which would then find no
   * data at runtime. Fixed here as part of the flip.
   */
  queryRef: BAIAdminResourceGroupSelectAstryx_resourceGroupsFragment$key;
  /** Plain key(s), as the antd `BAIAdminResourceGroupSelect` exposes. */
  value?: string | Array<string> | null;
  onChange?: (value: string | Array<string> | undefined) => void;
}

const BAIAdminResourceGroupSelectAstryx: React.FC<
  BAIAdminResourceGroupSelectAstryxProps
> = ({ queryRef, multiple = false, isLoading, ...selectProps }) => {
  'use memo';
  const { t } = useBAIi18n();
  const [controllableValue, setControllableValue] = useControllableValue<
    string | Array<string> | null | undefined
  >(selectProps as Record<string, unknown>, {
    valuePropName: 'value',
    trigger: 'onChange',
  });
  const [searchStr, setSearchStr] = useState<string>('');

  const { data, loadNext, isLoadingNext, refetch, hasNext } =
    usePaginationFragment<
      BAIAdminResourceGroupSelectAstryxPaginationQuery,
      BAIAdminResourceGroupSelectAstryx_resourceGroupsFragment$key
    >(
      graphql`
        fragment BAIAdminResourceGroupSelectAstryx_resourceGroupsFragment on Query
        @argumentDefinitions(
          first: { type: "Int", defaultValue: 10 }
          after: { type: "String" }
          filter: { type: "ResourceGroupFilter" }
        )
        @refetchable(
          queryName: "BAIAdminResourceGroupSelectAstryxPaginationQuery"
        ) {
          resourceGroups(first: $first, after: $after, filter: $filter)
            @connection(key: "BAIAdminResourceGroupSelectAstryx_resourceGroups")
            @since(version: "26.1.0") {
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
      queryRef,
    );

  const selectedKeys = _.compact(_.castArray(controllableValue ?? []));

  const options = _.compact(
    _.map(data.resourceGroups?.edges, (item) =>
      item?.node?.name
        ? { value: item.node.name, label: item.node.name }
        : null,
    ),
  );

  // label === value for this domain object (see header PILOT-DECISION), so
  // labelInValue pairs can be constructed directly from the selected keys
  // with no separate resolution query.
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
      placeholder={t('comp:BAIAdminResourceGroupSelect.PlaceHolder')}
      {...selectProps}
      multiple={multiple}
      isLoading={isLoading}
      isLoadingNext={isLoadingNext}
      total={data.resourceGroups?.count ?? undefined}
      options={options}
      value={labeledValue}
      onChange={(next) => {
        const keys = _.map(_.compact(_.castArray(next ?? [])), (v) => v.value);
        setControllableValue(multiple ? keys : keys[0], undefined);
      }}
      searchValue={searchStr}
      onSearch={(next) => {
        setSearchStr(next);
        refetch({
          filter: next ? { name: { contains: next } } : null,
        });
      }}
      endReached={() => {
        hasNext && loadNext(10);
      }}
    />
  );
};

export default BAIAdminResourceGroupSelectAstryx;
