/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import BAIErrorBoundary from '../components/BAIErrorBoundary';
import ConfigurationsSettingList from '../components/ConfigurationsSettingList';
import WebUISettingList from '../components/WebUISettingList';
import { WEBUI_SETTINGS_CONFIG_KEY } from '../helper/webuiSettings';
import { useSuspendedBackendaiClient, useTabQuerySnapshot } from '../hooks';
import { useCurrentUserRole } from '../hooks/backendai';
import {
  useDomainAppConfig,
  usePublicDomainAppConfig,
} from '../hooks/useAppConfig';
import { BAICard, BAIFlex, BAISkeleton } from 'backend.ai-ui';
import { parseAsStringLiteral } from 'nuqs';
import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';

const tabParser = parseAsStringLiteral([
  'settings',
  'configurations',
]).withDefault('settings');

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
  const baiClient = useSuspendedBackendaiClient();
  const isSuperAdmin = useCurrentUserRole() === 'superadmin';
  const { currentTab, onTabChange } = useTabQuerySnapshot(tabParser);

  // The Configurations tab replaced the `settings` sidebar entry (#10684), so
  // the menu lists keyed on `settings` still govern it: blocked hides the
  // tab, inactive shows it disabled but keeps the URL reachable.
  const showsConfigurations =
    isSuperAdmin && !(baiClient._config.blockList ?? []).includes('settings');
  const isConfigurationsInactive = (
    baiClient._config.inactiveList ?? []
  ).includes('settings');
  const activeTab = showsConfigurations ? currentTab : 'settings';

  return (
    <BAICard
      activeTabKey={activeTab}
      onTabChange={onTabChange}
      tabList={[
        { key: 'settings', label: t('webui.menu.SystemSettings') },
        ...(showsConfigurations
          ? [
              {
                key: 'configurations',
                label: t('webui.menu.Configurations'),
                disabled: isConfigurationsInactive,
              },
            ]
          : []),
      ]}
    >
      <BAIFlex direction="column" align="stretch" gap="md">
        <Suspense fallback={<BAISkeleton />}>
          {activeTab === 'settings' && (
            <BAIErrorBoundary>
              {isSuperAdmin ? (
                <SuperadminWebUISettingList />
              ) : (
                <DomainAdminWebUISettingList />
              )}
            </BAIErrorBoundary>
          )}
          {activeTab === 'configurations' && (
            <BAIErrorBoundary>
              <ConfigurationsSettingList />
            </BAIErrorBoundary>
          )}
        </Suspense>
      </BAIFlex>
    </BAICard>
  );
};

export default WebUISettingsPage;
