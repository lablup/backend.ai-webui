import { ModelDeployment } from './TempDeploymentTypes';
import WebUILink from './WebUILink';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Tag, theme, Tooltip, Typography } from 'antd';
import {
  BAIColumnType,
  BAIFlex,
  BAITable,
  BAITablePaginationConfig,
  BAITableProps,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import _ from 'lodash';
import { ExternalLinkIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { filterOutEmpty, filterOutNullAndUndefined } from 'src/helper';
import { useSuspendedBackendaiClient } from 'src/hooks';

interface DeploymentListProps
  extends Omit<BAITableProps<ModelDeployment>, 'dataSource' | 'columns'> {
  deployments: ModelDeployment[];
  pagination: BAITablePaginationConfig;
}

const DeploymentList: React.FC<DeploymentListProps> = ({
  deployments,
  pagination,
  ...tableProps
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const baiClient = useSuspendedBackendaiClient();

  const filteredDeployments = filterOutNullAndUndefined(deployments);
  const columns = _.map(
    filterOutEmpty<BAIColumnType<ModelDeployment>>([
      {
        title: t('deployment.DeploymentName'),
        key: 'name',
        dataIndex: ['metadata', 'name'],
        fixed: 'left',
        render: (name, row) => (
          <WebUILink to={`/deployment/${row.id}`}>{name}</WebUILink>
        ),
        sorter: true,
      },
      {
        title: t('deployment.EndpointURL'),
        key: 'endpointUrl',
        dataIndex: ['networkAccess', 'endpointUrl'],
        render: (url) => (
          <BAIFlex gap={'xxs'}>
            <Typography.Text copyable>{url}</Typography.Text>
            <a href={url} title="" target="_blank" rel="noopener noreferrer">
              <Tooltip title={t('common.OpenInNewTab')}>
                <ExternalLinkIcon />
              </Tooltip>
            </a>
          </BAIFlex>
        ),
      },
      // {
      //   title: t('deployment.Status'),
      //   key: 'status',
      //   dataIndex: ['status'],
      // },
      {
        title: t('deployment.NumberOfReplicas'),
        key: 'desiredReplicaCount',
        dataIndex: ['replicaState', 'desiredReplicaCount'],
        render: (count) => count,
        sorter: true,
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
        sorter: true,
      },
      // {
      //   title: t('deployment.Resources'),
      //   dataIndex: ['resourceConfig', 'resourceSlots'],
      //   key: 'resourceSlots',
      //   render: (resourceSlots) => (
      //     <BAIFlex direction="row" gap="xs">
      //       {_.map(resourceSlots, (value, key) => (
      //         <ResourceNumber key={key} type={key} value={value.toString()} />
      //       ))}
      //     </BAIFlex>
      //   ),
      //   defaultHidden: true,
      // },
      {
        title: t('deployment.CreatedAt'),
        dataIndex: ['metadata', 'createdAt'],
        key: 'createdAt',
        render: (createdAt) => {
          return dayjs(createdAt).format('ll LT');
        },
        sorter: true,
      },
      {
        title: t('deployment.UpdatedAt'),
        dataIndex: ['metadata', 'updatedAt'],
        key: 'updatedAt',
        render: (updatedAt) => {
          return dayjs(updatedAt).format('ll LT');
        },
        sorter: true,
        defaultHidden: true,
      },
      baiClient.is_admin && {
        title: t('deployment.Owner'),
        dataIndex: ['createdUser', 'email'],
        key: 'owner',
        render: (email) => <Typography.Text>{email}</Typography.Text>,
      },
      {
        title: t('deployment.Tags'),
        dataIndex: ['metadata', 'tags'],
        key: 'tags',
        render: (tags) => _.map(tags, (tag) => <Tag key={tag}>{tag}</Tag>),
        defaultHidden: true,
      },
      {
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
        render: (id) => <Typography.Text>{id}</Typography.Text>,
        defaultHidden: true,
      },
      {
        title: t('deployment.PreferredDomainName'),
        dataIndex: ['networkAccess', 'preferredDomainName'],
        key: 'preferredDomainName',
        render: (name) => <Typography.Text>{name}</Typography.Text>,
        defaultHidden: true,
      },
      {
        title: t('deployment.DeploymentStrategy'),
        dataIndex: ['deploymentStrategy', 'type'],
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
        defaultHidden: true,
      },
      {
        title: t('deployment.ClusterSize'),
        dataIndex: ['clusterConfig', 'size'],
        key: 'clusterSize',
        render: (size) => <Typography.Text>{size}</Typography.Text>,
        sorter: true,
        defaultHidden: true,
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
