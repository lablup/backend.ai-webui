import { ConnectedKernelListLegacyQuery } from '../../__generated__/ConnectedKernelListLegacyQuery.graphql';
import {
  ConnectedKernelListQuery,
  ConnectedKernelListQuery$data,
} from '../../__generated__/ConnectedKernelListQuery.graphql';
import { filterEmptyItem, filterNonNullItems, toGlobalId } from '../../helper';
import { useCurrentProjectValue } from '../../hooks/useCurrentProject';
// import BAIPropertyFilter from '../BAIPropertyFilter';
import BAITable from '../BAITable';
import DoubleTag from '../DoubleTag';
import Flex from '../Flex';
import UnmountModalAfterClose from '../UnmountModalAfterClose';
import ContainerLogModal from './ContainerLogModal';
import { Button, Tag, theme, Tooltip, Typography } from 'antd';
import { ColumnType } from 'antd/lib/table';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import { ScrollTextIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLazyLoadQuery } from 'react-relay';

type Kernel = NonNullable<
  NonNullable<
    NonNullable<
      NonNullable<ConnectedKernelListQuery$data['session']>['kernel_nodes']
    >['edges'][number]
  >['node']
>;

interface ConnectedKernelListProps {
  id: string;
  fetchKey?: string;
}

const kernelStatusTagColor = {
  // prepare
  PREPARING: 'blue',
  BUILDING: 'blue',
  PULLING: 'blue',
  PREPARED: 'blue',
  CREATING: 'blue',
  // running
  PENDING: 'green',
  SCHEDULED: 'green',
  RUNNING: 'green',
  RESTARTING: 'green',
  RESIZING: 'green',
  SUSPENDED: 'green',
  // terminated
  TERMINATING: 'default',
  TERMINATED: 'default',
  CANCELLED: 'default',
  // error
  ERROR: 'red',
};

const ConnectedKernelList: React.FC<ConnectedKernelListProps> = ({
  id,
  fetchKey,
}) => {
  const { t } = useTranslation();
  const currentProject = useCurrentProjectValue();
  const [kernelIdForLogModal, setKernelIdForLogModal] = useState<string>();
  const { token } = theme.useToken();

  // get the project id of the session for <= v24.12.0.
  const { session_for_project_id } =
    useLazyLoadQuery<ConnectedKernelListLegacyQuery>(
      graphql`
        query ConnectedKernelListLegacyQuery($uuid: UUID!) {
          session_for_project_id: compute_session(id: $uuid) {
            group_id
          }
        }
      `,
      {
        uuid: id,
      },
      {
        fetchPolicy: 'network-only',
      },
    );

  const { session } = useLazyLoadQuery<ConnectedKernelListQuery>(
    graphql`
      query ConnectedKernelListQuery($id: GlobalIDField!, $project_id: UUID!) {
        session: compute_session_node(id: $id, project_id: $project_id) {
          kernel_nodes {
            edges {
              node {
                id
                row_id
                cluster_role
                status
                status_info
                agent_id
                container_id
              }
            }
            count
          }
          ...ContainerLogModalFragment
        }
      }
    `,
    {
      id: toGlobalId('ComputeSessionNode', id),
      project_id: session_for_project_id?.group_id || currentProject.id,
    },
    {
      fetchPolicy: 'network-only',
      fetchKey: fetchKey,
    },
  );
  const kernelNodes = session?.kernel_nodes;

  const columns = filterEmptyItem<ColumnType<Kernel>>([
    {
      title: t('kernel.KernelId'),
      fixed: 'left',
      dataIndex: 'row_id',
      render: (row_id) => (
        <>
          <Typography.Text copyable ellipsis>
            {row_id}
          </Typography.Text>
          <Tooltip title={t('session.SeeContainerLogs')}>
            <Button
              icon={<ScrollTextIcon />}
              type="link"
              onClick={() => {
                setKernelIdForLogModal(row_id);
              }}
              style={{
                width: 'auto',
                height: 'auto',
                marginInlineStart: token.marginXXS,
                border: 'none',
              }}
            />
          </Tooltip>
        </>
      ),
    },
    {
      title: t('kernel.Role'),
      dataIndex: 'cluster_role',
      render: (role) => <Tag>{role}</Tag>,
    },
    {
      title: t('kernel.Status'),
      dataIndex: 'status',
      render: (status, record) => {
        return (
          <>
            {record?.status_info !== '' ? (
              <DoubleTag
                values={[
                  { label: status, color: _.get(kernelStatusTagColor, status) },
                  {
                    label: record?.status_info,
                    color: _.get(
                      kernelStatusTagColor,
                      record?.status_info ?? '',
                    ),
                  },
                ]}
              />
            ) : (
              <Tag color={_.get(kernelStatusTagColor, status)}>{status}</Tag>
            )}
          </>
        );
      },
    },
    {
      title: t('kernel.ContainerId'),
      dataIndex: 'container_id',
      onCell: () => ({
        style: { maxWidth: 250 },
      }),
      render: (id) =>
        _.isEmpty(id) ? (
          '-'
        ) : (
          <Typography.Text copyable ellipsis>
            {id}
          </Typography.Text>
        ),
    },
    {
      title: t('kernel.AgentId'),
      dataIndex: 'agent_id',
      render: (id) => <Typography.Text copyable>{id}</Typography.Text>,
    },
  ]);

  return (
    <Flex direction="column" align="stretch" gap={'sm'}>
      {/* TODO: implement filter when compute_session_node query supports filter */}
      {/* <BAIPropertyFilter
        filterProperties={[
          {
            key: 'agent_id',
            propertyLabel: t('kernel.AgentId'),
            type: 'string',
          },
        ]}
        value={filterString}
        onChange={(value) => {
          startFilterTransition(() => {
            setFilterString(value);
          });
        }}
      /> */}
      <BAITable
        bordered
        // loading={isPendingFilter}
        rowKey="id"
        scroll={{ x: 'max-content' }}
        columns={columns}
        dataSource={filterNonNullItems(
          kernelNodes?.edges.map((edge) => edge?.node),
        )}
        style={{ width: '100%' }}
        // TODO: implement pagination when compute_session_node query supports pagination
        pagination={false}
      />

      <UnmountModalAfterClose>
        <ContainerLogModal
          open={!!kernelIdForLogModal}
          sessionFrgmt={session || null}
          defaultKernelId={kernelIdForLogModal}
          onCancel={() => {
            setKernelIdForLogModal(undefined);
          }}
        />
      </UnmountModalAfterClose>
    </Flex>
  );
};

export default ConnectedKernelList;
