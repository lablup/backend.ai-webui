/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import React from 'react';

export type SessionMonitorThinBarVariant =
  'accent' | 'success' | 'warning' | 'error';

/**
 * A 6px track with a proportional fill and no minimum width, so 0% reads as
 * an empty bar (Astryx `ProgressBar` keeps a visible sliver at 0).
 */
const SessionMonitorThinBar: React.FC<{
  percent: number;
  variant?: SessionMonitorThinBarVariant;
  label: string;
}> = ({ percent, variant = 'accent', label }) => {
  'use memo';
  const clamped = Math.max(0, Math.min(100, percent));
  const width = clamped < 1 ? 0 : clamped;
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped)}
      style={{
        height: 6,
        borderRadius: 'var(--radius-full)',
        background: 'var(--color-background-muted)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: `${width}%`,
          height: '100%',
          borderRadius: 'var(--radius-full)',
          background: `var(--color-${variant})`,
          transition: 'width 300ms ease',
        }}
      />
    </div>
  );
};

export default SessionMonitorThinBar;
