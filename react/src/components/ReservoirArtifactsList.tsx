import BAIFetchKeyButton from './BAIFetchKeyButton';
import BAIRadioGroup from './BAIRadioGroup';
import { useToggle } from 'ahooks';
import { Button, theme, Tooltip, Typography } from 'antd';
import {
  BAIActivateArtifactsModal,
  BAIActivateArtifactsModalArtifactsFragmentKey,
  BAIArtifactTable,
  BAIDeactivateArtifactsModal,
  BAIDeactivateArtifactsModalArtifactsFragmentKey,
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
import { BanIcon, UndoIcon } from 'lucide-react';
import { useDeferredValue, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { useNavigate } from 'react-router-dom';
import {
  ReservoirArtifactsListQuery,
  ReservoirArtifactsListQuery$data,
  ReservoirArtifactsListQuery$variables,
} from 'src/__generated__/ReservoirArtifactsListQuery.graphql';
import { INITIAL_FETCH_KEY, useUpdatableState } from 'src/hooks';
import { useBAIPaginationOptionStateOnSearchParam } from 'src/hooks/reactPaginationQueryOptions';
import { useSetBAINotification } from 'src/hooks/useBAINotification';
import {
  JsonParam,
  StringParam,
  useQueryParams,
  withDefault,
} from 'use-query-params';

const getStatusFilter = (status: string) => {
  return { availability: [status] };
};

type ArtifactNode = NonNullable<
  ReservoirArtifactsListQuery$data['artifacts']
>['edges'][number]['node'];

const ReservoirArtifactsList = () => {
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
  } = useBAIPaginationOptionStateOnSearchParam({
    current: 1,
    pageSize: 10,
  });

  const [queryParams, setQuery] = useQueryParams({
    filter: withDefault(JsonParam, {}),
    mode: withDefault(StringParam, 'ALIVE'),
  });
  const jsonStringFilter = JSON.stringify(queryParams.filter);

  const queryVariables: ReservoirArtifactsListQuery$variables = useMemo(
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

  const queryRef = useLazyLoadQuery<ReservoirArtifactsListQuery>(
    graphql`
      query ReservoirArtifactsListQuery(
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

  const { artifacts, defaultArtifactRegistry } = queryRef;
  const isAvailableUsingHuggingFace =
    defaultArtifactRegistry?.type === 'HUGGINGFACE';
  const mode = queryParams.mode;
  return (
    <>
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
    </>
  );
};

export default ReservoirArtifactsList;
