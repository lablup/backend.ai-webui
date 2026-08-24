import {
  BAIModelDeploymentNodesFragment$data,
  BAIModelDeploymentNodesFragment$key,
} from '../../__generated__/BAIModelDeploymentNodesFragment.graphql';
import { filterOutEmpty, filterOutNullAndUndefined } from '../../helper';
import { useBAIi18n } from '../../hooks/useBAIi18n';
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
  BAITable,
  BAITableProps,
} from '../Table';
import BAIDeploymentOwnerInfo from './BAIDeploymentOwnerInfo';
import BAIDeploymentTagChips from './BAIDeploymentTagChips';
import { Link } from '@astryxdesign/core/Link';
import { Text } from '@astryxdesign/core/Text';
import { Tooltip } from '@astryxdesign/core/Tooltip';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import { CircleHelp } from 'lucide-react';
import React from 'react';
import { graphql, useFragment } from 'react-relay';

export type ModelDeploymentNodeInList = NonNullable<
  BAIModelDeploymentNodesFragment$data[number]
>;

/**
 * Sortable column keys, in the same camelCase form every other table uses
 * (see `AdminDeploymentPresetTable`). A sortable column's `dataIndex` matches
 * an entry here, and callers bridge these strings to the server
 * `DeploymentOrderField` enum with the shared `convertToOrderBy` helper
 * (`createdAt` → `CREATED_AT`, `tag` → `TAG`, …). `updatedAt` is
 * intentionally omitted because the server enum does not include it.
 */
const availableDeploymentSorterKeys = [
  'name',
  'createdAt',
  'domain',
  'project',
  'resourceGroup',
  'tag',
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
}

const BAIModelDeploymentNodes: React.FC<BAIModelDeploymentNodesProps> = ({
  deploymentsFrgmt,
  customizeColumns,
  disableSorter,
  onChangeOrder,
  ...tableProps
}) => {
  'use memo';
  const { t } = useBAIi18n();

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
        dataIndex: 'name',
        sorter: isEnableSorter('name'),
        render: (_value, record) => (
          <BAINameActionCell
            title={record.metadata?.name ?? '-'}
            showActions="always"
          />
        ),
      },
      {
        key: 'currentRevisionNumber',
        title: (
          <BAIFlex gap="xxs" align="center">
            {t('comp:BAIModelDeploymentNodes.RevisionNumber')}
            <Tooltip
              content={t('comp:BAIModelDeploymentNodes.RevisionNumberTooltip')}
            >
              <Text color="placeholder" style={{ cursor: 'help' }}>
                <CircleHelp size="1em" />
              </Text>
            </Tooltip>
          </BAIFlex>
        ),
        render: (__, record) => {
          const revision = record.currentRevision;
          if (revision?.revisionNumber == null) {
            return <Text color="secondary">-</Text>;
          }
          return <Text>{`#${revision.revisionNumber}`}</Text>;
        },
      },
      {
        key: 'status',
        title: t('comp:BAIModelDeploymentNodes.Lifecycle'),
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
              content={t('comp:BAIModelDeploymentNodes.ReplicaSummaryTooltip')}
            >
              <Text color="placeholder" style={{ cursor: 'help' }}>
                <CircleHelp size="1em" />
              </Text>
            </Tooltip>
          </BAIFlex>
        ),
        render: (__, record) => {
          const running = record.runningReplicas?.count ?? 0;
          const desired = record.replicaState?.desiredReplicaCount ?? 0;
          return (
            <Text>
              {t('comp:BAIModelDeploymentNodes.HealthySummary', {
                healthy: running,
                total: desired,
              })}
            </Text>
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
            return <Text color="secondary">-</Text>;
          }
          return (
            <BAIText
              ellipsis={{ tooltip: modelName }}
              style={{ maxWidth: 200 }}
            >
              {modelName}
            </BAIText>
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
        dataIndex: 'tag',
        sorter: isEnableSorter('tag'),
        render: (__, record) => (
          <BAIDeploymentTagChips
            metadataFrgmt={record.metadata}
            stopRowClick
            fallback={<Text color="secondary">-</Text>}
          />
        ),
      },
      {
        key: 'projectId',
        title: t('comp:BAIModelDeploymentNodes.Project'),
        defaultHidden: true,
        dataIndex: 'project',
        sorter: isEnableSorter('project'),
        render: (__, record) => {
          const projectId = record.metadata?.projectId;
          if (!projectId) {
            return <Text color="secondary">-</Text>;
          }
          const projectName = record.metadata?.projectV2?.basicInfo?.name;
          if (!projectName) {
            return <BAIId globalId={projectId} copyable />;
          }
          return (
            <>
              <BAIText
                ellipsis={{ tooltip: projectName }}
                style={{ maxWidth: 160 }}
              >
                {projectName}
              </BAIText>
              &nbsp;
              <Text color="secondary">
                (<BAIId globalId={projectId} copyable type="secondary" />)
              </Text>
            </>
          );
        },
      },
      {
        key: 'domainName',
        title: t('comp:BAIModelDeploymentNodes.DomainName'),
        defaultHidden: true,
        dataIndex: 'domain',
        sorter: isEnableSorter('domain'),
        render: (__, record) => {
          const domain = record.metadata?.domainName;
          return domain ? (
            <Text>{domain}</Text>
          ) : (
            <Text color="secondary">-</Text>
          );
        },
      },
      {
        key: 'resourceGroup',
        title: t('comp:BAIModelDeploymentNodes.ResourceGroup'),
        defaultHidden: true,
        dataIndex: 'resourceGroup',
        sorter: isEnableSorter('resourceGroup'),
        render: (__, record) => {
          const resourceGroup = record.metadata?.resourceGroupName;
          return resourceGroup ? (
            <Text>{resourceGroup}</Text>
          ) : (
            <Text color="secondary">-</Text>
          );
        },
      },
      {
        key: 'currentRevisionId',
        title: t('comp:BAIModelDeploymentNodes.CurrentRevisionID'),
        defaultHidden: true,
        render: (__, record) =>
          record.currentRevisionId ? (
            <BAIText
              copyable
              ellipsis={{ tooltip: true }}
              monospace
              style={{ maxWidth: 160 }}
            >
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
            return <Text color="secondary">-</Text>;
          }
          return (
            <Link href={url} target="_blank" rel="noreferrer">
              {url}
            </Link>
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
        dataIndex: 'updatedAt',
        sorter: isEnableSorter('updatedAt'),
        render: (_, record) =>
          record.metadata?.updatedAt
            ? dayjs(record.metadata.updatedAt).format('lll')
            : '-',
      },
      {
        key: 'createdAt',
        title: t('comp:BAIModelDeploymentNodes.CreatedAt'),
        dataIndex: 'createdAt',
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
