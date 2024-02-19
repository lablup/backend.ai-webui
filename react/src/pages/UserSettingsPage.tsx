import ErrorLogList from '../components/ErrorLogList';
import Flex from '../components/Flex';
import { SettingItemProps } from '../components/SettingItem';
import SettingList from '../components/SettingList';
import { useLocalStorageGlobalState } from '../hooks/useLocalStorageGlobalState';
import { SettingOutlined } from '@ant-design/icons';
import { useToggle } from 'ahooks';
import { Button, theme } from 'antd';
import Card from 'antd/es/card/Card';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { StringParam, useQueryParam, withDefault } from 'use-query-params';

type TabKey = 'general' | 'logs';

const tabParam = withDefault(StringParam, 'general');

const UserPreferencesPage = () => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [curTabKey, setCurTabKey] = useQueryParam('tab', tabParam);
  const [compactSidebar, setCompactSidebar] =
    useLocalStorageGlobalState<boolean>(
      'backendaiwebui.settings.user.compact_sidebar',
      false,
    );
  const [desktopNotification, setDesktopNotification] =
    useLocalStorageGlobalState<boolean>(
      'backendaiwebui.settings.user.desktop_notification',
      false,
    );
  const [language, setLanguage] = useLocalStorageGlobalState<string>(
    'backendaiwebui.settings.user.language',
    'default',
  );
  const [autoAutomaticUpdateCheck, setAutoAutomaticUpdateCheck] =
    useLocalStorageGlobalState<boolean>(
      'backendaiwebui.settings.user.automatic_update_check',
      true,
    );
  const [autoLogout, setAutoLogout] = useLocalStorageGlobalState<boolean>(
    'backendaiwebui.settings.user.auto_logout',
    false,
  );
  const [isOpenSSHKeypairInfoModal, { toggle: toggleSSHKeypairInfoModal }] =
    useToggle(false);
  const settingOptions: { title: string; options: SettingItemProps[] }[] = [
    {
      title: t('usersettings.Preferences'),
      options: [
        {
          type: 'checkbox',
          title: t('usersettings.DesktopNotification'),
          description: t('usersettings.DescDesktopNotification'),
          value: desktopNotification,
          setValue: setDesktopNotification,
          defaultValue: false,
          onChange: (e) => {
            setDesktopNotification(e.target.checked);
          },
        },
        {
          type: 'checkbox',
          title: t('usersettings.UseCompactSidebar'),
          description: t('usersettings.DescUseCompactSidebar'),
          value: compactSidebar,
          setValue: setCompactSidebar,
          defaultValue: false,
          onChange: (e) => {
            setCompactSidebar(e.target.checked);
          },
        },
        {
          type: 'select',
          title: t('usersettings.Language'),
          description: t('usersettings.DescLanguage'),
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
            { label: t('language.Turkish'), value: 'tr' },
            { label: t('language.Vietnamese'), value: 'vi' },
          ],
          value: language,
          setValue: setLanguage,
          defaultValue: 'ko',
          onChange: (value) => {
            setLanguage(value);
            const currentLanguage =
              value === 'default' ? navigator.language.split('-')[0] : value;
            const event = new CustomEvent('language-changed', {
              detail: { language: currentLanguage },
            });
            document.dispatchEvent(event);
            return value;
          },
        },
        {
          type: 'checkbox',
          title: t('usersettings.AutomaticUpdateCheck'),
          description: t('usersettings.DescAutomaticUpdateCheck'),
          value: autoAutomaticUpdateCheck,
          setValue: setAutoAutomaticUpdateCheck,
          defaultValue: useRef(autoAutomaticUpdateCheck).current,
          onChange: (e) => {
            setAutoAutomaticUpdateCheck(e.target.checked);
          },
        },
        {
          type: 'custom',
          title: t('usersettings.SSHKeypairManagement'),
          description: t('usersettings.DescSSHKeypairManagement'),
          value: false,
          setValue: toggleSSHKeypairInfoModal,
          defaultValue: false,
          onClick: toggleSSHKeypairInfoModal,
        },
        {
          type: 'checkbox',
          title: t('usersettings.AutoLogout'),
          description: t('usersettings.DescAutoLogout'),
          value: autoLogout,
          setValue: setAutoLogout,
          defaultValue: useRef(autoLogout).current,
          onChange: (e) => {
            setAutoLogout(e.target.checked);
          },
        },
      ],
    },
    {
      title: t('usersettings.ShellEnvironments'),
      options: [
        {
          type: 'custom',
          title: t('usersettings.EditBootstrapScript'),
          description: '',
          value: false,
          setValue: () => {},
          defaultValue: false,
          children: (
            <Button
              type="primary"
              icon={<SettingOutlined />}
              style={{ width: 120 }}
            >
              custom
            </Button>
          ),
        },
        {
          type: 'custom',
          title: t('usersettings.EditUserConfigScript'),
          description: '',
          value: false,
          setValue: () => {},
          defaultValue: false,
          children: (
            <Button
              type="primary"
              icon={<SettingOutlined />}
              style={{ width: 120 }}
            >
              custom
            </Button>
          ),
        },
      ],
    },
  ];

  return (
    <Card
      activeTabKey={curTabKey}
      onTabChange={(key) => setCurTabKey(key as TabKey)}
      tabList={[
        {
          key: 'general',
          label: t('usersettings.General'),
        },
        {
          key: 'logs',
          label: t('usersettings.Logs'),
        },
      ]}
      bodyStyle={{
        padding: 0,
      }}
    >
      <Flex
        style={{
          display: curTabKey === 'general' ? 'block' : 'none',
          paddingTop: token.paddingContentVerticalLG,
          paddingBottom: token.paddingContentVerticalLG,
          paddingLeft: token.paddingContentHorizontalSM,
          paddingRight: token.paddingContentHorizontalSM,
        }}
      >
        <SettingList settingOptions={settingOptions} />
        {/* @ts-ignore */}
        {/* <backend-ai-usersettings-general-list
          active={curTabKey === 'general'}
        /> */}
      </Flex>
      {curTabKey === 'logs' && <ErrorLogList />}
    </Card>
  );
};

export default UserPreferencesPage;
