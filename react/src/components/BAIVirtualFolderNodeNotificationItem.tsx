/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import BAINotificationBackgroundProgress from './BAINotificationBackgroundProgress';
import { useToggle } from 'ahooks';
import { Card, List, theme, Typography } from 'antd';
import { BAIFlex, BAILink, BAINotificationItem, BAIText } from 'backend.ai-ui';
import dayjs from 'dayjs';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';
import { useNavigate } from 'react-router-dom';
import { BAIVirtualFolderNodeNotificationItemFragment$key } from 'src/__generated__/BAIVirtualFolderNodeNotificationItemFragment.graphql';
import {
  NotificationState,
  useSetBAINotification,
} from 'src/hooks/useBAINotification';

interface BAIVirtualFolderNodeNotificationItemProps {
  notification: NotificationState;
  virtualFolderNodeFrgmt: BAIVirtualFolderNodeNotificationItemFragment$key | null;
  showDate?: boolean;
}

const BAIVirtualFolderNodeNotificationItem: React.FC<
  BAIVirtualFolderNodeNotificationItemProps
> = ({ notification, virtualFolderNodeFrgmt, showDate }) => {
  'use memo';

  const navigate = useNavigate();
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { closeNotification } = useSetBAINotification();
  const [showExtraDescription, { toggle: toggleShowExtraDescription }] =
    useToggle(false);

  const node = useFragment(
    graphql`
      fragment BAIVirtualFolderNodeNotificationItemFragment on VirtualFolderNode {
        row_id
        id
        name
        status
      }
    `,
    virtualFolderNodeFrgmt,
  );

  return (
    node && (
      <BAINotificationItem
        title={
          <BAIText ellipsis>
            {t('general.Folder')}:&nbsp;
            <BAILink
              style={{
                fontWeight: 'normal',
              }}
              title={node.name || ''}
              onClick={() => {
                navigate(
                  `/data${node.row_id ? `?${new URLSearchParams({ folder: node.row_id }).toString()}` : ''}`,
                );
                closeNotification(notification.key);
              }}
            >
              {node.name}
            </BAILink>
          </BAIText>
        }
        description={
          <List.Item>
            <BAIFlex direction="column" align="stretch" gap={'xxs'}>
              <BAIFlex
                direction="row"
                align="end"
                gap={'xxs'}
                justify="between"
              >
                {_.isString(notification.description) ? (
                  <BAIText>
                    {_.truncate(notification.description, { length: 300 })}
                  </BAIText>
                ) : (
                  notification.description
                )}

                {notification.extraDescription && !notification?.onCancel ? (
                  <BAIFlex>
                    <Typography.Link
                      onClick={() => {
                        toggleShowExtraDescription();
                      }}
                    >
                      {t('notification.SeeDetail')}
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

              {notification.backgroundTask && (
                <BAINotificationBackgroundProgress
                  backgroundTask={notification.backgroundTask}
                  showDate={showDate}
                />
              )}
            </BAIFlex>
          </List.Item>
        }
        footer={
          showDate ? dayjs(notification.created).format('lll') : undefined
        }
      />
    )
  );
};

export default BAIVirtualFolderNodeNotificationItem;
