/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { HEADER_Z_INDEX_IN_MAIN_LAYOUT } from './MainLayout/MainLayout';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Kbd } from '@astryxdesign/core/Kbd';
import { Tooltip } from '@astryxdesign/core/Tooltip';
import { MediaTheme, useTheme } from '@astryxdesign/core/theme';
import { BAIFlex } from 'backend.ai-ui';
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
  const { mode } = useTheme();
  const label = collapsed ? t('button.Expand') : t('button.Collapse');
  return (
    <BAIFlex
      style={{
        position: 'absolute',
        right: 0,
        transform: 'translateX(12px)',
        paddingTop: buttonTop,
        zIndex: HEADER_Z_INDEX_IN_MAIN_LAYOUT + 1,
      }}
      direction="column"
      justify={buttonTop ? 'start' : 'center'}
    >
      {/* `IconButton`'s own `tooltip` prop is a plain `string`, which is why
          the `[` shortcut used to be concatenated into the label as bare text.
          Composing Astryx's `Tooltip` explicitly restores the legacy
          rendering: label + the shortcut as a real key badge (`Kbd`), the
          Astryx counterpart of the legacy `BAIText keyboardWithLightBorder`.
          `placement="end"` is the logical form of antd's `placement="right"`.

          `MediaTheme` is required, not decorative. The tooltip surface is
          INVERTED by hand — `useTooltip`'s container hardcodes
          `background: var(--color-text-primary)` / `color:
          var(--color-background-surface)` — but it does not flip the token
          CONTEXT, so a nested component still resolves its own tokens against
          the page surface. `Kbd` paints itself with `--color-neutral` on
          `--color-text-secondary`, which on the inverted surface came out as a
          dark chip on a dark tooltip (measured: `rgba(33,26,22,0.1)` fill,
          `rgb(81,68,60)` text, on a `rgb(33,26,22)` tooltip — invisible).
          `MediaTheme` is Astryx's own answer for exactly this ("media
          overlays, scrims, toasts, and tooltips"); it renders `display:
          contents`, so it costs no layout. Its `mode` is the tooltip
          surface's luminance, which is the OPPOSITE of the app's — the
          tooltip is dark while the app is light and vice versa. */}
      <Tooltip
        placement="end"
        content={
          <MediaTheme mode={mode === 'dark' ? 'light' : 'dark'}>
            {label} <Kbd keys="[" />
          </MediaTheme>
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
