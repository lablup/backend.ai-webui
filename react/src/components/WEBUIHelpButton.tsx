/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { resolveHelpDocPath } from '../helper/helpAnchors';
import { useCurrentMenuKey } from '../hooks/useRouteScope';
import { useCurrentLanguage } from './DefaultProviders';
import { IconButton } from '@astryxdesign/core/IconButton';
import { CircleHelp } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

// Languages the hosted user manual (https://webui.docs.backend.ai) is
// published in. Any other WebUI locale falls back to English.
const DOCS_LANGUAGES = ['en', 'ko', 'ja', 'th'];

// PILOT-DECISION: antd `Button type="text" icon href target="_blank"` →
// Astryx `IconButton variant="ghost"` + `window.open` (MAPPING §3.3).
// `IconButton` has no `href` (it renders a <button>), and MAPPING's `href`
// branch (`Link`) would drop the header's icon-button chrome. The anchor
// affordances (middle-click, "copy link address") are lost; the click
// behaviour and the new-tab target are identical.
// P1 grep: the only consumer (WebUIHeader) passes `data-testid` alone.
interface WEBUIHelpButtonProps {
  'data-testid'?: string;
}
const WEBUIHelpButton: React.FC<WEBUIHelpButtonProps> = ({ ...props }) => {
  'use memo';
  const { t } = useTranslation();
  const [lang] = useCurrentLanguage();
  const location = useLocation();

  const docsLang = DOCS_LANGUAGES.includes(lang) ? lang : 'en';
  // The manual is published as a versioned static site (FR-2729): stable
  // releases live under their `major.minor` (e.g. "26.7") and the
  // in-development tip lives under the `next` channel. Map the running WebUI
  // build to the matching docs channel so the "?" opens docs for this build:
  //   - a prerelease build (e.g. "26.5.0-alpha.0") tracks the workspace tip
  //     and there is no numbered docs site for it yet → use `next`;
  //   - a stable release → its `major.minor`.
  // Fall back to `next` when the version is unknown (numbered docs may not
  // exist, but `next` is rebuilt on every commit and always present).
  const rawVersion = globalThis.packageVersion ?? '';
  const docsVersion = rawVersion.includes('-')
    ? 'next'
    : rawVersion.split('.').slice(0, 2).filter(Boolean).join('.') || 'next';
  const manualURL = `https://webui.docs.backend.ai/${docsVersion}/${docsLang}/`;

  // Scope-aware menu key (route handle): under the `/admin/<feature>` and
  // `/project/:name/<feature>` URLs the first pathname segment is the scope
  // prefix, so the help-anchor lookup uses the matched route's menu key.
  const matchingKey = useCurrentMenuKey() || '';
  const activeTab = new URLSearchParams(location.search).get('tab');
  const URL = manualURL + resolveHelpDocPath(matchingKey, activeTab);

  return (
    <IconButton
      variant="ghost"
      label={t('webui.menu.Help')}
      icon={<CircleHelp size="1em" />}
      onClick={() => {
        window.open(URL, '_blank', 'noopener noreferrer');
      }}
      {...props}
    />
  );
};

export default WEBUIHelpButton;
