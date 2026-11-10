/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useCurrentLanguage } from '../components/DefaultProviders';
import { resolveHelpDocPath } from '../helper/helpAnchors';
import {
  coerceUserSettingsCategory,
  USER_SETTINGS_PARAM,
} from '../helper/userSettingsModal';
import { useWebUILocation } from './index';
import { useCurrentMenuKey } from './useRouteScope';
import { useEffectiveLoginConfig } from './useWebUIConfig';

// Languages the hosted user manual (https://webui.docs.backend.ai) is
// published in. Any other WebUI locale falls back to English.
const DOCS_LANGUAGES = ['en', 'ko', 'ja', 'th'];
export const HOSTED_MANUAL_ROOT = 'https://webui.docs.backend.ai';

/**
 * `<root>/<version>/<lang>/`: an http(s) `manualUrl` (System Settings) replaces
 * the hosted root, so a mirror keeps the hosted site's layout.
 */
export const buildManualBaseURL = (
  manualUrl: string,
  packageVersion: string,
  lang: string,
): string => {
  const custom = manualUrl.trim().replace(/\/+$/, '');
  const root = /^https?:\/\/[^/]/i.test(custom) ? custom : HOSTED_MANUAL_ROOT;
  const docsLang = DOCS_LANGUAGES.includes(lang) ? lang : 'en';
  // The manual is a versioned static site (FR-2729): a prerelease build has no
  // numbered docs site yet, so it tracks the `next` channel that every commit
  // rebuilds; a stable release uses its own `major.minor`.
  const docsVersion = packageVersion.includes('-')
    ? 'next'
    : packageVersion.split('.').slice(0, 2).filter(Boolean).join('.') || 'next';
  return `${root}/${docsVersion}/${docsLang}/`;
};

/** The user manual page for the current route (and `?tab=` when it has one). */
export const useHelpURL = (): string => {
  'use memo';

  const [lang] = useCurrentLanguage();
  const location = useWebUILocation();
  const { manualUrl } = useEffectiveLoginConfig();

  const manualURL = buildManualBaseURL(
    manualUrl,
    globalThis.packageVersion ?? '',
    lang,
  );

  // Scope-aware menu key (route handle): under `/admin/<feature>` and
  // `/project/:name/<feature>` the first pathname segment is the scope prefix,
  // so the lookup uses the matched route's menu key, not the pathname.
  const routeMenuKey = useCurrentMenuKey() || '';
  const searchParams = new URLSearchParams(location.search);
  // An open settings modal covers whatever page is underneath, so it owns the
  // help target — otherwise the "?" would answer for the page behind it.
  const settingsCategory = coerceUserSettingsCategory(
    searchParams.get(USER_SETTINGS_PARAM),
  );
  const matchingKey = settingsCategory ? 'usersettings' : routeMenuKey;
  const activeTab = settingsCategory ?? searchParams.get('tab');

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
