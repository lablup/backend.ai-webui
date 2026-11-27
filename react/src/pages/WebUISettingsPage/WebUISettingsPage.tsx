/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import BAIErrorBoundary from '../../components/BAIErrorBoundary';
import { WEBUI_SETTINGS_CONFIG_KEY } from '../../helper/webuiSettings';
import { useCurrentDomain, useTabQuerySnapshot } from '../../hooks';
import { PUBLIC_SCOPE, useScopedAppConfig } from '../../hooks/useAppConfig';
import { useEffectiveLoginConfig } from '../../hooks/useWebUIConfig';
import ConfigurationsSettingList from './components/ConfigurationsSettingList';
import WebUISettingList from './components/WebUISettingList';
import { BAICard, BAIFlex, BAISkeleton } from 'backend.ai-ui';
import { parseAsStringLiteral } from 'nuqs';
import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';

const tabParser = parseAsStringLiteral([
  'settings',
  'configurations',
]).withDefault('settings');

/** Reads both saved documents: the public (pre-login) slice and the domain one. */
const SavedWebUISettingList: React.FC = () => {
  'use memo';
  const { id: domainId, name: domainName } = useCurrentDomain();
  const domainScope = { type: 'domain', id: domainId } as const;
  // One read per scope, one after the other (ADR 0033).
  const domain = useScopedAppConfig(domainScope, ['domainConfig']);
  const publicConfig = useScopedAppConfig(PUBLIC_SCOPE, [
    'publicConfigByDomain',
  ]);
  // A change rebuilds both settings layers from these reads, so an unreadable
  // scope would reset its live settings to the defaults: show the error instead.
  if (!domain.scopedAppConfig || !publicConfig.scopedAppConfig) {
    throw new Error(
      `System Settings could not read the ${domain.scopedAppConfig ? 'public' : 'domain'} settings document`,
    );
  }
  return (
    <WebUISettingList
      savedDomainSettings={
        domain.scopedAppConfig.domainConfig?.[WEBUI_SETTINGS_CONFIG_KEY]
      }
      savedPublicSettings={
        publicConfig.scopedAppConfig.publicConfigByDomain?.[domainName]?.[
          WEBUI_SETTINGS_CONFIG_KEY
        ]
      }
      setDomainSettings={async (value) => {
        await domain.upsertScopedAppConfig({
          configName: 'domainConfig',
          subKey: WEBUI_SETTINGS_CONFIG_KEY,
          value,
        });
      }}
      setPublicSettings={async (value) => {
        await publicConfig.upsertScopedAppConfig({
          configName: 'publicConfigByDomain',
          subKey: [domainName, WEBUI_SETTINGS_CONFIG_KEY],
          value,
        });
      }}
    />
  );
};

const WebUISettingsPage: React.FC = () => {
  'use memo';
  const { t } = useTranslation();
  const loginConfig = useEffectiveLoginConfig();
  const { currentTab, onTabChange } = useTabQuerySnapshot(tabParser);

  // The Configurations tab replaced the `settings` sidebar entry (#10684), so
  // the menu lists keyed on `settings` still govern it: blocked hides the
  // tab, inactive shows it disabled but keeps the URL reachable.
  const showsConfigurations = !(loginConfig.blockList ?? []).includes(
    'settings',
  );
  const isConfigurationsInactive = (loginConfig.inactiveList ?? []).includes(
    'settings',
  );
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
              <SavedWebUISettingList />
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
