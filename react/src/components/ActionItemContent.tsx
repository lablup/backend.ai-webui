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
  const colorPrimaryWithAlpha = `rgba(${parseInt(token.colorPrimary.slice(1, 3), 16)}, ${parseInt(token.colorPrimary.slice(3, 5), 16)}, ${parseInt(token.colorPrimary.slice(5, 7), 16)}, 0.15)`;

  // PILOT-DECISION: antd `Button type="primary"` hand-painted with
  // `backgroundColor` (accent for user items, info blue for admin items) →
  // Astryx `Button variant="primary"` (MAPPING §3.3). The per-instance
  // background is inexpressible (P5: closed variant enum, no colour escape
  // hatch), so the admin/`themeColor` tint is DROPPED and every action button
  // takes the theme accent. The nested `Typography.Text` that only resized
  // and whitened the label goes away too — `label` is the button's own text.
  const actionButton = (
    <Button
      variant="primary"
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
            color: token.colorPrimary,
            backgroundColor: colorPrimaryWithAlpha,
          }}
        >
          {icon}
        </BAIFlex>
        <BAIFlex style={{ minHeight: 60 }}>
          {typeof title === 'string' ? (
            <Text
              type="large"
              weight="semibold"
              style={{
                color: themeColor
                  ? themeColor
                  : itemRole === 'user'
                    ? token.colorPrimary
                    : token.colorInfo,
              }}
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
