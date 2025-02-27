import ErrorLogList from '../components/ErrorLogList';
import MyKeypairInfoModal from '../components/MyKeypairInfoModal';
import SSHKeypairManagementModal from '../components/SSHKeypairManagementModal';
import { SettingItemProps } from '../components/SettingItem';
import SettingList from '../components/SettingList';
import ShellScriptEditModal from '../components/ShellScriptEditModal';
import {
  useBAISettingGeneralState,
  useBAISettingUserState,
} from '../hooks/useBAISetting';
import { SettingOutlined } from '@ant-design/icons';
import { useToggle } from 'ahooks';
import { Button } from 'antd';
import Card from 'antd/es/card/Card';
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { StringParam, useQueryParam, withDefault } from 'use-query-params';

type TabKey = 'general' | 'logs';
export type ShellScriptType = 'bootstrap' | 'userconfig' | undefined;

const tabParam = withDefault(StringParam, 'general');

const UserPreferencesPage = () => {
  const { t } = useTranslation();
  const [curTabKey, setCurTabKey] = useQueryParam('tab', tabParam);

  const [desktopNotification, setDesktopNotification] = useBAISettingUserState(
    'desktop_notification',
  );
  const [isClassicSessionLauncher, setIsClassicSessionLauncher] =
    useBAISettingUserState('classic_session_launcher');
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
  const [experimentalNeoSessionList, setExperimentalNeoSessionList] =
    useBAISettingUserState('experimental_neo_session_list');
  const [experimentalAIAgents, setExperimentalAIAgents] =
    useBAISettingUserState('experimental_ai_agents');
  const [experimentalNeoDataPage, setExperimentalNeoDataPage] =
    useBAISettingUserState('experimental_neo_data_page');
  const [shellInfo, setShellInfo] = useState<ShellScriptType>('bootstrap');
  const [isOpenShellScriptEditModal, { toggle: toggleShellScriptEditModal }] =
    useToggle(false);

  const settingGroup: { title: string; settingItems: SettingItemProps[] }[] = [
    {
      title: t('userSettings.Preferences'),
      settingItems: [
        {
          type: 'checkbox',
          title: t('userSettings.DesktopNotification'),
          description: <Trans i18nKey="userSettings.DescDesktopNotification" />,
          defaultValue: false,
          value: desktopNotification,
          setValue: setDesktopNotification,
          onChange: (e) => {
            setDesktopNotification(e.target.checked);
          },
        },
        {
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
          type: 'select',
          title: t('userSettings.Language'),
          description: t('userSettings.DescLanguage'),
          selectProps: {
            options: [
              { label: t('language.OSDefault'), value: 'default' },
              { label: t('language.English'), value: 'en' },
              { label: t('language.Korean'), value: 'ko' },
              { label: t('language.Brazilian'), value: 'pt-BR' },
              { label: t('language.Chinese'), value: 'zh-CN' },
              {
                label: t('language.Chinese (Simplified)'),
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
            ],
            showSearch: true,
          },
          defaultValue: 'default',
          value: selectedLanguage || 'default',
          setValue: setSelectedLanguage,
          onChange: (value) => {
            setSelectedLanguage(value);
            const defaultLanguage = globalThis.navigator.language.split('-')[0];
            const event = new CustomEvent('language-changed', {
              detail: {
                language: value === 'default' ? defaultLanguage : value,
              },
            });
            setLanguage(value === 'default' ? defaultLanguage : value);
            document.dispatchEvent(event);
            //@ts-ignore
            console.log(globalThis.backendaioptions.get('selected_language'));
          },
        },
        ...[
          //@ts-ignore
          globalThis.isElectron && {
            type: 'checkbox',
            title: t('userSettings.KeepLoginSessionInformation'),
            description: (
              <Trans i18nKey="userSettings.DescKeepLoginSessionInformation" />
            ),
            defaultValue: false,
            //@ts-ignore
            value: preserveLogin,
            onChange: (e: any) => {
              setPreserveLogin(e.target.checked);
            },
          },
        ].filter(Boolean),
        {
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
        {
          type: 'checkbox',
          title: t('userSettings.ClassicSessionLauncher'),
          description: t('userSettings.DescClassicSessionLauncher'),
          defaultValue: false,
          value: isClassicSessionLauncher,
          onChange: (e) => {
            setIsClassicSessionLauncher(e.target.checked);
          },
        },
      ],
    },
    {
      title: t('userSettings.ShellEnvironments'),
      settingItems: [
        {
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
      title: t('userSettings.ExperimentalFeatures'),
      settingItems: [
        {
          type: 'checkbox',
          title: t('userSettings.NEOSessionList'),
          description: t('general.Enabled'),
          defaultValue: false,
          value: experimentalNeoSessionList,
          setValue: setExperimentalNeoSessionList,
          onChange: (e) => {
            setExperimentalNeoSessionList(e.target.checked);
          },
        },
        {
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
          type: 'checkbox',
          title: t('userSettings.NEODataPage'),
          description: t('general.Enabled'),
          defaultValue: false,
          value: experimentalNeoDataPage,
          setValue: setExperimentalNeoDataPage,
          onChange: (e) => {
            setExperimentalNeoDataPage(e.target.checked);
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
        bodyStyle={{
          padding: 0,
        }}
      >
        {curTabKey === 'general' && (
          <SettingList
            settingGroups={settingGroup}
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
