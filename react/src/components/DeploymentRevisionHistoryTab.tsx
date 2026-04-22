/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  DeploymentRevisionHistoryTabListQuery,
  ModelRevisionOrderBy,
} from '../__generated__/DeploymentRevisionHistoryTabListQuery.graphql';
import { DeploymentRevisionHistoryTabRollbackMutation } from '../__generated__/DeploymentRevisionHistoryTabRollbackMutation.graphql';
import type { DeploymentRevisionHistoryTab_deployment$key } from '../__generated__/DeploymentRevisionHistoryTab_deployment.graphql';
import { convertToOrderBy } from '../helper';
import { useBAISettingUserState } from '../hooks/useBAISetting';
import { UndoOutlined } from '@ant-design/icons';
import { App, Tag, Typography, theme } from 'antd';
import {
  type BAIColumnType,
  BAIFetchKeyButton,
  BAIFlex,
  BAIGraphQLPropertyFilter,
  BAINameActionCell,
  BAITable,
  type GraphQLFilter,
  filterOutNullAndUndefined,
  toLocalId,
  useBAILogger,
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
import { useSetBAINotification } from 'src/hooks/useBAINotification';

const availableRevisionSorterKeys = ['createdAt'] as const;
const availableRevisionSorterValues = [
  ...availableRevisionSorterKeys,
  ...availableRevisionSorterKeys.map((key) => `-${key}` as const),
] as const;

export interface DeploymentRevisionHistoryTabProps {
  deploymentFrgmt: DeploymentRevisionHistoryTab_deployment$key;
  deploymentId: string;
  isDeploymentDestroying?: boolean;
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
> = ({ deploymentFrgmt, deploymentId, isDeploymentDestroying = false }) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { modal, message } = App.useApp();
  const { logger } = useBAILogger();
  const { upsertNotification } = useSetBAINotification();
  const [isPending, startTransition] = useTransition();
  const [rollingBackRevisionId, setRollingBackRevisionId] = useState<
    string | null
  >(null);

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

  const [fetchKey, setFetchKey] = useState(0);

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
                  name
                  createdAt
                  clusterConfig {
                    mode
                    size
                  }
                  modelRuntimeConfig {
                    runtimeVariant
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
                }
              }
            }
          }
        }
      `,
      { deploymentId, ...queryVars },
      { fetchKey, fetchPolicy: 'network-only' },
    );

  const [commitRollback] =
    useMutation<DeploymentRevisionHistoryTabRollbackMutation>(graphql`
      mutation DeploymentRevisionHistoryTabRollbackMutation(
        $input: UpdateDeploymentInput!
      ) {
        updateModelDeployment(input: $input) {
          deployment {
            id
            currentRevisionId
            currentRevision {
              id
              name
            }
          }
        }
      }
    `);

  const currentRevisionId = listData?.currentRevisionId;
  const revisionHistory = listData?.revisionHistory;

  type RevisionNode = NonNullable<
    NonNullable<NonNullable<typeof revisionHistory>['edges'][number]>['node']
  >;

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
    startTransition(() => setFetchKey((k) => k + 1));
  };

  const handleRollback = (revision: RevisionNode) => {
    // The `name` field is the human-readable revision number label
    // ("#3"). Fall back to the trimmed UUID if absent so the confirm
    // text is never blank.
    const revisionLabel = revision.name ?? toLocalId(revision.id);
    modal.confirm({
      title: t('deployment.Rollback'),
      content: t('deployment.RollbackConfirm', {
        revisionNumber: revisionLabel,
      }),
      okText: t('deployment.Rollback'),
      okButtonProps: {
        danger: true,
      },
      onOk: () => {
        return new Promise<void>((resolve) => {
          setRollingBackRevisionId(revision.id);
          commitRollback({
            variables: {
              input: {
                id: toLocalId(deployment.id),
                activeRevisionId: toLocalId(revision.id),
              },
            },
            onCompleted: (_res, errors) => {
              setRollingBackRevisionId(null);
              if (errors && errors.length > 0) {
                logger.error(errors[0]);
                message.error(errors[0]?.message ?? t('general.ErrorOccurred'));
                resolve();
                return;
              }
              upsertNotification({
                open: true,
                duration: 4.5,
                title: t('deployment.RollbackSuccess', {
                  revisionNumber: revisionLabel,
                }),
              });
              handleRefresh();
              resolve();
            },
            onError: (error) => {
              setRollingBackRevisionId(null);
              logger.error(error);
              message.error(error?.message ?? t('general.ErrorOccurred'));
              resolve();
            },
          });
        });
      },
    });
  };

  const columns: BAIColumnType<RevisionNode>[] = [
    {
      title: t('deployment.RevisionNumber'),
      dataIndex: 'revisionNumber',
      key: 'revisionNumber',
      fixed: 'left',
      render: (_value, record) => {
        const isCurrent = record.id === currentRevisionId;
        return (
          <BAINameActionCell
            title={
              <BAIFlex gap="xs" align="center">
                <Typography.Text strong={isCurrent}>
                  {record.name ?? '-'}
                </Typography.Text>
                {isCurrent ? (
                  <Tag color={token.colorPrimary}>
                    {t('deployment.Current')}
                  </Tag>
                ) : null}
              </BAIFlex>
            }
            showActions="always"
            actions={[
              {
                key: 'rollback',
                title: t('deployment.Rollback'),
                icon: <UndoOutlined />,
                disabled:
                  isCurrent ||
                  isDeploymentDestroying ||
                  rollingBackRevisionId === record.id,
                onClick: () => handleRollback(record),
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
      key: 'runtimeVariant',
      dataIndex: 'runtimeVariant',
      render: (_value, record) =>
        record.modelRuntimeConfig?.runtimeVariant ?? '-',
    },
    {
      title: t('deployment.Image'),
      key: 'image',
      render: (_value, record) => {
        const canonicalName = record.imageV2?.identity?.canonicalName;
        if (!canonicalName) return '-';
        return (
          <Typography.Text
            copyable={{ text: canonicalName }}
            ellipsis={{ tooltip: canonicalName }}
            style={{ maxWidth: 240 }}
          >
            {canonicalName}
          </Typography.Text>
        );
      },
    },
    {
      title: t('deployment.ClusterSize'),
      key: 'clusterSize',
      render: (_value, record) => {
        const mode = record.clusterConfig?.mode;
        const size = record.clusterConfig?.size;
        if (size == null) return '-';
        return mode ? `${size} (${mode})` : `${size}`;
      },
    },
  ];

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
  ];

  const filterValue: GraphQLFilter | undefined = queryParams.rvFilter
    ? (parseRevisionFilter(queryParams.rvFilter) ?? undefined)
    : undefined;

  return (
    <>
      <BAIFlex
        justify="between"
        align="center"
        gap="xs"
        style={{ marginBottom: 12 }}
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
