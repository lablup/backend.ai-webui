/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import BAIErrorBoundary from '../../components/BAIErrorBoundary';
import { WEBUI_SETTINGS_CONFIG_KEY } from '../../helper/webuiSettings';
import {
  useCurrentDomain,
  useSuspendedBackendaiClient,
  useTabQuerySnapshot,
} from '../../hooks';
import { PUBLIC_SCOPE, useScopedAppConfig } from '../../hooks/useAppConfig';
import {
  domainWebUISettingsState,
  publicWebUISettingsState,
} from '../../hooks/useWebUIConfig';
import ConfigurationsSettingList from './components/ConfigurationsSettingList';
import WebUISettingList from './components/WebUISettingList';
import { BAICard, BAIFlex, BAISkeleton } from 'backend.ai-ui';
import { useSetAtom } from 'jotai';
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
  // One request for both documents the page edits.
  const config = useScopedAppConfig([
    { scope: domainScope, configNames: ['domainConfig'] },
    { scope: PUBLIC_SCOPE, configNames: ['publicConfigByDomain'] },
  ]);
  const setDomainLayer = useSetAtom(domainWebUISettingsState);
  const setPublicLayer = useSetAtom(publicWebUISettingsState);
  return (
    <WebUISettingList
      savedDomainSettings={
        config.domain?.domainConfig?.[WEBUI_SETTINGS_CONFIG_KEY]
      }
      savedPublicSettings={
        config.public?.publicConfigByDomain?.[domainName]?.[
          WEBUI_SETTINGS_CONFIG_KEY
        ]
      }
      setDomainSettings={async (value) => {
        const written = await config.upsert({
          scope: domainScope,
          configName: 'domainConfig',
          subKey: WEBUI_SETTINGS_CONFIG_KEY,
          value,
        });
        setDomainLayer(
          written.domain?.domainConfig?.[WEBUI_SETTINGS_CONFIG_KEY],
        );
      }}
      setPublicSettings={async (value) => {
        const written = await config.upsert({
          scope: PUBLIC_SCOPE,
          configName: 'publicConfigByDomain',
          subKey: [domainName, WEBUI_SETTINGS_CONFIG_KEY],
          value,
        });
        setPublicLayer(
          written.public?.publicConfigByDomain?.[domainName]?.[
            WEBUI_SETTINGS_CONFIG_KEY
          ],
        );
      }}
    />
  );
};

const WebUISettingsPage: React.FC = () => {
  'use memo';
  const { t } = useTranslation();
  const baiClient = useSuspendedBackendaiClient();
  const { currentTab, onTabChange } = useTabQuerySnapshot(tabParser);

  // The Configurations tab replaced the `settings` sidebar entry (#10684), so
  // the menu lists keyed on `settings` still govern it: blocked hides the
  // tab, inactive shows it disabled but keeps the URL reachable.
  const showsConfigurations = !(baiClient._config.blockList ?? []).includes(
    'settings',
  );
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
