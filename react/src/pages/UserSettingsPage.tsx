import ErrorLogList from '../components/ErrorLogList';
import MyKeypairInfoModal from '../components/MyKeypairInfoModal';
import SSHKeypairManagementModal from '../components/SSHKeypairManagementModal';
import SettingList, { SettingGroup } from '../components/SettingList';
import ShellScriptEditModal from '../components/ShellScriptEditModal';
import {
  useBAISettingGeneralState,
  useBAISettingUserState,
} from '../hooks/useBAISetting';
import { SettingOutlined } from '@ant-design/icons';
import { useToggle } from 'ahooks';
import { App, Button, Typography } from 'antd';
import Card from 'antd/es/card/Card';
import { filterOutEmpty } from 'backend.ai-ui';
import _ from 'lodash';
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { StringParam, useQueryParam, withDefault } from 'use-query-params';

type TabKey = 'general' | 'logs';
export type ShellScriptType = 'bootstrap' | 'userconfig' | undefined;

const tabParam = withDefault(StringParam, 'general');

const UserPreferencesPage = () => {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [curTabKey, setCurTabKey] = useQueryParam('tab', tabParam);

  const [desktopNotification, setDesktopNotification] = useBAISettingUserState(
    'desktop_notification',
  );
  const [compactSidebar, setCompactSidebar] =
    useBAISettingUserState('compact_sidebar');
  const [selectedLanguage, setSelectedLanguage] =
    useBAISettingUserState('selected_language');
  const [, setLanguage] = useBAISettingGeneralState('language');
  const [autoAutomaticUpdateCheck, setAutoAutomaticUpdateCheck] =
    useBAISettingUserState('automatic_update_check');
  const [autoLogout, setAutoLogout] = useBAISettingUserState('auto_logout');
  const [isOpenSSHKeypairInfoModal, { toggle: toggleSSHKeypairInfoModal }] =
    useToggle(false);
  const [
    isOpenSSHKeypairManagementModal,
    { toggle: toggleSSHKeypairManagementModal },
  ] = useToggle(false);
  const [preserveLogin, setPreserveLogin] =
    useBAISettingUserState('preserve_login');
  const [classicSessionList, setClassicSessionList] = useBAISettingUserState(
    'classic_session_list',
  );
  const [experimentalAIAgents, setExperimentalAIAgents] =
    useBAISettingUserState('experimental_ai_agents');
  const [experimentalDashboard, setExperimentalDashboard] =
    useBAISettingUserState('experimental_dashboard');
  const [shellInfo, setShellInfo] = useState<ShellScriptType>('bootstrap');
  const [isOpenShellScriptEditModal, { toggle: toggleShellScriptEditModal }] =
    useToggle(false);

  const languageOptions = [
    { label: t('language.English'), value: 'en' },
    { label: t('language.Korean'), value: 'ko' },
    { label: t('language.Brazilian'), value: 'pt-BR' },
    { label: t('language.SimplifiedChinese'), value: 'zh-CN' },
    {
      label: t('language.TraditionalChinese'),
      value: 'zh-TW',
    },
    { label: t('language.French'), value: 'fr' },
    { label: t('language.Finnish'), value: 'fi' },
    { label: t('language.German'), value: 'de' },
    { label: t('language.Greek'), value: 'el' },
    { label: t('language.Indonesian'), value: 'id' },
    { label: t('language.Italian'), value: 'it' },
    { label: t('language.Japanese'), value: 'ja' },
    { label: t('language.Mongolian'), value: 'mn' },
    { label: t('language.Polish'), value: 'pl' },
    { label: t('language.Portuguese'), value: 'pt' },
    { label: t('language.Russian'), value: 'ru' },
    { label: t('language.Spanish'), value: 'es' },
    { label: t('language.Thai'), value: 'th' },
    { label: t('language.Turkish'), value: 'tr' },
    { label: t('language.Vietnamese'), value: 'vi' },
  ];
  let defaultLanguage = globalThis.navigator.language;
  defaultLanguage = _.includes(['zh-CN', 'zh-TW', 'pt-BR'], defaultLanguage)
    ? defaultLanguage
    : defaultLanguage.split('-')[0];
  defaultLanguage =
    languageOptions.find((item) => item.value === defaultLanguage)?.value ??
    'en';

  const settingGroups: Array<SettingGroup> = [
    {
      'data-testid': 'group-preferences',
      title: t('userSettings.Preferences'),
      settingItems: filterOutEmpty([
        {
          'data-testid': 'items-desktop-notification',
          type: 'checkbox',
          title: t('userSettings.DesktopNotification'),
          description: <Trans i18nKey="userSettings.DescDesktopNotification" />,
          defaultValue: false,
          value: desktopNotification,
          setValue: setDesktopNotification,
          onChange: (e) => {
            setDesktopNotification(e.target.checked);

            // Request permission for desktop notifications
            if (!e.target.checked || Notification.permission === 'granted')
              return;
            if (!('Notification' in window)) {
              message.error(t('desktopNotification.NotSupported'));
              setDesktopNotification(false);
              return;
            }
            if (Notification.permission === 'denied') {
              message.error(t('desktopNotification.PermissionDenied'));
              setDesktopNotification(false);
              return;
            }
            Notification.requestPermission().then((permission) => {
              if (permission === 'denied') {
                message.error(t('desktopNotification.PermissionDenied'));
                setDesktopNotification(false);
              }
            });
          },
        },
        {
          'data-testid': 'items-use-compact-sidebar',
          type: 'checkbox',
          title: t('userSettings.UseCompactSidebar'),
          description: <Trans i18nKey="userSettings.DescUseCompactSidebar" />,
          defaultValue: false,
          value: compactSidebar,
          setValue: setCompactSidebar,
          onChange: (e) => {
            setCompactSidebar(e.target.checked);
          },
        },
        {
          'data-testid': 'items-language-select',
          type: 'select',
          title: t('userSettings.Language'),
          description: t('userSettings.DescLanguage'),
          selectProps: {
            options: languageOptions.map((item) =>
              item.value === defaultLanguage
                ? {
                    ...item,
                    label: (
                      <>
                        {item.label}&nbsp;
                        <Typography.Text type="secondary">
                          ({t('userSettings.Default')})
                        </Typography.Text>
                      </>
                    ),
                    filterValue: item.label,
                  }
                : {
                    ...item,
                    filterValue: item.label,
                  },
            ),
            showSearch: true,
            optionFilterProp: 'filterValue',
          },
          defaultValue: defaultLanguage,
          value: selectedLanguage || defaultLanguage,
          setValue: setSelectedLanguage,
          onChange: (value) => {
            setSelectedLanguage(value);
            const event = new CustomEvent('language-changed', {
              detail: {
                language: value,
              },
            });
            setLanguage(value);
            document.dispatchEvent(event);
          },
        },
        globalThis.isElectron && {
          'data-testid': 'items-keep-login-session-information',
          type: 'checkbox',
          title: t('userSettings.KeepLoginSessionInformation'),
          description: (
            <Trans i18nKey="userSettings.DescKeepLoginSessionInformation" />
          ),
          defaultValue: false,
          value: preserveLogin,
          onChange: (e: any) => {
            setPreserveLogin(e.target.checked);
          },
        },
        {
          'data-testid': 'items-automatic-update-check',
          type: 'checkbox',
          title: t('userSettings.AutomaticUpdateCheck'),
          description: (
            <Trans i18nKey="userSettings.DescAutomaticUpdateCheck" />
          ),
          defaultValue: false,
          value: autoAutomaticUpdateCheck,
          setValue: setAutoAutomaticUpdateCheck,
          onChange: (e) => {
            setAutoAutomaticUpdateCheck(e.target.checked);
          },
        },
        {
          'data-testid': 'items-auto-logout',
          type: 'checkbox',
          title: t('userSettings.AutoLogout'),
          description: t('userSettings.DescAutoLogout'),
          defaultValue: false,
          value: autoLogout,
          setValue: setAutoLogout,
          onChange: (e) => {
            setAutoLogout(e.target.checked);
          },
        },
        {
          'data-testid': 'items-my-keypair-info',
          type: 'custom',
          title: t('userSettings.MyKeypairInfo'),
          description: t('userSettings.DescMyKeypairInfo'),
          children: (
            <Button
              icon={<SettingOutlined />}
              onClick={() => toggleSSHKeypairInfoModal()}
            >
              {t('button.Config')}
            </Button>
          ),
        },
        {
          'data-testid': 'items-ssh-keypair-management',
          type: 'custom',
          title: t('userSettings.SSHKeypairManagement'),
          description: t('userSettings.DescSSHKeypairManagement'),
          children: (
            <Button
              icon={<SettingOutlined />}
              onClick={() => toggleSSHKeypairManagementModal()}
            >
              {t('button.Config')}
            </Button>
          ),
        },
      ]),
    },
    {
      'data-testid': 'group-shell-environments',
      title: t('userSettings.ShellEnvironments'),
      settingItems: [
        {
          'data-testid': 'items-edit-bootstrap-script',
          type: 'custom',
          title: t('userSettings.EditBootstrapScript'),
          children: (
            <Button
              icon={<SettingOutlined />}
              onClick={() => {
                setShellInfo('bootstrap');
                toggleShellScriptEditModal();
              }}
            >
              {t('button.Config')}
            </Button>
          ),
        },
        {
          'data-testid': 'items-edit-user-config-script',
          type: 'custom',
          title: t('userSettings.EditUserConfigScript'),
          children: (
            <Button
              icon={<SettingOutlined />}
              onClick={() => {
                setShellInfo('userconfig');
                toggleShellScriptEditModal();
              }}
            >
              {t('button.Config')}
            </Button>
          ),
        },
      ],
    },
    {
      'data-testid': 'group-classic-features',
      title: t('userSettings.BackToClassicFeatures'),
      description: t('userSettings.BackToClassicFeaturesDesc'),
      settingItems: [
        {
          'data-testid': 'items-experimental-neo-session-list',
          type: 'checkbox',
          title: t('userSettings.ClassicSessionList'),
          description: t('general.Enabled'),
          defaultValue: false,
          value: classicSessionList,
          setValue: setClassicSessionList,
          onChange: (e) => {
            setClassicSessionList(e.target.checked);
          },
        },
      ],
    },
    {
      'data-testid': 'group-experimental-features',
      title: t('userSettings.ExperimentalFeatures'),
      description: t('userSettings.ExperimentalFeaturesDesc'),
      settingItems: [
        {
          'data-testid': 'items-experimental-ai-agents',
          type: 'checkbox',
          title: t('userSettings.AIAgents'),
          description: t('general.Enabled'),
          defaultValue: false,
          value: experimentalAIAgents,
          setValue: setExperimentalAIAgents,
          onChange: (e) => {
            setExperimentalAIAgents(e.target.checked);
          },
        },
        {
          'data-testid': 'items-experimental-dashboard',
          type: 'checkbox',
          title: t('webui.menu.Dashboard'),
          description: t('userSettings.DescExperimentalDashboard'),
          defaultValue: false,
          value: experimentalDashboard,
          setValue: setExperimentalDashboard,
          onChange: (e) => {
            setExperimentalDashboard(e.target.checked);
          },
        },
      ],
    },
  ];

  return (
    <>
      <Card
        activeTabKey={curTabKey}
        onTabChange={(key) => setCurTabKey(key as TabKey)}
        tabList={[
          {
            key: 'general',
            label: t('userSettings.General'),
          },
          {
            key: 'logs',
            label: t('userSettings.Logs'),
          },
        ]}
        styles={{
          body: { padding: 0 },
        }}
      >
        {curTabKey === 'general' && (
          <SettingList
            settingGroups={settingGroups}
            showChangedOptionFilter
            showResetButton
            showSearchBar
          />
        )}
        {curTabKey === 'logs' && <ErrorLogList />}
      </Card>
      <MyKeypairInfoModal
        open={isOpenSSHKeypairInfoModal}
        onRequestClose={toggleSSHKeypairInfoModal}
      />
      <SSHKeypairManagementModal
        open={isOpenSSHKeypairManagementModal}
        onRequestClose={toggleSSHKeypairManagementModal}
      />
      {shellInfo && (
        <ShellScriptEditModal
          open={isOpenShellScriptEditModal}
          shellInfo={shellInfo}
          onRequestClose={() => {
            toggleShellScriptEditModal();
          }}
          afterClose={() => {
            setShellInfo(undefined);
          }}
        />
      )}
    </>
  );
};

export default UserPreferencesPage;
