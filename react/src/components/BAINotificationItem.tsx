import { NotificationState } from '../hooks/useBAINotification';
import Flex from './Flex';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { Button, Card, List, Progress, Typography, theme } from 'antd';
import dayjs from 'dayjs';
import _, { set } from 'lodash';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const BAINotificationItem: React.FC<{
  notification: NotificationState;
  onClickAction?: (
    e: React.MouseEvent,
    notification: NotificationState,
  ) => void;
  showDate?: boolean;
}> = ({ notification, onClickAction, showDate }) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [showExtraDescription, setShowExtraDescription] = useState(false);
  return (
    <List.Item>
      <Flex direction="column" align="stretch" gap={'xxs'}>
        <Flex
          direction="row"
          align="center"
          gap={'xs'}
          style={{
            paddingRight: token.paddingMD,
          }}
        >
          {notification.backgroundTask &&
            {
              pending: (
                <ClockCircleOutlined style={{ color: token.colorInfo }} />
              ),
              resolved: (
                <CheckCircleOutlined style={{ color: token.colorSuccess }} />
              ),
              rejected: <CloseOutlined style={{ color: token.colorError }} />,
            }[notification.backgroundTask.status]}
          <Typography.Text strong>{notification.message}</Typography.Text>
        </Flex>

        <Flex direction="row" align="end" gap={'xxs'} justify="between">
          <Typography.Text>{notification.description}</Typography.Text>
          {notification.toUrl ? (
            <Flex>
              <Typography.Link
                onClick={(e) => {
                  onClickAction && onClickAction(e, notification);
                }}
              >
                {notification.toTextKey
                  ? t(notification.toTextKey)
                  : t('notification.SeeDetail')}
              </Typography.Link>
            </Flex>
          ) : null}
          {notification.extraDescription ? (
            <Flex>
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
            </Flex>
          ) : null}
        </Flex>
        {notification.extraDescription && showExtraDescription ? (
          <Card size="small">
            <Typography.Text type="secondary" copyable>
              {notification.extraDescription}
            </Typography.Text>
          </Card>
        ) : null}

        <Flex direction="row" align="center" justify="end" gap={'sm'}>
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
            <Flex>
              <Typography.Text type="secondary">
                {dayjs(notification.created).format('lll')}
              </Typography.Text>
            </Flex>
          ) : null}
        </Flex>
      </Flex>
    </List.Item>
  );
};

export default BAINotificationItem;
