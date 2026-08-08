/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { HEADER_Z_INDEX_IN_MAIN_LAYOUT } from './MainLayout/MainLayout';
import { IconButton } from '@astryxdesign/core/IconButton';
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
const SiderToggleButton: React.FC<SiderToggleButtonProps> = ({
  collapsed = false,
  buttonTop,
  onClick,
  hidden,
}) => {
  const { t } = useTranslation();
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
      {/* PILOT-DECISION: antd `Tooltip` + `Button shape="circle" size="small"`
          → Astryx `IconButton size="sm"` with its OWN `tooltip` prop
          (MAPPING §3.3 icon-only branch / §4 Tooltip). Three drops:
          (1) the `ConfigProvider` component-token override that repainted the
          button border (`defaultBorderColor`) — component tokens are closed
          enums in Astryx (P5/P11), and this wrapper existed only to re-theme
          antd; (2) the `[` keyboard hint that antd rendered as a JSX tooltip
          title — Astryx `tooltip` is a plain `string` (P2), so the shortcut
          glyph is folded into the text; (3) the circle shape — Astryx
          IconButton is a rounded square. */}
      <IconButton
        size="sm"
        tooltip={`${collapsed ? t('button.Expand') : t('button.Collapse')} [`}
        label={collapsed ? t('button.Expand') : t('button.Collapse')}
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
    </BAIFlex>
  );
};

export default SiderToggleButton;
