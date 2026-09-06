/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useBAIi18n } from '../hooks/useBAIi18n';
import './BAIDrawer.css';
import BAIDrawerPortal from './BAIDrawerPortal';
import { Heading } from '@astryxdesign/core/Heading';
import { IconButton } from '@astryxdesign/core/IconButton';
import { HStack, StackItem, VStack } from '@astryxdesign/core/Stack';
import { Drawer } from '@astryxdesign/lab';
import classNames from 'classnames';
import { X } from 'lucide-react';
import React, { type ReactNode } from 'react';

export interface BAIDrawerProps {
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
  /**
   * Modal scrim, and with it the modality switch: `true` renders through
   * `BAIDrawerPortal` (modal band level + focus containment), `false` keeps
   * lab's native non-modal `show()` overlay.
   * antd `Drawer`'s `mask`. @default true
   */
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
 * The project's drawer shell: lab `Drawer` plus the header arrangement antd's
 * `Drawer` produced — `[X] Title …… [extra]`, a divider, then a padded
 * scrollable body — so every detail drawer reads the way it did before the
 * Astryx migration. lab has no title bar of its own, only a floating
 * `hasCloseButton` glyph that overlaps whatever the content renders first;
 * that button is turned off here so there is one close affordance (qa2-c).
 */
const BAIDrawer: React.FC<BAIDrawerProps> = ({
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
  const { t } = useBAIi18n();

  // lab `Drawer` requires a non-empty accessible name.
  const accessibleName =
    label ?? (typeof title === 'string' ? title : undefined) ?? '';

  const hasHeader = title !== undefined || extra !== undefined;

  const panel = (
    <VStack gap={0} align="stretch" height="100%">
      {hasHeader ? (
        <HStack
          className={classNames('bai-drawer-header', headerClassName)}
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
              label={t('general.button.Close')}
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
          className={classNames(
            hasBodyPadding ? 'bai-drawer-body' : 'bai-drawer-body-flush',
            bodyClassName,
          )}
        >
          {children}
        </div>
      </StackItem>
    </VStack>
  );

  const drawerProps = {
    isOpen: open,
    onClose: () => onClose?.(),
    side,
    size,
    label: accessibleName,
    // The header above owns the close affordance, at antd's `start` placement.
    // Leaving lab's own button on would paint a second, floating one over the
    // content.
    hasCloseButton: false,
  };

  // A scrimmed lab `Drawer` would `showModal()` and inert every portalled modal
  // opened from inside it; the portal keeps the modality without the top layer
  // (FR-3585). Non-scrim drawers already use `show()` and stay native.
  return hasScrim ? (
    <BAIDrawerPortal {...drawerProps}>{panel}</BAIDrawerPortal>
  ) : (
    <Drawer {...drawerProps} hasScrim={false}>
      {panel}
    </Drawer>
  );
};

export default BAIDrawer;
