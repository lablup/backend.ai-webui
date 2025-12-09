import { NotificationState } from '../hooks/useBAINotification';
import BAINotificationBackgroundProgress from './BAINotificationBackgroundProgress';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { Button, Card, List, Typography, theme } from 'antd';
import { BAIFlex } from 'backend.ai-ui';
import dayjs from 'dayjs';
import _ from 'lodash';
import { FolderIcon } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const BAIGeneralNotificationItem: React.FC<{
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
    <>
      <List.Item>
        <BAIFlex direction="column" align="stretch" gap={'xxs'}>
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
            {notification?.onCancel ? (
              <BAIFlex>
                <Button type="link" onClick={notification.onCancel}>
                  {t('button.Cancel')}
                </Button>
              </BAIFlex>
            ) : null}
            {notification.extraDescription && !notification?.onCancel ? (
              <BAIFlex>
                <Typography.Link
                  onClick={() => {
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
            <Card
              size="small"
              style={{
                maxHeight: '300px',
                overflow: 'auto',
                overflowX: 'hidden',
                marginTop: token.marginSM,
              }}
            >
              {_.isString(notification.extraDescription) ? (
                <Typography.Text type="secondary" copyable>
                  {notification.extraDescription}
                </Typography.Text>
              ) : (
                notification.extraDescription
              )}
            </Card>
          ) : null}

          <BAIFlex direction="row" align="center" justify="end" gap={'sm'}>
            {notification.backgroundTask && (
              <BAINotificationBackgroundProgress
                backgroundTask={notification.backgroundTask}
                showDate={showDate}
              />
            )}
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
    </>
  );
};

export default BAIGeneralNotificationItem;
