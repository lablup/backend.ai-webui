/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { applyDevServerTitle, devServerTitlePrefix } from './devServerTitle';

const FALLBACK_BASE_TITLE = 'Backend.AI';

// index.html's <title>, read once at import — before any route rewrites it.
const initialTitle = typeof document !== 'undefined' ? document.title : '';

/** The app name every tab title ends with, without the dev-server prefix. */
export const getBaseDocumentTitle = (): string => {
  const prefix = devServerTitlePrefix();
  const title =
    prefix && initialTitle.startsWith(prefix)
      ? initialTitle.slice(prefix.length)
      : initialTitle;
  return title || FALLBACK_BASE_TITLE;
};

/** `Sessions · Backend.AI`, or just the base title when there is no label. */
export const formatDocumentTitle = (
  pageLabel: string | undefined,
  baseTitle: string = getBaseDocumentTitle(),
): string => (pageLabel ? `${pageLabel} · ${baseTitle}` : baseTitle);

/** Sets the tab title for a page; the dev-server prefix is re-applied on top. */
export const applyRouteDocumentTitle = (pageLabel: string | undefined) => {
  document.title = formatDocumentTitle(pageLabel);
  applyDevServerTitle();
};
