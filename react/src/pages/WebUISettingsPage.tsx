/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import BAIErrorBoundary from '../components/BAIErrorBoundary';
import WebUISettingList from '../components/WebUISettingList';
import { WEBUI_SETTINGS_CONFIG_KEY } from '../helper/webuiSettings';
import { useCurrentUserRole } from '../hooks/backendai';
import {
  useDomainAppConfig,
  usePublicDomainAppConfig,
} from '../hooks/useAppConfig';
import { Text } from '@lablup/ui-common/Text';
import { BAICard, BAIFlex, BAISkeleton } from 'backend.ai-ui';
import { parseAsStringLiteral, useQueryState } from 'nuqs';
import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';

/** Superadmins also read the public (pre-login) slice; domain admins cannot. */
const SuperadminWebUISettingList: React.FC = () => {
  'use memo';
  const savedDomainSettings = useDomainAppConfig(WEBUI_SETTINGS_CONFIG_KEY);
  const savedPublicSettings = usePublicDomainAppConfig(
    WEBUI_SETTINGS_CONFIG_KEY,
  );
  return (
    <WebUISettingList
      savedDomainSettings={savedDomainSettings}
      savedPublicSettings={savedPublicSettings}
      canEditPublic
    />
  );
};

const DomainAdminWebUISettingList: React.FC = () => {
  'use memo';
  const savedDomainSettings = useDomainAppConfig(WEBUI_SETTINGS_CONFIG_KEY);
  return (
    <WebUISettingList
      savedDomainSettings={savedDomainSettings}
      canEditPublic={false}
    />
  );
};

const WebUISettingsPage: React.FC = () => {
  'use memo';
  const { t } = useTranslation();
  const isSuperAdmin = useCurrentUserRole() === 'superadmin';
  const [curTabKey] = useQueryState(
    'tab',
    parseAsStringLiteral(['settings']).withDefault('settings'),
  );

  return (
    <BAICard
      activeTabKey={curTabKey}
      tabList={[{ key: 'settings', label: t('webui.menu.WebUISettings') }]}
    >
      <BAIFlex direction="column" align="stretch" gap="md">
        <Text color="secondary">{t('webuiSettings.PageDesc')}</Text>
        <Suspense fallback={<BAISkeleton />}>
          <BAIErrorBoundary>
            {isSuperAdmin ? (
              <SuperadminWebUISettingList />
            ) : (
              <DomainAdminWebUISettingList />
            )}
          </BAIErrorBoundary>
        </Suspense>
      </BAIFlex>
    </BAICard>
  );
};

export default WebUISettingsPage;
