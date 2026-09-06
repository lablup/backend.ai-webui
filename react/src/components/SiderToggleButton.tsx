/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { IconButton } from '@astryxdesign/core/IconButton';
import { Kbd } from '@astryxdesign/core/Kbd';
import { Tooltip } from '@astryxdesign/core/Tooltip';
import { BAI_Z_INDEX, BAIFlex } from 'backend.ai-ui';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface SiderToggleButtonProps {
  collapsed?: boolean;
  buttonTop?: number;
  onClick?: (collapsed: boolean) => void;
  hidden?: boolean;
  // style?: React.CSSProperties;
}

/**
 * The hover-revealed rail collapse/expand control.
 *
 * Astryx `IconButton` stays (ticket 24's mapping), but its SHAPE is restyled
 * back to the legacy control: `size="sm"` renders a 28px rounded square on the
 * `secondary` fill, where the legacy button was a 24px white circle with a
 * hairline border. None of that is reachable from props — Astryx has no
 * `shape` enum and its radius/size scales are closed (P5) — so the look is
 * carried by the `.bai-sider-toggle` rule in `BAISider.css`, next to the
 * sider's other justified scoped overrides. See that file for the full
 * legacy-token mapping and why this is NOT a theme default.
 */
const SiderToggleButton: React.FC<SiderToggleButtonProps> = ({
  collapsed = false,
  buttonTop,
  onClick,
  hidden,
}) => {
  const { t } = useTranslation();
  const label = collapsed ? t('button.Expand') : t('button.Collapse');
  return (
    <BAIFlex
      style={{
        position: 'absolute',
        right: 0,
        transform: 'translateX(12px)',
        paddingTop: buttonTop,
        zIndex: BAI_Z_INDEX.appHeader + 1,
      }}
      direction="column"
      justify={buttonTop ? 'start' : 'center'}
    >
      {/* `IconButton`'s `tooltip` prop is a plain string, so the shortcut badge
          needs an explicit `Tooltip`. The `Kbd` takes its colours from the
          tooltip block of `ANTD_HOVER_PARITY`, not from a `MediaTheme` wrapper
          — the dark palette's `--color-neutral` equals the bubble. FR-3726. */}
      <Tooltip
        placement="end"
        content={
          <>
            {label} <Kbd keys="[" />
          </>
        }
      >
        <IconButton
          className="bai-sider-toggle"
          size="sm"
          label={label}
          icon={collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          onClick={() => {
            onClick && onClick(!collapsed);
          }}
          style={{
            visibility: 'hidden',
            opacity: 0,
            transition: 'opacity 0.2s ease, visibility 0.2s ease',
            ...(!hidden ? { visibility: 'visible', opacity: 1 } : {}),
          }}
        />
      </Tooltip>
    </BAIFlex>
  );
};

export default SiderToggleButton;
