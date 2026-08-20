/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useEffect, useEffectEvent, useState } from 'react';

/**
 * Resolve a tour's DOM anchors once `isActive` turns on.
 *
 * A tour can activate before the DOM it points at exists — the review summary
 * suspends on a Relay query, so `.bai-card-error` lands after the commit that
 * flips the tour on. The first attempt is retried on every DOM mutation until
 * it succeeds, so the wait is bounded by the anchor appearing rather than by a
 * wall-clock guess that a slow backend would blow through (FR-3546).
 *
 * `resolve` must return `null` while the DOM is not ready yet; anything
 * non-null ends the search.
 */
export const useTourTargets = <T>(
  isActive: boolean,
  resolve: () => T | null,
): T | null => {
  'use memo';
  const [targets, setTargets] = useState<T | null>(null);
  const resolveTargets = useEffectEvent(() => resolve());

  useEffect(() => {
    let observer: MutationObserver | null = null;

    // Returns true when the search is over — resolved, or not wanted at all.
    const attempt = () => {
      if (!isActive) {
        setTargets(null);
        return true;
      }
      const next = resolveTargets();
      if (!next) {
        return false;
      }
      setTargets(next);
      return true;
    };

    // Never set state synchronously in the effect
    // (react-hooks/set-state-in-effect) — the first attempt is a frame away.
    const frame = requestAnimationFrame(() => {
      if (attempt()) {
        return;
      }
      observer = new MutationObserver(() => {
        if (attempt()) {
          observer?.disconnect();
          observer = null;
        }
      });
      // `.bai-card-error` arrives either with the card (childList) or as a
      // class added to one already mounted (attributes).
      observer.observe(document.body, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ['class'],
      });
    });

    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, [isActive]);

  return targets;
};

export default useTourTargets;
