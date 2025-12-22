import LogoPreviewer, {
  getLogoThemeKey,
} from './BrandingSettingItems/LogoPreviewer';
import ThemeColorPicker, {
  ThemeConfigPath,
} from './BrandingSettingItems/ThemeColorPicker';
import SettingList, { SettingGroup } from './SettingList';
import { ExportOutlined } from '@ant-design/icons';
import { App } from 'antd';
import { BAIAlert, BAIButton, BAIFlex } from 'backend.ai-ui';
import _ from 'lodash';
import { Fullscreen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { downloadBlob } from 'src/helper/csv-util';
import { useCustomThemeConfig } from 'src/helper/customThemeConfig';
import { useBAISettingUserState } from 'src/hooks/useBAISetting';

interface BrandingSettingListProps {}

const BrandingSettingList: React.FC<BrandingSettingListProps> = () => {
  'use memo';

  const { t } = useTranslation();
  const { message } = App.useApp();

  const themeConfig = useCustomThemeConfig();

  const [userCustomThemeConfig, setUserCustomThemeConfig] =
    useBAISettingUserState('custom_theme_config');

  const resetColorThemeConfig = (tokenName: ThemeConfigPath) => {
    if (!themeConfig) return;

    setUserCustomThemeConfig((prev: typeof userCustomThemeConfig) => {
      const newCustomThemeConfig = _.cloneDeep({
        ...themeConfig,
        ...prev,
      });
      const lightDefaultValue = _.get(themeConfig, `light.${tokenName}`);
      const darkDefaultValue = _.get(themeConfig, `dark.${tokenName}`);

      _.set(newCustomThemeConfig, `light.${tokenName}`, lightDefaultValue);
      _.set(newCustomThemeConfig, `dark.${tokenName}`, darkDefaultValue);
      return newCustomThemeConfig;
    });
  };

  const resetLogoThemeConfig = (
    mode: 'light' | 'dark' | 'lightCollapsed' | 'darkCollapsed',
  ) => {
    if (!themeConfig) return;
    setUserCustomThemeConfig((prev) => ({
      ...themeConfig!,
      ...prev,
      logo: {
        ...themeConfig!.logo,
        ...prev?.logo,
        [getLogoThemeKey(mode)]: themeConfig!.logo[getLogoThemeKey(mode)],
      },
    }));
  };

  const settingGroups: Array<SettingGroup> = [
    {
      'data-testid': 'group-theme-customization',
      title: t('userSettings.Theme'),
      settingItems: [
        {
          type: 'custom',
          title: t('userSettings.theme.PrimaryColor'),
          description: t('userSettings.theme.PrimaryColorDesc'),
          children: <ThemeColorPicker tokenName="token.colorPrimary" />,
          onReset: () => {
            resetColorThemeConfig('token.colorPrimary');
          },
        },
        {
          type: 'custom',
          title: t('userSettings.theme.HeaderBg'),
          description: t('userSettings.theme.HeaderBgDesc'),
          children: <ThemeColorPicker tokenName="components.Layout.headerBg" />,
          onReset: () => {
            resetColorThemeConfig('components.Layout.headerBg');
          },
        },
        {
          type: 'custom',
          title: t('userSettings.theme.LinkColor'),
          description: t('userSettings.theme.LinkColorDesc'),
          children: <ThemeColorPicker tokenName="token.colorLink" />,
          onReset: () => {
            resetColorThemeConfig('token.colorLink');
          },
        },
        {
          type: 'custom',
          title: t('userSettings.theme.InfoColor'),
          description: t('userSettings.theme.InfoColorDesc'),
          children: <ThemeColorPicker tokenName="token.colorInfo" />,
          onReset: () => {
            resetColorThemeConfig('token.colorInfo');
          },
        },
        {
          type: 'custom',
          title: t('userSettings.theme.ErrorColor'),
          description: t('userSettings.theme.ErrorColorDesc'),
          children: <ThemeColorPicker tokenName="token.colorError" />,
          onReset: () => {
            resetColorThemeConfig('token.colorError');
          },
        },
        {
          type: 'custom',
          title: t('userSettings.theme.SuccessColor'),
          description: t('userSettings.theme.SuccessColorDesc'),
          children: <ThemeColorPicker tokenName="token.colorSuccess" />,
          onReset: () => {
            resetColorThemeConfig('token.colorSuccess');
          },
        },
        {
          type: 'custom',
          title: t('userSettings.theme.TextColor'),
          description: t('userSettings.theme.TextColorDesc'),
          children: <ThemeColorPicker tokenName="token.colorText" />,
          onReset: () => {
            resetColorThemeConfig('token.colorText');
          },
        },
      ],
    },
    {
      'data-testid': 'group-logo-customization',
      title: t('userSettings.Logo'),
      description: t('userSettings.logo.LogoCustomizationDesc'),
      settingItems: [
        {
          type: 'custom',
          title: t('userSettings.logo.LightModeLogo'),
          description: t('userSettings.logo.LightModeLogoDesc'),
          children: <LogoPreviewer mode="light" />,
          onReset: () => {
            resetLogoThemeConfig('light');
          },
        },
        {
          type: 'custom',
          title: t('userSettings.logo.DarkModeLogo'),
          description: t('userSettings.logo.DarkModeLogoDesc'),
          children: <LogoPreviewer mode="dark" />,
          onReset: () => {
            resetLogoThemeConfig('dark');
          },
        },
        {
          type: 'custom',
          title: t('userSettings.logo.LightModeCollapsedLogo'),
          description: t('userSettings.logo.LightModeCollapsedLogoDesc'),
          children: <LogoPreviewer mode="lightCollapsed" />,
          onReset: () => {
            resetLogoThemeConfig('lightCollapsed');
          },
        },
        {
          type: 'custom',
          title: t('userSettings.logo.DarkModeCollapsedLogo'),
          description: t('userSettings.logo.DarkModeCollapsedLogoDesc'),
          children: <LogoPreviewer mode="darkCollapsed" />,
          onReset: () => {
            resetLogoThemeConfig('darkCollapsed');
          },
        },
      ],
    },
  ];

  return (
    <BAIFlex direction="column" gap="md" align="stretch">
      <BAIAlert
        description={t('userSettings.theme.CustomThemeSettingAlert')}
        type="warning"
        showIcon
      />
      <SettingList
        showSearchBar
        showResetButton
        settingGroups={settingGroups}
        primaryButton={
          <BAIButton
            type="primary"
            icon={<ExportOutlined />}
            action={async () => {
              if (_.isEmpty(userCustomThemeConfig)) {
                message.error(t('userSettings.theme.NoChangesMade'));
                return;
              }

              const blob = new Blob(
                [JSON.stringify(userCustomThemeConfig, null, 2)],
                { type: 'application/json' },
              );
              downloadBlob(blob, `theme.json`);
            }}
          >
            {t('theme.button.ExportToJson')}
          </BAIButton>
        }
        extraButton={
          <BAIButton
            icon={<Fullscreen />}
            action={async () => {
              const previewWindow = window.open(
                window.location.origin,
                '_blank',
              );
              previewWindow?.addEventListener('load', () => {
                previewWindow?.sessionStorage.setItem(
                  'isThemePreviewMode',
                  'true',
                );
                previewWindow?.location.reload();
              });
            }}
          >
            {t('userSettings.theme.Preview')}
          </BAIButton>
        }
      />
    </BAIFlex>
  );
};

export default BrandingSettingList;
