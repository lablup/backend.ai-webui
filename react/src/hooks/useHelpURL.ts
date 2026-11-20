/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useCurrentLanguage } from '../components/DefaultProviders';
import {
  hasUrlCredentials,
  isValidUrl,
} from '../diagnostics/rules/configRules';
import { resolveHelpDocPath } from '../helper/helpAnchors';
import {
  coerceUserSettingsCategory,
  USER_SETTINGS_PARAM,
} from '../helper/userSettingsModal';
import { useWebUILocation } from './index';
import { useCurrentMenuKey, useRouteScope } from './useRouteScope';
import { useEffectiveLoginConfig } from './useWebUIConfig';

// Languages the hosted user manual is published in; others fall back to English.
const DOCS_LANGUAGES = ['en', 'ko', 'ja', 'th'];
export const HOSTED_MANUAL_ROOT = 'https://webui.docs.backend.ai';

/** `https://webui.docs.backend.ai/<version>/<lang>/` for this build and language. */
export const buildHostedManualBaseURL = (
  packageVersion: string,
  lang: string,
): string => {
  const docsLang = DOCS_LANGUAGES.includes(lang) ? lang : 'en';
  // The manual is a versioned static site (FR-2729): a prerelease build has no
  // numbered docs site yet, so it tracks the `next` channel that every commit
  // rebuilds; a stable release uses its own `major.minor`.
  const docsVersion = packageVersion.includes('-')
    ? 'next'
    : packageVersion.split('.').slice(0, 2).filter(Boolean).join('.') || 'next';
  return `${HOSTED_MANUAL_ROOT}/${docsVersion}/${docsLang}/`;
};

/** The hosted manual's root for this build and language (the WebUI Assistant links into it). */
export const useManualBaseURL = (): { baseURL: string; docsLang: string } => {
  'use memo';
  const [lang] = useCurrentLanguage();
  return {
    baseURL: buildHostedManualBaseURL(globalThis.packageVersion ?? '', lang),
    docsLang: DOCS_LANGUAGES.includes(lang) ? lang : 'en',
  };
};

/**
 * The page the help button opens, `null` when help is hidden. An unset
 * `manualUrl` (System Settings) opens the hosted page for the route, an empty
 * one hides help, and an http(s) URL opens as is. A value the diagnostics
 * reject (not http(s), or with a user name or password) keeps the hosted page.
 */
export const resolveHelpURL = (
  manualUrl: string | null,
  hostedPageURL: string,
): string | null => {
  if (manualUrl === null) return hostedPageURL;
  const value = manualUrl.trim();
  if (value === '') return null;
  if (!isValidUrl(value) || hasUrlCredentials(value)) return hostedPageURL;
  return value;
};

/** The user manual page for the current route (and `?tab=` when it has one). */
export const useHelpURL = (): string | null => {
  'use memo';

  const [lang] = useCurrentLanguage();
  const location = useWebUILocation();
  const { manualUrl } = useEffectiveLoginConfig();

  const hostedBaseURL = buildHostedManualBaseURL(
    globalThis.packageVersion ?? '',
    lang,
  );

  // Scope-aware menu key (route handle): under `/admin/<feature>` and
  // `/project/:name/<feature>` the first pathname segment is the scope prefix,
  // so the lookup uses the matched route's menu key, not the pathname.
  const routeMenuKey = useCurrentMenuKey() || '';
  const routeScope = useRouteScope();
  const searchParams = new URLSearchParams(location.search);
  // An open settings modal covers whatever page is underneath, so it owns the
  // help target — otherwise the "?" would answer for the page behind it.
  const settingsCategory = coerceUserSettingsCategory(
    searchParams.get(USER_SETTINGS_PARAM),
  );
  const matchingKey = settingsCategory ? 'usersettings' : routeMenuKey;
  const activeTab = settingsCategory ?? searchParams.get('tab');

  return resolveHelpURL(
    manualUrl,
    hostedBaseURL +
      resolveHelpDocPath(
        matchingKey,
        activeTab,
        settingsCategory ? undefined : routeScope,
      ),
  );
};

/** Opens the current page's manual in a new tab; `null` when help is hidden. */
export const useOpenHelp = (): (() => void) | null => {
  'use memo';

  const url = useHelpURL();
  if (url === null) return null;
  return () => {
    window.open(url, '_blank', 'noopener noreferrer');
  };
};
