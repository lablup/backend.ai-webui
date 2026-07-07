/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useThemeMode } from '../../hooks/useThemeMode';
import { Typography, theme } from 'antd';
import { createStyles } from 'antd-style';
import { BAIFlex } from 'backend.ai-ui';
import { ArrowUpLeftIcon } from 'lucide-react';
import React, { useId } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Scope-aware error state for the `/project/:projectName/*` subtree — the
 * "dissolving session cube" hero, designed as the showcase sibling of the
 * Diagonal Weave loading curtain (FR-3073):
 *
 *  - a giant gradient `404` watermark and a soft radial wash give the scene
 *    depth; a quiet fragment of the curtain's ±23° weave stays at the
 *    corners (radially MASKED, so the treatment is independent of the
 *    layout background color).
 *  - the brand wire-frame session cube renders large, gently floating over
 *    a soft ground shadow. The top-right corner is "dissolving": its edges
 *    are dashed ghosts, the missing vertex is ringed in accent, and small
 *    fragments drift off and fade.
 *  - a glass path pill (`/project / <broken name> / <feature>`) shows WHERE
 *    the URL broke. It is derived from route data — not translated copy —
 *    so the invalid name stays instantly findable without touching i18n.
 *  - title / subtitle / CTA reuse the existing `projectSelect.*` i18n keys.
 *
 * All decorative elements (watermark, weave, cube, pill) are `aria-hidden`;
 * the heading carries the semantics. Motion keeps its final/resting state in
 * base styles (hidden states exist only inside keyframes), so
 * `prefers-reduced-motion` collapses everything to a calm static layout.
 */

const WEAVE_PITCH = 28;
// Seamless drift loop: each layer translates by the warm-line period
// (9 lines = 252px), so the line range is over-extended by a full period on
// BOTH ends — coverage never runs out at any point of the cycle.
const WEAVE_PERIOD = WEAVE_PITCH * 9;
const WEAVE_YS = Array.from(
  { length: Math.ceil((2400 + 2 * WEAVE_PERIOD) / WEAVE_PITCH) },
  (_, i) => -1200 - WEAVE_PERIOD + i * WEAVE_PITCH,
);

const useStyles = createStyles(({ css }) => ({
  weave: css`
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    /* Radial mask instead of a painted veil: the weave fades out under the
       center composition and stays strongest toward the corners, regardless
       of the surrounding layout background color. */
    mask-image: radial-gradient(
      ellipse 65% 60% at 50% 44%,
      transparent 42%,
      #000 88%
    );
    -webkit-mask-image: radial-gradient(
      ellipse 65% 60% at 50% 44%,
      transparent 42%,
      #000 88%
    );
  `,
  driftA: css`
    animation: project-scope-drift-a 110s linear infinite;
    @keyframes project-scope-drift-a {
      to {
        transform: translateY(${WEAVE_PERIOD}px);
      }
    }
    @media (prefers-reduced-motion: reduce) {
      animation: none;
    }
  `,
  driftB: css`
    animation: project-scope-drift-b 150s linear infinite;
    @keyframes project-scope-drift-b {
      to {
        transform: translateY(-${WEAVE_PERIOD}px);
      }
    }
    @media (prefers-reduced-motion: reduce) {
      animation: none;
    }
  `,
  hero: css`
    position: relative;
    width: 196px;
    height: 196px;
    animation: project-scope-float 6s ease-in-out infinite;
    @keyframes project-scope-float {
      0%,
      100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-7px);
      }
    }
    svg {
      overflow: visible;
    }
    @media (prefers-reduced-motion: reduce) {
      animation: none;
      .project-scope-bit {
        animation: none;
        opacity: 0;
      }
    }
  `,
  bit: css`
    position: absolute;
    /* Resting state is invisible; the fragments exist only mid-flight. */
    opacity: 0;
    animation: project-scope-bit-drift 3.6s ease-out infinite;
    @keyframes project-scope-bit-drift {
      0% {
        opacity: 0;
        translate: 0 0;
      }
      12% {
        opacity: 0.95;
      }
      100% {
        opacity: 0;
        translate: 34px -46px;
      }
    }
  `,
}));

interface ProjectScopeErrorStateProps {
  /** 'not-found' = invalid/inaccessible project name; 'no-projects' = the
   *  user belongs to no project at all. */
  variant: 'not-found' | 'no-projects';
  /** The invalid project name from the URL (not-found variant). */
  projectName?: string;
  /** The feature segment after the project name (e.g. 'session'), ghosted in
   *  the path pill. */
  featureKey?: string;
  /** Action area under the copy (e.g. the "Go to {{project}}" button). */
  extra?: React.ReactNode;
}

const ProjectScopeErrorState: React.FC<ProjectScopeErrorStateProps> = ({
  variant,
  projectName,
  featureKey,
  extra,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { isDarkMode } = useThemeMode();
  const { styles, cx } = useStyles();
  const gradientId = useId();

  // Curtain palette (resources/webui.css `.splash` custom props). The dark
  // accent is the splash's brighter #E88A28 — tuned for dark surfaces —
  // rather than the primary token, matching the loading curtain exactly.
  const weaveLine = isDarkMode
    ? 'rgba(255,255,255,0.05)'
    : 'rgba(20,20,20,0.055)';
  const weaveWarm = isDarkMode
    ? 'rgba(232,138,40,0.18)'
    : 'rgba(255,122,0,0.16)';
  const accent = isDarkMode ? '#E88A28' : '#FF7A00';
  const amber = isDarkMode ? '#F2B56B' : '#FFB25E';
  // Pill TEXT ink for the broken name: small bold mono, so light mode uses a
  // darker orange (~4.8:1 on the pill bg) instead of the raw accent.
  const pillInk = isDarkMode ? '#F2A045' : '#B25400';
  const glow = isDarkMode ? 'rgba(232,138,40,0.17)' : 'rgba(255,122,0,0.10)';
  const watermarkInk = isDarkMode
    ? 'rgba(232,138,40,0.16)'
    : 'rgba(255,122,0,0.11)';

  const isNotFound = variant === 'not-found';

  const weaveLines = (warmEvery?: number) =>
    WEAVE_YS.map((y, i) => (
      <line
        key={y}
        x1={-1100}
        y1={y}
        x2={2540}
        y2={y}
        stroke={warmEvery && i % warmEvery === 0 ? weaveWarm : weaveLine}
        strokeWidth={1}
      />
    ));

  const pillSeparator = (
    <span style={{ color: token.colorTextQuaternary, opacity: 0.7 }}>/</span>
  );

  return (
    <BAIFlex
      direction="column"
      align="center"
      justify="center"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Diagonal Weave fragment at the corners (decorative) */}
      <svg
        className={styles.weave}
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <g transform="rotate(23 720 450)">
          <g className={styles.driftA}>{weaveLines(9)}</g>
        </g>
        <g transform="rotate(-23 720 450)">
          <g className={styles.driftB}>{weaveLines()}</g>
        </g>
      </svg>

      {/* Soft radial wash behind the hero (decorative) */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '50%',
          top: '38%',
          width: 740,
          height: 540,
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(ellipse 50% 44% at 50% 50%, ${glow}, transparent 68%)`,
          filter: 'blur(8px)',
          pointerEvents: 'none',
        }}
      />

      <BAIFlex
        direction="column"
        align="center"
        style={{
          position: 'relative',
          maxWidth: 640,
          padding: token.paddingLG,
        }}
      >
        {/* Hero: giant watermark + the dissolving session cube (decorative) */}
        <div style={{ position: 'relative' }} aria-hidden="true">
          {isNotFound ? (
            <div
              style={{
                position: 'absolute',
                top: -58,
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: 'min(232px, 26vh)',
                fontWeight: 800,
                letterSpacing: '-0.04em',
                lineHeight: 1,
                userSelect: 'none',
                backgroundImage: `linear-gradient(180deg, ${watermarkInk} 0%, transparent 78%)`,
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                whiteSpace: 'nowrap',
              }}
            >
              404
            </div>
          ) : null}
          <div className={styles.hero}>
            <svg viewBox="0 0 120 120" width={196} height={196}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor={accent} />
                  <stop offset="1" stopColor={amber} />
                </linearGradient>
              </defs>
              {isNotFound ? (
                <>
                  {/* materialized edges */}
                  <path
                    d="M60 14 L24 35 L24 77 L60 98 L95.6 77"
                    fill="none"
                    stroke={token.colorText}
                    strokeWidth={2.3}
                    strokeLinecap="round"
                    opacity={0.82}
                  />
                  <path
                    d="M60 56 L60 98 M60 56 L24 35"
                    fill="none"
                    stroke={`url(#${gradientId})`}
                    strokeWidth={2.3}
                    strokeLinecap="round"
                  />
                  {/* the dissolving corner */}
                  <path
                    d="M60 14 L95.6 35 L95.6 68 M60 56 L86 41"
                    fill="none"
                    stroke={token.colorTextQuaternary}
                    strokeWidth={1.7}
                    strokeLinecap="round"
                    strokeDasharray="3.5 5"
                    opacity={0.75}
                  />
                  <circle
                    cx={95.6}
                    cy={35}
                    r={7}
                    fill="none"
                    stroke={accent}
                    strokeWidth={1.6}
                    strokeDasharray="2.6 3"
                  />
                </>
              ) : (
                <>
                  {/* no projects at all: the whole cube is a ghost */}
                  <path
                    d="M60 14 L24 35 L24 77 L60 98 L95.6 77 L95.6 35 Z M60 56 L60 98 M60 56 L24 35 M60 56 L95.6 35"
                    fill="none"
                    stroke={token.colorTextQuaternary}
                    strokeWidth={1.9}
                    strokeLinecap="round"
                    strokeDasharray="3.5 5"
                  />
                  <text
                    x={60}
                    y={64}
                    textAnchor="middle"
                    fill={accent}
                    fontSize={17}
                    fontWeight={700}
                  >
                    ?
                  </text>
                </>
              )}
            </svg>
            {isNotFound ? (
              <>
                {/* fragments drifting off the missing corner */}
                <span
                  className={cx(styles.bit, 'project-scope-bit')}
                  style={{
                    left: '76%',
                    top: '12%',
                    width: 9,
                    height: 9,
                    borderRadius: 2,
                    border: `1.6px solid ${accent}`,
                    animationDelay: '0.2s',
                  }}
                />
                <span
                  className={cx(styles.bit, 'project-scope-bit')}
                  style={{
                    left: '88%',
                    top: '24%',
                    width: 8,
                    height: 8,
                    borderRadius: 2,
                    border: `1.6px solid ${accent}`,
                    rotate: '45deg',
                    animationDelay: '1.4s',
                  }}
                />
                <span
                  className={cx(styles.bit, 'project-scope-bit')}
                  style={{
                    left: '82%',
                    top: '6%',
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    backgroundColor: amber,
                    animationDelay: '2.5s',
                  }}
                />
              </>
            ) : null}
            {/* soft ground shadow */}
            <div
              style={{
                position: 'absolute',
                left: '50%',
                bottom: -18,
                width: 150,
                height: 26,
                transform: 'translateX(-50%)',
                background: `radial-gradient(ellipse 50% 50% at 50% 50%, ${
                  isDarkMode ? 'rgba(0,0,0,0.5)' : 'rgba(30,20,10,0.16)'
                }, transparent 70%)`,
                filter: 'blur(6px)',
              }}
            />
          </div>
        </div>

        {/* Glass path pill — derived from route data, not from i18n copy
            (decorative; the heading below carries the semantics). */}
        {isNotFound ? (
          <BAIFlex
            align="center"
            gap={4}
            aria-hidden="true"
            style={{
              marginTop: token.marginLG,
              marginBottom: token.marginXS,
              padding: '9px 18px',
              borderRadius: 999,
              backgroundColor: isDarkMode
                ? 'rgba(255,255,255,0.045)'
                : 'rgba(255,255,255,0.78)',
              border: `1px solid ${
                isDarkMode ? 'rgba(255,255,255,0.09)' : 'rgba(20,20,20,0.09)'
              }`,
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 18px rgba(0,0,0,0.06)',
              fontFamily: token.fontFamilyCode,
              fontSize: token.fontSize,
            }}
          >
            <span style={{ color: token.colorTextQuaternary }}>/project</span>
            {pillSeparator}
            <span
              style={{
                color: pillInk,
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
              {projectName}
            </span>
            {featureKey ? (
              <>
                {pillSeparator}
                <span
                  style={{ color: token.colorTextQuaternary, opacity: 0.75 }}
                >
                  {featureKey}
                </span>
              </>
            ) : null}
          </BAIFlex>
        ) : null}

        <Typography.Title
          level={4}
          style={{
            margin: 0,
            marginTop: isNotFound ? token.marginSM : token.marginLG,
            textAlign: 'center',
            fontSize: token.fontSizeHeading3,
            letterSpacing: '-0.015em',
            lineHeight: 1.32,
            maxWidth: 560,
          }}
        >
          {isNotFound
            ? t('projectSelect.ProjectNotFoundOrNoAccess', {
                project: projectName,
              })
            : t('projectSelect.NoAccessibleProjects')}
        </Typography.Title>

        <Typography.Text
          type="secondary"
          style={{ marginTop: token.marginSM, textAlign: 'center' }}
        >
          {isNotFound ? (
            <>
              <ArrowUpLeftIcon
                size="0.95em"
                style={{ verticalAlign: '-0.12em', marginRight: 5 }}
                aria-hidden="true"
              />
              {t('projectSelect.SwitchToAccessibleProject')}
            </>
          ) : (
            t('projectSelect.AskAdminForProjectAccess')
          )}
        </Typography.Text>

        {extra ? (
          <div
            style={{
              marginTop: token.marginXL,
              // Soft accent glow under the CTA without touching its styles.
              filter: `drop-shadow(0 10px 18px ${
                isDarkMode ? 'rgba(232,138,40,0.35)' : 'rgba(255,122,0,0.30)'
              })`,
            }}
          >
            {extra}
          </div>
        ) : null}
      </BAIFlex>
    </BAIFlex>
  );
};

export default ProjectScopeErrorState;
