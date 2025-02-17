import { useSuspendedBackendaiClient } from '../../hooks';
import { useCurrentUserRole } from '../../hooks/backendai';
import BAIModal from '../BAIModal';
import DoubleTag from '../DoubleTag';
import Flex from '../Flex';
import { statusTagColor } from './SessionStatusTag';
import { SessionStatusDetailModalFragment$key } from './__generated__/SessionStatusDetailModalFragment.graphql';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import {
  Descriptions,
  ModalProps,
  Tag,
  Timeline,
  Typography,
  theme,
} from 'antd';
import graphql from 'babel-plugin-relay/macro';
import dayjs from 'dayjs';
import _ from 'lodash';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { useFragment } from 'react-relay';

export const statusInfoTagColor = {
  'idle-timeout': 'green',
  'user-requested': 'green',
  scheduled: 'green',
  'self-terminated': 'green',
  'failed-to-start': 'red',
  'creation-failed': 'red',
  'no-available-instances': 'red',
};

type Predicates = {
  name: string;
  msg: string;
};

type ErrorCollection = {
  name: string;
  repr: string;
  src: string;
  agent_id?: string;
  traceback?: string;
};

type StatusData = {
  kernel?: {
    exit_code: number | string;
  };
  session?: {
    status: string;
  };
  scheduler?: {
    failed_predicates: Array<Predicates>;
    passed_predicates: Array<Predicates>;
    retries: number;
    last_try: string;
    msg?: string;
  };
  error?: {
    name: string;
    repr: string;
    src: string;
    collection: Array<ErrorCollection>;
  };
};

interface SessionStatusDetailModalProps extends ModalProps {
  sessionFrgmt: SessionStatusDetailModalFragment$key;
}

const SessionStatusDetailModal: React.FC<SessionStatusDetailModalProps> = ({
  sessionFrgmt,
  ...modalProps
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const userRole = useCurrentUserRole();
  const baiClient = useSuspendedBackendaiClient();

  const session = useFragment(
    graphql`
      fragment SessionStatusDetailModalFragment on ComputeSessionNode {
        id
        status
        status_info
        status_data
        starts_at
      }
    `,
    sessionFrgmt,
  );
  console.log(session);
  const statusData: StatusData = JSON.parse(session.status_data || '{}');
  console.log('#', statusData);

  return (
    <BAIModal
      title={
        <>
          {t('session.StatusInfo')}
          <DoubleTag
            values={[
              {
                label: session.status ?? '',
                color: session.status
                  ? _.get(statusTagColor, session.status)
                  : undefined,
                style: { fontWeight: 'normal' },
              },
              {
                label: session.status_info ?? '',
                color: session.status_info
                  ? _.get(statusInfoTagColor, session.status_info)
                  : undefined,
                style: { borderStyle: 'dashed', fontWeight: 'normal' },
              },
            ]}
          />
        </>
      }
      footer={null}
      width={450}
      {...modalProps}
    >
      <Descriptions
        size="small"
        // labelStyle={{ width: '40%' }}
        title={t('session.StatusDetail')}
        layout="vertical"
        column={2}
      >
        {statusData?.kernel ? (
          <Descriptions.Item label={t('session.KernelExitCode')} span={1}>
            {statusData.kernel.exit_code}
          </Descriptions.Item>
        ) : null}
        {statusData?.session ? (
          <Descriptions.Item label={t('session.SessionStatus')} span={1}>
            {statusData.session?.status}
          </Descriptions.Item>
        ) : null}
        {statusData?.scheduler ? (
          <>
            <Descriptions.Item label={t('session.TotalRetries')} span={1}>
              {statusData.scheduler?.retries}
            </Descriptions.Item>
            <Descriptions.Item label={t('session.LastTry')} span={1}>
              {dayjs(statusData.scheduler?.last_try).format('lll')}
            </Descriptions.Item>
            <Descriptions.Item label={t('session.Message')} span={2}>
              {statusData.scheduler?.msg}
            </Descriptions.Item>
            <Descriptions.Item>
              <Descriptions title={t('session.PredicateChecks')} column={1}>
                <Descriptions.Item>
                  <Timeline
                    items={_.concat(
                      _.map(statusData.scheduler?.failed_predicates, (p) => {
                        return {
                          dot: <CloseCircleOutlined />,
                          color: token.colorError,
                          children: (
                            <Flex direction="column" align="stretch">
                              <Typography.Text>{p.name}</Typography.Text>
                              <Typography.Text type="secondary">
                                {p.msg}
                              </Typography.Text>
                            </Flex>
                          ),
                        };
                      }),
                      _.map(statusData.scheduler?.passed_predicates, (p) => {
                        return {
                          dot: <CheckCircleOutlined />,
                          color: token.colorSuccess,
                          children: <Typography.Text>{p.name}</Typography.Text>,
                        };
                      }),
                    )}
                  />
                </Descriptions.Item>
              </Descriptions>
            </Descriptions.Item>
          </>
        ) : null}
        {statusData?.error
          ? _.map(statusData?.error?.collection ?? statusData, (collection) => {
              return (
                <Fragment key={collection.name}>
                  <Descriptions.Item label={t('dialog.error.Error')} span={2}>
                    <Tag color="red">{collection.name}</Tag>
                  </Descriptions.Item>
                  {(userRole === 'superadmin' ||
                    !baiClient._config.hideAgents) &&
                    collection?.agent_id && (
                      <Descriptions.Item label={t('session.AgentId')}>
                        {collection?.agent_id}
                      </Descriptions.Item>
                    )}
                  <Descriptions.Item label={t('session.Message')} span={2}>
                    {collection.repr}
                  </Descriptions.Item>
                  {collection?.traceback && (
                    <Descriptions.Item label={t('session.Traceback')} span={2}>
                      <pre>{collection?.traceback}</pre>
                    </Descriptions.Item>
                  )}
                </Fragment>
              );
            })
          : null}
      </Descriptions>
    </BAIModal>
  );
};

export default SessionStatusDetailModal;
