import {
  BAIModelDeploymentNodesFragment$data,
  BAIModelDeploymentNodesFragment$key,
} from '../../__generated__/BAIModelDeploymentNodesFragment.graphql';
import {
  SemanticColor,
  filterOutEmpty,
  filterOutNullAndUndefined,
  toLocalId,
  useSemanticColorMap,
} from '../../helper';
import BAITag from '../BAITag';
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
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

export type ModelDeploymentNodeInList = NonNullable<
  BAIModelDeploymentNodesFragment$data[number]
>;

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
] as const;

export const availableDeploymentSorterValues = [
  ...availableDeploymentSorterKeys,
  ...availableDeploymentSorterKeys.map((key) => `-${key}` as const),
] as const;

const isEnableSorter = (key: string) => {
  return _.includes(availableDeploymentSorterKeys, key);
};

const deploymentStatusSemanticMap: Record<string, SemanticColor> = {
  PENDING: 'info',
  SCALING: 'info',
  DEPLOYING: 'info',
  READY: 'success',
  STOPPING: 'warning',
  STOPPED: 'default',
  DESTROYING: 'warning',
  DESTROYED: 'default',
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
  const semanticColorMap = useSemanticColorMap();

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
        # creator {
        #   id
        #   basicInfo {
        #     email
        #   }
        # }
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
        key: 'status',
        title: t('comp:BAIModelDeploymentNodes.Status'),
        dataIndex: ['metadata', 'status'],
        render: (__, record) => {
          const status = record.metadata?.status;
          if (!status || status === '%future added value') {
            return '-';
          }
          return (
            <BAITag
              color={
                semanticColorMap[
                  deploymentStatusSemanticMap[status] ?? 'default'
                ]
              }
              style={{ marginRight: 0 }}
            >
              {status}
            </BAITag>
          );
        },
      },
      {
        key: 'replicas',
        title: t('comp:BAIModelDeploymentNodes.Replicas'),
        render: (__, record) => {
          const desired = record.replicaState?.desiredReplicaCount;
          if (!_.isNumber(desired)) {
            return '-';
          }
          return <span>{desired}</span>;
        },
      },
      // {
      //   key: 'basicInfo.email',
      //   title: t('comp:BAIModelDeploymentNodes.CreatedUser'),
      //   render: (__, record) => record.creator?.basicInfo?.email ?? '-',
      // },
      {
        key: 'id',
        title: t('comp:BAIModelDeploymentNodes.DeploymentID'),
        defaultHidden: true,
        render: (__, record) => (
          <BAIText copyable ellipsis monospace style={{ maxWidth: 160 }}>
            {toLocalId(record.id)}
          </BAIText>
        ),
      },
      {
        key: 'projectId',
        title: t('comp:BAIModelDeploymentNodes.ProjectID'),
        defaultHidden: true,
        render: (__, record) =>
          record.metadata?.projectId ? (
            <BAIText copyable ellipsis monospace style={{ maxWidth: 160 }}>
              {record.metadata.projectId}
            </BAIText>
          ) : (
            '-'
          ),
      },
      {
        key: 'domainName',
        title: t('comp:BAIModelDeploymentNodes.DomainName'),
        defaultHidden: true,
        render: (__, record) => record.metadata?.domainName ?? '-',
      },
      {
        key: 'tags',
        title: t('comp:BAIModelDeploymentNodes.Tags'),
        defaultHidden: true,
        render: (__, record) => {
          const tags = record.metadata?.tags ?? [];
          if (_.isEmpty(tags)) {
            return '-';
          }
          return (
            <span>
              {tags.map((tag) => (
                <BAITag key={tag} style={{ marginRight: 4 }}>
                  {tag}
                </BAITag>
              ))}
            </span>
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
        render: (__, record) =>
          record.networkAccess?.endpointUrl ? (
            <BAIText copyable ellipsis style={{ maxWidth: 220 }}>
              {record.networkAccess.endpointUrl}
            </BAIText>
          ) : (
            '-'
          ),
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
