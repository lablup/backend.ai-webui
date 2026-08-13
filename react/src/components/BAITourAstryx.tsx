/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Tour, type TourProps, useTour } from '@astryxdesign/lab';
import React, { useEffect, useEffectEvent } from 'react';

export interface BAITourAstryxProps extends TourProps {
  /**
   * Ordered scroll targets, one per RENDERED `TourStep` (skip steps that are
   * not rendered). When a step activates and its target sits outside the
   * viewport, it is scrolled into view — antd Tour `scrollIntoViewOptions`
   * parity (FR-3526).
   */
  scrollTargets?: Array<HTMLElement | null | undefined>;
}

// lab TourStep spotlights the target at its current box but never scrolls it
// on screen, so an off-viewport step points at nothing (FR-3526).
const ActiveTargetScroller: React.FC<{
  targets: Array<HTMLElement | null | undefined>;
}> = ({ targets }) => {
  'use memo';
  const tour = useTour();
  const activeStepIndex = tour?.activeStepIndex ?? -1;

  const scrollActiveTargetIntoView = useEffectEvent(() => {
    const el = activeStepIndex >= 0 ? targets[activeStepIndex] : null;
    if (!el) {
      return;
    }
    const box = el.getBoundingClientRect();
    const isInViewport =
      box.top >= 0 &&
      box.left >= 0 &&
      box.bottom <= window.innerHeight &&
      box.right <= window.innerWidth;
    if (!isInViewport) {
      el.scrollIntoView({ block: 'center' });
    }
  });

  useEffect(() => {
    scrollActiveTargetIntoView();
  }, [activeStepIndex]);

  return null;
};

const BAITourAstryx: React.FC<BAITourAstryxProps> = ({
  scrollTargets,
  children,
  ...tourProps
}) => {
  'use memo';
  return (
    <Tour {...tourProps}>
      {scrollTargets ? <ActiveTargetScroller targets={scrollTargets} /> : null}
      {children}
    </Tour>
  );
};

export default BAITourAstryx;
