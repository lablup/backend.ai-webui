/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useThemeMode } from '../../hooks/useThemeMode';
import { Typography, theme } from 'antd';
import { createStyles } from 'antd-style';
import { BAIFlex } from 'backend.ai-ui';
import { ArrowUpIcon } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Scope-aware error state for the `/project/:projectName/*` subtree, designed
 * as the calm sibling of the Diagonal Weave loading curtain (FR-3073):
 *
 *  - a quiet fragment of the curtain's ±23° weave (28px pitch, sparse warm
 *    orange accent lines) drifts imperceptibly behind the content. Instead of
 *    a background-colored veil, the weave itself is radially MASKED so the
 *    center stays void — this keeps the treatment independent of the layout
 *    background color.
 *  - the brand wire-frame session cube renders "unmaterialized": six edges
 *    draw once on mount, the three edges around the top-right vertex stay
 *    dashed ghosts, and the missing vertex is cued with a dashed accent
 *    circle and a small "?".
 *  - a monospace path-chip row (`/project/` + the invalid name in a warm
 *    dashed chip + the ghosted feature segment) shows WHERE the URL broke.
 *    It is derived from route data — not from translated copy — so the
 *    invalid name stays instantly findable without touching i18n strings.
 *  - title / subtitle / CTA reuse the existing `projectSelect.*` i18n keys.
 *
 * All decorative elements (weave, cube, chip row) are `aria-hidden`; the
 * heading carries the semantics. Mount animations keep their final state in
 * the base styles (hidden states exist only inside keyframes), so
 * `prefers-reduced-motion` collapses everything to the resting layout.
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
       center lockup and stays strongest toward the corners, regardless of the
       surrounding layout background color. */
    mask-image: radial-gradient(
      ellipse 62% 58% at 50% 46%,
      transparent 34%,
      #000 78%
    );
    -webkit-mask-image: radial-gradient(
      ellipse 62% 58% at 50% 46%,
      transparent 34%,
      #000 78%
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
  cube: css`
    overflow: visible;
    line {
      stroke-linecap: round;
    }
    .draw {
      /* Base state = fully drawn; the hidden state lives only inside the
         keyframes, so reduced-motion lands on the finished cube. */
      stroke-dasharray: 40;
      stroke-dashoffset: 0;
      animation: project-scope-cube-draw 0.5s ease-out both;
    }
    .fade {
      opacity: 1;
      animation: project-scope-cube-fade 0.45s ease-out both;
      animation-delay: 0.55s;
    }
    @keyframes project-scope-cube-draw {
      from {
        stroke-dashoffset: 40;
      }
      to {
        stroke-dashoffset: 0;
      }
    }
    @keyframes project-scope-cube-fade {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .draw,
      .fade {
        animation: none;
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
   *  the chip row. */
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
  const { styles } = useStyles();

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
  // Chip TEXT ink: the invalid name is small bold mono, so light mode uses a
  // darker orange (~4.8:1 on the near-white chip) instead of the raw accent
  // (~2.6:1). The dashed border / "?" stay on the decorative splash accent.
  const chipInk = isDarkMode ? '#E88A28' : '#B25400';

  const isNotFound = variant === 'not-found';

  const chipBase: React.CSSProperties = {
    fontFamily: token.fontFamilyCode,
    fontSize: token.fontSizeSM,
    lineHeight: 1.6,
    padding: `${token.paddingXXS}px ${token.paddingXS}px`,
    borderRadius: token.borderRadiusSM,
  };

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
      {/* Diagonal Weave fragment (decorative) */}
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

      <BAIFlex
        direction="column"
        align="center"
        gap="md"
        style={{
          position: 'relative',
          maxWidth: 560,
          padding: token.paddingLG,
        }}
      >
        {/* The session cube that failed to materialize (decorative) */}
        <svg
          className={styles.cube}
          viewBox="0 0 40 40"
          width={104}
          height={104}
          aria-hidden="true"
        >
          {/* solid edges, drawn once on mount */}
          {(
            [
              [8.1, 13, 20, 6],
              [8.1, 13, 8.1, 27],
              [8.1, 27, 20, 34],
              [31.9, 27, 20, 34],
              [20, 20, 20, 34],
              [20, 20, 8.1, 13],
            ] as const
          ).map(([x1, y1, x2, y2], i) => (
            <line
              key={i}
              className="draw"
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={token.colorTextSecondary}
              strokeWidth={1.5}
              style={{ animationDelay: `${i * 0.07}s` }}
            />
          ))}
          {/* edges that failed to materialize */}
          {(
            [
              [20, 6, 31.9, 13],
              [31.9, 13, 31.9, 27],
              [20, 20, 31.9, 13],
            ] as const
          ).map(([x1, y1, x2, y2], i) => (
            <line
              key={i}
              className="fade"
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={token.colorTextQuaternary}
              strokeWidth={1.2}
              strokeDasharray="2.4 3"
            />
          ))}
          {/* missing-vertex cue */}
          <circle
            className="fade"
            cx={31.9}
            cy={13}
            r={2.6}
            fill="none"
            stroke={accent}
            strokeWidth={1.1}
            strokeDasharray="1.8 2"
          />
          <text
            className="fade"
            x={35.6}
            y={10}
            fill={accent}
            fontSize={7}
            fontWeight={700}
          >
            ?
          </text>
        </svg>

        {/* Path chip row — derived from route data, not from i18n copy
            (decorative; the heading below carries the semantics). */}
        <BAIFlex
          align="center"
          gap="xxs"
          aria-hidden="true"
          wrap="wrap"
          justify="center"
        >
          <span
            style={{
              ...chipBase,
              color: token.colorTextTertiary,
              backgroundColor: token.colorFillTertiary,
            }}
          >
            /project/
          </span>
          <span
            style={{
              ...chipBase,
              color: chipInk,
              fontWeight: 600,
              border: `1px dashed ${accent}`,
              backgroundColor: isDarkMode
                ? 'rgba(232,138,40,0.10)'
                : 'rgba(255,122,0,0.07)',
              transform: 'rotate(-1.5deg)',
            }}
          >
            {isNotFound ? projectName : '—'}
          </span>
          {isNotFound && featureKey ? (
            <span style={{ ...chipBase, color: token.colorTextQuaternary }}>
              /{featureKey}
            </span>
          ) : null}
        </BAIFlex>

        <Typography.Title level={4} style={{ margin: 0, textAlign: 'center' }}>
          {isNotFound
            ? t('projectSelect.ProjectNotFoundOrNoAccess', {
                project: projectName,
              })
            : t('projectSelect.NoAccessibleProjects')}
        </Typography.Title>

        <Typography.Text type="secondary" style={{ textAlign: 'center' }}>
          {isNotFound ? (
            <>
              <ArrowUpIcon
                size="0.9em"
                style={{ verticalAlign: '-0.1em', marginRight: 4 }}
                aria-hidden="true"
              />
              {t('projectSelect.SwitchToAccessibleProject')}
            </>
          ) : (
            t('projectSelect.AskAdminForProjectAccess')
          )}
        </Typography.Text>

        {extra ? (
          <div style={{ marginTop: token.marginXS }}>{extra}</div>
        ) : null}
      </BAIFlex>
    </BAIFlex>
  );
};

export default ProjectScopeErrorState;
