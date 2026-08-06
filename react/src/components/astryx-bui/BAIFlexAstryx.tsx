/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 PILOT PHASE 2 (cn-oss-removal / ticket 10) — local Astryx-backed `BAIFlex`.

 Parallel component; `packages/backend.ai-ui` is deliberately NOT modified.
 Import swapped only inside the pilot page's graph.

 Backed by Astryx `HStack`/`VStack`. The public prop contract stays BUI-shaped
 (`direction`/`justify`/`align`/`gap`/`wrap`/`style`) so call sites don't change.

 PILOT-DECISION: Astryx's `gap` is a CLOSED number-literal scale
 (0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10 — spacing steps, not pixels), while
 `BAIFlex` accepts a token name ('xxs'…'xxl'), an arbitrary number of pixels,
 or a CSS string. Arbitrary pixel gaps CANNOT be expressed. The mapping below
 snaps each BUI token to the nearest Astryx step and rounds raw pixel values to
 the nearest step, so a few call sites shift by 2–4px. Needs a design pass.
*/
import { HStack, VStack } from '@astryxdesign/core/Stack';
import React from 'react';

type AstryxGap = 0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10;

const STEPS: Array<AstryxGap> = [0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10];

/** Astryx spacing steps are 4px-based: step n ≈ 4n px. */
const TOKEN_TO_STEP: Record<string, AstryxGap> = {
  xxs: 0.5, // ~2px  (BUI 4px)
  xs: 1, //   ~4px  (BUI 8px)
  sm: 2, //   ~8px  (BUI 12px)
  md: 4, //  ~16px  (BUI 16px)  <- exact
  lg: 6, //  ~24px  (BUI 24px)  <- exact
  xl: 8, //  ~32px
  xxl: 10, // ~40px
};

function toGap(gap: unknown): AstryxGap | undefined {
  if (gap == null) return undefined;
  if (typeof gap === 'string') {
    if (gap in TOKEN_TO_STEP) return TOKEN_TO_STEP[gap];
    const parsed = Number.parseFloat(gap);
    if (Number.isNaN(parsed)) return undefined;
    return nearestStep(parsed / 4);
  }
  if (typeof gap === 'number') return nearestStep(gap / 4);
  return undefined;
}

function nearestStep(value: number): AstryxGap {
  return STEPS.reduce((best, step) =>
    Math.abs(step - value) < Math.abs(best - value) ? step : best,
  );
}

export interface BAIFlexAstryxProps {
  direction?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  justify?: 'start' | 'end' | 'center' | 'between' | 'around';
  align?: 'start' | 'end' | 'center' | 'baseline' | 'stretch';
  gap?: string | number | Array<string | number>;
  style?: React.CSSProperties;
  className?: string;
  children?: React.ReactNode;
  [key: string]: unknown;
}

const BAIFlexAstryx: React.FC<BAIFlexAstryxProps> = ({
  direction = 'row',
  wrap = 'nowrap',
  justify = 'start',
  align = 'center',
  gap,
  style,
  className,
  children,
  ...rest
}) => {
  'use memo';
  // BUI supports an [rowGap, colGap] tuple; Astryx has one scalar gap.
  // PILOT-DECISION: the first value wins.
  const resolvedGap = toGap(Array.isArray(gap) ? gap[0] : gap);

  // `baseline` has no Astryx counterpart (its cross-axis enum stops at
  // start/center/end/stretch). PILOT-DECISION: falls back to `start`.
  const crossAlign = align === 'baseline' ? 'start' : align;

  const isColumn = direction === 'column' || direction === 'column-reverse';
  const Comp = isColumn ? VStack : HStack;

  return (
    <Comp
      gap={resolvedGap}
      justify={justify}
      align={crossAlign}
      wrap={wrap}
      className={className}
      style={{
        // `row-reverse` / `column-reverse` are not Astryx props.
        ...(direction.endsWith('-reverse')
          ? { flexDirection: direction as React.CSSProperties['flexDirection'] }
          : null),
        ...style,
      }}
      {...rest}
    >
      {children}
    </Comp>
  );
};

export default BAIFlexAstryx;
