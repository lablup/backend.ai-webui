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

 CLASS: B (id-valued) — stored value is always `toLocalId(node.id)`, exactly
 as the antd original.

 PILOT-DECISIONs:
  - The resolution query resolves only the FIRST selected key, carried over
    unchanged from the antd original: `DeploymentFilter` has no id-based
    filter, so the original falls back to the single-node `deployment(id:)`
    query, which can only take one id. In `multiple` mode any selection
    beyond the first therefore falls back to `label: key` (the raw UUID)
    until it scrolls back into a loaded page — this is a pre-existing
    limitation of the underlying schema/query, not something introduced by
    this conversion.
  - `notFoundContent={<Skeleton.Input/>}` first-load placeholder dropped
    (P26-7).
  - This wrapper never used `optionRender`/`labelRender`.
*/
import { BAIAdminModelServiceSelectPaginatedQuery } from '../../__generated__/BAIAdminModelServiceSelectPaginatedQuery.graphql';
import { BAIAdminModelServiceSelectValueQuery } from '../../__generated__/BAIAdminModelServiceSelectValueQuery.graphql';
import { toGlobalId, toLocalId } from '../../helper';
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

  // Use single-node query to resolve the selected value's label.
  // DeploymentFilter does not support id-based filtering, so we use the
  // deployment(id:) query instead — it can only resolve ONE id (see the
  // PILOT-DECISION in the header comment).
  const { deployment: selectedDeployment } =
    useLazyLoadQuery<BAIAdminModelServiceSelectValueQuery>(
      graphql`
        query BAIAdminModelServiceSelectValueQuery(
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
        id: selectedKeys.length
          ? toGlobalId('ModelDeployment', selectedKeys[0])
          : '',
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
        getId: (item) => (item?.id ? toLocalId(item.id) : item?.id),
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

  // Use raw UUID (toLocalId) as value instead of Relay global ID
  const options = _.compact(
    _.map(paginationData, (item) => {
      const key = item?.id ? toLocalId(item.id) : undefined;
      return key ? { value: key, label: item?.metadata?.name ?? key } : null;
    }),
  );

  const labeledValue: BAIComplexSelectValue = (() => {
    const labeled: Array<BAILabeledValue> = _.map(selectedKeys, (key) => {
      if (selectedDeployment && toLocalId(selectedDeployment.id) === key) {
        return {
          label: selectedDeployment.metadata?.name ?? key,
          value: key,
        };
      }
      return { label: key, value: key };
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
