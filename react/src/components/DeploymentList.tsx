import ResourceNumber from './ResourceNumber';
import WebUILink from './WebUILink';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Tag, theme, Tooltip, Typography } from 'antd';
import {
  BAIColumnType,
  BAIFlex,
  BAITable,
  BAITablePaginationConfig,
  BAITableProps,
  filterOutEmpty,
  filterOutNullAndUndefined,
  toLocalId,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import _ from 'lodash';
import { ExternalLinkIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import {
  DeploymentListFragment$data,
  DeploymentListFragment$key,
} from 'src/__generated__/DeploymentListFragment.graphql';
import { useSuspendedBackendaiClient } from 'src/hooks';

type ModelDeployment = NonNullable<
  NonNullable<DeploymentListFragment$data>[number]
>;
interface DeploymentListProps
  extends Omit<BAITableProps<ModelDeployment>, 'dataSource' | 'columns'> {
  deploymentsFragment: DeploymentListFragment$key;
  pagination: BAITablePaginationConfig;
}

const DeploymentList: React.FC<DeploymentListProps> = ({
  deploymentsFragment,
  pagination,
  ...tableProps
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const baiClient = useSuspendedBackendaiClient();

  const deployments = useFragment(
    graphql`
      fragment DeploymentListFragment on ModelDeployment @relay(plural: true) {
        id
        metadata {
          name
          createdAt
          updatedAt
          tags
        }
        networkAccess {
          endpointUrl
          openToPublic
        }
        revision {
          id
          name
          clusterConfig {
            size
          }
          resourceConfig {
            resourceSlots
            resourceOpts
          }
        }
        replicaState {
          desiredReplicaCount
        }
        defaultDeploymentStrategy {
          type
        }
        createdUser {
          email
        }
      }
    `,
    deploymentsFragment,
  );

  const filteredDeployments = filterOutNullAndUndefined(deployments);
  const columns = _.map(
    filterOutEmpty<BAIColumnType<ModelDeployment>>([
      {
        title: t('deployment.DeploymentName'),
        key: 'name',
        dataIndex: ['metadata', 'name'],
        fixed: 'left',
        render: (name, row) => (
          <WebUILink to={`/deployment/${toLocalId(row.id)}`}>{name}</WebUILink>
        ),
      },
      {
        title: t('deployment.EndpointURL'),
        key: 'endpointUrl',
        dataIndex: ['networkAccess', 'endpointUrl'],
        render: (url) => (
          <BAIFlex gap={'xxs'}>
            {url ? (
              <>
                <Typography.Text>{url}</Typography.Text>
                <Typography.Text copyable={{ text: url }} />
                <a
                  href={url}
                  title=""
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Tooltip title={t('common.OpenInNewTab')}>
                    <ExternalLinkIcon />
                  </Tooltip>
                </a>
              </>
            ) : (
              '-'
            )}
          </BAIFlex>
        ),
      },
      {
        title: t('deployment.Public'),
        key: 'openToPublic',
        dataIndex: ['networkAccess', 'openToPublic'],
        render: (openToPublic) =>
          openToPublic ? (
            <CheckOutlined style={{ color: token.colorSuccess }} />
          ) : (
            <CloseOutlined style={{ color: token.colorTextSecondary }} />
          ),
      },
      {
        title: t('deployment.Tags'),
        dataIndex: ['metadata', 'tags'],
        key: 'tags',
        render: (tags) => _.map(tags, (tag) => <Tag key={tag}>{tag}</Tag>),
      },
      {
        title: t('deployment.NumberOfDesiredReplicas'),
        key: 'desiredReplicaCount',
        dataIndex: ['replicaState', 'desiredReplicaCount'],
        render: (count) => count,
        defaultHidden: true,
      },
      {
        title: t('deployment.Resources'),
        dataIndex: ['revision', 'resourceConfig', 'resourceSlots'],
        key: 'resourceSlots',
        render: (resourceSlots) => (
          <BAIFlex direction="row" gap="xs">
            {_.map(JSON.parse(resourceSlots || '{}'), (value, key) => (
              <ResourceNumber key={key} type={key} value={value.toString()} />
            ))}
          </BAIFlex>
        ),
        defaultHidden: true,
      },
      {
        title: t('deployment.ClusterSize'),
        dataIndex: ['revision', 'clusterConfig', 'size'],
        key: 'clusterSize',
        render: (size) => <Typography.Text>{size}</Typography.Text>,

        defaultHidden: true,
      },
      {
        title: t('deployment.DefaultDeploymentStrategy'),
        dataIndex: ['defaultDeploymentStrategy', 'type'],
        key: 'type',
        render: (type) => (
          <Tag
            color={
              type === 'ROLLING'
                ? 'default'
                : type === 'BLUE_GREEN'
                  ? 'blue'
                  : 'yellow'
            }
          >
            {type}
          </Tag>
        ),
      },
      {
        title: t('deployment.RevisionName'),
        dataIndex: ['revision', 'name'],
        key: 'revisionName',
        render: (name, row) => (
          <WebUILink to={`/deployment/revision/${row.id}`}>{name}</WebUILink>
        ),
        defaultHidden: true,
      },
      {
        title: t('deployment.CreatedAt'),
        dataIndex: ['metadata', 'createdAt'],
        key: 'createdAt',
        render: (createdAt) => {
          return dayjs(createdAt).format('ll LT');
        },
      },
      {
        title: t('deployment.UpdatedAt'),
        dataIndex: ['metadata', 'updatedAt'],
        key: 'updatedAt',
        render: (updatedAt) => {
          return dayjs(updatedAt).format('ll LT');
        },
        defaultHidden: true,
      },
      baiClient.is_admin && {
        title: t('deployment.CreatedBy'),
        dataIndex: ['createdUser', 'email'],
        key: 'createdBy',
        render: (email) => <Typography.Text>{email}</Typography.Text>,
      },
    ]),
  );

  return (
    <BAITable
      resizable
      rowKey={'id'}
      size="small"
      dataSource={filteredDeployments}
      columns={columns}
      pagination={pagination}
      scroll={{ x: 'max-content' }}
      {...tableProps}
    />
  );
};

export default DeploymentList;
