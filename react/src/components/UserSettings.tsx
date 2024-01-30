import { useLocalStorageGlobalState } from '../hooks/useLocalStorageGlobalState';
import { useThemeMode } from '../hooks/useThemeMode';
import { useCurrentLanguage } from './DefaultProviders';
import DescriptionLabel from './DescriptionLabel';
import Flex from './Flex';
import KeypairInfoModal from './KeypairInfoModal';
import SSHKeypairManagementModal from './SSHKeypairManagementModal';
import { ProfileOutlined, SettingOutlined } from '@ant-design/icons';
import { useToggle } from 'ahooks';
import {
  Button,
  Card,
  Descriptions,
  DescriptionsProps,
  Select,
  Switch,
  theme,
} from 'antd';
import _ from 'lodash';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';

interface UserSettingsProps {}
const UserSettings: React.FC<UserSettingsProps> = ({}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { themeMode, setThemeMode } = useThemeMode();
  // TODO: refactor below localStorage related codes in https://github.com/lablup/backend.ai-webui/issues/2187
  const [desktopNotification, setDesktopNotification] =
    useLocalStorageGlobalState<boolean>(
      'backendaiwebui.settings.user.desktop_notification',
      true,
    );
  const [compactSidebar, setCompactSidebar] =
    useLocalStorageGlobalState<boolean>(
      'backendaiwebui.settings.user.compact_sidebar',
      false,
    );
  const [preserveLogin, setPreserveLogin] = useLocalStorageGlobalState<boolean>(
    'backendaiwebui.settings.user.preserve_login',
    false,
  );
  const { lang: currentLanguage, setLang: setCurrentLanguage } =
    useCurrentLanguage();
  const [language, setLanguage] = useLocalStorageGlobalState<string>(
    'backendaiwebui.settings.user.language',
    'default',
  );
  const [autoAutomaticUpdateCheck, setAutoAutomaticUpdateCheck] =
    useLocalStorageGlobalState<boolean>(
      'backendaiwebui.settings.user.automatic_update_check',
      true,
    );
  const [autoAutomaticCountTrial, setAutoAutomaticCountTrial] =
    useLocalStorageGlobalState<number>(
      'backendaiwebui.settings.user.automatic_update_count_trial',
      0,
    );
  const [customSSHPort, setCustomSSHPort] = useLocalStorageGlobalState<string>(
    'backendaiwebui.settings.user.custom_ssh_port',
    '',
  );
  const [autoLogout, setAutoLogout] = useLocalStorageGlobalState<boolean>(
    'backendaiwebui.settings.user.auto_logout',
    false,
  );
  const [betaFeatures, setBetaFeatures] = useLocalStorageGlobalState<boolean>(
    'backendaiwebui.settings.user.beta_features',
    false,
  );

  const columnSetting: DescriptionsProps['column'] = {
    xxl: 3,
    xl: 3,
    lg: 2,
    md: 1,
    sm: 1,
    xs: 1,
  };

  const [isOpenKeypairInfoModal, { toggle: toggleKeypairInfoModal }] =
    useToggle(false);
  const [isOpenSSHKeypairInfoModal, { toggle: toggleSSHKeypairInfoModal }] =
    useToggle(false);

  return (
    <>
      <Flex
        direction="column"
        align="stretch"
        gap="sm"
        style={{ padding: token.padding }}
      >
        <Card>
          <Descriptions
            title={t('usersettings.Preferences')}
            bordered
            column={columnSetting}
          >
            <Descriptions.Item
              label={
                <DescriptionLabel
                  title={t('usersettings.DesktopNotification')}
                  subtitle={
                    <Trans i18nKey="usersettings.DescDesktopNotification" />
                  }
                />
              }
            >
              <Switch
                checked={desktopNotification}
                onChange={setDesktopNotification}
              />
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <DescriptionLabel
                  title={t('usersettings.UseCompactSidebar')}
                  subtitle={
                    <Trans i18nKey="usersettings.DescUseCompactSidebar" />
                  }
                />
              }
            >
              <Switch checked={compactSidebar} onChange={setCompactSidebar} />
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <DescriptionLabel
                  title={t('usersettings.AutomaticUpdateCheck')}
                  subtitle={
                    <Trans i18nKey="usersettings.DescAutomaticUpdateCheck" />
                  }
                />
              }
            >
              <Switch
                checked={autoAutomaticUpdateCheck}
                onChange={(value) => {
                  setAutoAutomaticUpdateCheck(value);
                  if (!value) {
                    setAutoAutomaticCountTrial(0);
                  }
                }}
              />
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <DescriptionLabel
                  title={t('usersettings.AutoLogout')}
                  subtitle={<Trans i18nKey="usersettings.DescAutoLogout" />}
                />
              }
            >
              <Switch
                checked={autoLogout}
                onChange={(value) => {
                  setAutoLogout(value);
                  const event = new CustomEvent('backend-ai-auto-logout', {
                    detail: value,
                  });
                  document.dispatchEvent(event);
                }}
              />
            </Descriptions.Item>
            {/* TODO: Preserve Login */}
            {/* TODO: KeepLoginSessionInformation */}
            {/* TODO: BetaFeatures */}
            {/* TODO: BetaFeaturesPanel */}
            <Descriptions.Item
              label={
                <DescriptionLabel
                  title={t('usersettings.SSHKeypairManagement')}
                  subtitle={
                    <Trans i18nKey="usersettings.DescSSHKeypairManagement" />
                  }
                />
              }
            >
              <Button
                type="text"
                icon={<SettingOutlined />}
                onClick={toggleSSHKeypairInfoModal}
              />
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <DescriptionLabel
                  title={t('usersettings.MyKeypairInfo')}
                  subtitle={<Trans i18nKey="usersettings.DescMyKeypairInfo" />}
                />
              }
            >
              <Button
                type="text"
                icon={<ProfileOutlined />}
                onClick={toggleKeypairInfoModal}
              />
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <DescriptionLabel
                  title={t('usersettings.Language')}
                  subtitle={<Trans i18nKey="usersettings.DescLanguage" />}
                />
              }
            >
              <Select
                style={{ minWidth: 170 }}
                defaultValue={language}
                onChange={(value) => {
                  setLanguage(value);
                  const currentLanguage =
                    value === 'default'
                      ? navigator.language.split('-')[0]
                      : value;
                  setCurrentLanguage(value);
                  const event = new CustomEvent('language-changed', {
                    detail: { language: currentLanguage },
                  });
                  document.dispatchEvent(event);
                  return value;
                }}
                options={[
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
                ]}
              />
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <DescriptionLabel
                  title={t('usersettings.ThemeMode')}
                  subtitle={<Trans i18nKey="usersettings.DescThemeMode" />}
                />
              }
            >
              <Select
                style={{ minWidth: 170 }}
                defaultValue={themeMode}
                onChange={setThemeMode}
                options={[
                  {
                    value: 'system',
                    label: t('usersettings.UseSystemSetting'),
                  },
                  {
                    value: 'light',
                    label: t('usersettings.LightMode'),
                  },
                  {
                    value: 'dark',
                    label: t('usersettings.DarkMode'),
                  },
                ]}
              />
            </Descriptions.Item>
          </Descriptions>
        </Card>
        <Card>
          <Card.Meta
            title={t('usersettings.ShellEnvironments')}
            description={
              <Flex gap="xs">
                <Button>{t('usersettings.EditBootstrapScript')}</Button>
                <Button>{t('usersettings.EditUserConfigScript')}</Button>
              </Flex>
            }
          />
        </Card>
      </Flex>
      <KeypairInfoModal
        open={isOpenKeypairInfoModal}
        onRequestClose={toggleKeypairInfoModal}
      />
      <SSHKeypairManagementModal
        open={isOpenSSHKeypairInfoModal}
        onCancel={toggleSSHKeypairInfoModal}
      />
    </>
  );
};

export default UserSettings;
