/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 GAP COMPONENT 1/5 (to-astryx ticket 08) — `BAISkeleton`.

 MAPPING.md §"Also COMPOSITION": antd `Skeleton` (94 files / 138 sites),
 `Skeleton.Input` (29 files / 34 sites) and `Skeleton.Button` (3 files / 3
 sites) all collapse onto Astryx's single `Skeleton`, which is ONE box
 (`width`, `height`, `radius`, `index` for the stagger). antd's multi-part
 shimmer — title bar + N paragraph rows + avatar — has to be composed.

 MEASURED usage (prop-profiles.json), and what this component does with it:

   Skeleton         active x138, style x20, paragraph x11
   Skeleton.Input   active x34,  block x27, size="small" x25
   Skeleton.Button  active x3,   size="small" x1

   `active`      -> DROPPED as a prop, kept as behaviour. Astryx `Skeleton` is
                    always animated; there is no static variant. 175/175 sites
                    passed `active`, so the prop carried no information.
   `paragraph`   -> `variant="paragraph"` + `rows` (the object form
                    `{rows: n}` becomes a scalar; `paragraph={false}` becomes
                    `hasParagraph={false}` / `variant="block"`).
   `block`       -> DROPPED. Astryx `Skeleton` already defaults `width: '100%'`,
                    which is exactly what `block` meant; 27/34 sites passed it.
   `size`        -> kept for `input`/`button`, resolved through the Astryx
                    element-size tokens rather than antd's control heights.
   `style`       -> passes through (Astryx `BaseProps`).

 NOT built, because nothing in the repo asks for it: `Skeleton.Avatar` as a
 standalone export, `Skeleton.Image`, `Skeleton.Node`, `loading` (call sites
 branch themselves), `round`, and `title={{width}}` / `paragraph={{width}}`
 per-row width objects. `hasAvatar` IS built (antd `avatar`), because the
 avatar+lines shape is what a list-row fallback needs and composing it at the
 call site is 15 lines every time.

 P10 note: `Skeleton.Input active` rendered an INPUT-shaped shimmer (a filled
 control-height box with antd's control radius). `variant="input"` reproduces
 the shape from `--size-element-*` + `radius={1}`; it is a rebuild, not a
 pixel port — see the size table below.

 Standard pairing (`use-bai-card.md`): this is the Suspense fallback INSIDE a
 `BAICardAstryx` body, so the card header stays visible while the body loads.

     <BAICardAstryx title={t('...')}>
       <Suspense fallback={<BAISkeletonAstryx rows={4} />}>
         <DataDrivenContent />
       </Suspense>
     </BAICardAstryx>

 FR-3514: this lives in BUI (not `react/src/components/astryx-bui/`) because
 `BAIModal`'s `loading` body needs it and BUI cannot import from `react/src`.
 `react/src/components/astryx-bui/BAISkeletonAstryx.tsx` re-exports it.
*/
import { Skeleton } from '@astryxdesign/core/Skeleton';
import type { SkeletonProps } from '@astryxdesign/core/Skeleton';
import { HStack, VStack } from '@astryxdesign/core/Stack';
import React from 'react';

export type BAISkeletonVariant = 'block' | 'paragraph' | 'input' | 'button';

/** antd's `size` on `Skeleton.Input` / `Skeleton.Button`. */
export type BAISkeletonSize = 'small' | 'default' | 'large';

/**
 * PILOT-DECISION: antd resolved these to its control heights (24 / 32 / 40).
 * Astryx's element-size tokens are 28 / 32 / 40, so `small` drifts +4px.
 * MAPPING.md §"Also COMPOSITION" already prescribes `height={28}` for the 25
 * `size="small"` sites, and the theme-shim records the same delta under
 * `controlHeightSM` (verdict `self`). Taking the Astryx token keeps a skeleton
 * the same height as the Astryx control it stands in for — which is the point
 * of the shape — at the cost of 4px against today's antd render.
 */
const ELEMENT_HEIGHT: Record<BAISkeletonSize, string> = {
  small: 'var(--size-element-sm)',
  default: 'var(--size-element-md)',
  large: 'var(--size-element-lg)',
};

/** antd's paragraph/title line box is 16px tall with 16px between lines. */
const LINE_HEIGHT = 16;
/** Astryx spacing step 4 = 16px. Steps are 4px multiples (P9). */
const LINE_GAP = 4;
/** antd shortens the last paragraph row when a title is present. */
const LAST_ROW_WIDTH = '61%';
/** antd narrows the title when an avatar shares the row. */
const TITLE_WIDTH_WITH_AVATAR = '38%';
/** antd `Skeleton.Avatar` default ("default" size). */
const AVATAR_SIZE = 32;
/** antd `Skeleton.Button` min-width, per size. */
const BUTTON_WIDTH: Record<BAISkeletonSize, number> = {
  small: 48,
  default: 64,
  large: 80,
};

export interface BAISkeletonAstryxProps extends Omit<
  SkeletonProps,
  'height' | 'index'
> {
  /**
   * Which antd skeleton shape this stands in for.
   * - `paragraph` (default): title bar + `rows` lines — antd's `<Skeleton />`
   * - `block`: a single box — `width`/`height` are yours
   * - `input`: a control-height filled box — antd's `<Skeleton.Input />`
   * - `button`: a control-height box of button width
   * @default 'paragraph'
   */
  variant?: BAISkeletonVariant;
  /**
   * Paragraph line count. antd's `paragraph={{ rows: n }}`.
   * @default 3
   */
  rows?: number;
  /**
   * Render the title bar above the paragraph. antd's `title`.
   * @default true
   */
  hasTitle?: boolean;
  /**
   * Render a round avatar to the left of the lines. antd's `avatar`.
   * @default false
   */
  hasAvatar?: boolean;
  /** `input` / `button` height, via the Astryx element-size tokens. */
  size?: BAISkeletonSize;
  /** `block` / `input` / `button` box height. Astryx `Skeleton.height`. */
  height?: SkeletonProps['height'];
  /**
   * Stagger offset for the first box. Successive boxes increment from here, so
   * two adjacent skeletons can share one continuous wave.
   * @default 0
   */
  startIndex?: number;
}

const BAISkeletonAstryx: React.FC<BAISkeletonAstryxProps> = ({
  variant = 'paragraph',
  rows = 3,
  hasTitle = true,
  hasAvatar = false,
  size = 'default',
  radius = 1,
  width,
  height,
  startIndex = 0,
  ...skeletonProps
}) => {
  'use memo';

  if (variant === 'block') {
    return (
      <Skeleton
        width={width}
        height={height}
        radius={radius}
        index={startIndex}
        {...skeletonProps}
      />
    );
  }

  if (variant === 'input' || variant === 'button') {
    return (
      <Skeleton
        // `block` is gone: Astryx already defaults width to '100%', which is
        // what the 27 `block` sites asked for. A button keeps antd's min-width.
        width={width ?? (variant === 'button' ? BUTTON_WIDTH[size] : '100%')}
        height={height ?? ELEMENT_HEIGHT[size]}
        radius={radius}
        index={startIndex}
        {...skeletonProps}
      />
    );
  }

  // `paragraph` — antd's default `<Skeleton active />`: an optional title bar
  // above `rows` lines, the last one short. `index` increments down the stack
  // so the shimmer reads as one wave instead of N synchronised pulses.
  let index = startIndex;
  const lines = (
    <VStack gap={LINE_GAP} align="stretch" width="100%">
      {hasTitle ? (
        <Skeleton
          width={hasAvatar ? TITLE_WIDTH_WITH_AVATAR : (width ?? '100%')}
          height={LINE_HEIGHT}
          radius={radius}
          index={index++}
          {...skeletonProps}
        />
      ) : null}
      {Array.from({ length: Math.max(0, rows) }, (_unused, row) => (
        <Skeleton
          key={row}
          width={
            row === rows - 1 && (hasTitle || rows > 1) ? LAST_ROW_WIDTH : '100%'
          }
          height={LINE_HEIGHT}
          radius={radius}
          index={index++}
          {...skeletonProps}
        />
      ))}
    </VStack>
  );

  return hasAvatar ? (
    <HStack gap={LINE_GAP} align="start" width="100%">
      <Skeleton
        width={AVATAR_SIZE}
        height={AVATAR_SIZE}
        radius="rounded"
        index={startIndex}
        {...skeletonProps}
      />
      {lines}
    </HStack>
  ) : (
    lines
  );
};

export default BAISkeletonAstryx;
