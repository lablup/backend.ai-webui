import { NotificationState } from '../hooks/useBAINotification';
import SessionActionButtons from './ComputeSessionNodeItems/SessionActionButtons';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { Card, List, Progress, Typography, theme } from 'antd';
import { BAIFlex } from 'backend.ai-ui';
import dayjs from 'dayjs';
import _ from 'lodash';
import { FolderIcon } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery, useRefetchableFragment } from 'react-relay';
import { BAISessionNotificationItemQuery } from 'src/__generated__/BAISessionNotificationItemQuery.graphql';
import { BAISessionNotificationItem_session$key } from 'src/__generated__/BAISessionNotificationItem_session.graphql';
import { useFetchKey } from 'src/hooks';

const BAISessionNotificationItem: React.FC<{
  notification: NotificationState;
  onClickAction?: (
    e: React.MouseEvent,
    notification: NotificationState,
  ) => void;
  showDate?: boolean;
  sessionFrgmt?: BAISessionNotificationItem_session$key | null;
  sessionId?: string;
}> = ({ notification, onClickAction, showDate, sessionFrgmt, sessionId }) => {
  const [
    fetchKey,
    //  updateFetchKey
  ] = useFetchKey();
  const sessionQueryRef = useLazyLoadQuery<BAISessionNotificationItemQuery>(
    graphql`
      query BAISessionNotificationItemQuery($sessionId: GlobalIDField!) {
        compute_session_node(id: $sessionId) {
          id
          status
          ...BAISessionNotificationItem_session
        }
      }
    `,
    { sessionId: sessionId! },
    {
      fetchPolicy:
        sessionId && !sessionFrgmt ? 'store-or-network' : 'store-only',
      fetchKey,
    },
  );
  const [session] = useRefetchableFragment(
    graphql`
      fragment BAISessionNotificationItem_session on ComputeSessionNode
      @refetchable(queryName: "BAISessionNotificationItemSessionRefetchQuery") {
        status
        ...SessionActionButtonsFragment
      }
    `,
    sessionFrgmt ||
      (sessionQueryRef.compute_session_node as BAISessionNotificationItem_session$key),
  );

  // const reFetchSession = () => {
  //   //TODO: use refetch of useRefetchableFragment after node(id:) works
  //   updateFetchKey();
  // };

  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [showExtraDescription, setShowExtraDescription] = useState(false);

  const explicitIcon = notification.icon === 'folder' ? <FolderIcon /> : null;
  const icon =
    explicitIcon ||
    (notification.backgroundTask &&
      {
        pending: <ClockCircleOutlined style={{ color: token.colorInfo }} />,
        resolved: <CheckCircleOutlined style={{ color: token.colorSuccess }} />,
        rejected: <CloseCircleOutlined style={{ color: token.colorError }} />,
      }[notification.backgroundTask.status]) ||
    (notification.type === 'error' ? (
      <CloseCircleOutlined style={{ color: token.colorError }} />
    ) : notification.type === 'success' ? (
      <CheckCircleOutlined style={{ color: token.colorSuccess }} />
    ) : null);
  return (
    <List.Item>
      <BAIFlex direction="column" align="stretch" gap={'xxs'}>
        {session.status}
        <SessionActionButtons sessionFrgmt={session} />
        {/* <Button onClick={() => reFetchSession()}>Refetch</Button> */}
        <BAIFlex
          direction="row"
          align="start"
          gap={'xs'}
          style={{
            paddingRight: token.paddingMD,
          }}
        >
          {icon && <BAIFlex style={{ height: 22 }}>{icon}</BAIFlex>}
          <Typography.Paragraph
            style={{
              fontWeight: 500,
            }}
          >
            {_.isString(notification.message)
              ? _.truncate(notification.message, {
                  length: 200,
                })
              : notification.message}
          </Typography.Paragraph>
        </BAIFlex>
        <BAIFlex direction="row" align="end" gap={'xxs'} justify="between">
          <Typography.Paragraph>
            {_.isString(notification.description)
              ? _.truncate(notification.description, {
                  length: 300,
                })
              : notification.description}
          </Typography.Paragraph>
          {notification.to ? (
            <BAIFlex>
              <Typography.Link
                onClick={(e) => {
                  onClickAction && onClickAction(e, notification);
                }}
              >
                {notification.toText ??
                  notification.toTextKey ??
                  t('notification.SeeDetail')}
              </Typography.Link>
            </BAIFlex>
          ) : null}
          {notification.extraDescription ? (
            <BAIFlex>
              <Typography.Link
                onClick={(e) => {
                  // onClickAction && onClickAction(e, notification);
                  setShowExtraDescription(!showExtraDescription);
                }}
              >
                {notification.toTextKey
                  ? t(notification.toTextKey)
                  : t('notification.SeeDetail')}
              </Typography.Link>
            </BAIFlex>
          ) : null}
        </BAIFlex>
        {notification.extraDescription && showExtraDescription ? (
          <Card size="small">
            <Typography.Text type="secondary" copyable>
              {notification.extraDescription}
            </Typography.Text>
          </Card>
        ) : null}

        <BAIFlex direction="row" align="center" justify="end" gap={'sm'}>
          {notification.backgroundTask &&
          _.isNumber(notification.backgroundTask.percent) ? (
            <Progress
              size="small"
              showInfo={false}
              percent={notification.backgroundTask.percent}
              strokeColor={
                notification.backgroundTask.status === 'rejected'
                  ? token.colorTextDisabled
                  : undefined
              }
              style={{
                margin: 0,
                opacity:
                  notification.backgroundTask.status === 'resolved' && showDate
                    ? 0
                    : 1,
              }}

              // status={item.progressStatus}
            />
          ) : null}
          {showDate ? (
            <BAIFlex>
              <Typography.Text type="secondary">
                {dayjs(notification.created).format('lll')}
              </Typography.Text>
            </BAIFlex>
          ) : null}
        </BAIFlex>
      </BAIFlex>
    </List.Item>
  );
};

export default BAISessionNotificationItem;
