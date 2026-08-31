/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useMatches } from 'react-router-dom';

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
    const labelKeys = matches
      .map((match) => (match.handle as { labelKey?: string } | null)?.labelKey)
      .filter((key): key is string => !!key);
    let cancelled = false;
    const publish = async () => {
      let routeLabel: string | undefined;
      if (labelKeys.length) {
        await i18n.loadLanguages('en');
        if (cancelled) return;
        const t = i18n.getFixedT('en');
        routeLabel = labelKeys.map((key) => t(key)).join(' › ');
      }
      window.__BAI_REVIEW__ = { ...window.__BAI_REVIEW__, routeLabel };
    };
    void publish();
    return () => {
      cancelled = true;
    };
  }, [matches, i18n]);

  return null;
};

export default DevReviewRouteLabel;
