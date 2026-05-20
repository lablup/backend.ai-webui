import {
  BAIModelDeploymentNodesFragment$data,
  BAIModelDeploymentNodesFragment$key,
} from '../../__generated__/BAIModelDeploymentNodesFragment.graphql';
import { filterOutEmpty, filterOutNullAndUndefined } from '../../helper';
import BAIDeploymentStatusTag, {
  BAIDeploymentStatus,
} from '../BAIDeploymentStatusTag';
import BAIFlex from '../BAIFlex';
import BAIId from '../BAIId';
import BAIText from '../BAIText';
import BooleanTag from '../BooleanTag';
import {
  BAIColumnType,
  BAIColumnsType,
  BAINameActionCell,
  BAINameActionCellProps,
  BAITable,
  BAITableProps,
} from '../Table';
import BAIDeploymentOwnerInfo from './BAIDeploymentOwnerInfo';
import BAIDeploymentTagChips from './BAIDeploymentTagChips';
import { Tooltip, Typography } from 'antd';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

export type ModelDeploymentNodeInList = NonNullable<
  BAIModelDeploymentNodesFragment$data[number]
>;

interface DeploymentSort {
  field: string;
  order: 'ASC' | 'DESC';
}

/** Maps BAITable column keys (camelCase) → server-side enum field. */
const COLUMN_KEY_TO_FIELD: Record<string, string> = {
  name: 'NAME',
  createdAt: 'CREATED_AT',
  updatedAt: 'UPDATED_AT',
  domainName: 'DOMAIN',
  projectId: 'PROJECT',
  resourceGroup: 'RESOURCE_GROUP',
  tags: 'TAG',
};

/**
 * @deprecated Use `nameColumnActionProps` via `customizeColumns` instead.
 * Kept temporarily for backward compatibility while migrating away from
 * the prop.
 */
export type BAIModelDeploymentNodesNameColumnActionProps =
  | BAINameActionCellProps
  | ((
      value: any,
      record: ModelDeploymentNodeInList,
      index: number,
    ) => BAINameActionCellProps);

const availableDeploymentSorterKeys = [
  'name',
  'createdAt',
  'updatedAt',
  'domainName',
  'projectId',
  'resourceGroup',
  'tags',
] as const;

export const availableDeploymentSorterValues = [
  ...availableDeploymentSorterKeys,
  ...availableDeploymentSorterKeys.map((key) => `-${key}` as const),
] as const;

export type DeploymentOrderValue =
  (typeof availableDeploymentSorterValues)[number];

const isEnableSorter = (key: string) => {
  return _.includes(availableDeploymentSorterKeys, key);
};

/**
 * Convert a BAITable order string (e.g. `'-createdAt'`) to the structured
 * `DeploymentSort` shape expected by the server `DeploymentOrderBy` input.
 * Returns `undefined` for unrecognised keys so callers can safely skip
 * building the `orderBy` variable.
 */
export const tableOrderToSort = (
  order: string | null | undefined,
): DeploymentSort | undefined => {
  if (!order) return undefined;
  const descending = order.startsWith('-');
  const columnKey = descending ? order.slice(1) : order;
  const field = COLUMN_KEY_TO_FIELD[columnKey];
  if (!field) return undefined;
  return { field, order: descending ? 'DESC' : 'ASC' };
};

export interface BAIModelDeploymentNodesProps extends Omit<
  BAITableProps<ModelDeploymentNodeInList>,
  'dataSource' | 'columns' | 'onChangeOrder'
> {
  deploymentsFrgmt: BAIModelDeploymentNodesFragment$key;
  customizeColumns?: (
    baseColumns: BAIColumnsType<ModelDeploymentNodeInList>,
  ) => BAIColumnsType<ModelDeploymentNodeInList>;
  disableSorter?: boolean;
  onChangeOrder?: (
    order: (typeof availableDeploymentSorterValues)[number] | null,
  ) => void;
  /**
   * Props forwarded to the `BAINameActionCell` used in the `name` column.
   * Accepts either a static object or a function receiving the column
   * render arguments `(value, record, index)` and returning props.
   *
   * @deprecated Prefer `customizeColumns` to override the name column's
   * render. Will be removed once existing consumers migrate.
   */
  nameColumnActionProps?: BAIModelDeploymentNodesNameColumnActionProps;
}

const BAIModelDeploymentNodes: React.FC<BAIModelDeploymentNodesProps> = ({
  deploymentsFrgmt,
  customizeColumns,
  disableSorter,
  onChangeOrder,
  nameColumnActionProps,
  ...tableProps
}) => {
  'use memo';
  const { t } = useTranslation();

  const deployments = useFragment<BAIModelDeploymentNodesFragment$key>(
    graphql`
      fragment BAIModelDeploymentNodesFragment on ModelDeployment
      @relay(plural: true) {
        id
        currentRevisionId
        metadata {
          projectId
          domainName
          name
          status
          tags
          createdAt
          updatedAt
          resourceGroupName
          projectV2 @since(version: "26.4.3") {
            basicInfo {
              name
            }
            id
          }
          ...BAIDeploymentTagChips_metadata
        }
        networkAccess {
          endpointUrl
          preferredDomainName
          openToPublic
        }
        defaultDeploymentStrategy {
          type
        }
        replicaState {
          desiredReplicaCount
        }
        totalReplicas: replicas {
          count
        }
        runningReplicas: replicas(filter: { status: { equals: RUNNING } }) {
          count
        }
        currentRevision @since(version: "26.4.3") {
          id
          revisionNumber
          modelMountConfig {
            vfolder {
              id
              name
            }
          }
        }
        ...BAIDeploymentOwnerInfo_deployment
      }
    `,
    deploymentsFrgmt,
  );

  const baseColumns = _.map(
    filterOutEmpty<BAIColumnType<ModelDeploymentNodeInList>>([
      {
        key: 'name',
        title: t('comp:BAIModelDeploymentNodes.Name'),
        fixed: 'left',
        required: true,
        sorter: isEnableSorter('name'),
        render: (value, record, index) => {
          const resolvedProps =
            typeof nameColumnActionProps === 'function'
              ? nameColumnActionProps(value, record, index)
              : nameColumnActionProps;
          return (
            <BAINameActionCell
              title={record.metadata?.name ?? '-'}
              showActions="always"
              {...resolvedProps}
            />
          );
        },
      },
      {
        key: 'currentRevisionNumber',
        title: (
          <BAIFlex gap="xxs" align="center">
            {t('comp:BAIModelDeploymentNodes.RevisionNumber')}
            <Tooltip
              title={t('comp:BAIModelDeploymentNodes.RevisionNumberTooltip')}
            >
              <Typography.Text type="secondary">?</Typography.Text>
            </Tooltip>
          </BAIFlex>
        ),
        render: (__, record) => {
          const revision = record.currentRevision;
          if (revision?.revisionNumber == null) {
            return <Typography.Text type="secondary">-</Typography.Text>;
          }
          return (
            <Typography.Text>{`#${revision.revisionNumber}`}</Typography.Text>
          );
        },
      },
      {
        key: 'status',
        title: t('comp:BAIModelDeploymentNodes.Status'),
        dataIndex: ['metadata', 'status'],
        render: (__, record) => {
          const status = record.metadata?.status;
          if (!status || status === '%future added value') {
            return '-';
          }
          return (
            <BAIDeploymentStatusTag status={status as BAIDeploymentStatus} />
          );
        },
      },
      {
        key: 'replicaSummary',
        title: (
          <BAIFlex gap="xxs" align="center">
            {t('comp:BAIModelDeploymentNodes.ReplicaSummary')}
            <Tooltip
              title={t('comp:BAIModelDeploymentNodes.ReplicaSummaryTooltip')}
            >
              <Typography.Text type="secondary">?</Typography.Text>
            </Tooltip>
          </BAIFlex>
        ),
        render: (__, record) => {
          const running = record.runningReplicas?.count ?? 0;
          const desired = record.replicaState?.desiredReplicaCount ?? 0;
          const total = record.totalReplicas?.count ?? desired;
          const denominator = desired > 0 ? desired : total;
          return (
            <Typography.Text>
              {t('comp:BAIModelDeploymentNodes.HealthySummary', {
                healthy: running,
                total: denominator,
              })}
            </Typography.Text>
          );
        },
      },
      {
        key: 'model',
        title: t('comp:BAIModelDeploymentNodes.Model'),
        render: (__, record) => {
          const modelName =
            record.currentRevision?.modelMountConfig?.vfolder?.name ?? null;
          if (!modelName) {
            return <Typography.Text type="secondary">-</Typography.Text>;
          }
          return (
            <Typography.Text
              ellipsis={{ tooltip: modelName }}
              style={{ maxWidth: 200 }}
            >
              {modelName}
            </Typography.Text>
          );
        },
      },
      {
        key: 'replicas',
        title: t('comp:BAIModelDeploymentNodes.Replicas'),
        defaultHidden: true,
        render: (__, record) => {
          const desired = record.replicaState?.desiredReplicaCount;
          if (!_.isNumber(desired)) {
            return '-';
          }
          return <span>{desired}</span>;
        },
      },
      {
        key: 'id',
        title: t('comp:BAIModelDeploymentNodes.DeploymentID'),
        defaultHidden: true,
        render: (__, record) => <BAIId globalId={record.id} copyable />,
      },
      {
        key: 'tags',
        title: t('comp:BAIModelDeploymentNodes.Tags'),
        defaultHidden: true,
        sorter: isEnableSorter('tags'),
        render: (__, record) => (
          <BAIDeploymentTagChips
            metadataFrgmt={record.metadata}
            stopRowClick
            fallback={<Typography.Text type="secondary">-</Typography.Text>}
          />
        ),
      },
      {
        key: 'projectId',
        title: t('comp:BAIModelDeploymentNodes.Project'),
        defaultHidden: true,
        sorter: isEnableSorter('projectId'),
        render: (__, record) => {
          const projectId = record.metadata?.projectId;
          if (!projectId) {
            return <Typography.Text type="secondary">-</Typography.Text>;
          }
          const projectName = record.metadata?.projectV2?.basicInfo?.name;
          if (!projectName) {
            return <BAIId globalId={projectId} copyable />;
          }
          return (
            <>
              <Typography.Text
                ellipsis={{ tooltip: projectName }}
                style={{ maxWidth: 160 }}
              >
                {projectName}
              </Typography.Text>
              &nbsp;
              <Typography.Text type="secondary">
                (<BAIId globalId={projectId} copyable type="secondary" />)
              </Typography.Text>
            </>
          );
        },
      },
      {
        key: 'domainName',
        title: t('comp:BAIModelDeploymentNodes.DomainName'),
        defaultHidden: true,
        sorter: isEnableSorter('domainName'),
        render: (__, record) => {
          const domain = record.metadata?.domainName;
          return domain ? (
            <Typography.Text>{domain}</Typography.Text>
          ) : (
            <Typography.Text type="secondary">-</Typography.Text>
          );
        },
      },
      {
        key: 'resourceGroup',
        title: t('comp:BAIModelDeploymentNodes.ResourceGroup'),
        defaultHidden: true,
        sorter: isEnableSorter('resourceGroup'),
        render: (__, record) => {
          const resourceGroup = record.metadata?.resourceGroupName;
          return resourceGroup ? (
            <Typography.Text>{resourceGroup}</Typography.Text>
          ) : (
            <Typography.Text type="secondary">-</Typography.Text>
          );
        },
      },
      {
        key: 'currentRevisionId',
        title: t('comp:BAIModelDeploymentNodes.CurrentRevisionID'),
        defaultHidden: true,
        render: (__, record) =>
          record.currentRevisionId ? (
            <BAIText copyable ellipsis monospace style={{ maxWidth: 160 }}>
              {record.currentRevisionId}
            </BAIText>
          ) : (
            '-'
          ),
      },
      {
        key: 'openToPublic',
        title: t('comp:BAIModelDeploymentNodes.OpenToPublic'),
        defaultHidden: true,
        render: (__, record) => (
          <BooleanTag value={record.networkAccess?.openToPublic ?? false} />
        ),
      },
      {
        key: 'endpointUrl',
        title: t('comp:BAIModelDeploymentNodes.EndpointURL'),
        defaultHidden: true,
        render: (__, record) => {
          const url = record.networkAccess?.endpointUrl;
          if (!url) {
            return <Typography.Text type="secondary">-</Typography.Text>;
          }
          return (
            <Typography.Link href={url} target="_blank" rel="noreferrer">
              {url}
            </Typography.Link>
          );
        },
      },
      {
        key: 'preferredDomainName',
        title: t('comp:BAIModelDeploymentNodes.PreferredDomainName'),
        defaultHidden: true,
        render: (__, record) =>
          record.networkAccess?.preferredDomainName ?? '-',
      },
      {
        key: 'strategyType',
        title: t('comp:BAIModelDeploymentNodes.StrategyType'),
        defaultHidden: true,
        render: (__, record) => {
          const type = record.defaultDeploymentStrategy?.type;
          if (!type || type === '%future added value') {
            return '-';
          }
          return type;
        },
      },
      {
        key: 'owner',
        title: t('comp:BAIModelDeploymentNodes.Owner'),
        defaultHidden: true,
        render: (__, record) => (
          <BAIDeploymentOwnerInfo deploymentFrgmt={record} />
        ),
      },
      {
        key: 'updatedAt',
        title: t('comp:BAIModelDeploymentNodes.UpdatedAt'),
        defaultHidden: true,
        sorter: isEnableSorter('updatedAt'),
        render: (_, record) =>
          record.metadata?.updatedAt
            ? dayjs(record.metadata.updatedAt).format('lll')
            : '-',
      },
      {
        key: 'createdAt',
        title: t('comp:BAIModelDeploymentNodes.CreatedAt'),
        sorter: isEnableSorter('createdAt'),
        defaultSortOrder: 'descend',
        render: (_, record) =>
          record.metadata?.createdAt
            ? dayjs(record.metadata.createdAt).format('lll')
            : '-',
      },
    ]),
    (column) => {
      return disableSorter ? _.omit(column, 'sorter') : column;
    },
  );

  const allColumns = customizeColumns
    ? customizeColumns(baseColumns)
    : baseColumns;

  return (
    <BAITable<ModelDeploymentNodeInList>
      resizable
      rowKey="id"
      size="small"
      dataSource={filterOutNullAndUndefined(deployments)}
      columns={allColumns}
      scroll={{ x: 'max-content' }}
      onChangeOrder={(order) => {
        onChangeOrder?.(
          order
            ? (order as (typeof availableDeploymentSorterValues)[number])
            : null,
        );
      }}
      {...tableProps}
    />
  );
};

export default BAIModelDeploymentNodes;
