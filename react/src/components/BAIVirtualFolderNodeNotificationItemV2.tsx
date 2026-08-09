/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { BAIVirtualFolderNodeNotificationItemV2Fragment$key } from '../__generated__/BAIVirtualFolderNodeNotificationItemV2Fragment.graphql';
import {
  NotificationState,
  useSetBAINotification,
} from '../hooks/useBAINotification';
import { theme } from '../theme-shim';
import BAINotificationBackgroundProgress from './BAINotificationBackgroundProgress';
import { useFolderExplorerOpener } from './FolderExplorerOpener';
import { Card } from '@astryxdesign/core/Card';
import { Link } from '@astryxdesign/core/Link';
import {
  BAIFlex,
  BAILink,
  BAINotificationItem,
  BAIText,
  toLocalId,
  useToggle,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

interface BAIVirtualFolderNodeNotificationItemV2Props {
  notification: NotificationState;
  vfolderFrgmt: BAIVirtualFolderNodeNotificationItemV2Fragment$key | null;
  showDate?: boolean;
}

// V2 counterpart of `BAIVirtualFolderNodeNotificationItem`. Operates on the
// Strawberry V2 `VFolder` type (`VFolder implements Node`, FR-2573) so V2
// list/mutation flows can pass `node: vfolder` to `upsertNotification` and
// get the same rich folder-link + extra-description rendering as the legacy
// V1 path. The V1 component stays in place until all callers migrate.
const BAIVirtualFolderNodeNotificationItemV2: React.FC<
  BAIVirtualFolderNodeNotificationItemV2Props
> = ({ notification, vfolderFrgmt, showDate }) => {
  'use memo';

  const { open: openFolderExplorer } = useFolderExplorerOpener();
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { closeNotification } = useSetBAINotification();
  const [showExtraDescription, { toggle: toggleShowExtraDescription }] =
    useToggle(false);

  const node = useFragment(
    graphql`
      fragment BAIVirtualFolderNodeNotificationItemV2Fragment on VFolder {
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
              if (localId) {
                openFolderExplorer(localId);
              }
              closeNotification(notification.key);
            }}
          >
            {folderName}
          </BAILink>
        </BAIText>
      }
      description={
        /* PILOT-DECISION: nested `List.Item` dropped — see above. */
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
      footer={showDate ? dayjs(notification.created).format('lll') : undefined}
    />
  );
};

export default BAIVirtualFolderNodeNotificationItemV2;
