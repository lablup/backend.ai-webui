/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 antd-parity skeleton composed from Astryx's single-box `Skeleton`: antd's
 multi-part shimmer (title + paragraph rows, avatar, input/button shapes)
 collapses onto `variant` + `rows`/`hasTitle`/`hasAvatar`. `active` is dropped
 as a prop (Astryx skeletons are always animated); `block` is dropped (Astryx
 already defaults `width: '100%'`). Mapping evidence: MAPPING.md §"Also
 COMPOSITION" (FR-3482); moved here from react/src/components/astryx-bui in
 FR-3513 so BUI components (e.g. `BAIModal`'s loading body) can share it.

 Standard pairing (`use-bai-card.md`): the Suspense fallback INSIDE a card
 body, so the header stays visible while the body loads.
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
 * Astryx's element-size tokens are 28 / 32 / 40, so `small` drifts +4px —
 * deliberate, so a skeleton matches the Astryx control it stands in for.
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

export interface BAISkeletonProps extends Omit<
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

const BAISkeleton: React.FC<BAISkeletonProps> = ({
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

export default BAISkeleton;
