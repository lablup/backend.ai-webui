import BAIJSONViewerModal from './BAIJSONViewerModal';
import QuestionIconWithTooltip from './QuestionIconWithTooltip';
import SessionDetailDrawer from './SessionDetailDrawer';
import { WarningOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Button, Tag, theme, Typography } from 'antd';
import {
  BAITable,
  filterOutNullAndUndefined,
  filterOutEmpty,
  BAIColumnType,
  BAIFlex,
  BAIUnmountAfterClose,
  toLocalId,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import _ from 'lodash';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';
import {
  ReplicaListFragment$data,
  ReplicaListFragment$key,
} from 'src/__generated__/ReplicaListFragment.graphql';
import { useBAISettingUserState } from 'src/hooks/useBAISetting';

export type ReplicaInList = NonNullable<
  NonNullable<ReplicaListFragment$data>[number]
>;

interface ReplicaListProps {
  replicasFrgmt?: ReplicaListFragment$key;
}

const ReplicaList: React.FC<ReplicaListProps> = ({ replicasFrgmt }) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [selectedSessionId, setSelectedSessionId] = useState<string>();
  const [detailDataForJSONModal, setDetailDataForJSONModal] = useState<any>();
  const [detailModalTitle, setDetailModalTitle] = useState<string>('');

  const replicas = useFragment(
    graphql`
      fragment ReplicaListFragment on ModelReplica @relay(plural: true) {
        id
        revision {
          id
          name
        }
        sessionId
        readinessStatus
        livenessStatus
        weight
        detail
        createdAt
      }
    `,
    replicasFrgmt,
  );

  const filteredReplicas = filterOutNullAndUndefined(replicas);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'HEALTHY':
        return 'green';
      case 'UNHEALTHY':
        return 'red';
      case 'DEGRADED':
        return 'orange';
      case 'NOT_CHECKED':
        return 'default';
      default:
        return 'blue';
    }
  };

  const parsedDetails = _.map(filteredReplicas, (row) => {
    const parsedDetail = JSON.parse(row?.detail || '{}');
    return {
      parsedDetail,
      hasError:
        _.isArray(parsedDetail.errors) && parsedDetail.errors.length > 0,
      hasNonErrorLog: !parsedDetail.errors && !!parsedDetail.message,
    };
  });

  const columns = filterOutEmpty<BAIColumnType<ReplicaInList>>([
    {
      key: 'id',
      title: t('deployment.ReplicaID'),
      dataIndex: 'id',
      render: (id, row, idx) => {
        const { parsedDetail, hasError, hasNonErrorLog } =
          parsedDetails[idx] || {};
        return (
          <Typography.Text>
            {toLocalId(id) || '-'}
            {(hasError || hasNonErrorLog) && (
              <Button
                size="small"
                type="text"
                icon={hasError ? <WarningOutlined /> : <InfoCircleOutlined />}
                style={{
                  color: hasError ? token.colorError : token.colorIcon,
                }}
                onClick={() => {
                  setDetailDataForJSONModal(parsedDetail);
                  setDetailModalTitle(
                    hasError
                      ? t('deployment.ReplicaError')
                      : t('deployment.ReplicaLog'),
                  );
                }}
              />
            )}
          </Typography.Text>
        );
      },
    },
    {
      key: 'sessionId',
      title: t('deployment.SessionID'),
      dataIndex: 'sessionId',
      render: (sessionId) => (
        <Typography.Link onClick={() => setSelectedSessionId(sessionId)}>
          {sessionId}
        </Typography.Link>
      ),
    },
    {
      key: 'readinessStatus',
      title: (
        <BAIFlex gap={'xxs'}>
          {t('deployment.ReadinessStatus')}
          <QuestionIconWithTooltip
            title={t('deployment.ReadinessStatusDesc')}
          />
        </BAIFlex>
      ),
      dataIndex: 'readinessStatus',
      render: (status) => (
        <Tag color={getStatusColor(status)}>{status || 'Unknown'}</Tag>
      ),
    },
    {
      key: 'livenessStatus',
      title: (
        <BAIFlex gap={'xxs'}>
          {t('deployment.LivenessStatus')}
          <QuestionIconWithTooltip title={t('deployment.LivenessStatusDesc')} />
        </BAIFlex>
      ),
      dataIndex: 'livenessStatus',
      render: (status) => (
        <Tag color={getStatusColor(status)}>{status || 'Unknown'}</Tag>
      ),
    },
    {
      key: 'weight',
      title: t('deployment.Weight'),
      dataIndex: 'weight',
      render: (weight) => (
        <BAIFlex gap={'xxs'}>
          <Typography.Text>{weight}</Typography.Text>
          {/* TODO: Show Traffic Ratio after server gives totalWeight */}
          {/* <Typography.Text type="secondary">
            (
            {totalWeight
              ? `${toFixedFloorWithoutTrailingZeros((weight / totalWeight) * 100, 1)}%`
              : '0%'}
            )
          </Typography.Text> */}
        </BAIFlex>
      ),
    },
    {
      key: 'revisionName',
      title: t('deployment.RevisionName'),
      dataIndex: ['revision', 'name'],
      render: (name) => <Typography.Text>{name || '-'}</Typography.Text>,
      defaultHidden: true,
    },
    {
      key: 'revisionId',
      title: t('deployment.RevisionID'),
      dataIndex: ['revision', 'id'],
      render: (id) => <Typography.Text>{toLocalId(id) || '-'}</Typography.Text>,
      defaultHidden: true,
    },
    {
      key: 'createdAt',
      title: t('deployment.CreatedAt'),
      dataIndex: 'createdAt',
      render: (createdAt) => (
        <Typography.Text>{dayjs(createdAt).format('LLL')}</Typography.Text>
      ),
    },
  ]);

  const [columnOverrides, setColumnOverrides] = useBAISettingUserState(
    'table_column_overrides.ReplicaList',
  );

  return (
    <>
      <BAITable
        resizable
        columns={columns}
        dataSource={filteredReplicas}
        rowKey="id"
        size="small"
        tableSettings={{
          columnOverrides: columnOverrides,
          onColumnOverridesChange: setColumnOverrides,
        }}
      />
      <BAIUnmountAfterClose>
        <SessionDetailDrawer
          open={!!selectedSessionId}
          sessionId={selectedSessionId}
          onClose={() => {
            setSelectedSessionId(undefined);
          }}
        />
      </BAIUnmountAfterClose>
      <BAIJSONViewerModal
        open={!!detailDataForJSONModal}
        title={detailModalTitle}
        json={detailDataForJSONModal}
        onCancel={() => {
          setDetailDataForJSONModal(undefined);
          setDetailModalTitle('');
        }}
      />
    </>
  );
};

export default ReplicaList;
