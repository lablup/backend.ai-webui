/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 BAIScopedImageSelect — Relay-paginated, id-valued image select over
 `scopedImagesV2` (ADR 0012). The value is the image UUID; options are
 labelled `"<canonicalName>@<architecture>"`, and a selected id missing from
 the loaded pages falls back to the UUID as its label.
*/
import {
  BAIScopedImageSelectPaginatedQuery,
  ImageSearchScope,
  ImageV2Filter,
} from '../../__generated__/BAIScopedImageSelectPaginatedQuery.graphql';
import { BAIScopedImageSelectValueQuery } from '../../__generated__/BAIScopedImageSelectValueQuery.graphql';
import useDebouncedDeferredValue from '../../helper/useDebouncedDeferredValue';
import { useControllableValue, useFetchKey } from '../../hooks';
import { useBAIi18n } from '../../hooks/useBAIi18n';
import { useLazyPaginatedQuery } from '../../hooks/usePaginatedQuery';
import BAIComplexSelect, {
  type BAIComplexSelectProps,
  type BAIComplexSelectValue,
  type BAILabeledValue,
} from '../BAIComplexSelect';
import BAIImageNodeSimpleTagV2 from './BAIImageNodeSimpleTagV2';
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
    BAIScopedImageSelectPaginatedQuery['response']['scopedImagesV2']
  >['edges'][number]
>['node'];

export interface BAIScopedImageSelectRef {
  refetch: () => void;
}

export interface BAIScopedImageSelectProps extends Omit<
  BAIComplexSelectProps,
  'options' | 'value' | 'onChange' | 'searchValue' | 'onSearch' | 'total'
> {
  /** Plain key(s), as the antd `BAIScopedImageSelect` exposes. */
  value?: string | Array<string> | null;
  /** The second argument is the picked option, so a `renderInput` filter can
   * label its token with the image name while the UUID serializes. */
  onChange?: (
    value: string | Array<string> | undefined,
    option?: BAILabeledValue | Array<BAILabeledValue>,
  ) => void;
  /** Additional GraphQL filter to narrow the image list. */
  filter?: ImageV2Filter;
  open?: boolean;
  defaultOpen?: boolean;
  /** The images this scope reaches are listed (ADR 0012). */
  scope: ImageSearchScope;
  ref?: React.Ref<BAIScopedImageSelectRef>;
}

/**
 * Paginated image selector backed by `scopedImagesV2` (ImageV2) over the required `scope`.
 * Stored value is the image UUID so callers can pass it directly to
 * mutation inputs that expect `UUID`.
 */
const BAIScopedImageSelect: React.FC<BAIScopedImageSelectProps> = ({
  filter: filterFromProps,
  scope,
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

  const selectedImageData = useLazyLoadQuery<BAIScopedImageSelectValueQuery>(
    graphql`
      query BAIScopedImageSelectValueQuery(
        $ids: [UUID!]
        $scope: ImageSearchScope!
        $skipSelected: Boolean!
      ) {
        scopedImagesV2(scope: $scope, filter: { id: { in: $ids } }, limit: 100)
          @skip(if: $skipSelected) {
          edges {
            node {
              id
              entityId
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
      scope,
      skipSelected: selectedKeys.length === 0,
    },
    {
      fetchPolicy: selectedKeys.length ? 'store-or-network' : 'store-only',
      fetchKey: deferredFetchKey,
    },
  );
  const selectedImageMap = _.keyBy(
    _.compact(_.map(selectedImageData.scopedImagesV2?.edges, (e) => e?.node)),
    (node) => node.entityId,
  );

  const { paginationData, result, loadNext, isLoadingNext } =
    useLazyPaginatedQuery<
      BAIScopedImageSelectPaginatedQuery,
      AstryxImageV2Node
    >(
      graphql`
        query BAIScopedImageSelectPaginatedQuery(
          $offset: Int!
          $limit: Int!
          $filter: ImageV2Filter
          $scope: ImageSearchScope!
        ) {
          scopedImagesV2(
            scope: $scope
            offset: $offset
            limit: $limit
            filter: $filter
            orderBy: [{ field: NAME, direction: ASC }]
          ) {
            count
            edges {
              node {
                id
                entityId
                identity {
                  canonicalName
                  architecture
                }
                ...BAIImageNodeSimpleTagV2Fragment
              }
            }
          }
        }
      `,
      { limit: 20 },
      {
        scope,
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
        getTotal: (r) => r.scopedImagesV2?.count ?? undefined,
        getItem: (r) => r.scopedImagesV2?.edges?.map((e) => e?.node),
        // The image UUID, so callers can pass the value straight to UUID! inputs.
        getId: (item) => item?.entityId,
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

  // The option row is the project-wide image row (ADR 0005), so the picker
  // reads like the session launcher. `label` stays the canonical reference —
  // the trigger text, the accessible name and the filter chip's text — while
  // the popup draws the row in its place.
  const options = _.compact(
    _.map(paginationData, (item) => {
      const key = item?.entityId;
      return key
        ? {
            value: key,
            label: getImageLabel(item?.identity),
            labelContent: item ? (
              <BAIImageNodeSimpleTagV2 imageFrgmt={item} copyable={false} />
            ) : undefined,
          }
        : null;
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
      total={result.scopedImagesV2?.count ?? undefined}
      options={options}
      value={labeledValue}
      onChange={(next) => {
        const labeled = _.compact(_.castArray(next ?? []));
        const keys = _.map(labeled, (v) => v.value);
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

export default BAIScopedImageSelect;
