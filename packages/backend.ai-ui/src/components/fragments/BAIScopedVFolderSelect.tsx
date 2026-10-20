import type {
  BAIScopedVFolderSelectQuery,
  BAIScopedVFolderSelectQuery$data,
} from '../../__generated__/BAIScopedVFolderSelectQuery.graphql';
import type { BAIScopedVFolderSelectValueQuery } from '../../__generated__/BAIScopedVFolderSelectValueQuery.graphql';
import useDebouncedDeferredValue from '../../helper/useDebouncedDeferredValue';
import { useControllableValue } from '../../hooks';
import { useBAIi18n } from '../../hooks/useBAIi18n';
import type {
  VFolderFilter,
  VFolderScope,
} from '../../hooks/useMountableVFolders';
import { useLazyPaginatedQuery } from '../../hooks/usePaginatedQuery';
import { BAIUserUnionIcon } from '../../icons';
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
import { User } from 'lucide-react';
import React, {
  useEffect,
  useEffectEvent,
  useImperativeHandle,
  useState,
  useTransition,
} from 'react';
import { fetchQuery, graphql, useRelayEnvironment } from 'react-relay';

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
  /** Selected folders the scope and `filter` reach and `isFolderDisabled` allows. */
  resolved: Array<ScopedVFolderSummary>;
  /** Selected ids the scope and `filter` do not reach, or `isFolderDisabled` rejects. */
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
  /** A matching option is listed disabled, and a matching selection is reported unresolved. */
  isFolderDisabled?: (folder: ScopedVFolderSummary) => boolean;
  /** Labels shown for selected ids until the lookup answers. */
  fallbackLabels?: Record<string, string>;
  /**
   * Fires once every selected id is accounted for, and again whenever that
   * outcome changes. Ids whose lookup failed are in neither list.
   */
  onResolve?: (resolution: ScopedVFolderResolution) => void;
  /** Owner line of a project folder; the folder list carries no project name. */
  currentProjectName?: string;
  ref?: React.Ref<BAIScopedVFolderSelectRef>;
}

const PAGE_SIZE = 100;

type LookupResult = ScopedVFolderSummary | 'missing' | 'failed';

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

/** Second line of a folder option: who owns it, what it is for, where it is. */
const VFolderOptionMeta: React.FC<{
  folder: ScopedVFolderNode;
  projectName?: string;
}> = ({ folder, projectName }) => {
  'use memo';
  const { t } = useBAIi18n();
  const isUserOwned = folder.accessControl.ownershipType === 'USER';
  const owner = isUserOwned
    ? folder.ownership.creatorEmail ||
      t('comp:BAIScopedVFolderSelect.OwnerUser')
    : projectName || t('comp:BAIScopedVFolderSelect.OwnerProject');
  const createdAt = dayjs(folder.metadata.createdAt);
  return (
    <span className="bai-scoped-vfolder-select__option-meta">
      <span>
        {isUserOwned ? <User size="1em" /> : <BAIUserUnionIcon />}
        {owner}
      </span>
      <span>{folder.metadata.usageMode.toLowerCase()}</span>
      <span>{folder.host}</span>
      {createdAt.isValid() && <span>{createdAt.format('ll')}</span>}
    </span>
  );
};

/**
 * Picks vfolders from `scopedVFoldersV2`, paged and searched on the server.
 * The value is folder UUIDs; a selected id the loaded pages do not cover is
 * looked up by `entityId`, which labels it and tells `onResolve` whether the
 * scope still reaches it. Suspends on the first page.
 *
 * Props and usage: `BAIScopedVFolderSelect.doc.ts`.
 */
const BAIScopedVFolderSelect: React.FC<BAIScopedVFolderSelectProps> = ({
  scope,
  filter,
  optionFilter,
  isFolderDisabled,
  fallbackLabels,
  onResolve,
  currentProjectName,
  multiple = false,
  isLoading,
  ref,
  ...selectProps
}) => {
  'use memo';
  const { t } = useBAIi18n();
  const relayEnv = useRelayEnvironment();
  const [controllableValue, setControllableValue] = useControllableValue<
    string | Array<string> | null | undefined
  >(selectProps as Record<string, unknown>, {
    valuePropName: 'value',
    trigger: 'onChange',
  });
  const [searchStr, setSearchStr] = useState('');
  const deferredSearchStr = useDebouncedDeferredValue(searchStr);
  const [fetchKey, setFetchKey] = useState(0);
  const [isPendingRefetch, startRefetchTransition] = useTransition();
  const [lookup, setLookup] = useState<Record<string, LookupResult>>({});

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
                id
                entityId
                host
                metadata {
                  name
                  usageMode
                  createdAt
                }
                accessControl {
                  permission
                  ownershipType
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
      { fetchKey, fetchPolicy: 'store-and-network' },
      {
        getTotal: (data) => data.scopedVFoldersV2?.count ?? undefined,
        getItem: (data) =>
          data.scopedVFoldersV2?.edges.map((edge) => edge.node),
        getId: (node) => node?.id,
      },
    );

  useImperativeHandle(ref, () => ({
    refetch: () => {
      startRefetchTransition(() => {
        setFetchKey((key) => key + 1);
        setLookup({});
      });
    },
  }));

  const selectedIds = _.compact(_.castArray(controllableValue ?? []));
  const nodeById = _.keyBy(paginationData, 'entityId');
  const statusOf = (id: string): LookupResult | undefined =>
    nodeById[id] ? toSummary(nodeById[id]) : lookup[id];

  // A selected id the loaded pages miss is looked up once by id.
  const pendingKey = _.sortBy(
    selectedIds.filter((id) => statusOf(id) === undefined),
  ).join(',');
  const lookUpSelected = useEffectEvent((ids: Array<string>) => {
    const answer = (resultOf: (id: string) => LookupResult) =>
      setLookup((prev) => ({
        ...prev,
        ..._.fromPairs(ids.map((id) => [id, resultOf(id)])),
      }));
    fetchQuery<BAIScopedVFolderSelectValueQuery>(
      relayEnv,
      graphql`
        query BAIScopedVFolderSelectValueQuery(
          $scope: VFolderScope!
          $filter: VFolderFilter
          $limit: Int!
        ) {
          scopedVFoldersV2(scope: $scope, filter: $filter, limit: $limit) {
            edges {
              node {
                id
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
        filter: { AND: _.compact([filter, { entityId: { in: ids } }]) },
        limit: ids.length,
      },
    )
      .toPromise()
      .then((data) => {
        const found = _.keyBy(
          _.map(data?.scopedVFoldersV2?.edges, (edge) => toSummary(edge.node)),
          'entityId',
        );
        answer((id) => found[id] ?? 'missing');
      })
      // A failed lookup proves nothing about the id, so it is left unjudged.
      .catch(() => answer(() => 'failed'));
  });
  useEffect(() => {
    if (pendingKey) lookUpSelected(pendingKey.split(','));
  }, [pendingKey]);

  const resolution: ScopedVFolderResolution | null = pendingKey
    ? null
    : {
        resolved: _.filter(
          _.map(selectedIds, statusOf),
          (status): status is ScopedVFolderSummary =>
            _.isObject(status) && !isFolderDisabled?.(status),
        ),
        unresolved: selectedIds.filter((id) => {
          const status = statusOf(id);
          return (
            status === 'missing' ||
            (_.isObject(status) && !!isFolderDisabled?.(status))
          );
        }),
      };
  const resolutionKey = resolution
    ? JSON.stringify([
        _.map(resolution.resolved, (folder) => [folder.entityId, folder.name]),
        resolution.unresolved,
      ])
    : '';
  const notifyResolve = useEffectEvent(() => {
    if (resolution) onResolve?.(resolution);
  });
  useEffect(() => {
    if (resolutionKey) notifyResolve();
  }, [resolutionKey]);

  const options = _.map(paginationData, (folder) => ({
    value: folder.entityId,
    label: folder.metadata.name,
    disabled: !!isFolderDisabled?.(toSummary(folder)),
    icon: (
      <BAIVFolderIdenticon
        vfolderId={folder.entityId}
        className="bai-scoped-vfolder-select__option-icon"
      />
    ),
    description: (
      <VFolderOptionMeta folder={folder} projectName={currentProjectName} />
    ),
    extra: (
      <VFolderPermissionTokens permission={folder.accessControl.permission} />
    ),
  }));

  const labeled: Array<BAILabeledValue> = _.map(selectedIds, (id) => {
    const status = statusOf(id);
    return {
      value: id,
      label: _.isObject(status) ? status.name : (fallbackLabels?.[id] ?? id),
    };
  });
  const labeledValue: BAIComplexSelectValue = multiple
    ? labeled
    : (labeled[0] ?? null);

  return (
    <BAIComplexSelect
      placeholder={t('comp:BAIScopedVFolderSelect.SelectFolder')}
      {...selectProps}
      multiple={multiple}
      isLoading={
        isLoading || searchStr !== deferredSearchStr || isPendingRefetch
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
      endReached={loadNext}
    />
  );
};

export default BAIScopedVFolderSelect;
