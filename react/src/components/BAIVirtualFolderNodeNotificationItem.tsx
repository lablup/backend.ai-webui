/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { BAIVirtualFolderNodeNotificationItemFragment$key } from '../__generated__/BAIVirtualFolderNodeNotificationItemFragment.graphql';
import {
  NotificationState,
  useSetBAINotification,
} from '../hooks/useBAINotification';
import { theme } from '../theme-shim';
import BAINotificationBackgroundProgress from './BAINotificationBackgroundProgress';
import { useFolderExplorerOpener } from './FolderExplorerOpener';
import { Card } from '@astryxdesign/core/Card';
import { Link } from '@astryxdesign/core/Link';
import { Text } from '@astryxdesign/core/Text';
import {
  BAIFlex,
  BAILink,
  BAINotificationItem,
  BAIText,
  useToggle,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

interface BAIVirtualFolderNodeNotificationItemProps {
  notification: NotificationState;
  virtualFolderNodeFrgmt: BAIVirtualFolderNodeNotificationItemFragment$key | null;
  showDate?: boolean;
}

/**
 * @deprecated Renders V1 `VirtualFolderNode` notifications. The V2 counterpart
 * `BAIVirtualFolderNodeNotificationItemV2` (operating on `VFolder implements Node` from
 * the Strawberry GraphQL API, FR-2573) is the preferred path going forward.
 * This component will be removed once all V1 callers migrate.
 */
const BAIVirtualFolderNodeNotificationItem: React.FC<
  BAIVirtualFolderNodeNotificationItemProps
> = ({ notification, virtualFolderNodeFrgmt, showDate }) => {
  'use memo';

  const { open: openFolderExplorer } = useFolderExplorerOpener();
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
                if (node.row_id) {
                  openFolderExplorer(node.row_id);
                }
                closeNotification(notification.key);
              }}
            >
              {node.name}
            </BAILink>
          </BAIText>
        }
        description={
          /* PILOT-DECISION: the `List.Item` here was NESTED inside the one
             `BAINotificationItem` already renders, so it only added a second
             padding box. Dropped rather than translated (MAPPING §4 `List`
             maps `List.Item` to Astryx `ListItem`, a fixed
             label/description row this body does not fit). */
          <BAIFlex direction="column" align="stretch" gap={'xxs'}>
            <BAIFlex direction="row" align="end" gap={'xxs'} justify="between">
              {_.isString(notification.description) ? (
                <Text type="supporting" style={{ flex: 1, minWidth: 0 }}>
                  {_.truncate(notification.description, { length: 300 })}
                </Text>
              ) : (
                notification.description
              )}

              {notification.extraDescription && !notification?.onCancel ? (
                <BAIFlex style={{ flexShrink: 0 }}>
                  <Link
                    style={{ whiteSpace: 'nowrap' }}
                    onClick={() => {
                      toggleShowExtraDescription();
                    }}
                  >
                    {showExtraDescription
                      ? t('notification.SeeSummary')
                      : t('notification.SeeDetail')}
                  </Link>
                </BAIFlex>
              ) : null}
            </BAIFlex>

            {notification.extraDescription && showExtraDescription ? (
              <Card
                padding={4}
                style={{
                  maxHeight: '300px',
                  overflow: 'auto',
                  overflowX: 'hidden',
                  marginTop: token.marginSM,
                }}
              >
                {_.isString(notification.extraDescription) ? (
                  <BAIText type="secondary" copyable>
                    {notification.extraDescription}
                  </BAIText>
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
        }
        footer={
          showDate ? dayjs(notification.created).format('lll') : undefined
        }
      />
    )
  );
};

export default BAIVirtualFolderNodeNotificationItem;
