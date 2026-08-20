/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { theme } from '../theme-shim';
import WebUILink from './WebUILink';
import { Button } from '@astryxdesign/core/Button';
import { Divider } from '@astryxdesign/core/Divider';
import { Text } from '@astryxdesign/core/Text';
import { BAIFlex } from 'backend.ai-ui';
import { ReactNode, useRef } from 'react';
import { To } from 'react-router-dom';

interface StartItemContentProps {
  title: string | ReactNode;
  description?: string;
  icon?: React.ReactNode;
  buttonText: string;
  onClick?: () => void;
  to?: To;
  themeColor?: string;
  itemRole?: 'user' | 'admin';
  type?: 'simple' | 'default';
  style?: React.CSSProperties;
}

const ActionItemContent: React.FC<StartItemContentProps> = ({
  title,
  description,
  icon,
  buttonText,
  onClick,
  to,
  themeColor,
  type = 'default',
  itemRole = 'user',
  style,
}) => {
  const { token } = theme.useToken();
  const containerRef = useRef<HTMLDivElement>(null);
  const accentColor =
    themeColor ?? (itemRole === 'user' ? token.colorPrimary : token.colorInfo);
  const accentColorWithAlpha = `rgba(${parseInt(accentColor.slice(1, 3), 16)}, ${parseInt(accentColor.slice(3, 5), 16)}, ${parseInt(accentColor.slice(5, 7), 16)}, 0.15)`;

  // PILOT-DECISION: antd `Button type="primary"` hand-painted with
  // `backgroundColor` (accent for user items, info blue for admin items) →
  // Astryx `Button variant="primary"` (MAPPING §3.3). The per-instance
  // background is inexpressible (P5: closed variant enum, no colour escape
  // hatch), so the admin/`themeColor` tint is DROPPED and every action button
  // takes the theme accent. The nested `Typography.Text` that only resized
  // and whitened the label goes away too — `label` is the button's own text.
  //
  // POLISH-3 item 6 — the SIZE comes back. Legacy hand-set `height: 40` on
  // the button and `fontSize: token.fontSizeHeading5` (16px) on its label;
  // the conversion took the default `md` (32px tall, 14px label), which is
  // the size difference the user reads on these cards. Astryx's `lg` step is
  // that metric as a prop, so no hand-set height or font-size returns.
  const actionButton = (
    <Button
      variant="primary"
      size="lg"
      width="100%"
      onClick={onClick}
      label={buttonText}
    />
  );
  return (
    <BAIFlex
      ref={containerRef}
      align="center"
      justify="between"
      direction="column"
      style={{
        height: 328,
        textAlign: 'center',
        overflowY: 'auto',
        ...style,
      }}
    >
      <BAIFlex
        direction="column"
        gap={type === 'default' ? 'sm' : 'xxs'}
        style={{
          overflow: 'hidden',
          padding: token.marginMD,
          paddingBottom: 0,
        }}
      >
        <BAIFlex
          align="center"
          justify="center"
          style={{
            borderRadius: 25,
            width: 50,
            height: 50,
            fontSize: token.fontSizeHeading3,
            color: accentColor,
            backgroundColor: accentColorWithAlpha,
          }}
        >
          {icon}
        </BAIFlex>
        <BAIFlex style={{ minHeight: 60 }}>
          {typeof title === 'string' ? (
            // POLISH-3 item 6 — the card title is 20px, as legacy had it.
            // Legacy was `Typography.Text strong` at `token.fontSizeHeading4`
            // (20px / weight 600). `type="large"` carries the 600 but its
            // size token is `--font-size-lg`, which `ANTD_ALIGN_TOKENS` pins
            // to antd's `fontSizeLG` = 16px — so the title rendered 4px
            // small. `size="xl"` is `--font-size-xl` = 1.25rem = 20px, i.e.
            // exactly `fontSizeHeading4`, and Text's `size` prop is the
            // documented way to move the size while keeping the rest of the
            // semantic type (weight, leading, colour role) intact.
            <Text
              type="large"
              size="xl"
              weight="semibold"
              style={{ color: accentColor }}
            >
              {title}
            </Text>
          ) : (
            title
          )}
        </BAIFlex>
        <Text type="supporting">{description}</Text>
      </BAIFlex>
      <BAIFlex
        direction="column"
        align="stretch"
        style={{
          width: '100%',
          position: 'sticky',
          bottom: 0,
          backgroundColor:
            type === 'default' ? token.colorBgContainer : undefined,
          padding: type === 'default' ? token.paddingMD : undefined,
          paddingTop: 0,
        }}
      >
        {description && <Divider style={{ marginBottom: token.marginMD }} />}
        {to ? <WebUILink to={to}>{actionButton}</WebUILink> : actionButton}
      </BAIFlex>
    </BAIFlex>
  );
};

export default ActionItemContent;
