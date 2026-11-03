/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import BAIErrorBoundary from '../components/BAIErrorBoundary';
import WebUISettingList from '../components/WebUISettingList';
import { WEBUI_SETTINGS_CONFIG_KEY } from '../helper/webuiSettings';
import {
  useDomainAppConfig,
  useRawPublicDomainAppConfig,
} from '../hooks/useAppConfig';
import { BAICard, BAIFlex, BAISkeleton } from 'backend.ai-ui';
import { parseAsStringLiteral, useQueryState } from 'nuqs';
import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';

/** Reads both saved documents: the public (pre-login) slice and the domain one. */
const SavedWebUISettingList: React.FC = () => {
  'use memo';
  const savedDomainSettings = useDomainAppConfig(WEBUI_SETTINGS_CONFIG_KEY);
  const savedPublicSettings = useRawPublicDomainAppConfig(
    WEBUI_SETTINGS_CONFIG_KEY,
  );
  return (
    <WebUISettingList
      savedDomainSettings={savedDomainSettings}
      savedPublicSettings={savedPublicSettings}
    />
  );
};

const WebUISettingsPage: React.FC = () => {
  'use memo';
  const { t } = useTranslation();
  const [curTabKey] = useQueryState(
    'tab',
    parseAsStringLiteral(['settings']).withDefault('settings'),
  );

  return (
    <BAICard
      activeTabKey={curTabKey}
      tabList={[{ key: 'settings', label: t('webui.menu.SystemSettings') }]}
    >
      <BAIFlex direction="column" align="stretch" gap="md">
        <Suspense fallback={<BAISkeleton />}>
          <BAIErrorBoundary>
            <SavedWebUISettingList />
          </BAIErrorBoundary>
        </Suspense>
      </BAIFlex>
    </BAICard>
  );
};

export default WebUISettingsPage;
