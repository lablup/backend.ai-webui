import { Button, Typography, Descriptions, theme, Tooltip } from 'antd';
import {
  BAIArtifactRevisionDeleteButton,
  BAIArtifactRevisionDownloadButton,
  BAIArtifactRevisionTable,
  BAIArtifactTypeTag,
  BAICard,
  BAIDeleteArtifactRevisionsModal,
  BAIDeleteArtifactRevisionsModalArtifactRevisionFragmentKey,
  BAIFetchKeyButton,
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
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import _ from 'lodash';
import { Download } from 'lucide-react';
import { useDeferredValue, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { useParams } from 'react-router-dom';
import {
  ReservoirArtifactDetailPageQuery,
  ReservoirArtifactDetailPageQuery$data,
  ReservoirArtifactDetailPageQuery$variables,
} from 'src/__generated__/ReservoirArtifactDetailPageQuery.graphql';
import { useBAIPaginationOptionStateOnSearchParamLegacy } from 'src/hooks/reactPaginationQueryOptions';
import { useSetBAINotification } from 'src/hooks/useBAINotification';
import { JsonParam, useQueryParams, withDefault } from 'use-query-params';

dayjs.extend(relativeTime);

const { Title, Text, Paragraph } = Typography;

type RevisionNode = NonNullable<
  ReservoirArtifactDetailPageQuery$data['artifact']
>['revisions']['edges'][number]['node'];

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
  const [queryParams, setQuery] = useQueryParams({
    filter: withDefault(JsonParam, {}),
  });
  const jsonStringFilter = JSON.stringify(queryParams.filter);
  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionStateOnSearchParamLegacy({
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

  const { artifact } = useLazyLoadQuery<ReservoirArtifactDetailPageQuery>(
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
            orderBy: { field: VERSION, direction: DESC }
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
            orderBy: { field: VERSION, direction: DESC }
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
            orderBy: { field: VERSION, direction: DESC }
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
              }
            }
          }
          ...BAIImportArtifactModalArtifactFragment
          ...BAIDeleteArtifactRevisionsModalArtifactFragment
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

  const latestArtifact = artifact?.latestVersion.edges[0]?.node;
  const pullingArtifacts = filterOutNullAndUndefined(
    artifact?.pullingArtifactRevisions.edges.map((e) => e?.node),
  );

  return (
    <div>
      <BAIFlex
        align="center"
        style={{ marginBottom: token.marginLG }}
        justify="between"
      >
        <BAIFlex align="center" gap="xs">
          <Title level={3} style={{ margin: 0 }}>
            {artifact?.name}
          </Title>
          {artifact && <BAIArtifactTypeTag artifactTypeFrgmt={artifact} />}
        </BAIFlex>
        <BAIFetchKeyButton
          value={fetchKey}
          autoUpdateDelay={10_000}
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
            type="primary"
            icon={<Download size={16} />}
            onClick={() => {
              if (!latestArtifact) return;
              setSelectedRevisions([latestArtifact]);
            }}
            disabled={!latestArtifact || latestArtifact.status !== 'SCANNED'}
          >
            {latestArtifact
              ? t('reservoirPage.PullLatestVersion', {
                  version: latestArtifact.version,
                })
              : 'N/A'}
          </Button>
        }
        style={{ marginBottom: token.marginMD }}
      >
        <Descriptions column={2} bordered>
          <Descriptions.Item label={t('reservoirPage.Name')}>
            {artifact?.name}
          </Descriptions.Item>
          <Descriptions.Item label={t('reservoirPage.Type')}>
            {artifact && <BAIArtifactTypeTag artifactTypeFrgmt={artifact} />}
          </Descriptions.Item>
          <Descriptions.Item label={t('reservoirPage.Size')}>
            <BAIText monospace>
              {latestArtifact?.size
                ? convertToDecimalUnit(latestArtifact.size, 'auto')
                    ?.displayValue
                : 'N/A'}
            </BAIText>
          </Descriptions.Item>
          <Descriptions.Item label={t('reservoirPage.Source')}>
            {artifact?.source ? (
              <Typography.Link
                href={artifact.source.url ?? ''}
                target="_blank"
                rel="noopener noreferrer"
              >
                {artifact.source.name || 'N/A'}
              </Typography.Link>
            ) : (
              'N/A'
            )}
          </Descriptions.Item>
          <Descriptions.Item label={t('reservoirPage.Registry')}>
            <Typography>
              {artifact?.registry
                ? `${artifact.registry.name}(${artifact.registry.url})`
                : 'N/A'}
            </Typography>
          </Descriptions.Item>
          <Descriptions.Item label={t('reservoirPage.LastUpdated')} span={2}>
            {artifact?.updatedAt
              ? dayjs(artifact?.updatedAt).format('lll')
              : 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label={t('reservoirPage.Description')} span={2}>
            {artifact?.description ? (
              <Paragraph>{artifact.description}</Paragraph>
            ) : (
              'N/A'
            )}
          </Descriptions.Item>
        </Descriptions>
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
                setQuery({ filter: value ?? {} }, 'replaceIn');
              }}
              filterProperties={[
                {
                  fixedOperator: 'equals',
                  propertyLabel: t('reservoirPage.Status'),
                  key: 'status',
                  type: 'enum',
                  options: [
                    {
                      label: 'SCANNED',
                      value: 'SCANNED',
                    },
                    {
                      label: 'PULLING',
                      value: 'PULLING',
                    },
                    {
                      label: 'PULLED',
                      value: 'PULLED',
                    },
                    {
                      label: 'VERIFYING',
                      value: 'VERIFYING',
                    },
                    {
                      label: 'NEEDS_APPROVAL',
                      value: 'NEEDS_APPROVAL',
                    },
                    {
                      label: 'FAILED',
                      value: 'FAILED',
                    },
                    {
                      label: 'AVAILABLE',
                      value: 'AVAILABLE',
                    },
                    {
                      label: 'REJECTED',
                      value: 'REJECTED',
                    },
                  ],
                },
                {
                  fixedOperator: 'contains',
                  propertyLabel: t('reservoirPage.Version'),
                  key: 'version',
                  type: 'string',
                },
                {
                  propertyLabel: t('reservoirPage.ArtifactID'),
                  key: 'artifactId',
                  valueMode: 'scalar',
                  type: 'string',
                },
              ]}
            />
            {selectedRevisionIdList.length > 0 ? (
              <BAIFlex gap={'xs'}>
                <Text>{selectedRevisionIdList.length} selected</Text>
                <Tooltip title={t('reservoirPage.PullSelectedVersions')}>
                  <BAIArtifactRevisionDownloadButton
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
                </Tooltip>
                <Tooltip title={t('reservoirPage.RemoveSelectedVersions')}>
                  <BAIArtifactRevisionDeleteButton
                    revisionsFrgmt={selectedRevisionIdList.flatMap(
                      (arr) => arr.data,
                    )}
                    style={{
                      borderColor: token.colorBorder,
                      backgroundColor: token.colorBgContainer,
                    }}
                    onClick={() => {
                      if (!artifact) return;
                      setSelectedDeleteRevisions(
                        selectedRevisionIdList.flatMap((arr) => arr.data),
                      );
                    }}
                  />
                </Tooltip>
              </BAIFlex>
            ) : null}
          </BAIFlex>
          <BAIArtifactRevisionTable
            artifactRevisionFrgmt={filterOutNullAndUndefined(
              artifact?.revisions.edges.map((e) => e.node),
            )}
            latestRevisionFrgmt={artifact?.latestVersion.edges[0].node}
            loading={deferredQueryVariables !== queryVariables}
            onClickDownload={(revisionId: string) => {
              artifact?.revisions.edges.forEach((edge) => {
                if (edge.node.id === revisionId) {
                  return setSelectedRevisions([edge.node]);
                }
              });
            }}
            onClickDelete={(revisionId: string) => {
              artifact?.revisions.edges.forEach((edge) => {
                if (edge.node.id === revisionId) {
                  return setSelectedDeleteRevisions([edge.node]);
                }
              });
            }}
            pagination={{
              current: tablePaginationOption.current,
              pageSize: tablePaginationOption.pageSize,
              total: artifact?.revisions.count ?? 0,
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

                const selectedNode = artifact.revisions.edges.find(
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
                if (!artifact) return;

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
          artifact ? [artifact.pullingArtifactRevisions.__id] : undefined
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
                      to: `/reservoir/${task.artifact.id}`,
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
    </div>
  );
};

export default ReservoirArtifactDetailPage;
