/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 PILOT PHASE 2 (cn-oss-removal / ticket 10) — local Astryx-backed `BAIFlex`.

 Parallel component; `packages/backend.ai-ui` is deliberately NOT modified.
 Import swapped only inside the pilot page's graph.

 Backed by Astryx `HStack`/`VStack`. The public prop contract stays BUI-shaped
 (`direction`/`justify`/`align`/`gap`/`wrap`/`style`) so call sites don't change.

 PILOT-DECISION (corrected in phase 3): Astryx's `gap` is a CLOSED
 number-literal scale — step n is exactly 4n px, and only
 0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10 exist (0…40px).

 The phase-2 mapping was WRONG on 4 of 7 tokens because it snapped BUI's token
 NAMES to plausible-looking steps instead of resolving what those names actually
 evaluate to. `BAIFlex` resolves `gap="md"` to antd's `token.sizeMD`, which is
 **20px**, not 16px. That mis-mapping is what made the converted page's vertical
 rhythm visibly tighter than the antd original.

 Correct table (BUI token -> antd px -> Astryx step):
   xxs -> sizeXXS  4px -> 1
   xs  -> sizeXS   8px -> 2
   sm  -> sizeSM  12px -> 3
   md  -> sizeMD  20px -> 5
   lg  -> sizeLG  24px -> 6
   xl  -> sizeXL  32px -> 8
   xxl -> sizeXXL 48px -> INEXPRESSIBLE (the enum stops at 10 = 40px)

 So 6 of 7 land exactly and **1 of 7 (14%) forces an explicit CSS override** —
 that ratio is the answer to "how often does the closed scale force an escape
 hatch". Raw pixel gaps (`gap={10}`) are a second escape-hatch source: any value
 that is not a multiple of 4 within 0-40 also needs one.
*/
import { HStack, VStack } from '@astryxdesign/core/Stack';
import React from 'react';

type AstryxGap = 0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10;

const STEPS: Array<AstryxGap> = [0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10];

/** Astryx spacing steps are 4px-based: step n ≈ 4n px. */
const TOKEN_TO_STEP: Record<string, AstryxGap> = {
  xxs: 1, //  4px — exact
  xs: 2, //   8px — exact
  sm: 3, //  12px — exact
  md: 5, //  20px — exact
  lg: 6, //  24px — exact
  xl: 8, //  32px — exact
};

/**
 * Tokens the step scale cannot express. Applied as a literal `gap` CSS value
 * instead, which is the documented escape hatch.
 */
const TOKEN_TO_RAW_PX: Record<string, number> = {
  xxl: 48,
};

/** Resolves a BUI gap to either an exact Astryx step or a raw px override. */
function toGap(gap: unknown): { step?: AstryxGap; rawPx?: number } {
  if (gap == null) return {};
  if (typeof gap === 'string') {
    if (gap in TOKEN_TO_STEP) return { step: TOKEN_TO_STEP[gap] };
    if (gap in TOKEN_TO_RAW_PX) return { rawPx: TOKEN_TO_RAW_PX[gap] };
    const parsed = Number.parseFloat(gap);
    if (Number.isNaN(parsed)) return {};
    return toGap(parsed);
  }
  if (typeof gap === 'number') {
    const step = gap / 4;
    // Only accept an EXACT step; anything else keeps its literal pixel value
    // rather than silently snapping (which is what shifted the phase-2 layout).
    if ((STEPS as Array<number>).includes(step))
      return { step: step as AstryxGap };
    return { rawPx: gap };
  }
  return {};
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
      gap={resolvedGap.step}
      justify={justify}
      align={crossAlign}
      wrap={wrap}
      className={className}
      style={{
        // `row-reverse` / `column-reverse` are not Astryx props.
        ...(direction.endsWith('-reverse')
          ? { flexDirection: direction as React.CSSProperties['flexDirection'] }
          : null),
        // The documented escape hatch for gaps the closed scale cannot express.
        ...(resolvedGap.rawPx != null ? { gap: resolvedGap.rawPx } : null),
        ...style,
      }}
      {...rest}
    >
      {children}
    </Comp>
  );
};

export default BAIFlexAstryx;
