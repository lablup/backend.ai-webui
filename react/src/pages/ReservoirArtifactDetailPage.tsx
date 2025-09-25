import { getTypeColor, getTypeIcon } from '../utils/reservoir';
import { Button, Typography, Descriptions, Tag, theme, Tooltip } from 'antd';
import {
  BAIArtifactRevisionTable,
  BAICard,
  BAIFlex,
  BAIGraphQLPropertyFilter,
  BAIImportArtifactModal,
  BAIImportArtifactModalArtifactRevisionFragmentKey,
  BAIPullingArtifactRevisionAlert,
  BAITrashBinIcon,
  filterOutNullAndUndefined,
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
  ReservoirArtifactDetailPageQuery$variables,
} from 'src/__generated__/ReservoirArtifactDetailPageQuery.graphql';
import BAIFetchKeyButton from 'src/components/BAIFetchKeyButton';
import BAIText from 'src/components/BAIText';
import { INITIAL_FETCH_KEY, useUpdatableState } from 'src/hooks';
import { useBAIPaginationOptionStateOnSearchParam } from 'src/hooks/reactPaginationQueryOptions';
import { useDeferredQueryParams } from 'src/hooks/useDeferredQueryParams';
import { JsonParam, withDefault } from 'use-query-params';

dayjs.extend(relativeTime);

const { Title, Text, Paragraph } = Typography;

const ReservoirArtifactDetailPage = () => {
  const { token } = theme.useToken();
  const { t } = useTranslation();

  const { artifactId } = useParams<{ artifactId: string }>();

  const [fetchKey, updateFetchKey] = useUpdatableState(INITIAL_FETCH_KEY);
  const [selectedRevisionIdList, setSelectedRevisionIdList] = useState<
    {
      id: string;
      data: BAIImportArtifactModalArtifactRevisionFragmentKey;
    }[]
  >([]);
  const [selectedRevisions, setSelectedRevisions] =
    useState<BAIImportArtifactModalArtifactRevisionFragmentKey>([]);
  const [selectedRevision, setSelectedRevision] =
    useState<BAIImportArtifactModalArtifactRevisionFragmentKey>([]);

  const [queryParams, setQuery] = useDeferredQueryParams({
    filter: withDefault(JsonParam, {}),
  });
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
      filter: queryParams.filter,
    }),

    [
      artifactId,
      baiPaginationOption.limit,
      baiPaginationOption.offset,
      queryParams.filter,
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
          type
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
            filter: { status: { equals: PULLING } }
            orderBy: { field: VERSION, direction: DESC }
          ) {
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
            first: 1
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
                ...BAIArtifactRevisionTableArtifactRevisionFragment
                ...BAIImportArtifactModalArtifactRevisionFragment
              }
            }
          }
          ...BAIImportArtifactModalArtifactFragment
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
          <Tag color={getTypeColor(artifact?.type ?? '')} style={{ margin: 0 }}>
            {getTypeIcon(artifact?.type ?? '', 18)}&nbsp;
            {artifact?.type ?? ''.toUpperCase()}
          </Tag>
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
              setSelectedRevision([latestArtifact]);
            }}
            disabled={!latestArtifact || latestArtifact.status !== 'SCANNED'}
          >
            {`Pull latest(${latestArtifact?.version}) version`}
          </Button>
        }
        style={{ marginBottom: token.marginMD }}
      >
        <Descriptions column={2} bordered>
          <Descriptions.Item label={t('reservoirPage.Name')}>
            {artifact?.name}
          </Descriptions.Item>
          <Descriptions.Item label={t('reservoirPage.Type')}>
            <Tag color={getTypeColor(artifact?.type ?? '')}>
              {getTypeIcon(artifact?.type ?? '')}&nbsp;
              {artifact?.type.toUpperCase()}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label={t('reservoirPage.Size')}>
            <BAIText monospace>
              {/* {convertToDecimalUnit(latestArtifact?.size, 'auto')?.displayValue} */}
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
            <Paragraph>
              {artifact?.description || 'No description available'}
            </Paragraph>
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
                  fixedOperator: 'eq',
                  propertyLabel: 'Status',
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
                  propertyLabel: 'Version',
                  key: 'version',
                  type: 'string',
                },
                {
                  propertyLabel: 'Artifact ID',
                  key: 'artifactId',
                  valueMode: 'scalar',
                  type: 'string',
                },
              ]}
            />
            {selectedRevisionIdList.length > 0 ? (
              <BAIFlex gap={'xs'}>
                <Text>{selectedRevisionIdList.length} selected</Text>
                <Tooltip title="Delete selected versions">
                  <Button
                    style={{
                      color: token.colorError,
                      borderColor: token.colorBorder,
                    }}
                    type="text"
                    icon={<BAITrashBinIcon />}
                  />
                </Tooltip>
                <Tooltip title="Pull selected versions">
                  <Button
                    type="primary"
                    icon={<Download size={16} />}
                    onClick={() => {
                      if (!artifact) return;
                      setSelectedRevisions(
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
                  return setSelectedRevision([edge.node]);
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
                    return [...prev, { id: record.id, data: [selectedNode] }];
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
                      data: [arr.node],
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
        onOk={() => {
          setSelectedRevisions([]);
        }}
        onCancel={() => {
          setSelectedRevisions([]);
        }}
      />
      <BAIImportArtifactModal
        selectedArtifactFrgmt={artifact ?? null}
        selectedArtifactRevisionFrgmt={selectedRevision}
        open={!!artifact && !_.isEmpty(selectedRevision)}
        onOk={() => {
          setSelectedRevision([]);
        }}
        onCancel={() => {
          setSelectedRevision([]);
        }}
      />
    </div>
  );
};

export default ReservoirArtifactDetailPage;
