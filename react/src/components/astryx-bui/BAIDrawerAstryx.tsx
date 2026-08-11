/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import './BAIDrawerAstryx.css';
import { Heading } from '@astryxdesign/core/Heading';
import { IconButton } from '@astryxdesign/core/IconButton';
import { HStack, StackItem, VStack } from '@astryxdesign/core/Stack';
import { Drawer } from '@astryxdesign/lab';
import { X } from 'lucide-react';
import React, { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

export interface BAIDrawerAstryxProps {
  /** Whether the drawer is open. antd `Drawer`'s `open`. */
  open?: boolean;
  /** Close request (Escape, scrim click, the header close button). */
  onClose?: () => void;
  /** Header title. antd `Drawer`'s `title`. */
  title?: ReactNode;
  /** Header actions, rendered at the trailing edge. antd `Drawer`'s `extra`. */
  extra?: ReactNode;
  /**
   * Accessible name for the drawer. lab `Drawer` requires one because it has
   * no built-in heading to derive a name from. Defaults to `title` when the
   * title is a plain string.
   */
  label?: string;
  /** Panel size along the slide axis. antd `Drawer`'s `size`/`width`. */
  size?: number | string;
  /** Edge the panel slides from. @default 'end' */
  side?: 'start' | 'end' | 'top' | 'bottom';
  /** Modal scrim. antd `Drawer`'s `mask`. @default true */
  hasScrim?: boolean;
  /**
   * Body padding. antd's drawer body was `paddingLG` (24px) and a few call
   * sites zeroed it via `styles={{ body: { padding: 0 } }}`; pass `false` for
   * those and pad inside the content instead.
   * @default true
   */
  hasBodyPadding?: boolean;
  /** Extra class on the scrollable body region. */
  bodyClassName?: string;
  /**
   * Extra class on the header row. Used by the Electron-aware notification
   * drawer, which makes its header the frameless window's drag handle.
   */
  headerClassName?: string;
  children?: ReactNode;
}

/**
 * The project's drawer shell: lab `Drawer` plus the header arrangement the
 * antd `Drawer` produced, so every detail drawer reads the same way it did
 * before the Astryx migration.
 *
 * WHY THIS EXISTS (qa2-c). lab `Drawer` has no title bar at all — it only
 * offers `hasCloseButton`, which paints a ghost icon button ABSOLUTELY
 * POSITIONED in the top-trailing corner, floating over whatever the content
 * renders first. Each converted drawer therefore hand-rolled its own
 * `HStack justify="between"` title row inside the body, which put the page's
 * own action buttons underneath (or overlapping) that floating close button
 * and produced a different header on every drawer.
 *
 * The legacy arrangement, read off antd 6.5.0's `DrawerPanel` and its style
 * module (and confirmed by rendering it):
 *
 *   .ant-drawer-header        display:flex; align-items:center;
 *                             padding: `padding` `paddingLG` (16px 24px);
 *                             border-bottom: 1px solid colorSplit
 *     .ant-drawer-header-title  flex:1; display:flex; align-items:center
 *       button.ant-drawer-close   margin-inline-end: marginXS (8px)
 *       .ant-drawer-title         flex:1; font-weight:600; font-size:fontSizeLG
 *     .ant-drawer-extra         flex:none
 *   .ant-drawer-body          flex:1; padding: paddingLG (24px); overflow:auto
 *
 * i.e. `[X] Title …………… [extra]` on one row, a divider, then a padded
 * scrollable body. `closable.placement` was never overridden anywhere in the
 * app (`ConfigProvider drawer={{ mask: { blur: false } }}` is the only drawer
 * config), so antd's default `'start'` placement applies and the close button
 * sits BEFORE the title, not at the far edge.
 *
 * This component reproduces that exactly and turns lab's floating button off
 * (`hasCloseButton={false}`) so there is only one close affordance.
 */
const BAIDrawerAstryx: React.FC<BAIDrawerAstryxProps> = ({
  open = false,
  onClose,
  title,
  extra,
  label,
  size = 400,
  side = 'end',
  hasScrim = true,
  hasBodyPadding = true,
  bodyClassName,
  headerClassName,
  children,
}) => {
  'use memo';
  const { t } = useTranslation();

  // lab `Drawer` requires a non-empty accessible name.
  const accessibleName =
    label ?? (typeof title === 'string' ? title : undefined) ?? '';

  const hasHeader = title !== undefined || extra !== undefined;

  return (
    <Drawer
      isOpen={open}
      onClose={() => onClose?.()}
      side={side}
      size={size}
      label={accessibleName}
      hasScrim={hasScrim}
      // The header below owns the close affordance, at antd's `start`
      // placement. Leaving lab's own button on would paint a second, floating
      // one over the content.
      hasCloseButton={false}
    >
      <VStack gap={0} align="stretch" height="100%">
        {hasHeader ? (
          <HStack
            className={['bai-drawer-header', headerClassName]
              .filter(Boolean)
              .join(' ')}
            align="center"
            gap={0}
            wrap="nowrap"
          >
            <HStack
              align="center"
              gap={0}
              wrap="nowrap"
              className="bai-drawer-header-title"
            >
              <IconButton
                icon={<X size="1em" />}
                label={t('button.Close')}
                variant="ghost"
                size="sm"
                onClick={() => onClose?.()}
              />
              {title !== undefined ? (
                <Heading level={5} className="bai-drawer-title">
                  {title}
                </Heading>
              ) : null}
            </HStack>
            {extra !== undefined ? (
              <div className="bai-drawer-extra">{extra}</div>
            ) : null}
          </HStack>
        ) : null}
        <StackItem size="fill" isScrollable>
          <div
            className={[
              hasBodyPadding ? 'bai-drawer-body' : 'bai-drawer-body-flush',
              bodyClassName,
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {children}
          </div>
        </StackItem>
      </VStack>
    </Drawer>
  );
};

export default BAIDrawerAstryx;
