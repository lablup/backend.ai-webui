import { INITIAL_FETCH_KEY, useUpdatableState } from '../hooks';
import { useBAIPaginationOptionStateOnSearchParamLegacy } from '../hooks/reactPaginationQueryOptions';
import { useToggle } from 'ahooks';
import {
  theme,
  Col,
  Row,
  Statistic,
  Card,
  Button,
  Tooltip,
  Typography,
} from 'antd';
import {
  BAIActivateArtifactsModal,
  BAIActivateArtifactsModalArtifactsFragmentKey,
  BAIArtifactTable,
  BAICard,
  BAIDeactivateArtifactsModal,
  BAIDeactivateArtifactsModalArtifactsFragmentKey,
  BAIFetchKeyButton,
  BAIFlex,
  BAIGraphQLPropertyFilter,
  BAIHuggingFaceIcon,
  BAIImportArtifactModal,
  BAIImportArtifactModalArtifactFragmentKey,
  BAIImportArtifactModalArtifactRevisionFragmentKey,
  BAIImportFromHuggingFaceModal,
  toLocalId,
} from 'backend.ai-ui';
import _ from 'lodash';
import { BanIcon, Brain, UndoIcon } from 'lucide-react';
import React, { useMemo, useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { useNavigate } from 'react-router-dom';
import {
  ReservoirPageQuery,
  ReservoirPageQuery$data,
  ReservoirPageQuery$variables,
} from 'src/__generated__/ReservoirPageQuery.graphql';
import BAIRadioGroup from 'src/components/BAIRadioGroup';
import { useSetBAINotification } from 'src/hooks/useBAINotification';
import {
  withDefault,
  JsonParam,
  StringParam,
  useQueryParams,
} from 'use-query-params';

const getStatusFilter = (status: string) => {
  return { availability: [status] };
};

type ArtifactNode = NonNullable<
  ReservoirPageQuery$data['artifacts']
>['edges'][number]['node'];

const ReservoirPage: React.FC = () => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const { upsertNotification } = useSetBAINotification();

  const [selectedArtifactIdList, setSelectedArtifactIdList] = useState<
    {
      id: string;
      data: ArtifactNode;
    }[]
  >([]);
  const [selectedArtifacts, setSelectedArtifacts] =
    useState<BAIDeactivateArtifactsModalArtifactsFragmentKey>([]);
  const [selectedRestoreArtifacts, setSelectedRestoreArtifacts] =
    useState<BAIActivateArtifactsModalArtifactsFragmentKey>([]);
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
  } = useBAIPaginationOptionStateOnSearchParamLegacy({
    current: 1,
    pageSize: 10,
  });

  const [queryParams, setQuery] = useQueryParams({
    filter: withDefault(JsonParam, {}),
    mode: withDefault(StringParam, 'ALIVE'),
  });
  const jsonStringFilter = JSON.stringify(queryParams.filter);

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
      filter: _.merge(
        {},
        JSON.parse(jsonStringFilter || '{}'),
        getStatusFilter(queryParams.mode),
      ),
    }),
    [
      baiPaginationOption.offset,
      baiPaginationOption.limit,
      jsonStringFilter,
      queryParams.mode,
    ],
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
        total: artifacts(
          limit: 0
          offset: 0
          filter: { availability: [ALIVE, DELETED] }
        ) {
          count
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
              ...BAIDeactivateArtifactsModalArtifactsFragment
              ...BAIActivateArtifactsModalArtifactsFragment
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

  const { artifacts, defaultArtifactRegistry, total } = queryRef;
  const isAvailableUsingHuggingFace =
    defaultArtifactRegistry?.type === 'HUGGINGFACE';
  const mode = queryParams.mode;

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
              value={total.count}
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
              style={{
                flexShrink: 1,
              }}
              wrap="wrap"
            >
              <BAIRadioGroup
                optionType="button"
                options={[
                  {
                    label: t('reservoirPage.Active'),
                    value: 'ALIVE',
                  },
                  {
                    label: t('reservoirPage.Inactive'),
                    value: 'DELETED',
                  },
                ]}
                value={queryParams.mode}
                onChange={(e) => {
                  setQuery({ mode: e.target.value }, 'replaceIn');
                  setTablePaginationOption({ current: 1 });
                  setSelectedArtifactIdList([]);
                  setSelectedArtifacts([]);
                  setSelectedRestoreArtifacts([]);
                }}
              />
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
              {selectedArtifactIdList.length > 0 && (
                <BAIFlex gap="xs">
                  <Typography.Text>
                    {t('general.NSelected', {
                      count: selectedArtifactIdList.length,
                    })}
                  </Typography.Text>
                  <Tooltip
                    title={
                      mode === 'ALIVE'
                        ? t('reservoirPage.Deactivate')
                        : t('reservoirPage.Activate')
                    }
                  >
                    <Button
                      icon={mode === 'ALIVE' ? <BanIcon /> : <UndoIcon />}
                      style={{
                        color:
                          mode === 'ALIVE' ? token.colorError : token.colorInfo,
                      }}
                      onClick={() => {
                        if (mode === 'ALIVE') {
                          setSelectedArtifacts(
                            selectedArtifactIdList.flatMap((arr) => arr.data),
                          );
                        } else {
                          setSelectedRestoreArtifacts(
                            selectedArtifactIdList.flatMap((arr) => arr.data),
                          );
                        }
                      }}
                    />
                  </Tooltip>
                </BAIFlex>
              )}
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
            onClickDelete={(artifactId: string) => {
              artifacts.edges.forEach((edge) => {
                if (edge.node.id === artifactId) {
                  setSelectedArtifacts([edge.node]);
                  return;
                }
              });
            }}
            onClickRestore={(artifactId: string) => {
              artifacts.edges.forEach((edge) => {
                if (edge.node.id === artifactId) {
                  setSelectedRestoreArtifacts([edge.node]);
                  return;
                }
              });
            }}
            rowSelection={{
              type: 'checkbox',
              onChange: (keys) => {
                const artifactIdList = artifacts.edges.map((e) => e.node.id);
                setSelectedArtifactIdList((prev) => {
                  const _filtered = prev.filter(
                    (v) => !artifactIdList.includes(v.id),
                  );
                  const _selected = artifacts.edges
                    .filter((e) => keys.includes(e.node.id))
                    .map((arr) => ({
                      id: arr.node.id,
                      data: arr.node,
                    }));
                  return _filtered.concat(_selected);
                });
              },
              selectedRowKeys: selectedArtifactIdList.map((v) => v.id),
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
      <BAIDeactivateArtifactsModal
        open={!!selectedArtifacts.length}
        selectedArtifactsFragment={selectedArtifacts}
        onCancel={() => setSelectedArtifacts([])}
        onOk={() => {
          updateFetchKey();
          setSelectedArtifacts([]);
          setSelectedArtifactIdList([]);
        }}
      />
      <BAIActivateArtifactsModal
        open={!!selectedRestoreArtifacts.length}
        selectedArtifactsFragment={selectedRestoreArtifacts}
        onCancel={() => setSelectedRestoreArtifacts([])}
        onOk={() => {
          updateFetchKey();
          setSelectedRestoreArtifacts([]);
          setSelectedArtifactIdList([]);
        }}
      />
    </BAIFlex>
  );
};

export default ReservoirPage;
