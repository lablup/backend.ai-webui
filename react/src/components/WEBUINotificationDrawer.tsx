/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useWebUINavigate } from '../hooks';
import { useBAINotificationState } from '../hooks/useBAINotification';
import BAIGeneralNotificationItem from './BAIGeneralNotificationItem';
import BAIMultiStepNotificationItem from './BAIMultiStepNotificationItem';
import BAINodeNotificationItem from './BAINodeNotificationItem';
import './WEBUINotificationDrawer.css';
import { DropdownMenu } from '@astryxdesign/core/DropdownMenu';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import { VStack } from '@astryxdesign/core/Stack';
import { StatusDot } from '@astryxdesign/core/StatusDot';
import { BAIDrawer, BAIFlex } from 'backend.ai-ui';
import { BellOff, EllipsisVertical } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

type NotificationCategory = 'all' | 'in progress';

// PILOT-DECISION: props no longer extend antd `DrawerProps`. The only consumer
// (`BAINotificationButton`) passes `open` + `onClose`, so that is the whole
// public surface; the antd spellings are kept and mapped onto the lab Drawer.
interface Props {
  /** Whether the drawer is open. antd Drawer's `open`. */
  open?: boolean;
  /** Close request handler (Escape, close button). */
  onClose?: () => void;
}

export const DRAWER_WIDTH = 280;
const WEBUINotificationDrawer: React.FC<Props> = ({
  open = false,
  onClose,
}) => {
  'use memo';
  const { t } = useTranslation();

  const webuiNavigate = useWebUINavigate();

  const [notifications, { clearAllNotifications }] = useBAINotificationState();
  const [selectedCategory, setSelectedCategory] =
    useState<NotificationCategory>('all');

  const inProgressNotifications = useMemo(
    () =>
      notifications.filter((n) => {
        return n.backgroundTask?.status === 'pending';
      }),
    [notifications],
  );

  const visibleNotifications =
    selectedCategory === 'all' ? notifications : inProgressNotifications;

  return (
    // antd `mask={false}` -> lab `hasScrim={false}`: this drawer is a
    // non-modal inspector — the page behind it stays interactive, which is
    // what `BAIContentWithDrawerArea`'s margin-style layout depends on.
    <BAIDrawer
      open={open}
      onClose={onClose}
      side="end"
      size={DRAWER_WIDTH}
      hasScrim={false}
      title={t('notification.Notifications')}
      // antd's `styles.body` was `padding: 0` plus
      // `paddingContentHorizontalSM` (16px) on the inline axis — restored on
      // `.webui-notification-drawer-body` instead of the shared 24px budget.
      hasBodyPadding={false}
      bodyClassName="webui-notification-drawer-body"
      // Electron: the frameless window's drag handle is the drawer header.
      headerClassName="webui-notification-drawer-header"
      // MAPPING §3.7: `Dropdown menu={{items}}` + an icon-only trigger ->
      // `DropdownMenu` with its `button` slot. antd's per-item `danger` red
      // tint is dropped (ticket 18 decision 2 — the item variant enum is
      // closed).
      //
      // qa2-c: this used to sit in a hand-rolled first content row, which had
      // to reserve 32px on the inline end so lab `Drawer`'s FLOATING close
      // button (absolutely positioned, top-trailing) did not swallow the More
      // button's hit box. `BAIDrawer` turns that floating button off and
      // renders the close affordance inside the header at antd's `start`
      // placement, so the reserve — and the overlap — are gone.
      extra={
        <DropdownMenu
          button={{
            label: t('button.More'),
            icon: <EllipsisVertical size="1em" />,
            isIconOnly: true,
            variant: 'ghost',
            isDisabled: notifications.length === 0,
          }}
          hasChevron={false}
          items={[
            {
              label: t('notification.ClearNotifications'),
              onClick: clearAllNotifications,
            },
          ]}
        />
      }
    >
      <VStack gap={2} align="stretch">
        {/* Notifications are rich cards with their own action rows, so they map
            into a plain `VStack`, not Astryx `List` — "don't place interactive
            elements inside an interactive list item" is an Astryx rule. */}
        <BAIFlex justify="end">
          <SegmentedControl
            value={selectedCategory}
            onChange={(value) =>
              setSelectedCategory(value as NotificationCategory)
            }
            size="sm"
            label={t('notification.Notifications')}
          >
            <SegmentedControlItem value="all" label={t('general.All')} />
            <SegmentedControlItem
              value="in progress"
              label={t('general.InProgress')}
              // `SegmentedControlItem.label` is a required STRING (P2), so
              // antd's `<Badge dot>` wrapper around the label cannot ride
              // along. The dot moves into the `icon` slot as a `StatusDot`,
              // which is the same "there is activity" signal with an
              // accessible name attached.
              icon={
                inProgressNotifications.length > 0 ? (
                  <StatusDot variant="accent" label={t('general.InProgress')} />
                ) : undefined
              }
            />
          </SegmentedControl>
        </BAIFlex>
        {visibleNotifications.length === 0 ? (
          <EmptyState
            title={t('notification.NoNotification')}
            icon={<BellOff size="1.5em" />}
            isCompact
          />
        ) : (
          <VStack gap={2} align="stretch">
            {visibleNotifications.map((item) =>
              item.node ? (
                <BAINodeNotificationItem
                  key={item.key}
                  notification={item}
                  nodeFrgmt={item.node || null}
                  showDate
                />
              ) : item.multiStep ? (
                <BAIMultiStepNotificationItem
                  key={item.key}
                  notification={item}
                  onRetry={item.onRetry ?? undefined}
                  onCancel={item.onCancel ?? undefined}
                  showDate
                />
              ) : (
                <BAIGeneralNotificationItem
                  key={item.key}
                  notification={item}
                  onClickAction={() => {
                    item.to && webuiNavigate(item.to);
                  }}
                  showDate
                />
              ),
            )}
          </VStack>
        )}
      </VStack>
    </BAIDrawer>
  );
};

export default WEBUINotificationDrawer;
