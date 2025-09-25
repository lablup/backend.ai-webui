import { INITIAL_FETCH_KEY, useUpdatableState } from '../hooks';
import { useBAIPaginationOptionStateOnSearchParam } from '../hooks/reactPaginationQueryOptions';
import { useDeferredQueryParams } from '../hooks/useDeferredQueryParams';
import { useToggle } from 'ahooks';
import { theme, Col, Row, Statistic, Card, Button } from 'antd';
import {
  BAICard,
  BAIFlex,
  BAIArtifactTable,
  BAIImportArtifactModal,
  BAIGraphQLPropertyFilter,
  BAIImportFromHuggingFaceModal,
  BAIHuggingFaceIcon,
  toLocalId,
  BAIImportArtifactModalArtifactFragmentKey,
  BAIImportArtifactModalArtifactRevisionFragmentKey,
} from 'backend.ai-ui';
import _ from 'lodash';
import { Brain } from 'lucide-react';
import React, { useMemo, useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { useNavigate } from 'react-router-dom';
import {
  ReservoirPageQuery,
  ReservoirPageQuery$variables,
} from 'src/__generated__/ReservoirPageQuery.graphql';
import BAIFetchKeyButton from 'src/components/BAIFetchKeyButton';
import { useSetBAINotification } from 'src/hooks/useBAINotification';
import { withDefault, JsonParam } from 'use-query-params';

const ReservoirPage: React.FC = () => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const { upsertNotification } = useSetBAINotification();

  const [selectedArtifact, setSelectedArtifact] =
    useState<BAIImportArtifactModalArtifactFragmentKey | null>(null);
  const [selectedRevision, setSelectedRevision] =
    useState<BAIImportArtifactModalArtifactRevisionFragmentKey>([]);
  const [openHuggingFaceModal, { toggle: toggleOpenHuggingFaceModal }] =
    useToggle();

  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionStateOnSearchParam({
    current: 1,
    pageSize: 10,
  });

  const [queryParams, setQuery] = useDeferredQueryParams({
    filter: withDefault(JsonParam, {}),
  });

  const queryVariables: ReservoirPageQuery$variables = useMemo(
    () => ({
      offset: baiPaginationOption.offset,
      limit: baiPaginationOption.limit,
      order: [
        {
          field: 'UPDATED_AT',
          direction: 'DESC',
        },
      ],
      filter: queryParams.filter,
    }),
    [baiPaginationOption.offset, baiPaginationOption.limit, queryParams.filter],
  );
  const deferredQueryVariables = useDeferredValue(queryVariables);

  const [fetchKey, updateFetchKey] = useUpdatableState(INITIAL_FETCH_KEY);
  const deferredFetchKey = useDeferredValue(fetchKey);

  // const [rescanArtifacts, isInflightRescanArtifacts] =
  //   useMutation<ReservoirPageRescanArtifactsMutation>(graphql`
  //     mutation ReservoirPageRescanArtifactsMutation(
  //       $input: ScanArtifactsInput!
  //     ) {
  //       scanArtifacts(input: $input) {
  //         artifacts {
  //           id
  //         }
  //       }
  //     }
  //   `);

  const queryRef = useLazyLoadQuery<ReservoirPageQuery>(
    graphql`
      query ReservoirPageQuery(
        $order: [ArtifactOrderBy!]
        $limit: Int!
        $offset: Int!
        $filter: ArtifactFilter!
      ) {
        defaultArtifactRegistry(artifactType: MODEL) {
          name
          type
        }
        artifacts(
          orderBy: $order
          limit: $limit
          offset: $offset
          filter: $filter
        ) {
          count
          edges {
            node {
              id
              ...BAIArtifactTableArtifactFragment
              ...BAIImportArtifactModalArtifactFragment
              revisions(
                first: 1
                orderBy: { field: VERSION, direction: DESC }
              ) {
                edges {
                  node {
                    id
                    ...BAIImportArtifactModalArtifactRevisionFragment
                  }
                }
              }
            }
          }
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

  const { artifacts, defaultArtifactRegistry } = queryRef;
  const isAvailableUsingHuggingFace =
    defaultArtifactRegistry?.type === 'HUGGINGFACE';

  // TODO: implement when reservoir supports other types
  // const typeFilterGenerator = (type: 'IMAGE' | 'PACKAGE' | 'MODEL') => {
  //   return { type: { eq: type } };
  // };
  // const handleStatisticCardClick = (type: 'IMAGE' | 'PACKAGE' | 'MODEL') => {
  //   setQuery({ filter: typeFilterGenerator(type) }, 'replaceIn');
  // };

  return (
    <BAIFlex direction="column" align="stretch" gap={'md'}>
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={8} lg={6} xl={4}>
          <Card
            size="small"
            variant="borderless"
            hoverable
            style={{
              cursor: 'pointer',
              border: `1px solid ${token.colorPrimary}`,
            }}
          >
            <Statistic
              title="MODEL"
              value={artifacts.count}
              prefix={<Brain size={16} />}
              valueStyle={{
                color: token.colorPrimary,
              }}
            />
          </Card>
        </Col>
      </Row>
      <BAICard
        activeTabKey={'artifacts'}
        tabList={[
          {
            key: 'artifacts',
            tab: t('reservoirPage.ReservoirArtifacts'),
          },
        ]}
        styles={{
          body: {
            padding: `${token.paddingSM}px ${token.paddingLG}px ${token.paddingLG}px ${token.paddingLG}px`,
          },
        }}
      >
        <BAIFlex direction="column" align="stretch" gap={'sm'}>
          <BAIFlex justify="between" wrap="wrap" gap={'sm'}>
            <BAIFlex
              gap={'sm'}
              align="start"
              justify="between"
              style={{
                flexShrink: 1,
              }}
              wrap="wrap"
            >
              <BAIGraphQLPropertyFilter
                combinationMode="AND"
                onChange={(value) => {
                  setQuery({ filter: value ?? {} }, 'replaceIn');
                }}
                value={queryParams.filter}
                filterProperties={[
                  {
                    fixedOperator: 'contains',
                    key: 'name',
                    propertyLabel: t('reservoirPage.Name'),
                    type: 'string',
                  },
                  {
                    fixedOperator: 'contains',
                    key: 'source',
                    propertyLabel: t('reservoirPage.Source'),
                    type: 'string',
                  },
                  {
                    fixedOperator: 'contains',
                    key: 'registry',
                    propertyLabel: t('reservoirPage.Registry'),
                    type: 'string',
                  },
                ]}
              />
            </BAIFlex>
            <BAIFlex gap={'sm'} align="center">
              <BAIFetchKeyButton
                value={fetchKey}
                autoUpdateDelay={10_000}
                loading={deferredFetchKey !== fetchKey}
                onChange={() => {
                  updateFetchKey();
                  // rescanArtifacts({
                  //   variables: {
                  //     input: {
                  //       registryId: 'fe878f09-06cc-4b91-9242-4c71015cce05',
                  //       limit: 100,
                  //     },
                  //   },
                  // });
                }}
              />
              {isAvailableUsingHuggingFace && (
                <Button
                  type="primary"
                  icon={
                    <BAIHuggingFaceIcon
                      style={{
                        fontSize: '1.5em',
                      }}
                    />
                  }
                  onClick={() => toggleOpenHuggingFaceModal()}
                >
                  {t('reservoirPage.FromHuggingFace')}
                </Button>
              )}
            </BAIFlex>
          </BAIFlex>
          <BAIArtifactTable
            artifactFragment={artifacts.edges.map((edge) => edge.node)}
            onClickPull={(artifactId: string, revisionId: string) => {
              artifacts.edges.forEach((artifact) => {
                if (artifact.node.id === artifactId) {
                  setSelectedArtifact(artifact.node);
                  artifact.node.revisions.edges.forEach((revision) => {
                    if (revision.node.id === revisionId) {
                      setSelectedRevision([revision.node]);
                      return;
                    }
                  });
                  return;
                }
              });
            }}
            loading={deferredQueryVariables !== queryVariables}
            pagination={{
              pageSize: tablePaginationOption.pageSize,
              current: tablePaginationOption.current,
              total: artifacts.count,
              onChange: (current, pageSize) => {
                if (_.isNumber(current) && _.isNumber(pageSize)) {
                  setTablePaginationOption({ current, pageSize });
                }
              },
            }}
          />
        </BAIFlex>
        {/* TODO: implement audit log for reservoir page */}
        {/* {curTabKey === 'audit' ? (
          <Suspense fallback={<Skeleton active />}>
            <ReservoirAuditLogList
              auditLogs={filteredAuditLogs}
              loading={false}
              filterValue={queryParams.auditFilter}
              onFilterChange={(value) => {
                setQuery({ auditFilter: value }, 'replaceIn');
              }}
              pagination={{
                pageSize: tablePaginationOption.pageSize,
                current: tablePaginationOption.current,
                total: filteredAuditLogs.length,
                showTotal: (total) => (
                  <Typography.Text type="secondary">
                    {t('general.TotalItems', { total: total })}
                  </Typography.Text>
                ),
                onChange: (current, pageSize) => {
                  if (_.isNumber(current) && _.isNumber(pageSize)) {
                    setTablePaginationOption({ current, pageSize });
                  }
                },
              }}
              order={queryParams.auditOrder}
              onChangeOrder={(order) => {
                setQuery({ auditOrder: order }, 'replaceIn');
              }}
            />
          </Suspense>
        ) : null} */}
      </BAICard>
      <BAIImportArtifactModal
        selectedArtifactFrgmt={selectedArtifact}
        selectedArtifactRevisionFrgmt={selectedRevision}
        open={!!selectedArtifact && !_.isEmpty(selectedRevision)}
        onOk={(_e, tasks) => {
          setSelectedArtifact(null);
          setSelectedRevision([]);
          tasks.forEach((task) => {
            upsertNotification({
              message: `Pulling artifact version: ${task.version}`,
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
                      message: `Successfully pulled artifact version: ${task.version}`,
                      toText: 'Go to Artifact',
                      to: `/reservoir/${task.artifact_id}`,
                    };
                  },
                  rejected: (_data, _notification) => {
                    return 'Failed to pull artifact versions: ';
                  },
                },
              },
            });
          });
        }}
        onCancel={() => {
          setSelectedArtifact(null);
          setSelectedRevision([]);
        }}
      />
      <BAIImportFromHuggingFaceModal
        open={openHuggingFaceModal}
        onOk={(_e, artifactId) => {
          toggleOpenHuggingFaceModal();
          navigate(`/reservoir/${toLocalId(artifactId)}`);
        }}
        onCancel={toggleOpenHuggingFaceModal}
      />
    </BAIFlex>
  );
};

export default ReservoirPage;
