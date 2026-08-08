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
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import { VStack } from '@astryxdesign/core/Stack';
import { StatusDot } from '@astryxdesign/core/StatusDot';
import { Heading } from '@astryxdesign/core/Text';
import { Drawer } from '@astryxdesign/lab';
import { BAIFlex } from 'backend.ai-ui';
import { EllipsisVertical } from 'lucide-react';
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
    <Drawer
      isOpen={open}
      onClose={() => onClose?.()}
      side="end"
      size={DRAWER_WIDTH}
      hasScrim={false}
      hasCloseButton
      label={t('notification.Notifications')}
    >
      <VStack
        gap={2}
        align="stretch"
        className="webui-notification-drawer-body"
      >
        {/* lab Drawer has no title bar, so antd's `title` + `extra` become
            the first content row (ticket 18 precedent). The row keeps the
            Electron `-webkit-app-region: drag` affordance the antd header
            had — see WEBUINotificationDrawer.css. */}
        <BAIFlex
          justify="between"
          align="center"
          gap="xs"
          className="webui-notification-drawer-header"
          // MEASURED (`.scratch/astryx-migration/p3-w2c-measure-drawer.mjs`,
          // 280px drawer against the viewport's right edge): the lab Drawer's
          // built-in Close button sits at x 1760..1792 / y 8..40 and paints
          // ABOVE the drawer content, while this row's "More" menu landed at
          // x 1752..1784 / y 16..48 — a 24x24 overlap that swallowed part of
          // the More button's hit box. Reserving 32px on the inline end (on
          // top of the body's own 16px) leaves an 8px gap between them.
          // Inline rather than in the co-located CSS because `BAIFlex` sets
          // `padding: 0` as an inline style, which no stylesheet can outrank.
          style={{ paddingInlineEnd: 'var(--spacing-8)' }}
        >
          <Heading level={5}>{t('notification.Notifications')}</Heading>
          {/* MAPPING §3.7: `Dropdown menu={{items}}` + an icon-only trigger
              -> `DropdownMenu` with its `button` slot. antd's per-item
              `danger` red tint is dropped (ticket 18 decision 2 — the item
              variant enum is closed). */}
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
        </BAIFlex>
        {/* PILOT-DECISION: antd `List` (`dataSource` + `renderItem` + `header`)
            becomes a plain `VStack` map. Astryx `List`/`ListItem` is a
            `<ul>`-shaped component for label/description rows; the three
            notification items are rich cards with their own action rows, and
            "don't place interactive elements inside an interactive list item"
            is an explicit Astryx rule. Nothing antd's List contributed here
            (it had no pagination, no dividers, no item meta) is lost, and it
            keeps this file decoupled from how the item components render. */}
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
      </VStack>
    </Drawer>
  );
};

export default WEBUINotificationDrawer;
