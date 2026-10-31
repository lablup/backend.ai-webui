/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useTranslation } from 'react-i18next';
import { useMatches, type UIMatch } from 'react-router-dom';

interface LabelHandle {
  title?: string;
  labelKey?: string;
}

/** The deepest match's label; `handle.title` wins over `handle.labelKey`, as in `WebUIBreadcrumb`. */
export const routeLabelOf = (
  matches: ReadonlyArray<UIMatch>,
  t: (key: string) => string,
): string | undefined => {
  for (let i = matches.length - 1; i >= 0; i--) {
    const handle = matches[i]?.handle as LabelHandle | null | undefined;
    const label = handle?.title || (handle?.labelKey ? t(handle.labelKey) : '');
    if (label) return label;
  }
  return undefined;
};

/** The translated label of the current page, or `undefined` for unlabelled routes. */
export const useCurrentRouteLabel = (): string | undefined => {
  'use memo';
  const matches = useMatches();
  const { t } = useTranslation();
  return routeLabelOf(matches, t);
};
