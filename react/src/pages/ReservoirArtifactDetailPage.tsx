/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ImportArtifactRevisionToFolderModalArtifactRevisionFragment$key } from '../__generated__/ImportArtifactRevisionToFolderModalArtifactRevisionFragment.graphql';
import {
  ArtifactRevisionFilter,
  ArtifactStatus,
  ReservoirArtifactDetailPageQuery,
  ReservoirArtifactDetailPageQuery$data,
  ReservoirArtifactDetailPageQuery$variables,
} from '../__generated__/ReservoirArtifactDetailPageQuery.graphql';
import AutoUpdateFetchKeyButton from '../components/AutoUpdateFetchKeyButton';
import ImportArtifactRevisionToFolderButton from '../components/ImportArtifactRevisionToFolderButton';
import ImportArtifactRevisionToFolderModal from '../components/ImportArtifactRevisionToFolderModal';
import { buildPath } from '../helper/pathBuilder';
import { useBAIPaginationOptionStateOnSearchParam } from '../hooks/reactPaginationQueryOptions';
import { useSetBAINotification } from '../hooks/useBAINotification';
import { theme } from '../theme-shim';
import { Button } from '@astryxdesign/core/Button';
import { Heading } from '@astryxdesign/core/Heading';
import { Link } from '@astryxdesign/core/Link';
import {
  MetadataList,
  MetadataListItem,
} from '@astryxdesign/core/MetadataList';
import { Text } from '@astryxdesign/core/Text';
import {
  BAIArtifactRevisionDeleteButton,
  BAIArtifactRevisionDownloadButton,
  BAIArtifactRevisionTable,
  BAIArtifactTypeTag,
  BAICard,
  BAIColumnType,
  BAIDeleteArtifactRevisionsModal,
  BAIDeleteArtifactRevisionsModalArtifactRevisionFragmentKey,
  BAIFlex,
  BAIGraphQLPropertyFilter,
  BAIImportArtifactModal,
  BAIImportArtifactModalArtifactRevisionFragmentKey,
  BAIPullingArtifactRevisionAlert,
  BAIText,
  convertToDecimalUnit,
  filterOutNullAndUndefined,
  INITIAL_FETCH_KEY,
  useUpdatableState,
  ArtifactRevision,
  toLocalId,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import * as _ from 'lodash-es';
import { Download } from 'lucide-react';
import { parseAsJson, useQueryStates } from 'nuqs';
import { useDeferredValue, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { useParams } from 'react-router-dom';

dayjs.extend(relativeTime);

type RevisionNode = NonNullable<
  NonNullable<ReservoirArtifactDetailPageQuery$data['artifact']>['revisions']
>['edges'][number]['node'];

const ReservoirArtifactDetailPage = () => {
  const { token } = theme.useToken();
  const { t } = useTranslation();
  const { upsertNotification } = useSetBAINotification();

  const { artifactId } = useParams<{ artifactId: string }>();

  const [fetchKey, updateFetchKey] = useUpdatableState(INITIAL_FETCH_KEY);
  const [selectedRevisionIdList, setSelectedRevisionIdList] = useState<
    {
      id: string;
      data: RevisionNode;
    }[]
  >([]);
  const [selectedDeleteRevisions, setSelectedDeleteRevisions] =
    useState<BAIDeleteArtifactRevisionsModalArtifactRevisionFragmentKey>([]);
  const [selectedRevisions, setSelectedRevisions] =
    useState<BAIImportArtifactModalArtifactRevisionFragmentKey>([]);
  const [selectedImportRevisions, setSelectedImportRevisions] =
    useState<ImportArtifactRevisionToFolderModalArtifactRevisionFragment$key>(
      [],
    );
  const [queryParams, setQuery] = useQueryStates(
    {
      filter: parseAsJson<ArtifactRevisionFilter>(
        (value) => value as ArtifactRevisionFilter,
      ).withDefault({}),
    },
    { history: 'replace' },
  );
  const jsonStringFilter = JSON.stringify(queryParams.filter);
  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionStateOnSearchParam({
    current: 1,
    pageSize: 10,
  });

  const queryVariables: ReservoirArtifactDetailPageQuery$variables = useMemo(
    () => ({
      id: artifactId ?? '',
      offset: baiPaginationOption.offset,
      limit: baiPaginationOption.limit,
      filter: JSON.parse(jsonStringFilter || '{}'),
    }),

    [
      artifactId,
      baiPaginationOption.limit,
      baiPaginationOption.offset,
      jsonStringFilter,
    ],
  );

  const deferredQueryVariables = useDeferredValue(queryVariables);
  const deferredFetchKey = useDeferredValue(fetchKey);

  const { artifact, groups } =
    useLazyLoadQuery<ReservoirArtifactDetailPageQuery>(
      graphql`
        query ReservoirArtifactDetailPageQuery(
          $id: ID!
          $offset: Int!
          $limit: Int!
          $filter: ArtifactRevisionFilter!
        ) {
          artifact(id: $id) {
            id
            name
            ...BAIArtifactTypeTagFragment
            description
            registry {
              name
              url
            }
            source {
              name
              url
            }
            updatedAt
            pullingArtifactRevisions: revisions(
              first: null
              last: null
              filter: { status: { equals: PULLING } }
              orderBy: [
                { field: VERSION, direction: DESC }
                { field: UPDATED_AT, direction: DESC }
              ]
            )
              @connection(
                key: "ReservoirArtifactDetailPage_pullingArtifactRevisions"
              ) {
              __id
              count
              edges {
                node {
                  id
                  status
                  ...BAIPullingArtifactRevisionAlertFragment
                }
              }
            }
            latestVersion: revisions(
              limit: 1
              orderBy: [
                { field: VERSION, direction: DESC }
                { field: UPDATED_AT, direction: DESC }
              ]
            ) {
              edges {
                node {
                  id
                  size
                  version
                  status
                  ...BAIImportArtifactModalArtifactRevisionFragment
                  ...BAIArtifactRevisionTableLatestRevisionFragment
                }
              }
            }
            revisions(
              offset: $offset
              limit: $limit
              orderBy: [
                { field: VERSION, direction: DESC }
                { field: UPDATED_AT, direction: DESC }
              ]
              filter: $filter
            ) {
              count
              edges {
                node {
                  id
                  status
                  ...BAIArtifactRevisionTableArtifactRevisionFragment
                  ...BAIImportArtifactModalArtifactRevisionFragment
                  ...BAIDeleteArtifactRevisionsModalArtifactRevisionFragment
                  ...BAIArtifactRevisionDeleteButtonFragment
                  ...BAIArtifactRevisionDownloadButtonFragment
                  ...ImportArtifactRevisionToFolderButtonFragment
                  ...ImportArtifactRevisionToFolderModalArtifactRevisionFragment
                }
              }
            }
            ...BAIImportArtifactModalArtifactFragment
            ...BAIDeleteArtifactRevisionsModalArtifactFragment
          }
          groups(is_active: true, type: ["MODEL_STORE"]) {
            ...ImportArtifactRevisionToFolderModalModelStoreProjectsFragment
          }
        }
      `,
      deferredQueryVariables,
      {
        fetchKey:
          deferredFetchKey === INITIAL_FETCH_KEY ? undefined : deferredFetchKey,
        fetchPolicy:
          deferredFetchKey === INITIAL_FETCH_KEY
            ? 'store-and-network'
            : 'network-only',
      },
    );

  const latestArtifact = artifact?.latestVersion?.edges[0]?.node;
  const pullingArtifacts = filterOutNullAndUndefined(
    artifact?.pullingArtifactRevisions?.edges.map((e) => e?.node),
  );

  // Custom column for artifact revision table
  const controlColumn: BAIColumnType<ArtifactRevision> = {
    key: 'control',
    title: t('general.Control'),
    fixed: true,
    required: true,
    render: (__, record) => {
      const status = record.status;

      return (
        // The three antd `Tooltip` wrappers are gone: all three buttons are
        // `BAIButton`-shaped, and `BAIButton` now forwards `title` to Astryx's
        // own `tooltip` AND uses it as the icon-only accessible name. The
        // delete button already passed `title` — so it had the string twice.
        <BAIFlex gap={'xs'}>
          <BAIArtifactRevisionDownloadButton
            size="small"
            title={t('reservoirPage.PullThisVersion')}
            revisionsFrgmt={[record]}
            loading={status === 'PULLING' || status === 'VERIFYING'}
            onClick={() => {
              artifact?.revisions?.edges?.forEach((edge) => {
                if (edge.node.id === record.id) {
                  setSelectedRevisions([edge.node]);
                }
              });
            }}
          />
          <ImportArtifactRevisionToFolderButton
            size="small"
            title={t('importArtifactRevisionToFolderModal.ImportToFolder')}
            revisionsFrgmt={_.map(
              _.filter(
                artifact?.revisions?.edges,
                (edge) => edge.node.id === record.id,
              ),
              'node',
            )}
            onClick={() => {
              artifact?.revisions?.edges?.forEach((edge) => {
                if (edge.node.id === record.id) {
                  setSelectedImportRevisions([edge.node]);
                }
              });
            }}
          />
          <BAIArtifactRevisionDeleteButton
            size="small"
            title={t('reservoirPage.RemoveThisVersion')}
            revisionsFrgmt={[record]}
            onClick={() => {
              artifact?.revisions?.edges?.forEach((edge) => {
                if (edge.node.id === record.id) {
                  setSelectedDeleteRevisions([edge.node]);
                }
              });
            }}
          />
        </BAIFlex>
      );
    },
  };

  return (
    <div>
      <BAIFlex
        align="center"
        style={{ marginBottom: token.marginLG }}
        justify="between"
      >
        <BAIFlex align="center" gap="xs">
          {/* `Typography.Title level={3}` -> `Heading level={3}`. The
              `margin: 0` reset goes with antd's heading margins. */}
          <Heading level={3}>{artifact?.name}</Heading>
          {artifact && <BAIArtifactTypeTag artifactTypeFrgmt={artifact} />}
        </BAIFlex>
        <AutoUpdateFetchKeyButton
          settingId="reservoir-artifact-detail"
          value={fetchKey}
          loading={deferredFetchKey !== fetchKey}
          onChange={() => {
            updateFetchKey();
          }}
        />
      </BAIFlex>

      {pullingArtifacts.length > 0 && (
        <BAIFlex
          direction="column"
          gap="sm"
          align="stretch"
          style={{ marginBottom: token.marginMD }}
        >
          {pullingArtifacts.map((frgmt) => (
            <BAIPullingArtifactRevisionAlert
              key={frgmt.id}
              pullingArtifactRevisionFrgmt={frgmt}
              onOk={() => {
                updateFetchKey();
              }}
            />
          ))}
        </BAIFlex>
      )}

      <BAICard
        title={t('reservoirPage.BasicInformation')}
        showDivider
        extra={
          <Button
            variant="primary"
            icon={<Download size={16} />}
            onClick={() => {
              if (!latestArtifact) return;
              setSelectedRevisions([latestArtifact]);
            }}
            isDisabled={!latestArtifact || latestArtifact.status !== 'SCANNED'}
            label={
              latestArtifact
                ? t('reservoirPage.PullLatestVersion', {
                    version: latestArtifact.version,
                  })
                : 'N/A'
            }
          />
        }
        style={{ marginBottom: token.marginMD }}
      >
        {/* antd `Descriptions column={2} bordered` -> `MetadataList
            columns={2}` (MAPPING §4: `bordered` has no destination and is
            DROPPED — Astryx renders label/value pairs, not a table grid).
            PILOT-DECISION: `Descriptions.Item span={2}` (a full-width row) has
            no `MetadataListItem` counterpart either, so the two long fields —
            Last updated and Description — move OUT of the 2-column list into
            their own single-column list below it. That keeps them full width
            without a span mechanism, and keeps the short fields paired. */}
        <MetadataList columns={2}>
          <MetadataListItem label={t('reservoirPage.Name')}>
            {artifact?.name}
          </MetadataListItem>
          <MetadataListItem label={t('reservoirPage.Type')}>
            {artifact && <BAIArtifactTypeTag artifactTypeFrgmt={artifact} />}
          </MetadataListItem>
          <MetadataListItem label={t('reservoirPage.Size')}>
            <BAIText monospace>
              {latestArtifact?.size
                ? convertToDecimalUnit(latestArtifact.size, 'auto')
                    ?.displayValue
                : 'N/A'}
            </BAIText>
          </MetadataListItem>
          <MetadataListItem label={t('reservoirPage.Source')}>
            {artifact?.source ? (
              // `Typography.Link` with an href -> Astryx `Link` (MAPPING §3.5
              // routes the href-carrying branch there). The explicit
              // `rel="noopener noreferrer"` goes: Astryx merges both tokens
              // automatically for `target="_blank"`.
              <Link href={artifact.source.url ?? ''} target="_blank">
                {artifact.source.name || 'N/A'}
              </Link>
            ) : (
              'N/A'
            )}
          </MetadataListItem>
          <MetadataListItem label={t('reservoirPage.Registry')}>
            <Text>
              {artifact?.registry
                ? `${artifact.registry.name} (${artifact.registry.url})`
                : 'N/A'}
            </Text>
          </MetadataListItem>
        </MetadataList>
        <MetadataList columns="single">
          <MetadataListItem label={t('reservoirPage.LastUpdated')}>
            {artifact?.updatedAt
              ? dayjs(artifact?.updatedAt).format('lll')
              : 'N/A'}
          </MetadataListItem>
          <MetadataListItem label={t('reservoirPage.Description')}>
            {artifact?.description ? (
              // `Typography.Paragraph` -> `Text as="p" display="block"`.
              <Text as="p" display="block">
                {artifact.description}
              </Text>
            ) : (
              'N/A'
            )}
          </MetadataListItem>
        </MetadataList>
      </BAICard>

      <BAICard
        title={t('reservoirPage.VersionList')}
        showDivider
        style={{ marginBottom: token.marginMD }}
        styles={{
          body: {
            padding: `${token.paddingSM}px ${token.paddingLG}px ${token.paddingLG}px ${token.paddingLG}px`,
          },
        }}
      >
        <BAIFlex direction="column" gap={'sm'} align="stretch">
          <BAIFlex align="stretch" justify="between">
            <BAIGraphQLPropertyFilter
              combinationMode="AND"
              onChange={(value) => {
                setQuery({ filter: value ?? {} });
              }}
              filterProperties={[
                {
                  fixedOperator: 'equals',
                  propertyLabel: t('reservoirPage.Status'),
                  key: 'status',
                  type: 'enum',
                  options: _.map(
                    [
                      'SCANNED',
                      'PULLING',
                      'PULLED',
                      'VERIFYING',
                      'NEEDS_APPROVAL',
                      'FAILED',
                      'AVAILABLE',
                      'REJECTED',
                    ] satisfies ArtifactStatus[],
                    (v) => ({
                      label: v,
                      value: v,
                    }),
                  ),
                },
                {
                  fixedOperator: 'contains',
                  propertyLabel: t('reservoirPage.Version'),
                  key: 'version',
                  type: 'string',
                },
                {
                  propertyLabel: t('reservoirPage.Size'),
                  key: 'size',
                  type: 'number',
                  operators: [
                    'equals',
                    'greaterThan',
                    'greaterOrEqual',
                    'lessThan',
                    'lessOrEqual',
                  ],
                },
              ]}
            />
            {selectedRevisionIdList.length > 0 ? (
              <BAIFlex gap={'xs'}>
                <Text>{selectedRevisionIdList.length} selected</Text>
                {/* Same as the row control column: the `Tooltip` wrappers fold
                    into each button's own `title` -> Astryx `tooltip`. */}
                <BAIArtifactRevisionDownloadButton
                  type="default"
                  title={t('reservoirPage.PullSelectedVersions')}
                  revisionsFrgmt={selectedRevisionIdList.flatMap(
                    (arr) => arr.data,
                  )}
                  onClick={() => {
                    if (!artifact) return;
                    setSelectedRevisions(
                      selectedRevisionIdList.flatMap((arr) => arr.data),
                    );
                  }}
                />
                <ImportArtifactRevisionToFolderButton
                  type="default"
                  title={t(
                    'importArtifactRevisionToFolderModal.ImportToFolder',
                  )}
                  revisionsFrgmt={selectedRevisionIdList.flatMap(
                    (arr) => arr.data,
                  )}
                  onClick={() => {
                    if (!artifact) return;
                    setSelectedImportRevisions(
                      _.flatMap(selectedRevisionIdList, (arr) => arr.data),
                    );
                  }}
                />
                <BAIArtifactRevisionDeleteButton
                  title={t('reservoirPage.RemoveSelectedVersions')}
                  style={{
                    borderColor: token.colorBorder,
                  }}
                  revisionsFrgmt={selectedRevisionIdList.flatMap(
                    (arr) => arr.data,
                  )}
                  onClick={() => {
                    if (!artifact) return;
                    setSelectedDeleteRevisions(
                      selectedRevisionIdList.flatMap((arr) => arr.data),
                    );
                  }}
                />
              </BAIFlex>
            ) : null}
          </BAIFlex>
          <BAIArtifactRevisionTable
            artifactRevisionFrgmt={filterOutNullAndUndefined(
              artifact?.revisions?.edges?.map((e) => e.node),
            )}
            latestRevisionFrgmt={artifact?.latestVersion?.edges[0]?.node}
            loading={deferredQueryVariables !== queryVariables}
            pagination={{
              current: tablePaginationOption.current,
              pageSize: tablePaginationOption.pageSize,
              total: artifact?.revisions?.count ?? 0,
              onChange: (page, pageSize) => {
                if (_.isNumber(page) && _.isNumber(pageSize)) {
                  setTablePaginationOption({
                    current: page,
                    pageSize: pageSize,
                  });
                }
              },
            }}
            onRow={(record) => ({
              onClick: (event) => {
                event.stopPropagation();
                const target = event.target as HTMLElement;
                // skip when clicking buttons or links inside the row
                if (target.closest('button') || target.closest('a')) {
                  return;
                }
                if (!artifact) return;

                const selectedNode = artifact.revisions?.edges.find(
                  (e) => e.node.id === record.id,
                )?.node;

                if (!selectedNode) return;

                setSelectedRevisionIdList((prev) => {
                  const _filtered = prev.filter((v) => v.id !== record.id);
                  if (_filtered.length === prev.length) {
                    return [...prev, { id: record.id, data: selectedNode }];
                  } else {
                    return _filtered;
                  }
                });
              },
            })}
            rowSelection={{
              type: 'checkbox',
              onChange: (keys) => {
                if (!artifact?.revisions) return;

                const revisions = artifact.revisions;
                const revisionsIds = revisions.edges.map((e) => e.node.id);

                setSelectedRevisionIdList((prev) => {
                  const _filtered = prev.filter(
                    (v) => !revisionsIds.includes(v.id),
                  );
                  const _selected = revisions.edges
                    .filter((e) => keys.includes(e.node.id))
                    .map((arr) => ({
                      id: arr.node.id,
                      data: arr.node,
                    }));
                  return _filtered.concat(_selected);
                });
              },
              selectedRowKeys: selectedRevisionIdList.map((arr) => arr.id),
            }}
            customizeColumns={(baseColumns) => [
              baseColumns[0], // Version
              baseColumns[1], // Status
              controlColumn,
              ...baseColumns.slice(2),
            ]}
          />
        </BAIFlex>
      </BAICard>

      {/* {artifact.dependencies && artifact.dependencies.length > 0 && (
        <BAICard title="Dependencies" style={{ marginBottom: token.marginMD }}>
          <Space wrap>
            {artifact.dependencies.map((dep) => (
              <Tag key={dep} color="default">
                {dep}
              </Tag>
            ))}
          </Space>
        </BAICard>
      )}

      {artifact.tags && artifact.tags.length > 0 && (
        <Card title="Tags">
          <Space wrap>
            {artifact.tags.map((tag) => (
              <Tag key={tag} color="blue">
                {tag}
              </Tag>
            ))}
          </Space>
        </Card>
      )} */}
      <BAIImportArtifactModal
        selectedArtifactFrgmt={artifact ?? null}
        selectedArtifactRevisionFrgmt={selectedRevisions}
        open={!!artifact && !_.isEmpty(selectedRevisions)}
        connectionIds={
          artifact?.pullingArtifactRevisions
            ? [artifact.pullingArtifactRevisions.__id]
            : undefined
        }
        onOk={(_e, tasks) => {
          setSelectedRevisions([]);
          tasks.forEach((task) => {
            upsertNotification({
              message: t('reservoirPage.PullingArtifact', {
                name: task.artifact.name,
                version: task.version,
              }),
              type: 'info',
              open: true,
              duration: 0,
              backgroundTask: {
                status: 'pending',
                taskId: task.taskId,
                promise: null,
                percent: 0,
                onChange: {
                  resolved: (_data, _notification) => {
                    return {
                      type: 'success',
                      message: t('reservoirPage.SuccessFullyPulledArtifact', {
                        name: task.artifact.name,
                        version: task.version,
                      }),
                      showIcon: true,
                      toText: t('reservoirPage.GoToArtifact'),
                      to: buildPath('admin', `reservoir/${task.artifact.id}`),
                    };
                  },
                  rejected: (_data, _notification) => {
                    return t('reservoirPage.FailedToPullArtifact', {
                      name: task.artifact.name,
                      version: task.version,
                    });
                  },
                },
              },
            });
          });
        }}
        onCancel={() => {
          setSelectedRevisions([]);
        }}
      />
      <BAIDeleteArtifactRevisionsModal
        selectedArtifactFrgmt={artifact ?? null}
        selectedArtifactRevisionFrgmt={selectedDeleteRevisions}
        onOk={() => {
          setSelectedDeleteRevisions([]);
        }}
        onCancel={() => {
          setSelectedDeleteRevisions([]);
        }}
        open={!!artifact && !_.isEmpty(selectedDeleteRevisions)}
      />
      <ImportArtifactRevisionToFolderModal
        selectedArtifactRevisionFrgmt={selectedImportRevisions}
        modelStoreProjectsFrgmt={groups?.[0] ?? undefined}
        onOk={(_e, tasks, vfolderId) => {
          setSelectedImportRevisions([]);
          updateFetchKey();
          tasks.forEach((task) => {
            upsertNotification({
              message: t(
                'importArtifactRevisionToFolderModal.ImportingArtifact',
                {
                  name: task.artifact.name,
                  version: task.version,
                },
              ),
              type: 'info',
              open: true,
              duration: 0,
              backgroundTask: {
                status: 'pending',
                taskId: task.taskId,
                promise: null,
                percent: 0,
                onChange: {
                  resolved: (_data, _notification) => {
                    return {
                      type: 'success',
                      message: t(
                        'importArtifactRevisionToFolderModal.SuccessfullyImportedArtifact',
                        {
                          name: task.artifact.name,
                          version: task.version,
                        },
                      ),
                      showIcon: true,
                      toText: vfolderId
                        ? t('data.folders.OpenAFolder')
                        : t('reservoirPage.GoToArtifact'),
                      to: vfolderId
                        ? {
                            search: new URLSearchParams({
                              folder: toLocalId(vfolderId),
                            }).toString(),
                          }
                        : `/reservoir/${task.artifact.id}`,
                    };
                  },
                  rejected: (_data, _notification) => {
                    return t(
                      'importArtifactRevisionToFolderModal.FailedToImportArtifact',
                      {
                        name: task.artifact.name,
                        version: task.version,
                      },
                    );
                  },
                },
              },
            });
          });
        }}
        onCancel={() => {
          setSelectedImportRevisions([]);
        }}
        open={!!artifact && !_.isEmpty(selectedImportRevisions)}
      />
    </div>
  );
};

export default ReservoirArtifactDetailPage;
