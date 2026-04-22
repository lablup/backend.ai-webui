/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ModelRevisionOrderBy } from '../__generated__/DeploymentRevisionHistoryTabRefetchQuery.graphql';
import { DeploymentRevisionHistoryTabRollbackMutation } from '../__generated__/DeploymentRevisionHistoryTabRollbackMutation.graphql';
import type {
  DeploymentRevisionHistoryTab_deployment$data,
  DeploymentRevisionHistoryTab_deployment$key,
} from '../__generated__/DeploymentRevisionHistoryTab_deployment.graphql';
import { convertToOrderBy } from '../helper';
import { UndoOutlined } from '@ant-design/icons';
import { App, Tag, Typography, theme } from 'antd';
import {
  BAIButton,
  BAIFetchKeyButton,
  BAIFlex,
  BAITable,
  filterOutNullAndUndefined,
  toLocalId,
  useBAILogger,
} from 'backend.ai-ui';
import type { BAIColumnType } from 'backend.ai-ui';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import { parseAsInteger, parseAsStringLiteral, useQueryStates } from 'nuqs';
import React, { useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useMutation, useRefetchableFragment } from 'react-relay';
import { useSetBAINotification } from 'src/hooks/useBAINotification';

const revisionOrderValues = [
  'REVISION_NUMBER_ASC',
  'REVISION_NUMBER_DESC',
  'CREATED_AT_ASC',
  'CREATED_AT_DESC',
] as const;

type ModelDeploymentData = DeploymentRevisionHistoryTab_deployment$data;
type RevisionNode = NonNullable<
  NonNullable<
    NonNullable<ModelDeploymentData['revisionHistory']>['edges'][number]
  >['node']
>;

export interface DeploymentRevisionHistoryTabProps {
  deploymentFrgmt: DeploymentRevisionHistoryTab_deployment$key;
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
> = ({ deploymentFrgmt }) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { modal, message } = App.useApp();
  const { logger } = useBAILogger();
  const { upsertNotification } = useSetBAINotification();
  const [isPendingRefetch, startRefetchTransition] = useTransition();
  const [rollingBackRevisionId, setRollingBackRevisionId] = useState<
    string | null
  >(null);

  const [queryParams, setQueryParams] = useQueryStates(
    {
      current: parseAsInteger.withDefault(1),
      pageSize: parseAsInteger.withDefault(10),
      order: parseAsStringLiteral(revisionOrderValues).withDefault(
        'REVISION_NUMBER_DESC',
      ),
    },
    {
      history: 'replace',
      urlKeys: {
        current: 'rCurrent',
        pageSize: 'rPageSize',
        order: 'rOrder',
      },
    },
  );

  const limit = queryParams.pageSize;
  const offset =
    queryParams.current > 1 ? (queryParams.current - 1) * limit : 0;

  const [deployment, refetch] = useRefetchableFragment(
    graphql`
      fragment DeploymentRevisionHistoryTab_deployment on ModelDeployment
      @argumentDefinitions(
        orderBy: {
          type: "[ModelRevisionOrderBy!]"
          defaultValue: [{ field: REVISION_NUMBER, direction: DESC }]
        }
        limit: { type: "Int", defaultValue: 10 }
        offset: { type: "Int", defaultValue: 0 }
      )
      @refetchable(queryName: "DeploymentRevisionHistoryTabRefetchQuery") {
        id
        currentRevisionId
        revisionHistory(orderBy: $orderBy, limit: $limit, offset: $offset) {
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
    `,
    deploymentFrgmt,
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

  const revisions: RevisionNode[] = filterOutNullAndUndefined(
    _.map(deployment?.revisionHistory?.edges, 'node'),
  );

  const doRefetch = (overrides?: {
    order?: string | null;
    limit?: number;
    offset?: number;
  }) => {
    startRefetchTransition(() => {
      refetch(
        {
          orderBy: convertToOrderBy<ModelRevisionOrderBy>(
            overrides?.order !== undefined
              ? overrides.order
              : queryParams.order,
          ),
          limit: overrides?.limit ?? limit,
          offset: overrides?.offset ?? offset,
        },
        { fetchPolicy: 'network-only' },
      );
    });
  };

  const handleRefresh = () => {
    doRefetch();
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
                id: deployment.id,
                activeRevisionId: revision.id,
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
      dataIndex: 'name',
      key: 'name',
      render: (_value, record) => {
        const isCurrent = record.id === deployment.currentRevisionId;
        return (
          <BAIFlex gap="xs" align="center">
            <Typography.Text strong={isCurrent}>
              {record.name ?? '-'}
            </Typography.Text>
            {isCurrent ? (
              <Tag color={token.colorPrimary}>{t('deployment.Current')}</Tag>
            ) : null}
          </BAIFlex>
        );
      },
    },
    {
      title: t('general.CreatedAt'),
      dataIndex: 'createdAt',
      key: 'createdAt',
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
    {
      title: t('general.Actions'),
      key: 'actions',
      fixed: 'right',
      render: (_value, record) => {
        const isCurrent = record.id === deployment.currentRevisionId;
        return (
          <BAIButton
            size="small"
            icon={<UndoOutlined />}
            disabled={isCurrent}
            loading={rollingBackRevisionId === record.id}
            onClick={() => handleRollback(record)}
          >
            {t('deployment.Rollback')}
          </BAIButton>
        );
      },
    },
  ];

  return (
    <>
      <BAIFlex
        justify="end"
        align="center"
        gap="xs"
        style={{ marginBottom: 12 }}
      >
        <BAIFetchKeyButton
          loading={isPendingRefetch}
          value=""
          onChange={() => handleRefresh()}
        />
      </BAIFlex>
      <BAITable
        rowKey="id"
        dataSource={revisions}
        columns={columns}
        loading={isPendingRefetch}
        size="small"
        scroll={{ x: 'max-content' }}
        pagination={{
          pageSize: queryParams.pageSize,
          current: queryParams.current,
          total: deployment.revisionHistory?.count ?? 0,
          showSizeChanger: true,
          onChange: (current, pageSize) => {
            const nextOffset = current > 1 ? (current - 1) * pageSize : 0;
            setQueryParams({ current, pageSize });
            doRefetch({ limit: pageSize, offset: nextOffset });
          },
        }}
        onChangeOrder={(order) => {
          setQueryParams({
            order: (order as (typeof revisionOrderValues)[number]) ?? null,
          });
          doRefetch({ order: order ?? null });
        }}
        order={queryParams.order ?? undefined}
      />
    </>
  );
};

export default DeploymentRevisionHistoryTab;
