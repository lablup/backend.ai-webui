import {
  ConnectedKernelListFragment$data,
  ConnectedKernelListFragment$key,
} from '../../__generated__/ConnectedKernelListFragment.graphql';
import { ContainerLogModalFragment$key } from '../../__generated__/ContainerLogModalFragment.graphql';
import { filterOutEmpty, filterOutNullAndUndefined } from '../../helper';
// import BAIPropertyFilter from '../BAIPropertyFilter';
import DoubleTag from '../DoubleTag';
import UnmountAfterClose from '../UnmountAfterClose';
import ContainerLogModal from './ContainerLogModal';
import { Button, Tag, theme, Tooltip, Typography } from 'antd';
import { ColumnType } from 'antd/lib/table';
import { BAITable, BAIFlex } from 'backend.ai-ui';
import _ from 'lodash';
import { ScrollTextIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

type Kernel = NonNullable<ConnectedKernelListFragment$data[number]>;

interface ConnectedKernelListProps {
  kernelsFrgmt: ConnectedKernelListFragment$key;
  sessionFrgmtForLogModal: ContainerLogModalFragment$key;
  // fetchKey?: string;
  // get the project id of the session for <= v24.12.0.
  // projectId?: string | null;
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
  kernelsFrgmt,
  sessionFrgmtForLogModal,
}) => {
  const { t } = useTranslation();
  const [kernelIdForLogModal, setKernelIdForLogModal] = useState<string>();
  const { token } = theme.useToken();

  const kernelNodes = useFragment(
    graphql`
      fragment ConnectedKernelListFragment on KernelNode @relay(plural: true) {
        id
        row_id
        cluster_role
        status
        status_info
        agent_id
        container_id
      }
    `,
    kernelsFrgmt,
  );

  const columns = filterOutEmpty<ColumnType<Kernel>>([
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
    <BAIFlex direction="column" align="stretch" gap={'sm'}>
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
        dataSource={filterOutNullAndUndefined(kernelNodes)}
        style={{ width: '100%' }}
        // TODO: implement pagination when compute_session_node query supports pagination
        pagination={false}
      />

      <UnmountAfterClose>
        <ContainerLogModal
          open={!!kernelIdForLogModal}
          sessionFrgmt={sessionFrgmtForLogModal || null}
          defaultKernelId={kernelIdForLogModal}
          onCancel={() => {
            setKernelIdForLogModal(undefined);
          }}
        />
      </UnmountAfterClose>
    </BAIFlex>
  );
};

export default ConnectedKernelList;
