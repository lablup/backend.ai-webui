import { INITIAL_FETCH_KEY, useUpdatableState } from '../hooks';
import { useBAIPaginationOptionStateOnSearchParam } from '../hooks/reactPaginationQueryOptions';
import { useDeferredQueryParams } from '../hooks/useDeferredQueryParams';
import { theme, Col, Row, Statistic, Card } from 'antd';
import {
  BAICard,
  BAIFlex,
  BAIArtifactTable,
  BAIImportArtifactModal,
  BAIGraphQLPropertyFilter,
  toLocalId,
  BAIImportArtifactModalArtifactRevisionFragmentKey,
  BAIImportArtifactModalArtifactFragmentKey,
} from 'backend.ai-ui';
import _ from 'lodash';
import { Package, Brain, Container } from 'lucide-react';
import React, { useMemo, useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { useNavigate } from 'react-router-dom';
import {
  ReservoirPageQuery,
  ReservoirPageQuery$variables,
} from 'src/__generated__/ReservoirPageQuery.graphql';
import BAIFetchKeyButton from 'src/components/BAIFetchKeyButton';
import { withDefault, JsonParam } from 'use-query-params';

const ReservoirPage: React.FC = () => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const navigate = useNavigate();

  const [selectedArtifact, setSelectedArtifact] =
    useState<BAIImportArtifactModalArtifactFragmentKey | null>(null);
  const [selectedRevision, setSelectedRevision] =
    useState<BAIImportArtifactModalArtifactRevisionFragmentKey>([]);

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

  // const queryVariables: ReservoirPageQuery$variables = useMemo(() => ({}));

  const queryVariables: ReservoirPageQuery$variables = useMemo(
    () => ({
      offset: baiPaginationOption.offset,
      limit: baiPaginationOption.limit,
      order: [
        {
          field: 'NAME',
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

  const { artifacts } = queryRef;

  const typeFilterGenerator = (type: 'IMAGE' | 'PACKAGE' | 'MODEL') => {
    return { type: { eq: type } };
  };

  const handleStatisticCardClick = (type: 'IMAGE' | 'PACKAGE' | 'MODEL') => {
    setQuery({ filter: typeFilterGenerator(type) }, 'replaceIn');
  };

  return (
    <BAIFlex direction="column" align="stretch" gap={'md'}>
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={8} lg={6} xl={4}>
          <Card
            size="small"
            variant="borderless"
            hoverable
            onClick={() => handleStatisticCardClick('MODEL')}
            style={{
              cursor: 'pointer',
              border:
                queryParams.filter === typeFilterGenerator('MODEL')
                  ? `1px solid ${token.colorPrimary}`
                  : `1px solid ${token.colorBorder}`,
              backgroundColor:
                queryParams.filter === typeFilterGenerator('MODEL')
                  ? token.colorPrimaryBg
                  : undefined,
              transition: 'all 0.2s ease',
            }}
          >
            <Statistic
              title="MODEL"
              value={0}
              prefix={<Brain size={16} />}
              valueStyle={{
                color:
                  queryParams.filter === typeFilterGenerator('MODEL')
                    ? token.colorPrimary
                    : undefined,
              }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={6} xl={4}>
          <Card
            size="small"
            variant="borderless"
            hoverable
            onClick={() => handleStatisticCardClick('IMAGE')}
            style={{
              cursor: 'pointer',
              border:
                queryParams.filter === typeFilterGenerator('IMAGE')
                  ? `1px solid ${token.colorPrimary}`
                  : `1px solid ${token.colorBorder}`,
              backgroundColor:
                queryParams.filter === typeFilterGenerator('IMAGE')
                  ? token.colorPrimaryBg
                  : undefined,
              transition: 'all 0.2s ease',
            }}
          >
            <Statistic
              title="IMAGE"
              value={0}
              prefix={<Container />}
              valueStyle={{
                color:
                  queryParams.filter === typeFilterGenerator('IMAGE')
                    ? token.colorPrimary
                    : undefined,
              }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={6} xl={4}>
          <Card
            size="small"
            variant="borderless"
            hoverable
            onClick={() => handleStatisticCardClick('PACKAGE')}
            style={{
              cursor: 'pointer',
              border:
                queryParams.filter === typeFilterGenerator('PACKAGE')
                  ? `1px solid ${token.colorPrimary}`
                  : `1px solid ${token.colorBorder}`,
              backgroundColor:
                queryParams.filter === typeFilterGenerator('PACKAGE')
                  ? token.colorPrimaryBg
                  : undefined,
              transition: 'all 0.2s ease',
            }}
          >
            <Statistic
              title="PACKAGE"
              value={0}
              prefix={<Package />}
              valueStyle={{
                color:
                  queryParams.filter === typeFilterGenerator('PACKAGE')
                    ? token.colorPrimary
                    : undefined,
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
                    fixedOperator: 'eq',
                    key: 'type',
                    propertyLabel: 'Type',
                    type: 'enum',
                    options: [
                      {
                        label: 'Model',
                        value: 'MODEL',
                      },
                      {
                        label: 'Package',
                        value: 'PACKAGE',
                      },
                      {
                        label: 'Image',
                        value: 'IMAGE',
                      },
                    ],
                  },
                  {
                    fixedOperator: 'contains',
                    key: 'name',
                    propertyLabel: 'Name',
                    type: 'string',
                  },
                  {
                    fixedOperator: 'eq',
                    key: 'source',
                    propertyLabel: 'Source',
                    type: 'string',
                  },
                  {
                    fixedOperator: 'eq',
                    key: 'registry',
                    propertyLabel: 'Registry',
                    type: 'string',
                  },
                ]}
              />
            </BAIFlex>
            <BAIFetchKeyButton
              value={fetchKey}
              autoUpdateDelay={10_000}
              loading={deferredFetchKey !== fetchKey}
              onChange={() => {
                updateFetchKey();
                // rescanArtifacts({
                //   variables: {
                //     input: {
                //       storageId: 'fe878f09-06cc-4b91-9242-4c71015cce07',
                //       registryId: 'fe878f09-06cc-4b91-9242-4c71015cce05',
                //       limit: 100,
                //     },
                //   },
                // });
              }}
            />
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
            onRow={(record) => ({
              onClick: (event) => {
                event.stopPropagation();
                const target = event.target as HTMLElement;
                if (target.closest('button') || target.closest('a')) {
                  return;
                }
                navigate(`/reservoir/${toLocalId(record.id)}`);
              },
            })}
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
        onOk={() => {
          setSelectedArtifact(null);
          setSelectedRevision([]);
        }}
        onCancel={() => {
          setSelectedArtifact(null);
          setSelectedRevision([]);
        }}
      />
    </BAIFlex>
  );
};

export default ReservoirPage;
