/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { DeploymentRevisionDetail_revision$key } from '../__generated__/DeploymentRevisionDetail_revision.graphql';
import { DeploymentRevisionHistoryTabActivateMutation } from '../__generated__/DeploymentRevisionHistoryTabActivateMutation.graphql';
import {
  DeploymentRevisionHistoryTabListQuery,
  ModelRevisionOrderBy,
} from '../__generated__/DeploymentRevisionHistoryTabListQuery.graphql';
import type { DeploymentRevisionHistoryTab_deployment$key } from '../__generated__/DeploymentRevisionHistoryTab_deployment.graphql';
import { convertToOrderBy } from '../helper';
import { useSetBAINotification } from '../hooks/useBAINotification';
import { useBAISettingUserState } from '../hooks/useBAISetting';
import DeploymentRevisionDetailDrawer from './DeploymentRevisionDetailDrawer';
import { LoadingOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { App, Button, Typography, theme } from 'antd';
import {
  type BAIColumnType,
  BAIFetchKeyButton,
  BAIFlex,
  BAIGraphQLPropertyFilter,
  BAINameActionCell,
  BAITable,
  BAITag,
  BAIUnmountAfterClose,
  BAIId,
  INITIAL_FETCH_KEY,
  type GraphQLFilter,
  filterOutNullAndUndefined,
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
import React, { useState, useTransition } from 'react';
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
  'resourceGroup',
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
  isDeploymentDestroying?: boolean;
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
> = ({
  deploymentFrgmt,
  deploymentId,
  isDeploymentDestroying = false,
  fetchKey,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { modal } = App.useApp();
  const { logger } = useBAILogger();
  const { upsertNotification } = useSetBAINotification();
  const [isPending, startTransition] = useTransition();
  const [rollingBackRevisionId, setRollingBackRevisionId] = useState<
    string | null
  >(null);
  const [drawerRevision, setDrawerRevision] = useState<{
    frgmt: RevisionNode & DeploymentRevisionDetail_revision$key;
    status: 'current' | 'deploying' | 'none';
  } | null>(null);

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
        current: 'rCurrent',
        pageSize: 'rPageSize',
        order: 'rvOrder',
        rvFilter: 'rvFilter',
      },
    },
  );

  const deployment = useFragment(
    graphql`
      fragment DeploymentRevisionHistoryTab_deployment on ModelDeployment {
        id
      }
    `,
    deploymentFrgmt,
  );

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
                  resourceConfig {
                    resourceGroupName
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
                    }
                  }
                  modelMountConfig {
                    vfolderId
                    vfolder {
                      id
                      name
                    }
                  }
                  ...DeploymentRevisionDetail_revision
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
            currentRevision {
              id
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
    return new Promise<boolean>((resolveOuter) => {
      modal.confirm({
        title: t('deployment.Deploy'),
        content: t('deployment.DeployConfirm', {
          revisionNumber: revision.revisionNumber,
        }),
        okText: t('deployment.Deploy'),
        okButtonProps: {
          danger: true,
        },
        onCancel: () => resolveOuter(false),
        onOk: () => {
          return new Promise<void>((resolve) => {
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
                  upsertNotification({
                    open: true,
                    message: errors[0]?.message || t('general.ErrorOccurred'),
                    type: 'error',
                  });
                  resolveOuter(false);
                  resolve();
                  return;
                }
                upsertNotification({
                  open: true,
                  message: t('deployment.DeploySuccess', {
                    revisionNumber: revision.revisionNumber,
                  }),
                });
                handleRefresh();
                resolveOuter(true);
                resolve();
              },
              onError: (error) => {
                setRollingBackRevisionId(null);
                logger.error(error);
                upsertNotification({
                  open: true,
                  message: error?.message || t('general.ErrorOccurred'),
                  type: 'error',
                });
                resolveOuter(false);
                resolve();
              },
            });
          });
        },
      });
    });
  };

  const columns: BAIColumnType<RevisionNode>[] = [
    {
      title: t('deployment.RevisionNumberWithID'),
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
          isCurrent || isDeploying ? t('deployment.DeployDisabled') : undefined;
        const isDeployDisabled =
          isCurrent ||
          isDeploying ||
          isDeploymentDestroying ||
          rollingBackRevisionId === record.id;
        return (
          <BAINameActionCell
            title={
              <BAIFlex gap="xs" align="center">
                <Typography.Link
                  onClick={() =>
                    setDrawerRevision({
                      frgmt: record as RevisionNode &
                        DeploymentRevisionDetail_revision$key,
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
                    {t('deployment.Deploying')}
                  </BAITag>
                ) : null}
              </BAIFlex>
            }
            showActions="always"
            actions={[
              {
                key: 'deploy',
                title: t('deployment.Deploy'),
                icon: <PlayCircleOutlined />,
                disabled: isDeployDisabled,
                disabledReason: deployDisabledReason,
                onClick: () => {
                  void handleRollback(record);
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
        const imageGlobalId = record.imageV2?.id;
        if (!canonicalName && !imageGlobalId) return '-';
        return (
          <BAIFlex gap="xs" align="center" wrap="wrap">
            {canonicalName ? (
              <BAIText
                copyable
                ellipsis={{ tooltip: canonicalName }}
                style={{ maxWidth: 180 }}
              >
                {canonicalName}
              </BAIText>
            ) : null}
            {imageGlobalId ? (
              <BAIFlex gap={0} align="center">
                {'('}
                <BAIId globalId={imageGlobalId} />
                {')'}
              </BAIFlex>
            ) : null}
          </BAIFlex>
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
        if (!vfolder?.name && !vfolderId) return '-';
        return (
          <BAIFlex gap="xs" align="center" wrap="wrap">
            {vfolder?.name ? (
              <Typography.Text>{vfolder.name}</Typography.Text>
            ) : null}
            {vfolder?.id ? (
              <BAIFlex gap={0} align="center">
                {'('}
                <BAIId globalId={vfolder.id} />
                {')'}
              </BAIFlex>
            ) : vfolderId ? (
              <Typography.Text type="secondary">{vfolderId}</Typography.Text>
            ) : null}
          </BAIFlex>
        );
      },
    },
    {
      title: t('deployment.ClusterMode'),
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
    {
      title: t('deployment.ResourceGroup'),
      key: 'resourceGroup',
      dataIndex: 'resourceGroup',
      sorter: true,
      defaultHidden: true,
      render: (_value, record) =>
        record.resourceConfig?.resourceGroupName ?? '-',
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
      key: 'resourceGroup',
      propertyLabel: t('deployment.ResourceGroup'),
      type: 'string' as const,
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
              <Button
                type="primary"
                icon={<PlayCircleOutlined />}
                disabled={
                  drawerRevision.status === 'current' ||
                  drawerRevision.status === 'deploying' ||
                  isDeploymentDestroying ||
                  !!rollingBackRevisionId
                }
                onClick={async () => {
                  const success = await handleRollback(drawerRevision.frgmt);
                  if (success) setDrawerRevision(null);
                }}
              >
                {t('deployment.Deploy')}
              </Button>
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
    </>
  );
};

export default DeploymentRevisionHistoryTab;
