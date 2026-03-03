/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import LogoPreviewer, {
  getLogoThemeKey,
} from './BrandingSettingItems/LogoPreviewer';
import LogoSizeSettingItem from './BrandingSettingItems/LogoSizeSettingItem';
import ThemeColorPicker, {
  ThemeConfigPath,
} from './BrandingSettingItems/ThemeColorPicker';
import ThemeJsonConfigModal from './BrandingSettingItems/ThemeJsonConfigModal';
import SettingList, { SettingGroup } from './SettingList';
import { SettingOutlined } from '@ant-design/icons';
import {
  BAIAlert,
  BAIButton,
  BAIFlex,
  BAIUnmountAfterClose,
} from 'backend.ai-ui';
import _ from 'lodash';
import { Fullscreen } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCustomThemeConfig } from 'src/hooks/useCustomThemeConfig';
import { useUserCustomThemeConfig } from 'src/hooks/useUserCustomThemeConfig';

interface BrandingSettingListProps {}

const BrandingSettingList: React.FC<BrandingSettingListProps> = () => {
  'use memo';

  const { t } = useTranslation();

  const [openThemeConfigModal, setOpenThemeConfigModal] = useState(false);

  const themeConfig = useCustomThemeConfig();
  const { updateUserCustomThemeConfig, resetThemeConfig } =
    useUserCustomThemeConfig();

  const resetColorThemeConfig = (tokenName: ThemeConfigPath) => {
    updateUserCustomThemeConfig(
      'light.' + tokenName,
      _.get(themeConfig?.light, tokenName) ?? undefined,
    );
    updateUserCustomThemeConfig(
      'dark.' + tokenName,
      _.get(themeConfig?.dark, tokenName) ?? undefined,
    );
  };

  const resetLogoThemeConfig = (
    mode: 'light' | 'dark' | 'lightCollapsed' | 'darkCollapsed',
  ) => {
    updateUserCustomThemeConfig(
      'logo.' + getLogoThemeKey(mode),
      _.get(themeConfig?.logo, getLogoThemeKey(mode)) ?? undefined,
    );
  };

  const resetLogoSizeConfig = (logoType: 'wide' | 'collapsed') => {
    updateUserCustomThemeConfig(
      logoType === 'wide' ? 'logo.size' : 'logo.sizeCollapsed',
      _.get(
        themeConfig?.logo,
        logoType === 'wide' ? 'size' : 'sizeCollapsed',
      ) ?? undefined,
    );
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
          title: t('userSettings.logo.WideLogoSize'),
          description: t('userSettings.logo.WideLogoSizeDesc'),
          children: <LogoSizeSettingItem />,
          onReset: () => {
            resetLogoSizeConfig('wide');
          },
        },
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
          title: t('userSettings.logo.CollapsedLogoSize'),
          description: t('userSettings.logo.CollapsedLogoSizeDesc'),
          children: <LogoSizeSettingItem logoType="collapsed" />,
          onReset: () => {
            resetLogoSizeConfig('collapsed');
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
        onReset={() => {
          resetThemeConfig();
        }}
        settingGroups={settingGroups}
        primaryButton={
          <BAIButton
            type="primary"
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
        extraButton={
          <BAIButton
            icon={<SettingOutlined />}
            action={async () => {
              setOpenThemeConfigModal(true);
            }}
          >
            {t('theme.button.JsonConfig')}
          </BAIButton>
        }
      />
      <BAIUnmountAfterClose>
        <ThemeJsonConfigModal
          open={openThemeConfigModal}
          onRequestClose={() => {
            setOpenThemeConfigModal(false);
          }}
        />
      </BAIUnmountAfterClose>
    </BAIFlex>
  );
};

export default BrandingSettingList;
