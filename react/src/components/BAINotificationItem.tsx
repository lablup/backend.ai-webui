import { NotificationState } from '../hooks/useBAINotification';
import Flex from './Flex';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { Button, List, Progress, Typography, theme } from 'antd';
import dayjs from 'dayjs';
import _ from 'lodash';
import React from 'react';
import { useTranslation } from 'react-i18next';

const BAINotificationItem: React.FC<{
  notification: NotificationState;
  onClickAction?: (notification: NotificationState) => void;
  showDate?: boolean;
}> = ({ notification, onClickAction, showDate }) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  return (
    <List.Item>
      <Flex direction="column" align="stretch">
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
        {notification.toUrl ? (
          <Button
            type="link"
            rel="noreferrer noopener"
            onClick={(e) => {
              // notification.toUrl && webuiNavigate(item.toUrl);
              onClickAction && onClickAction(notification);
            }}
          >
            {notification.toTextKey
              ? t(notification.toTextKey)
              : t('notification.SeeDetail')}
          </Button>
        ) : null}
        <Typography.Text>{notification.description}</Typography.Text>

        <Flex direction="row" align="center" justify="end" gap={'sm'}>
          {notification.backgroundTask &&
          _.isNumber(notification.backgroundTask.percent) ? (
            <Progress
              size="small"
              showInfo={false}
              percent={notification.backgroundTask.percent}
              style={{ margin: 0 }}
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
