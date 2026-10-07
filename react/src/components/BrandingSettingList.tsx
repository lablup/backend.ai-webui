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
import { usePreviewThemeConfig } from '../hooks/usePreviewThemeConfig';
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
import { Button } from '@lablup/ui-common/Button';
import {
  BAIFlex,
  BAIUnmountAfterClose,
  useErrorMessageResolver,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { Settings, Fullscreen, Check } from 'lucide-react';
import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useBlocker } from 'react-router-dom';

interface BrandingSettingListProps {}

const BrandingSettingList: React.FC<BrandingSettingListProps> = () => {
  'use memo';

  const { t } = useTranslation();
  const { message, modal } = App.useApp();
  const { getErrorMessage } = useErrorMessageResolver();

  const [openThemeConfigModal, setOpenThemeConfigModal] = useState(false);

  const {
    themeConfig,
    appliedThemeConfig,
    hasPreviewThemeConfig,
    updateThemeConfigValue,
    clearPreviewThemeConfig,
  } = usePreviewThemeConfig();
  // Saved WHOLE — families included — as this domain's slice of the public
  // document; reads replace wholesale rather than merging (FR-1964).
  const updatePublicDomainAppConfig = useUpdatePublicDomainAppConfig();

  // Edits live only while this page is open: an entry (refresh included)
  // starts from the applied document, and leaving drops them.
  const discardPreview = useEffectEvent(() => {
    clearPreviewThemeConfig();
  });
  useEffect(() => {
    discardPreview();
    return () => discardPreview();
  }, []);

  // Set before the post-Apply reload so neither guard asks to confirm it.
  const isLeavingAfterApplyRef = useRef(false);
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      hasPreviewThemeConfig &&
      currentLocation.pathname !== nextLocation.pathname,
  );
  const confirmLeave = useEffectEvent(() => {
    modal.confirm({
      title: t('userSettings.LeaveWithoutApplyingTheme'),
      content: t('userSettings.LeaveWithoutApplyingThemeDesc'),
      okText: t('button.Discard'),
      okButtonProps: { danger: true },
      cancelText: t('button.Cancel'),
      onOk: () => blocker.proceed?.(),
      onCancel: () => blocker.reset?.(),
    });
  });
  useEffect(() => {
    if (blocker.state === 'blocked') {
      confirmLeave();
    }
  }, [blocker.state]);
  // Refresh / tab close can only show the browser's own prompt.
  const shouldConfirmUnload = useEffectEvent(
    () => hasPreviewThemeConfig && !isLeavingAfterApplyRef.current,
  );
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (shouldConfirmUnload()) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const applyThemeToDomain = async () => {
    if (!themeConfig) {
      message.error(t('userSettings.FailedToLoadDefaultThemeConfig'));
      return;
    }
    // A domain-wide write: confirm first; the ok button waits on the save.
    modal.confirm({
      title: t('userSettings.ApplyThemeToDomain'),
      content: t('userSettings.ApplyThemeToDomainDesc'),
      okText: t('button.Apply'),
      cancelText: t('button.Cancel'),
      onOk: async () => {
        try {
          await updatePublicDomainAppConfig(DOMAIN_APPEARANCE_CONFIG_KEY, {
            ...themeConfig,
            schemaVersion: APPEARANCE_SCHEMA_VERSION,
          });
          // The reloaded page renders the applied document — that IS the
          // feedback; the anonymous read path has no refresh API (FR-1964).
          isLeavingAfterApplyRef.current = true;
          clearPreviewThemeConfig();
          window.location.reload();
        } catch (error) {
          message.error(getErrorMessage(error));
        }
      },
    });
  };

  /** Restores the given paths to the applied document's values. */
  const resetToApplied = (paths: string[]) => {
    for (const path of paths) {
      updateThemeConfigValue(path, _.get(appliedThemeConfig, path));
    }
  };

  const resetColorThemeConfig = (seedPath: AppearanceSeedPath) => {
    resetToApplied([seedPath]);
  };

  const resetLogoThemeConfig = (mode: LogoPreviewerMode) => {
    resetToApplied([`branding.logo.${getLogoThemeKey(mode)}`]);
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
    resetToApplied([
      `branding.logo.${keyMap[logoType]}`,
      ...(logoType === 'about' ? ['branding.logo.aboutModalSize'] : []),
    ]);
  };

  const resetFontFamilyConfig = () => {
    resetToApplied(['theme.fontFamily']);
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
          clearPreviewThemeConfig();
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
