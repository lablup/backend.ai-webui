/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useThemeMode } from '../hooks/useThemeMode';
import { Typography, theme } from 'antd';
import { BAIFlex } from 'backend.ai-ui';
import React from 'react';

/**
 * Shared minimal composition for route-level error states (invalid project,
 * unknown page). One visual language for every "this URL is wrong" screen:
 *
 *   [ /path / broken-segment / rest ]   <- monospace pill (route data)
 *   Title                               <- semantic heading, i18n copy
 *   Description                         <- secondary hint
 *   [ CTA ]
 *
 * The pill is decorative (`aria-hidden`) — the heading carries the
 * semantics. The broken segment is highlighted with a warm chip and a wavy
 * accent underline; everything else stays quiet.
 */

export interface RouteErrorSegment {
  text: string;
  broken?: boolean;
}

interface RouteErrorContentProps {
  /** Path segments for the pill; omit to hide the pill entirely. */
  segments?: RouteErrorSegment[];
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Action area under the copy (e.g. a primary navigation button). */
  extra?: React.ReactNode;
}

const RouteErrorContent: React.FC<RouteErrorContentProps> = ({
  segments,
  title,
  description,
  extra,
}) => {
  'use memo';
  const { token } = theme.useToken();
  const { isDarkMode } = useThemeMode();

  // Splash-derived warm palette: the broken-segment ink needs ~4.5:1 on the
  // pill background, so light mode uses a darker orange than the raw accent.
  const accent = isDarkMode ? '#E88A28' : '#FF7A00';
  const brokenInk = isDarkMode ? '#F2A045' : '#B25400';

  const separator = (
    <span style={{ color: token.colorTextQuaternary, opacity: 0.6 }}>/</span>
  );

  return (
    <BAIFlex
      direction="column"
      align="center"
      justify="center"
      style={{ width: '100%', height: '100%' }}
    >
      <BAIFlex
        direction="column"
        align="center"
        style={{ maxWidth: 640, padding: token.paddingLG }}
      >
        {segments?.length ? (
          <BAIFlex
            align="center"
            gap={6}
            wrap="wrap"
            justify="center"
            aria-hidden="true"
            style={{
              marginBottom: token.marginLG,
              padding: '9px 18px',
              borderRadius: 999,
              backgroundColor: token.colorBgContainer,
              border: `1px solid ${token.colorBorderSecondary}`,
              fontFamily: token.fontFamilyCode,
              fontSize: token.fontSize,
            }}
          >
            {separator}
            {segments.map((segment, i) => (
              <React.Fragment key={i}>
                {i > 0 ? separator : null}
                {segment.broken ? (
                  <span
                    style={{
                      color: brokenInk,
                      fontWeight: 700,
                      backgroundColor: isDarkMode
                        ? 'rgba(232,138,40,0.13)'
                        : 'rgba(255,122,0,0.10)',
                      padding: '3px 9px',
                      borderRadius: 999,
                      textDecorationLine: 'underline',
                      textDecorationStyle: 'wavy',
                      textDecorationColor: accent,
                      textDecorationThickness: 1.2,
                      textUnderlineOffset: 4,
                    }}
                  >
                    {segment.text}
                  </span>
                ) : (
                  <span style={{ color: token.colorTextQuaternary }}>
                    {segment.text}
                  </span>
                )}
              </React.Fragment>
            ))}
          </BAIFlex>
        ) : null}

        <Typography.Title
          level={4}
          style={{
            margin: 0,
            textAlign: 'center',
            fontSize: token.fontSizeHeading3,
            letterSpacing: '-0.015em',
            lineHeight: 1.32,
            maxWidth: 560,
          }}
        >
          {title}
        </Typography.Title>

        {description ? (
          <Typography.Text
            type="secondary"
            style={{ marginTop: token.marginSM, textAlign: 'center' }}
          >
            {description}
          </Typography.Text>
        ) : null}

        {extra ? (
          <div style={{ marginTop: token.marginXL }}>{extra}</div>
        ) : null}
      </BAIFlex>
    </BAIFlex>
  );
};

export default RouteErrorContent;
