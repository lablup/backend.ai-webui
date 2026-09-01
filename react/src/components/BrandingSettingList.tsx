/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { App } from '../app-shim';
import {
  APPEARANCE_SCHEMA_VERSION,
  DOMAIN_APPEARANCE_CONFIG_KEY,
} from '../helper/customThemeConfig';
import { useUpdatePublicDomainAppConfig } from '../hooks/useAppConfig';
import { useDefaultTheme } from '../hooks/useDefaultTheme';
import FontFamilySettingItem from './BrandingSettingItems/FontFamilySettingItem';
import LogoPreviewer, {
  getLogoThemeKey,
  type LogoPreviewerMode,
} from './BrandingSettingItems/LogoPreviewer';
import LogoSizeSettingItem from './BrandingSettingItems/LogoSizeSettingItem';
import ThemeColorPicker, {
  AppearanceSeedPath,
} from './BrandingSettingItems/ThemeColorPicker';
import ThemeJsonConfigModal from './BrandingSettingItems/ThemeJsonConfigModal';
import SettingList, { SettingGroup } from './SettingList';
import { Button } from '@astryxdesign/core/Button';
import { BAIFlex, BAIUnmountAfterClose } from 'backend.ai-ui';
import { Settings, Fullscreen, Check } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface BrandingSettingListProps {}

const BrandingSettingList: React.FC<BrandingSettingListProps> = () => {
  'use memo';

  const { t } = useTranslation();
  const { message } = App.useApp();

  const [openThemeConfigModal, setOpenThemeConfigModal] = useState(false);

  const { defaultTheme, resetDefaultTheme } = useDefaultTheme();
  // The draft (prefilled from the saved domain theme, else theme.json) is
  // saved WHOLE — families included — as this domain's slice of the public
  // document; reads replace wholesale rather than merging (FR-1964).
  const updatePublicDomainAppConfig = useUpdatePublicDomainAppConfig();

  const applyThemeToDomain = async () => {
    if (!defaultTheme) {
      message.error(t('userSettings.FailedToLoadDefaultThemeConfig'));
      return;
    }
    try {
      await updatePublicDomainAppConfig(DOMAIN_APPEARANCE_CONFIG_KEY, {
        ...defaultTheme,
        schemaVersion: APPEARANCE_SCHEMA_VERSION,
      });
      // The reloaded page renders the applied document — that IS the
      // feedback; the anonymous read path has no refresh API (FR-1964).
      window.location.reload();
    } catch (error) {
      message.error(
        error instanceof Error && error.message
          ? error.message
          : t('dialog.ErrorOccurred'),
      );
    }
  };

  const resetColorThemeConfig = (seedPath: AppearanceSeedPath) => {
    resetDefaultTheme([seedPath]);
  };

  const resetLogoThemeConfig = (mode: LogoPreviewerMode) => {
    resetDefaultTheme([`branding.logo.${getLogoThemeKey(mode)}`]);
  };

  const resetLogoSizeConfig = (
    logoType: 'wide' | 'collapsed' | 'login' | 'about',
  ) => {
    const keyMap = {
      wide: 'size',
      collapsed: 'sizeCollapsed',
      login: 'loginLogoSize',
      about: 'aboutLogoSize',
    } as const;
    resetDefaultTheme([
      `branding.logo.${keyMap[logoType]}`,
      ...(logoType === 'about' ? ['branding.logo.aboutModalSize'] : []),
    ]);
  };

  const resetFontFamilyConfig = () => {
    resetDefaultTheme(['theme.fontFamily']);
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
          children: (
            <ThemeColorPicker seedPath="theme.families.default.seeds.accent" />
          ),
          onReset: () => {
            resetColorThemeConfig('theme.families.default.seeds.accent');
          },
        },
        {
          type: 'custom',
          title: t('userSettings.theme.HeaderBg'),
          description: t('userSettings.theme.HeaderBgDesc'),
          children: (
            <ThemeColorPicker seedPath="theme.families.default.headerBg" />
          ),
          onReset: () => {
            resetColorThemeConfig('theme.families.default.headerBg');
          },
        },
        {
          type: 'custom',
          title: t('userSettings.theme.LinkColor'),
          description: t('userSettings.theme.LinkColorDesc'),
          children: (
            <ThemeColorPicker seedPath="theme.families.default.seeds.link" />
          ),
          onReset: () => {
            resetColorThemeConfig('theme.families.default.seeds.link');
          },
        },
        {
          type: 'custom',
          title: t('userSettings.theme.InfoColor'),
          description: t('userSettings.theme.InfoColorDesc'),
          children: (
            <ThemeColorPicker seedPath="theme.families.default.seeds.info" />
          ),
          onReset: () => {
            resetColorThemeConfig('theme.families.default.seeds.info');
          },
        },
        {
          type: 'custom',
          title: t('userSettings.theme.ErrorColor'),
          description: t('userSettings.theme.ErrorColorDesc'),
          children: (
            <ThemeColorPicker seedPath="theme.families.default.seeds.error" />
          ),
          onReset: () => {
            resetColorThemeConfig('theme.families.default.seeds.error');
          },
        },
        {
          type: 'custom',
          title: t('userSettings.theme.SuccessColor'),
          description: t('userSettings.theme.SuccessColorDesc'),
          children: (
            <ThemeColorPicker seedPath="theme.families.default.seeds.success" />
          ),
          onReset: () => {
            resetColorThemeConfig('theme.families.default.seeds.success');
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
    {
      'data-testid': 'group-detail-logo-customization',
      title: t('userSettings.DetailLogo'),
      description: t('userSettings.logo.DetailLogoCustomizationDesc'),
      settingItems: [
        {
          type: 'custom',
          title: t('userSettings.logo.LoginLogoSize'),
          description: t('userSettings.logo.LoginLogoSizeDesc'),
          children: <LogoSizeSettingItem logoType="login" />,
          onReset: () => {
            resetLogoSizeConfig('login');
          },
        },
        {
          type: 'custom',
          title: t('userSettings.logo.LoginLightModeLogo'),
          description: t('userSettings.logo.LoginLightModeLogoDesc'),
          children: <LogoPreviewer mode="loginLight" />,
          onReset: () => {
            resetLogoThemeConfig('loginLight');
          },
        },
        {
          type: 'custom',
          title: t('userSettings.logo.LoginDarkModeLogo'),
          description: t('userSettings.logo.LoginDarkModeLogoDesc'),
          children: <LogoPreviewer mode="loginDark" />,
          onReset: () => {
            resetLogoThemeConfig('loginDark');
          },
        },
        {
          type: 'custom',
          title: t('userSettings.logo.AboutLogoSize'),
          description: t('userSettings.logo.AboutLogoSizeDesc'),
          children: <LogoSizeSettingItem logoType="about" />,
          onReset: () => {
            resetLogoSizeConfig('about');
          },
        },
        {
          type: 'custom',
          title: t('userSettings.logo.AboutLightModeLogo'),
          description: t('userSettings.logo.AboutLightModeLogoDesc'),
          children: <LogoPreviewer mode="aboutLight" />,
          onReset: () => {
            resetLogoThemeConfig('aboutLight');
          },
        },
        {
          type: 'custom',
          title: t('userSettings.logo.AboutDarkModeLogo'),
          description: t('userSettings.logo.AboutDarkModeLogoDesc'),
          children: <LogoPreviewer mode="aboutDark" />,
          onReset: () => {
            resetLogoThemeConfig('aboutDark');
          },
        },
      ],
    },
    {
      'data-testid': 'group-font-customization',
      title: t('userSettings.Font'),
      description: t('userSettings.font.FontCustomizationDesc'),
      settingItems: [
        {
          type: 'custom',
          title: t('userSettings.font.FontFamily'),
          description: t('userSettings.font.FontFamilyDesc'),
          children: <FontFamilySettingItem />,
          onReset: () => {
            resetFontFamilyConfig();
          },
        },
      ],
    },
  ];

  return (
    <BAIFlex direction="column" gap="md" align="stretch">
      <SettingList
        showSearchBar
        showResetButton
        onReset={() => {
          resetDefaultTheme();
        }}
        settingGroups={settingGroups}
        primaryButton={
          <Button
            variant="primary"
            icon={<Check size="1em" />}
            label={t('button.Apply')}
            clickAction={applyThemeToDomain}
          />
        }
        extraButton={
          <BAIFlex gap="sm">
            <Button
              icon={<Settings size="1em" />}
              label={t('theme.button.JsonConfig')}
              clickAction={async () => {
                setOpenThemeConfigModal(true);
              }}
            />
            <Button
              icon={<Fullscreen size="1em" />}
              label={t('userSettings.theme.Preview')}
              clickAction={async () => {
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
            />
          </BAIFlex>
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
