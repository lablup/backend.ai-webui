/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useMatches, type UIMatch } from 'react-router-dom';

/**
 * The same switch the Vite plugin reads (`1` / `true` / `on`). Paired with
 * `import.meta.env.DEV` at the call site so a production build folds the
 * branch — and this module with it — away.
 */
export const isDevReviewOverlayEnabled = (): boolean =>
  ['1', 'true', 'on'].includes(
    String(import.meta.env.VITE_DEV_REVIEW_OVERLAY ?? '').toLowerCase(),
  );

/** `handle.title` wins over `handle.labelKey`, as in `WebUIBreadcrumb`. */
const routeLabelFrom = (
  matches: Array<UIMatch>,
  t: (key: string) => string,
): string | undefined => {
  const parts = matches
    .map((match) => {
      const handle = match.handle as
        { title?: string; labelKey?: string } | null | undefined;
      return handle?.title || (handle?.labelKey ? t(handle.labelKey) : '');
    })
    .filter(Boolean);
  return parts.length ? parts.join(' › ') : undefined;
};

/**
 * Publishes the current route's ENGLISH label on `window.__BAI_REVIEW__` for
 * the dev review overlay (FR-3811), which lives outside React and so cannot
 * read `useMatches()` itself. English regardless of the user's language: the
 * label ends up in a PR comment other people read.
 */
const DevReviewRouteLabel: React.FC = () => {
  'use memo';
  const matches = useMatches();
  const { i18n } = useTranslation();

  useEffect(() => {
    const publish = () => {
      window.__BAI_REVIEW__ = {
        ...window.__BAI_REVIEW__,
        routeLabel: routeLabelFrom(matches, i18n.getFixedT('en')),
      };
    };
    publish();
    // `en` is `fallbackLng`, so i18next loads it at init — but the first
    // render can beat that fetch, which would publish raw keys.
    i18n.on('loaded', publish);
    return () => {
      i18n.off('loaded', publish);
    };
  }, [matches, i18n]);

  return null;
};

export default DevReviewRouteLabel;
