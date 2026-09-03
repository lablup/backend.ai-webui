/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useThemeMode } from '../hooks/useThemeMode';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { useTheme } from '@astryxdesign/core/theme';
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
  const { token } = useTheme();
  const { isDarkMode } = useThemeMode();

  // Splash-derived warm palette: the broken-segment ink needs ~4.5:1 on the
  // pill background, so light mode uses a darker orange than the raw accent.
  const accent = isDarkMode ? '#E88A28' : '#FF7A00';
  const brokenInk = isDarkMode ? '#F2A045' : '#B25400';

  const separator = (
    <span style={{ color: token('--color-text-quaternary'), opacity: 0.6 }}>
      /
    </span>
  );

  return (
    <BAIFlex
      direction="column"
      align="center"
      justify="center"
      // `flex: 1` fills MainLayout's stretched outlet wrapper so the
      // composition centers in the Outlet area; `height: '100%'` would
      // resolve against the wrong box (viewport-height scroll column in
      // project scope, collapsed auto-height in admin scope).
      style={{ width: '100%', flex: 1 }}
    >
      <BAIFlex
        direction="column"
        align="center"
        style={{ maxWidth: 640, padding: token('--spacing-6') }}
      >
        {segments?.length ? (
          <BAIFlex
            align="center"
            gap={6}
            wrap="wrap"
            justify="center"
            aria-hidden="true"
            style={{
              marginBottom: token('--spacing-6'),
              padding: '9px 18px',
              borderRadius: 999,
              backgroundColor: token('--color-background-surface'),
              border: `1px solid ${token('--color-border')}`,
              fontFamily: token('--font-family-code'),
              fontSize: token('--font-size-base'),
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
                  <span style={{ color: token('--color-text-quaternary') }}>
                    {segment.text}
                  </span>
                )}
              </React.Fragment>
            ))}
          </BAIFlex>
        ) : null}

        {/* antd `Typography.Title level={4}` overridden to
            `fontSize: token('--font-size-2xl')`, i.e. the headline RENDERED at
            24px. The letter-spacing / line-height hand-tuning is still dropped
            (Astryx's heading scale is theme-owned), but the SIZE is restored:
            on the antd type ramp (`ANTD_ALIGN_TOKENS`) 24px is heading-3.
            `level={4}` was the ticket-24 choice against Astryx's own ramp and
            now renders 20px. `justify="center"` replaces `textAlign`. */}
        <Heading
          level={3}
          justify="center"
          style={{ margin: 0, maxWidth: 560 }}
        >
          {title}
        </Heading>

        {description ? (
          <Text
            color="secondary"
            justify="center"
            display="block"
            style={{ marginTop: token('--spacing-3') }}
          >
            {description}
          </Text>
        ) : null}

        {extra ? (
          <div style={{ marginTop: token('--spacing-8') }}>{extra}</div>
        ) : null}
      </BAIFlex>
    </BAIFlex>
  );
};

export default RouteErrorContent;
