import { getTypeColor, getTypeIcon } from '../utils/reservoir';
import { Button, Typography, Descriptions, Tag, theme, Tooltip } from 'antd';
import {
  BAIArtifactRevisionTable,
  BAICard,
  BAIFlex,
  BAIImportArtifactModal,
  BAIPullingArtifactRevisionAlert,
  BAITrashBinIcon,
  filterOutNullAndUndefined,
} from 'backend.ai-ui';
import { ArtifactRevisionForModal } from 'backend.ai-ui/components/fragments/BAIImportArtifactModal';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import _ from 'lodash';
import { Download } from 'lucide-react';
import { useDeferredValue, useMemo, useState, useTransition } from 'react';
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

dayjs.extend(relativeTime);

const { Title, Text, Paragraph } = Typography;

// interface ReservoirArtifactDetailProps {
//   onPull: (artifactId: string, version?: string) => void;
// }

// export type Artifact = NonNullable<
//   NonNullable<
//     ReservoirArtifactDetailPageQuery$data['artifactGroup']
//   >['latestVersion']['edges']
// >[number]['node'];

const ReservoirArtifactDetailPage = () => {
  const { token } = theme.useToken();
  const { t } = useTranslation();

  const { artifactId } = useParams<{ artifactId: string }>();

  const [fetchKey, updateFetchKey] = useUpdatableState(INITIAL_FETCH_KEY);
  const [isPendingTransition, startTransition] = useTransition();
  const [selectedRevisions, setSelectedRevisions] = useState<Set<string>>(
    new Set(),
  );
  const [selectedRevision, setSelectedRevision] =
    useState<ArtifactRevisionForModal | null>(null);
  // const [selectedVersion, setSelectedVersion] = useState<string>(
  //   artifact.versions[0],
  // );
  // const [isPulling, setIsPulling] = useState(false);

  // const handlePull = () => {
  //   setIsPulling(true);
  //   onPull(artifact.id, selectedVersion);
  //   setIsPullModalVisible(false);

  //   // Simulate pulling progress
  //   setTimeout(() => {
  //     setIsPulling(false);
  //   }, 3000);
  // };

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
    }),

    [artifactId, baiPaginationOption.limit, baiPaginationOption.offset],
  );

  const deferredQueryVariables = useDeferredValue(queryVariables);
  const deferredFetchKey = useDeferredValue(fetchKey);

  const { artifact } = useLazyLoadQuery<ReservoirArtifactDetailPageQuery>(
    graphql`
      query ReservoirArtifactDetailPageQuery(
        $id: ID!
        $offset: Int!
        $limit: Int!
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
            filter: { status: { equals: [PULLING] } }
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
  const revisionIdArray = artifact?.revisions.edges.map((e) => e.node.id) ?? [];

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
          loading={isPendingTransition}
          onChange={() => startTransition(() => updateFetchKey())}
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
          latestArtifact?.status === 'SCANNED' ? (
            <Button
              type="primary"
              icon={<Download size={16} />}
              onClick={() => {
                setSelectedRevision(latestArtifact);
              }}
              disabled={false}
              loading={false}
            >
              {`Pull latest(${latestArtifact?.version}) version`}
            </Button>
          ) : null
        }
        style={{ marginBottom: token.marginMD }}
      >
        <Descriptions column={2} bordered>
          <Descriptions.Item label="Name">{artifact?.name}</Descriptions.Item>
          <Descriptions.Item label="Type">
            <Tag color={getTypeColor(artifact?.type ?? '')}>
              {getTypeIcon(artifact?.type ?? '')}&nbsp;
              {artifact?.type.toUpperCase()}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Size">
            <BAIText monospace>
              {/* {convertToDecimalUnit(latestArtifact?.size, 'auto')?.displayValue} */}
            </BAIText>
          </Descriptions.Item>
          <Descriptions.Item label="Source">
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
          <Descriptions.Item label="Registry">
            <Typography>
              {artifact?.registry
                ? `${artifact.registry.name}(${artifact.registry.url})`
                : 'N/A'}
            </Typography>
          </Descriptions.Item>
          <Descriptions.Item label="Last Updated" span={2}>
            {dayjs(artifact?.updatedAt).format('lll')}
          </Descriptions.Item>
          <Descriptions.Item label="Description" span={2}>
            <Paragraph>
              {artifact?.description || 'No description available'}
            </Paragraph>
          </Descriptions.Item>
        </Descriptions>
      </BAICard>

      <BAICard
        title={t('reservoirPage.AvailableVersions')}
        showDivider
        style={{ marginBottom: token.marginMD }}
        extra={
          selectedRevisions.size > 0 ? (
            <BAIFlex gap={'xs'}>
              <Text>{selectedRevisions.size} selected</Text>
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
                  style={{
                    color: token.colorSuccess,
                    borderColor: token.colorBorder,
                  }}
                  type="text"
                  icon={<Download size={16} />}
                />
              </Tooltip>
            </BAIFlex>
          ) : null
        }
      >
        <BAIArtifactRevisionTable
          artifactRevisionFrgmt={filterOutNullAndUndefined(
            artifact?.revisions.edges.map((e) => e.node),
          )}
          latestRevisionFrgmt={artifact?.latestVersion.edges[0].node}
          loading={isPendingTransition}
          onClickDownload={(revisionId: string) => {
            artifact?.revisions.edges.forEach((edge) => {
              if (edge.node.id === revisionId) {
                return setSelectedRevision(edge.node);
              }
            });
          }}
          pagination={{
            current: tablePaginationOption.current,
            pageSize: tablePaginationOption.pageSize,
            total: artifact?.revisions.count ?? 0,
            onChange: (page, pageSize) => {
              startTransition(() => {
                if (_.isNumber(page) && _.isNumber(pageSize)) {
                  setTablePaginationOption({
                    current: page,
                    pageSize: pageSize,
                  });
                }
              });
            },
          }}
          rowSelection={{
            type: 'checkbox',
            onChange: (keys) => {
              if (_.isEmpty(revisionIdArray)) return;
              setSelectedRevisions((prev) => {
                const _next = prev.difference(new Set(revisionIdArray));
                return _next.union(new Set(keys as string[]));
              });

              // setSelectedRevisions(
              //   _.unionBy(
              //     selectedRevisions,
              //     rows.map((row) => ({
              //       id: row.id,
              //       data: artifact.revisions.edges.find(
              //         (edge) => edge.node.id === row.id,
              //       )!.node,
              //     })),
              //     'id',
              //   ),
              // );
            },
            selectedRowKeys: Array.from(selectedRevisions),
          }}
        />
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
      {/* <BAIImportArtifactModal
        selectedArtifactFrgmt={artifact}
        selectedArtifactRevisionFrgmt={selectedRevisions.map((arr) => arr.data)}
        onOk={() => {
          setSelectedRevisions([]);
        }}
        onCancel={() => {
          setSelectedRevisions([]);
        }}
      /> */}
      <BAIImportArtifactModal
        selectedArtifactFrgmt={artifact}
        selectedArtifactRevisionFrgmt={
          selectedRevision ? [selectedRevision] : []
        }
        onOk={() => {
          setSelectedRevision(null);
        }}
        onCancel={() => {
          setSelectedRevision(null);
        }}
      />
    </div>
  );
};

export default ReservoirArtifactDetailPage;
