/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { NotificationState } from '../hooks/useBAINotification';
import { theme } from '../theme-shim';
import BAINotificationBackgroundProgress from './BAINotificationBackgroundProgress';
import './BAINotificationListItem.css';
import { Card } from '@astryxdesign/core/Card';
import { Link } from '@astryxdesign/core/Link';
import { Text } from '@astryxdesign/core/Text';
import { BAIFlex, BAIText } from 'backend.ai-ui';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import { CircleCheck, Clock, CircleX, FolderIcon } from 'lucide-react';
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
        pending: <Clock style={{ color: token.colorInfo }} size="1em" />,
        resolved: (
          <CircleCheck style={{ color: token.colorSuccess }} size="1em" />
        ),
        rejected: <CircleX style={{ color: token.colorError }} size="1em" />,
      }[notification.backgroundTask.status]) ||
    (notification.type === 'error' ? (
      <CircleX style={{ color: token.colorError }} size="1em" />
    ) : notification.type === 'success' ? (
      <CircleCheck style={{ color: token.colorSuccess }} size="1em" />
    ) : null);

  return (
    <>
      {/* PILOT-DECISION: antd `List.Item` -> a plain block carrying the two
          things it actually supplied here (16px vertical padding + the row
          hairline), moved into `BAINotificationListItem.css`. Astryx
          `ListItem` is a fixed label/description/start/end row and cannot hold
          a multi-row notification body (MAPPING §4 `List`). */}
      <div className="bai-notification-list-item">
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
            {/* antd `Typography.Paragraph` -> `Text as="p" display="block"`
                (MAPPING §4). antd's paragraph margin-bottom (1em) is restated
                literally; Astryx's reset gives block text no margin. */}
            <Text
              as="p"
              display="block"
              style={{
                fontWeight: 500,
                marginBottom: '1em',
              }}
            >
              {_.isString(notification.message)
                ? _.truncate(notification.message, {
                    length: 200,
                  })
                : notification.message}
            </Text>
          </BAIFlex>
          <BAIFlex direction="row" align="end" gap={'xxs'} justify="between">
            <Text
              as="p"
              display="block"
              style={{ flex: 1, minWidth: 0, marginBottom: 0 }}
            >
              {_.isString(notification.description)
                ? _.truncate(notification.description, {
                    length: 300,
                  })
                : notification.description}
            </Text>
            {notification.to ? (
              <BAIFlex style={{ flexShrink: 0 }}>
                {/* antd `Typography.Link` with `onClick` and no `href` ->
                    Astryx `Link`, which renders a `<button>` with link styling
                    when no href is given — the correct semantics antd faked
                    with a destination-less `<a>` (MAPPING §3.16). */}
                <Link
                  style={{ whiteSpace: 'nowrap' }}
                  onClick={(e) => {
                    onClickAction && onClickAction(e, notification);
                  }}
                >
                  {notification.toText ??
                    notification.toTextKey ??
                    t('notification.SeeDetail')}
                </Link>
              </BAIFlex>
            ) : null}
            {notification?.onCancel ? (
              <BAIFlex style={{ flexShrink: 0 }}>
                {/* antd `Button type="link"` -> `Link` (MAPPING §3.3). */}
                <Link onClick={notification.onCancel}>
                  {t('button.Cancel')}
                </Link>
              </BAIFlex>
            ) : null}
            {notification.extraDescription && !notification?.onCancel ? (
              <BAIFlex style={{ flexShrink: 0 }}>
                <Link
                  style={{ whiteSpace: 'nowrap' }}
                  onClick={() => {
                    // onClickAction && onClickAction(e, notification);
                    setShowExtraDescription(!showExtraDescription);
                  }}
                >
                  {notification.toTextKey
                    ? t(notification.toTextKey)
                    : showExtraDescription
                      ? t('notification.SeeSummary')
                      : t('notification.SeeDetail')}
                </Link>
              </BAIFlex>
            ) : null}
          </BAIFlex>
          {notification.extraDescription && showExtraDescription ? (
            // antd `Card size="small"` -> Astryx `Card padding={4}`
            // (MAPPING §5.1); no header, so the bare surface is enough.
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
                // `copyable` lives on BUI's `BAIText` (the repo's Astryx-native
                // home for it); plain Astryx `Text` has no copy affordance.
                <BAIText type="secondary" copyable>
                  {notification.extraDescription}
                </BAIText>
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
                <Text color="secondary">
                  {dayjs(notification.created).format('lll')}
                </Text>
              </BAIFlex>
            ) : null}
          </BAIFlex>
        </BAIFlex>
      </div>
    </>
  );
};

export default BAIGeneralNotificationItem;
