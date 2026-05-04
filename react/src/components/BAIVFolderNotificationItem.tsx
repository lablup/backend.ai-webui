/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import BAINotificationBackgroundProgress from './BAINotificationBackgroundProgress';
import { useToggle } from 'ahooks';
import { Card, List, theme, Typography } from 'antd';
import {
  BAIFlex,
  BAILink,
  BAINotificationItem,
  BAIText,
  toLocalId,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';
import { BAIVFolderNotificationItemFragment$key } from 'src/__generated__/BAIVFolderNotificationItemFragment.graphql';
import { useWebUINavigate } from 'src/hooks';
import {
  NotificationState,
  useSetBAINotification,
} from 'src/hooks/useBAINotification';

interface BAIVFolderNotificationItemProps {
  notification: NotificationState;
  vfolderFrgmt: BAIVFolderNotificationItemFragment$key | null;
  showDate?: boolean;
}

// V2 counterpart of `BAIVirtualFolderNodeNotificationItem`. Operates on the
// Strawberry V2 `VFolder` type (`VFolder implements Node`, FR-2573) so V2
// list/mutation flows can pass `node: vfolder` to `upsertNotification` and
// get the same rich folder-link + extra-description rendering as the legacy
// V1 path. The V1 component stays in place until all callers migrate.
const BAIVFolderNotificationItem: React.FC<BAIVFolderNotificationItemProps> = ({
  notification,
  vfolderFrgmt,
  showDate,
}) => {
  'use memo';

  const navigate = useWebUINavigate();
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { closeNotification } = useSetBAINotification();
  const [showExtraDescription, { toggle: toggleShowExtraDescription }] =
    useToggle(false);

  const node = useFragment(
    graphql`
      fragment BAIVFolderNotificationItemFragment on VFolder {
        id
        metadata {
          name
        }
      }
    `,
    vfolderFrgmt,
  );

  if (!node) return null;

  const localId = toLocalId(node.id);
  const folderName = node.metadata?.name;

  return (
    <BAINotificationItem
      title={
        <BAIText ellipsis>
          {t('general.Folder')}:&nbsp;
          <BAILink
            style={{
              fontWeight: 'normal',
            }}
            title={folderName || ''}
            onClick={() => {
              navigate(
                `/data${localId ? `?${new URLSearchParams({ folder: localId }).toString()}` : ''}`,
              );
              closeNotification(notification.key);
            }}
          >
            {folderName}
          </BAILink>
        </BAIText>
      }
      description={
        <List.Item>
          <BAIFlex direction="column" align="stretch" gap={'xxs'}>
            <BAIFlex direction="row" align="end" gap={'xxs'} justify="between">
              {_.isString(notification.description) ? (
                <BAIText style={{ flex: 1, minWidth: 0 }}>
                  {_.truncate(notification.description, { length: 300 })}
                </BAIText>
              ) : (
                notification.description
              )}

              {notification.extraDescription && !notification?.onCancel ? (
                <BAIFlex style={{ flexShrink: 0 }}>
                  <Typography.Link
                    style={{ whiteSpace: 'nowrap' }}
                    onClick={() => {
                      toggleShowExtraDescription();
                    }}
                  >
                    {showExtraDescription
                      ? t('notification.SeeSummary')
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

            {notification.backgroundTask && (
              <BAINotificationBackgroundProgress
                backgroundTask={notification.backgroundTask}
                showDate={showDate}
              />
            )}
          </BAIFlex>
        </List.Item>
      }
      footer={showDate ? dayjs(notification.created).format('lll') : undefined}
    />
  );
};

export default BAIVFolderNotificationItem;
