/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { DeploymentRevisionHistoryTabActivateMutation } from '../__generated__/DeploymentRevisionHistoryTabActivateMutation.graphql';
import {
  DeploymentRevisionHistoryTabListQuery,
  ModelRevisionOrderBy,
} from '../__generated__/DeploymentRevisionHistoryTabListQuery.graphql';
import type { DeploymentRevisionHistoryTab_deployment$key } from '../__generated__/DeploymentRevisionHistoryTab_deployment.graphql';
import { convertToOrderBy } from '../helper';
import { useBAISettingUserState } from '../hooks/useBAISetting';
import DeploymentAddRevisionModal from './DeploymentAddRevisionModal';
import DeploymentRevisionDetailDrawer from './DeploymentRevisionDetailDrawer';
import FolderLink from './FolderLink';
import {
  CopyOutlined,
  LoadingOutlined,
  MoreOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
import {
  App,
  Dropdown,
  Modal,
  Popconfirm,
  Space,
  theme,
  Typography,
} from 'antd';
import {
  type BAIColumnType,
  BAIButton,
  BAIFetchKeyButton,
  BAIFlex,
  BAIGraphQLPropertyFilter,
  BAINameActionCell,
  BAIQuestionIconWithTooltip,
  BAITable,
  BAITag,
  BAIUnmountAfterClose,
  BAIId,
  INITIAL_FETCH_KEY,
  type GraphQLFilter,
  filterOutNullAndUndefined,
  isDeploymentInStoppedCategory,
  isValidUUID,
  toLocalId,
  useBAILogger,
  useFetchKey,
  BAIText,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import {
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from 'nuqs';
import React, { Suspense, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import {
  graphql,
  useFragment,
  useLazyLoadQuery,
  useMutation,
} from 'react-relay';

type RevisionNode = NonNullable<
  NonNullable<
    NonNullable<
      NonNullable<
        DeploymentRevisionHistoryTabListQuery['response']['deployment']
      >['revisionHistory']
    >['edges'][number]
  >['node']
>;

const availableRevisionSorterKeys = [
  'revisionNumber',
  'createdAt',
  'clusterMode',
  'runtimeVariantName',
] as const;
const availableRevisionSorterValues = [
  ...availableRevisionSorterKeys,
  ...availableRevisionSorterKeys.map((key) => `-${key}` as const),
] as const;

export interface DeploymentRevisionHistoryTabProps {
  deploymentFrgmt: DeploymentRevisionHistoryTab_deployment$key;
  deploymentId: string;
  fetchKey?: string;
}

/**
 * Revision history tab for a model deployment detail page.
 *
 * Lists all revisions of the deployment (current revision highlighted),
 * and lets operators roll back to any earlier revision. Rollback is
 * executed via the `updateModelDeployment` mutation with the target
 * `activeRevisionId` — there is no dedicated rollback mutation in the
 * schema; switching the active revision atomically replaces the current
 * one. See FR-2678 and spec.md §Flow 5.
 */
const DeploymentRevisionHistoryTab: React.FC<
  DeploymentRevisionHistoryTabProps
> = ({ deploymentFrgmt, deploymentId, fetchKey }) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const { logger } = useBAILogger();
  const [isPending, startTransition] = useTransition();
  const [rollingBackRevisionId, setRollingBackRevisionId] = useState<
    string | null
  >(null);
  const [drawerRevision, setDrawerRevision] = useState<{
    frgmt: RevisionNode;
    status: 'current' | 'deploying' | 'none';
  } | null>(null);
  // Source revision for the AddRevision modal — both entry points in this
  // tab (row overflow menu / drawer Apply+More) hand a revision node
  // straight to the modal. A non-null node opens the modal and drives the
  // prefill; null closes it. No `fetchQuery` warm-up is needed: the source
  // revision data already comes off this tab's list query, which spreads
  // `DeploymentAddRevisionModal_revisionSource` on the node so it satisfies
  // the modal's fragment ref.
  const [sourceRevisionFrgmt, setSourceRevisionFrgmt] =
    useState<RevisionNode | null>(null);

  const [columnOverrides, setColumnOverrides] = useBAISettingUserState(
    'table_column_overrides.DeploymentRevisionHistoryTab',
  );

  const [queryParams, setQueryParams] = useQueryStates(
    {
      current: parseAsInteger.withDefault(1),
      pageSize: parseAsInteger.withDefault(10),
      order: parseAsStringLiteral(availableRevisionSorterValues),
      rvFilter: parseAsString,
    },
    {
      history: 'replace',
      urlKeys: {
        // Use an `rv*` prefix distinct from the replica tab's `r*` keys
        // (rCurrent/rPageSize). Both tabs live on the same deployment
        // detail URL, so sharing pagination keys made switching tabs carry
        // over an out-of-range page index and render an empty table.
        current: 'rvCurrent',
        pageSize: 'rvPageSize',
        order: 'rvOrder',
        rvFilter: 'rvFilter',
      },
    },
  );

  const deployment = useFragment(
    graphql`
      fragment DeploymentRevisionHistoryTab_deployment on ModelDeployment {
        id
        metadata {
          status
        }
        ...DeploymentAddRevisionModal_deployment
      }
    `,
    deploymentFrgmt,
  );

  // Derive the stopped-category guard from this component's own fragment
  // status rather than receiving it as a prop from the parent.
  const deploymentStatus = deployment?.metadata?.status;

  const parseRevisionFilter = (filter: string | null) => {
    if (!filter) return null;
    try {
      const parsed = JSON.parse(filter);
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
        ? parsed
        : null;
    } catch {
      return null;
    }
  };

  const stringifyRevisionFilter = (
    filter: GraphQLFilter | undefined,
  ): string => {
    if (!filter || Object.keys(filter).length === 0) return '';
    return JSON.stringify(filter);
  };

  const [queryVars, setQueryVars] = useState(() => ({
    filter: queryParams.rvFilter
      ? parseRevisionFilter(queryParams.rvFilter)
      : null,
    orderBy: convertToOrderBy<ModelRevisionOrderBy>(queryParams.order) ?? [
      { field: 'REVISION_NUMBER', direction: 'DESC' } as ModelRevisionOrderBy,
    ],
    limit: queryParams.pageSize,
    offset:
      queryParams.current > 1
        ? (queryParams.current - 1) * queryParams.pageSize
        : 0,
  }));

  const [internalFetchKey, updateInternalFetchKey] = useFetchKey();
  const combinedFetchKey = `${fetchKey ?? ''}${internalFetchKey}`;
  const isInitialFetch =
    (fetchKey === undefined || fetchKey === INITIAL_FETCH_KEY) &&
    internalFetchKey === INITIAL_FETCH_KEY;

  const { deployment: listData } =
    useLazyLoadQuery<DeploymentRevisionHistoryTabListQuery>(
      graphql`
        query DeploymentRevisionHistoryTabListQuery(
          $deploymentId: ID!
          $filter: ModelRevisionFilter
          $orderBy: [ModelRevisionOrderBy!]
          $limit: Int
          $offset: Int
        ) {
          deployment(id: $deploymentId) {
            currentRevisionId
            deployingRevisionId
            revisionHistory(
              filter: $filter
              orderBy: $orderBy
              limit: $limit
              offset: $offset
            ) {
              count
              edges {
                node {
                  id
                  revisionNumber
                  createdAt

                  clusterConfig {
                    mode
                    size
                  }
                  modelRuntimeConfig {
                    runtimeVariant {
                      name
                    }
                  }
                  modelDefinition {
                    models {
                      name
                      metadata {
                        version
                      }
                    }
                  }
                  imageV2 {
                    id
                    identity {
                      canonicalName
                      architecture
                    }
                  }
                  modelMountConfig {
                    vfolderId
                    vfolder {
                      id
                      name
                      ...FolderLink_vfolderNode
                    }
                  }
                  ...DeploymentRevisionDetail_revision
                  ...DeploymentAddRevisionModal_revisionSource
                }
              }
            }
          }
        }
      `,
      { deploymentId, ...queryVars },
      {
        fetchKey: combinedFetchKey,
        fetchPolicy: isInitialFetch ? 'store-and-network' : 'network-only',
      },
    );

  const [commitActivate] =
    useMutation<DeploymentRevisionHistoryTabActivateMutation>(graphql`
      mutation DeploymentRevisionHistoryTabActivateMutation(
        $input: ActivateRevisionInput!
      ) {
        activateDeploymentRevision(input: $input) {
          deployment {
            id
            currentRevisionId
            deployingRevisionId
            currentRevision @since(version: "26.4.3") {
              id
              ...DeploymentRevisionDetail_revision
            }
            deployingRevision @since(version: "26.4.3") {
              id
              ...DeploymentRevisionDetail_revision
            }
          }
          previousRevisionId
          activatedRevisionId
        }
      }
    `);

  const currentRevisionId = listData?.currentRevisionId;
  const deployingRevisionId = listData?.deployingRevisionId;
  const revisionHistory = listData?.revisionHistory;

  const revisions: RevisionNode[] = filterOutNullAndUndefined(
    _.map(revisionHistory?.edges, 'node'),
  );

  const doRefetch = (overrides?: {
    filter?: ReturnType<typeof parseRevisionFilter>;
    orderBy?: ReturnType<typeof convertToOrderBy<ModelRevisionOrderBy>>;
    limit?: number;
    offset?: number;
  }) => {
    startTransition(() => {
      setQueryVars((prev) => ({ ...prev, ...overrides }));
    });
  };

  const handleRefresh = () => {
    startTransition(() => updateInternalFetchKey());
  };

  const handleRollback = (revision: RevisionNode): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      setRollingBackRevisionId(revision.id);
      commitActivate({
        variables: {
          input: {
            deploymentId: toLocalId(deployment.id),
            revisionId: toLocalId(revision.id),
          },
        },
        onCompleted: (_res, errors) => {
          setRollingBackRevisionId(null);
          if (errors && errors.length > 0) {
            logger.error(errors[0]);
            message.error(errors[0]?.message || t('general.ErrorOccurred'));
            resolve(false);
            return;
          }
          message.success(
            t('deployment.ApplySuccess', {
              revisionNumber: revision.revisionNumber,
            }),
          );
          handleRefresh();
          resolve(true);
        },
        onError: (error) => {
          setRollingBackRevisionId(null);
          logger.error(error);
          message.error(error?.message || t('general.ErrorOccurred'));
          resolve(false);
        },
      });
    });
  };

  const columns: BAIColumnType<RevisionNode>[] = [
    {
      title: (
        <BAIFlex gap="xxs" align="center">
          {t('deployment.RevisionNumberWithID')}
          <BAIQuestionIconWithTooltip
            title={t('deployment.RevisionNumberTooltip')}
          />
        </BAIFlex>
      ),
      dataIndex: 'revisionNumber',
      key: 'revisionNumber',
      fixed: 'left',
      sorter: true,
      render: (_value, record) => {
        // `currentRevisionId` and `deployingRevisionId` come back as raw
        // UUIDs from the scalar fields, while `record.id` is the
        // Strawberry global id (`ModelRevision:<uuid>` base64). Compare
        // in the same shape so the disable check actually matches.
        const recordLocalId = toLocalId(record.id);
        const isCurrent = recordLocalId === currentRevisionId;
        const isDeploying = recordLocalId === deployingRevisionId;
        const deployDisabledReason =
          isCurrent || isDeploying ? t('deployment.ApplyDisabled') : undefined;
        const isDeployDisabled =
          isCurrent ||
          isDeploying ||
          isDeploymentInStoppedCategory(deploymentStatus) ||
          rollingBackRevisionId === record.id;
        return (
          <BAINameActionCell
            title={
              <BAIFlex gap="xs" align="center" wrap="nowrap">
                <Typography.Link
                  onClick={() =>
                    setDrawerRevision({
                      frgmt: record,
                      status: isCurrent
                        ? 'current'
                        : isDeploying
                          ? 'deploying'
                          : 'none',
                    })
                  }
                >
                  {record.revisionNumber != null
                    ? `#${record.revisionNumber}`
                    : '-'}
                </Typography.Link>
                <BAIFlex gap={0} align="center">
                  {'('}
                  <BAIId globalId={record.id} />
                  {')'}
                </BAIFlex>
                {isCurrent ? (
                  <BAITag color="success">{t('deployment.Current')}</BAITag>
                ) : null}
                {isDeploying && !isCurrent ? (
                  // Skip the "Deploying" tag when this revision is also
                  // the current one — the server briefly leaves
                  // `deployingRevisionId` set after promotion until the
                  // reconciler clears it, and showing both tags side by
                  // side reads as a contradiction.
                  <BAITag color="warning" icon={<LoadingOutlined spin />}>
                    {t('deployment.Applying')}
                  </BAITag>
                ) : null}
              </BAIFlex>
            }
            showActions="always"
            // TODO: "AddNewRevisionFromThis" is currently the only menu item.
            // The entire More button is disabled when stopped rather than
            // per-item. When more menu items are added, switch to per-item
            // disabled and remove moreMenuDisabled.
            moreMenuDisabled={isDeploymentInStoppedCategory(deploymentStatus)}
            actions={[
              {
                key: 'deploy',
                title: t('deployment.Apply'),
                icon: <PlayCircleOutlined />,
                disabled: isDeployDisabled,
                disabledReason: deployDisabledReason,
                popConfirm: {
                  title: t('deployment.ApplyRevision'),
                  description: t('deployment.ApplyConfirm', {
                    revisionNumber: record.revisionNumber,
                  }),
                  okText: t('deployment.Apply'),
                  cancelText: t('button.Cancel'),
                  okButtonProps: {
                    danger: true,
                  },
                  onConfirm: () => {
                    void handleRollback(record);
                  },
                },
              },
              {
                key: 'duplicate',
                title: t('deployment.AddNewRevisionFromThis'),
                icon: <CopyOutlined />,
                showInMenu: 'always',
                disabled: isDeploymentInStoppedCategory(deploymentStatus),
                onClick: () => {
                  setSourceRevisionFrgmt(record);
                },
              },
            ]}
          />
        );
      },
    },
    {
      title: t('general.CreatedAt'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: true,
      render: (value: string | null | undefined) =>
        value ? dayjs(value).format('lll') : '-',
    },
    {
      title: t('deployment.ModelVersion'),
      key: 'modelVersion',
      defaultHidden: true,
      render: (_value, record) => {
        const model = record.modelDefinition?.models?.[0];
        if (!model) return '-';
        const name = model.name ?? '-';
        // metadata.version is typed as JSON — coerce to a display string
        // when present; fall back to name only otherwise.
        const rawVersion = model.metadata?.version;
        const version =
          typeof rawVersion === 'string'
            ? rawVersion
            : rawVersion != null
              ? String(rawVersion)
              : null;
        return version ? `${name} (${version})` : name;
      },
    },
    {
      title: t('deployment.RuntimeVariant'),
      key: 'runtimeVariantName',
      dataIndex: 'runtimeVariantName',
      sorter: true,
      render: (_value, record) =>
        record.modelRuntimeConfig?.runtimeVariant?.name ?? '-',
    },
    {
      title: t('deployment.Image'),
      key: 'image',
      defaultHidden: true,
      render: (_value, record) => {
        const canonicalName = record.imageV2?.identity?.canonicalName;
        const architecture = record.imageV2?.identity?.architecture;
        const fullName =
          canonicalName && architecture
            ? `${canonicalName}@${architecture}`
            : canonicalName;
        if (!fullName) return '-';
        return (
          <BAIText
            copyable={{ text: fullName }}
            ellipsis={{ tooltip: fullName }}
            style={{ maxWidth: 180 }}
          >
            {fullName}
          </BAIText>
        );
      },
    },
    {
      title: t('deployment.ModelFolder'),
      key: 'modelFolder',
      defaultHidden: true,
      render: (_value, record) => {
        const vfolder = record.modelMountConfig?.vfolder;
        const vfolderId = record.modelMountConfig?.vfolderId;
        if (!vfolder && !vfolderId) return '-';
        if (vfolder) {
          return <FolderLink vfolderNodeFragment={vfolder} />;
        }
        return <Typography.Text type="secondary">{vfolderId}</Typography.Text>;
      },
    },
    {
      title: (
        <BAIFlex gap="xxs" align="center">
          {t('deployment.ClusterMode')}
          <BAIQuestionIconWithTooltip
            title={t('deployment.ClusterModeTooltip')}
          />
        </BAIFlex>
      ),
      key: 'clusterMode',
      dataIndex: 'clusterMode',
      sorter: true,
      render: (_value, record) => {
        const mode = record.clusterConfig?.mode;
        const size = record.clusterConfig?.size;
        if (mode == null && size == null) return '-';
        if (mode == null) return `${size}`;
        if (size == null) return mode;
        return `${mode} / ${size}`;
      },
    },
  ];

  const uuidRule = {
    message: t('general.InvalidUUID'),
    validate: (value: string) => isValidUUID(value.toLowerCase()),
  };

  const filterProperties = [
    {
      key: 'revisionNumber',
      propertyLabel: t('deployment.RevisionNumber'),
      type: 'number' as const,
    },
    {
      key: 'createdAt',
      propertyLabel: t('general.CreatedAt'),
      type: 'datetime' as const,
      operators: ['after' as const, 'before' as const],
      defaultOperator: 'after' as const,
    },
    {
      key: 'clusterMode',
      propertyLabel: t('deployment.ClusterMode'),
      type: 'string' as const,
    },
    {
      key: 'imageId',
      propertyLabel: t('deployment.Image'),
      type: 'uuid' as const,
      fixedOperator: 'equals' as const,
      rule: uuidRule,
    },
    {
      key: 'modelVfolderId',
      propertyLabel: t('deployment.ModelFolder'),
      type: 'uuid' as const,
      fixedOperator: 'equals' as const,
      rule: uuidRule,
    },
  ];

  const filterValue: GraphQLFilter | undefined = queryParams.rvFilter
    ? (parseRevisionFilter(queryParams.rvFilter) ?? undefined)
    : undefined;

  return (
    <>
      <BAIUnmountAfterClose>
        <DeploymentRevisionDetailDrawer
          revisionFrgmt={drawerRevision?.frgmt}
          status={drawerRevision?.status}
          open={!!drawerRevision}
          onClose={() => setDrawerRevision(null)}
          extra={
            drawerRevision ? (
              <Space.Compact>
                <Popconfirm
                  title={t('deployment.ApplyRevision')}
                  description={t('deployment.ApplyConfirm', {
                    revisionNumber: drawerRevision.frgmt.revisionNumber,
                  })}
                  okText={t('deployment.Apply')}
                  cancelText={t('button.Cancel')}
                  okButtonProps={{ danger: true }}
                  onConfirm={async () => {
                    const success = await handleRollback(drawerRevision.frgmt);
                    if (success) setDrawerRevision(null);
                  }}
                >
                  <BAIButton
                    type="primary"
                    icon={<PlayCircleOutlined />}
                    disabled={
                      drawerRevision.status === 'current' ||
                      drawerRevision.status === 'deploying' ||
                      isDeploymentInStoppedCategory(deploymentStatus) ||
                      !!rollingBackRevisionId
                    }
                  >
                    {t('deployment.Apply')}
                  </BAIButton>
                </Popconfirm>
                <Dropdown
                  trigger={['click']}
                  menu={{
                    items: [
                      {
                        key: 'duplicate',
                        label: t('deployment.AddNewRevisionFromThis'),
                        icon: <CopyOutlined />,
                        disabled:
                          isDeploymentInStoppedCategory(deploymentStatus),
                        onClick: () => {
                          // Capture the fragment ref before closing the
                          // drawer so the source survives the drawer unmount.
                          const source = drawerRevision.frgmt;
                          setDrawerRevision(null);
                          setSourceRevisionFrgmt(source);
                        },
                      },
                    ],
                  }}
                >
                  {/* TODO: "AddNewRevisionFromThis" is the only menu item.
                      Disable the entire button when stopped. When more items
                      are added, disable per-item instead. */}
                  <BAIButton
                    type="primary"
                    icon={<MoreOutlined />}
                    aria-label={t('button.More')}
                    disabled={isDeploymentInStoppedCategory(deploymentStatus)}
                  />
                </Dropdown>
              </Space.Compact>
            ) : undefined
          }
        />
      </BAIUnmountAfterClose>
      <BAIFlex
        justify="between"
        align="center"
        gap="xs"
        style={{ marginBottom: token.marginSM }}
        wrap="wrap"
      >
        <BAIGraphQLPropertyFilter
          filterProperties={filterProperties}
          value={filterValue}
          onChange={(next) => {
            const str = stringifyRevisionFilter(next);
            const parsed = parseRevisionFilter(str || null);
            setQueryParams({ rvFilter: str || null, current: 1 });
            doRefetch({ filter: parsed, offset: 0 });
          }}
        />
        <BAIFetchKeyButton
          loading={isPending}
          value=""
          onChange={() => handleRefresh()}
        />
      </BAIFlex>
      <BAITable
        rowKey="id"
        dataSource={revisions}
        columns={columns}
        loading={isPending}
        size="small"
        scroll={{ x: 'max-content' }}
        tableSettings={{
          columnOverrides,
          onColumnOverridesChange: setColumnOverrides,
        }}
        order={queryParams.order ?? undefined}
        onChangeOrder={(newOrder) => {
          setQueryParams({
            order: newOrder as
              | (typeof availableRevisionSorterValues)[number]
              | null,
          });
          doRefetch({
            orderBy: convertToOrderBy<ModelRevisionOrderBy>(newOrder),
          });
        }}
        pagination={{
          pageSize: queryParams.pageSize,
          current: queryParams.current,
          total: revisionHistory?.count ?? 0,
          showSizeChanger: true,
          onChange: (current, pageSize) => {
            const nextOffset = current > 1 ? (current - 1) * pageSize : 0;
            setQueryParams({ current, pageSize });
            doRefetch({ limit: pageSize, offset: nextOffset });
          },
        }}
      />
      <Suspense
        // Render a loading modal shell while the modal's lazy chunks resolve,
        // so the trigger click is visually acknowledged instead of producing a
        // momentary no-op.
        fallback={
          <Modal
            open={!!sourceRevisionFrgmt}
            loading
            footer={null}
            onCancel={() => setSourceRevisionFrgmt(null)}
          />
        }
      >
        <BAIUnmountAfterClose>
          <DeploymentAddRevisionModal
            open={!!sourceRevisionFrgmt}
            deploymentFrgmt={deployment}
            sourceRevisionFrgmt={sourceRevisionFrgmt}
            onRequestClose={(success) => {
              setSourceRevisionFrgmt(null);
              if (success) handleRefresh();
            }}
          />
        </BAIUnmountAfterClose>
      </Suspense>
    </>
  );
};

export default DeploymentRevisionHistoryTab;
