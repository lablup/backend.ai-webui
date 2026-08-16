/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useCurrentLanguage } from '../components/DefaultProviders';
import { resolveHelpDocPath } from '../helper/helpAnchors';
import { useWebUILocation } from './index';
import { useCurrentMenuKey } from './useRouteScope';

// Languages the hosted user manual (https://webui.docs.backend.ai) is
// published in. Any other WebUI locale falls back to English.
const DOCS_LANGUAGES = ['en', 'ko', 'ja', 'th'];

/** The hosted manual page for the current route (and `?tab=` when it has one). */
export const useHelpURL = (): string => {
  'use memo';

  const [lang] = useCurrentLanguage();
  const location = useWebUILocation();

  const docsLang = DOCS_LANGUAGES.includes(lang) ? lang : 'en';
  // The manual is a versioned static site (FR-2729): a prerelease build has no
  // numbered docs site yet, so it tracks the `next` channel that every commit
  // rebuilds; a stable release uses its own `major.minor`.
  const rawVersion = globalThis.packageVersion ?? '';
  const docsVersion = rawVersion.includes('-')
    ? 'next'
    : rawVersion.split('.').slice(0, 2).filter(Boolean).join('.') || 'next';
  const manualURL = `https://webui.docs.backend.ai/${docsVersion}/${docsLang}/`;

  // Scope-aware menu key (route handle): under `/admin/<feature>` and
  // `/project/:name/<feature>` the first pathname segment is the scope prefix,
  // so the lookup uses the matched route's menu key, not the pathname.
  const matchingKey = useCurrentMenuKey() || '';
  const activeTab = new URLSearchParams(location.search).get('tab');

  return manualURL + resolveHelpDocPath(matchingKey, activeTab);
};

/** Opens the current page's manual in a new tab. */
export const useOpenHelp = (): (() => void) => {
  'use memo';

  const url = useHelpURL();
  return () => {
    window.open(url, '_blank', 'noopener noreferrer');
  };
};
