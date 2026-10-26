import type {
  BAIScopedVFolderSelectQuery,
  BAIScopedVFolderSelectQuery$data,
} from '../../__generated__/BAIScopedVFolderSelectQuery.graphql';
import type { BAIScopedVFolderSelectValueQuery } from '../../__generated__/BAIScopedVFolderSelectValueQuery.graphql';
import useDebouncedDeferredValue from '../../helper/useDebouncedDeferredValue';
import { useControllableValue, useFetchKey } from '../../hooks';
import { useBAIi18n } from '../../hooks/useBAIi18n';
import type {
  VFolderFilter,
  VFolderScope,
} from '../../hooks/useMountableVFolders';
import { useLazyPaginatedQuery } from '../../hooks/usePaginatedQuery';
import BAIComplexSelect, {
  type BAIComplexSelectProps,
  type BAIComplexSelectValue,
  type BAILabeledValue,
} from '../BAIComplexSelect';
import BAIVFolderIdenticon from '../BAIVFolderIdenticon';
import './BAIScopedVFolderSelect.css';
import { Token } from '@lablup/ui-common/Token';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import React, {
  useDeferredValue,
  useEffect,
  useEffectEvent,
  useImperativeHandle,
  useState,
  useTransition,
} from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

export type ScopedVFolderNode = NonNullable<
  BAIScopedVFolderSelectQuery$data['scopedVFoldersV2']
>['edges'][number]['node'];

/** What the select knows about a folder, from an option row or the value lookup. */
export interface ScopedVFolderSummary {
  entityId: string;
  name: string;
  host: string;
  /** The caller's mount level: `NONE`, `READ_ONLY`, `READ_WRITE` or `RW_DELETE`. */
  permission: string;
}

export interface ScopedVFolderResolution {
  /** Selected folders the scope and `filter` reach and `getFolderDisabled` allows. */
  resolved: Array<ScopedVFolderSummary>;
  /** Selected ids the scope and `filter` do not reach, or `getFolderDisabled` rejects. */
  unresolved: Array<string>;
}

export interface BAIScopedVFolderSelectRef {
  /** Re-reads the options and re-checks the selected ids. */
  refetch: () => void;
}

export interface BAIScopedVFolderSelectProps extends Omit<
  BAIComplexSelectProps,
  | 'options'
  | 'value'
  | 'onChange'
  | 'searchValue'
  | 'onSearch'
  | 'total'
  | 'isLoadingNext'
  | 'endReached'
> {
  /** Folder UUIDs (`VFolder.entityId`). Array iff `multiple`. */
  value?: string | Array<string> | null;
  onChange?: (
    value: string | Array<string> | undefined,
    option?: BAILabeledValue | Array<BAILabeledValue>,
  ) => void;
  /** The scopes whose folders are read, combined with OR. */
  scope: VFolderScope;
  /** ANDed onto the options and onto the selected-value lookup. */
  filter?: VFolderFilter;
  /** ANDed onto the options only; a selected folder it excludes stays selected. */
  optionFilter?: VFolderFilter;
  /**
   * A truthy result lists the option disabled (with `reason` under its label)
   * and reports a matching selection unresolved.
   */
  getFolderDisabled?: (
    folder: ScopedVFolderSummary,
  ) => boolean | { reason: string };
  /** Labels for selected ids the scope and `filter` do not reach. */
  fallbackLabels?: Record<string, string>;
  /** Fires once the selected ids are looked up, and again whenever the outcome changes. */
  onResolve?: (resolution: ScopedVFolderResolution) => void;
  ref?: React.Ref<BAIScopedVFolderSelectRef>;
}

const PAGE_SIZE = 20;

const toSummary = (node: {
  entityId: string;
  host: string;
  metadata: { name: string };
  accessControl: { permission: string };
}): ScopedVFolderSummary => ({
  entityId: node.entityId,
  name: node.metadata.name,
  host: node.host,
  permission: node.accessControl.permission,
});

const PERMISSION_LETTERS: Record<
  string,
  Array<{ label: string; color: 'green' | 'blue' | 'red' }>
> = {
  READ_ONLY: [{ label: 'R', color: 'green' }],
  READ_WRITE: [
    { label: 'R', color: 'green' },
    { label: 'W', color: 'blue' },
  ],
  RW_DELETE: [
    { label: 'R', color: 'green' },
    { label: 'W', color: 'blue' },
    { label: 'D', color: 'red' },
  ],
};

/** The caller's mount level on a folder, as welded tokens in the data page's colours. */
const VFolderPermissionTokens: React.FC<{ permission: string }> = ({
  permission,
}) => {
  'use memo';
  return (
    <span className="bai-scoped-vfolder-select__permission">
      {(PERMISSION_LETTERS[permission] ?? []).map(({ label, color }) => (
        <Token key={label} label={label} color={color} size="sm" />
      ))}
    </span>
  );
};

/** Second line of a folder option: who made it, what it is for, where it is. */
const VFolderOptionMeta: React.FC<{ folder: ScopedVFolderNode }> = ({
  folder,
}) => {
  'use memo';
  const createdAt = dayjs(folder.metadata.createdAt);
  return (
    <span className="bai-scoped-vfolder-select__option-meta">
      {folder.ownership.creatorEmail && (
        <span>{folder.ownership.creatorEmail}</span>
      )}
      <span>{folder.metadata.usageMode.toLowerCase()}</span>
      <span>{folder.host}</span>
      {createdAt.isValid() && <span>{createdAt.format('ll')}</span>}
    </span>
  );
};

/**
 * Picks vfolders from `scopedVFoldersV2`, paged and searched on the server.
 * The value is folder UUIDs. The selected ids are looked up by `entityId`
 * within `scope` and `filter`, which labels them and tells `onResolve` whether
 * the scope still reaches them. The options are read only while the popup is
 * open; the lookup suspends on first load.
 *
 * Props and usage: `BAIScopedVFolderSelect.doc.ts`.
 */
const BAIScopedVFolderSelect: React.FC<BAIScopedVFolderSelectProps> = ({
  scope,
  filter,
  optionFilter,
  getFolderDisabled,
  fallbackLabels,
  onResolve,
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
  // The options are read only once the popup opens.
  const deferredOpen = useDeferredValue(controllableOpen);
  const [searchStr, setSearchStr] = useState('');
  const deferredSearchStr = useDebouncedDeferredValue(searchStr);
  const [fetchKey, updateFetchKey] = useFetchKey();
  const [isPendingRefetch, startRefetchTransition] = useTransition();

  const { paginationData, result, loadNext, isLoadingNext } =
    useLazyPaginatedQuery<BAIScopedVFolderSelectQuery, ScopedVFolderNode>(
      graphql`
        query BAIScopedVFolderSelectQuery(
          $scope: VFolderScope!
          $filter: VFolderFilter
          $limit: Int!
          $offset: Int!
        ) {
          scopedVFoldersV2(
            scope: $scope
            filter: $filter
            limit: $limit
            offset: $offset
            orderBy: [{ field: CREATED_AT, direction: DESC }]
          ) {
            count
            edges {
              node {
                entityId
                host
                metadata {
                  name
                  usageMode
                  createdAt
                }
                accessControl {
                  permission
                }
                ownership {
                  creatorEmail
                }
              }
            }
          }
        }
      `,
      { limit: PAGE_SIZE },
      {
        scope,
        filter: {
          AND: _.compact([
            filter,
            optionFilter,
            deferredSearchStr
              ? { name: { iContains: deferredSearchStr } }
              : null,
          ]),
        },
      },
      {
        fetchKey,
        fetchPolicy: deferredOpen ? 'store-and-network' : 'store-only',
      },
      {
        getTotal: (data) => data.scopedVFoldersV2?.count ?? undefined,
        getItem: (data) =>
          data.scopedVFoldersV2?.edges.map((edge) => edge.node),
        getId: (node) => node?.entityId,
      },
    );

  useImperativeHandle(ref, () => ({
    refetch: () => {
      startRefetchTransition(() => {
        updateFetchKey();
      });
    },
  }));

  const selectedIds = _.compact(_.castArray(controllableValue ?? []));
  // Keyed on the selection only, so paging and search never re-run it.
  const lookupKey = useDeferredValue(_.sortBy(selectedIds).join(','));
  const lookupIds = lookupKey ? lookupKey.split(',') : [];
  const { scopedVFoldersV2: selectedFolders } =
    useLazyLoadQuery<BAIScopedVFolderSelectValueQuery>(
      graphql`
        query BAIScopedVFolderSelectValueQuery(
          $scope: VFolderScope!
          $filter: VFolderFilter
          $limit: Int!
          $skip: Boolean!
        ) {
          scopedVFoldersV2(scope: $scope, filter: $filter, limit: $limit)
            @skip(if: $skip) {
            edges {
              node {
                entityId
                host
                metadata {
                  name
                }
                accessControl {
                  permission
                }
              }
            }
          }
        }
      `,
      {
        scope,
        filter: { AND: _.compact([filter, { entityId: { in: lookupIds } }]) },
        limit: Math.max(lookupIds.length, 1),
        skip: lookupIds.length === 0,
      },
      {
        fetchKey,
        fetchPolicy: lookupIds.length ? 'store-and-network' : 'store-only',
      },
    );
  const summaryById = _.keyBy(
    _.map(selectedFolders?.edges, (edge) => toSummary(edge.node)),
    'entityId',
  );
  const isReachable = (id: string) =>
    !!summaryById[id] && !getFolderDisabled?.(summaryById[id]);
  const resolution: ScopedVFolderResolution = {
    resolved: _.map(_.filter(lookupIds, isReachable), (id) => summaryById[id]),
    unresolved: _.reject(lookupIds, isReachable),
  };
  const resolutionKey = JSON.stringify([
    _.map(resolution.resolved, (folder) => [folder.entityId, folder.name]),
    resolution.unresolved,
  ]);
  const notifyResolve = useEffectEvent(() => onResolve?.(resolution));
  useEffect(() => {
    notifyResolve();
  }, [resolutionKey]);

  const options = _.map(paginationData, (folder) => ({
    value: folder.entityId,
    label: folder.metadata.name,
    disabled: getFolderDisabled?.(toSummary(folder)) ?? false,
    icon: (
      <BAIVFolderIdenticon
        vfolderId={folder.entityId}
        className="bai-scoped-vfolder-select__option-icon"
      />
    ),
    description: <VFolderOptionMeta folder={folder} />,
    extra: (
      <VFolderPermissionTokens permission={folder.accessControl.permission} />
    ),
  }));

  const nodeById = _.keyBy(paginationData, 'entityId');
  const labeled: Array<BAILabeledValue> = _.map(selectedIds, (id) => ({
    value: id,
    label:
      nodeById[id]?.metadata.name ??
      summaryById[id]?.name ??
      fallbackLabels?.[id] ??
      id,
  }));
  const labeledValue: BAIComplexSelectValue = multiple
    ? labeled
    : (labeled[0] ?? null);

  return (
    <BAIComplexSelect
      placeholder={t('comp:BAIScopedVFolderSelect.SelectFolder')}
      {...selectProps}
      multiple={multiple}
      isLoading={
        isLoading ||
        (!!controllableOpen && !deferredOpen) ||
        searchStr !== deferredSearchStr ||
        lookupKey !== _.sortBy(selectedIds).join(',') ||
        isPendingRefetch
      }
      isLoadingNext={isLoadingNext}
      total={result.scopedVFoldersV2?.count ?? undefined}
      options={options}
      value={labeledValue}
      onChange={(next) => {
        const items = _.compact(_.castArray(next ?? []));
        const ids = _.map(items, 'value');
        setControllableValue(
          multiple ? ids : ids[0],
          multiple ? items : items[0],
        );
      }}
      searchValue={searchStr}
      onSearch={setSearchStr}
      onOpenChange={setControllableOpen}
      endReached={loadNext}
    />
  );
};

export default BAIScopedVFolderSelect;
