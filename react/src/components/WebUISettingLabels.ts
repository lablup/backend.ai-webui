/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { WebUISettingGroup } from '../helper/webuiSettings';
import { useTranslation } from 'react-i18next';

export interface WebUISettingLabel {
  title: string;
  description: string;
}

/** Literal `t()` calls so the search index can find every setting. */
export const useWebUISettingLabels = (): {
  items: Record<string, WebUISettingLabel>;
  groups: Record<WebUISettingGroup, string>;
} => {
  'use memo';
  const { t } = useTranslation();
  return {
    items: {
      allowChangeSigninMode: {
        title: t('webuiSettings.AllowChangeSigninMode'),
        description: t('webuiSettings.DescAllowChangeSigninMode'),
      },
      allowAnonymousChangePassword: {
        title: t('webuiSettings.AllowAnonymousChangePassword'),
        description: t('webuiSettings.DescAllowAnonymousChangePassword'),
      },
      allowSignupWithoutConfirmation: {
        title: t('webuiSettings.AllowSignupWithoutConfirmation'),
        description: t('webuiSettings.DescAllowSignupWithoutConfirmation'),
      },
      enableInteractiveLoginAccountSwitch: {
        title: t('webuiSettings.EnableInteractiveLoginAccountSwitch'),
        description: t('webuiSettings.DescEnableInteractiveLoginAccountSwitch'),
      },
      singleSignOnVendors: {
        title: t('webuiSettings.SingleSignOnVendors'),
        description: t('webuiSettings.DescSingleSignOnVendors'),
      },
      ssoRealmName: {
        title: t('webuiSettings.SsoRealmName'),
        description: t('webuiSettings.DescSsoRealmName'),
      },
      loginAttemptLimit: {
        title: t('webuiSettings.LoginAttemptLimit'),
        description: t('webuiSettings.DescLoginAttemptLimit'),
      },
      loginBlockTime: {
        title: t('webuiSettings.LoginBlockTime'),
        description: t('webuiSettings.DescLoginBlockTime'),
      },
      autoLogout: {
        title: t('webuiSettings.AutoLogout'),
        description: t('webuiSettings.DescAutoLogout'),
      },
      pluginLogin: {
        title: t('webuiSettings.PluginLogin'),
        description: t('webuiSettings.DescPluginLogin'),
      },
      pluginPage: {
        title: t('webuiSettings.PluginPage'),
        description: t('webuiSettings.DescPluginPage'),
      },
      debug: {
        title: t('webuiSettings.Debug'),
        description: t('webuiSettings.DescDebug'),
      },
      defaultSessionEnvironment: {
        title: t('webuiSettings.DefaultSessionEnvironment'),
        description: t('webuiSettings.DescDefaultSessionEnvironment'),
      },
      allowManualImageNameForSession: {
        title: t('webuiSettings.AllowManualImageNameForSession'),
        description: t('webuiSettings.DescAllowManualImageNameForSession'),
      },
      allowCustomResourceAllocation: {
        title: t('webuiSettings.AllowCustomResourceAllocation'),
        description: t('webuiSettings.DescAllowCustomResourceAllocation'),
      },
      enableContainerCommit: {
        title: t('webuiSettings.EnableContainerCommit'),
        description: t('webuiSettings.DescEnableContainerCommit'),
      },
      maxCountForPreopenPorts: {
        title: t('webuiSettings.MaxCountForPreopenPorts'),
        description: t('webuiSettings.DescMaxCountForPreopenPorts'),
      },
      maxCPUCoresPerContainer: {
        title: t('webuiSettings.MaxCPUCoresPerContainer'),
        description: t('webuiSettings.DescMaxCPUCoresPerContainer'),
      },
      maxMemoryPerContainer: {
        title: t('webuiSettings.MaxMemoryPerContainer'),
        description: t('webuiSettings.DescMaxMemoryPerContainer'),
      },
      maxShmPerContainer: {
        title: t('webuiSettings.MaxShmPerContainer'),
        description: t('webuiSettings.DescMaxShmPerContainer'),
      },
      maxCUDADevicesPerContainer: {
        title: t('webuiSettings.MaxCUDADevicesPerContainer'),
        description: t('webuiSettings.DescMaxCUDADevicesPerContainer'),
      },
      maxCUDASharesPerContainer: {
        title: t('webuiSettings.MaxCUDASharesPerContainer'),
        description: t('webuiSettings.DescMaxCUDASharesPerContainer'),
      },
      maxROCMDevicesPerContainer: {
        title: t('webuiSettings.MaxROCMDevicesPerContainer'),
        description: t('webuiSettings.DescMaxROCMDevicesPerContainer'),
      },
      maxTPUDevicesPerContainer: {
        title: t('webuiSettings.MaxTPUDevicesPerContainer'),
        description: t('webuiSettings.DescMaxTPUDevicesPerContainer'),
      },
      maxIPUDevicesPerContainer: {
        title: t('webuiSettings.MaxIPUDevicesPerContainer'),
        description: t('webuiSettings.DescMaxIPUDevicesPerContainer'),
      },
      maxATOMDevicesPerContainer: {
        title: t('webuiSettings.MaxATOMDevicesPerContainer'),
        description: t('webuiSettings.DescMaxATOMDevicesPerContainer'),
      },
      maxATOMPLUSDevicesPerContainer: {
        title: t('webuiSettings.MaxATOMPLUSDevicesPerContainer'),
        description: t('webuiSettings.DescMaxATOMPLUSDevicesPerContainer'),
      },
      maxGaudi2DevicesPerContainer: {
        title: t('webuiSettings.MaxGaudi2DevicesPerContainer'),
        description: t('webuiSettings.DescMaxGaudi2DevicesPerContainer'),
      },
      maxWarboyDevicesPerContainer: {
        title: t('webuiSettings.MaxWarboyDevicesPerContainer'),
        description: t('webuiSettings.DescMaxWarboyDevicesPerContainer'),
      },
      maxRNGDDevicesPerContainer: {
        title: t('webuiSettings.MaxRNGDDevicesPerContainer'),
        description: t('webuiSettings.DescMaxRNGDDevicesPerContainer'),
      },
      maxHyperaccelLPUDevicesPerContainer: {
        title: t('webuiSettings.MaxHyperaccelLPUDevicesPerContainer'),
        description: t('webuiSettings.DescMaxHyperaccelLPUDevicesPerContainer'),
      },
      openPortToPublic: {
        title: t('webuiSettings.OpenPortToPublic'),
        description: t('webuiSettings.DescOpenPortToPublic'),
      },
      allowPreferredPort: {
        title: t('webuiSettings.AllowPreferredPort'),
        description: t('webuiSettings.DescAllowPreferredPort'),
      },
      allowNonAuthTCP: {
        title: t('webuiSettings.AllowNonAuthTCP'),
        description: t('webuiSettings.DescAllowNonAuthTCP'),
      },
      eduAppNamePrefix: {
        title: t('webuiSettings.EduAppNamePrefix'),
        description: t('webuiSettings.DescEduAppNamePrefix'),
      },
      defaultImportEnvironment: {
        title: t('webuiSettings.DefaultImportEnvironment'),
        description: t('webuiSettings.DescDefaultImportEnvironment'),
      },
      systemSSHImage: {
        title: t('webuiSettings.SystemSSHImage'),
        description: t('webuiSettings.DescSystemSSHImage'),
      },
      defaultFileBrowserImage: {
        title: t('webuiSettings.DefaultFileBrowserImage'),
        description: t('webuiSettings.DescDefaultFileBrowserImage'),
      },
      showNonInstalledImages: {
        title: t('webuiSettings.ShowNonInstalledImages'),
        description: t('webuiSettings.DescShowNonInstalledImages'),
      },
      isDirectorySizeVisible: {
        title: t('webuiSettings.IsDirectorySizeVisible'),
        description: t('webuiSettings.DescIsDirectorySizeVisible'),
      },
      enableModelFolders: {
        title: t('webuiSettings.EnableModelFolders'),
        description: t('webuiSettings.DescEnableModelFolders'),
      },
      maxFileUploadSize: {
        title: t('webuiSettings.MaxFileUploadSize'),
        description: t('webuiSettings.DescMaxFileUploadSize'),
      },
      storageWarningThreshold: {
        title: t('webuiSettings.StorageWarningThreshold'),
        description: t('webuiSettings.DescStorageWarningThreshold'),
      },
      menuBlocklist: {
        title: t('webuiSettings.MenuBlocklist'),
        description: t('webuiSettings.DescMenuBlocklist'),
      },
      menuInactivelist: {
        title: t('webuiSettings.MenuInactivelist'),
        description: t('webuiSettings.DescMenuInactivelist'),
      },
      hideAgents: {
        title: t('webuiSettings.HideAgents'),
        description: t('webuiSettings.DescHideAgents'),
      },
      enableReservoir: {
        title: t('webuiSettings.EnableReservoir'),
        description: t('webuiSettings.DescEnableReservoir'),
      },
      fasttrackEndpoint: {
        title: t('webuiSettings.FasttrackEndpoint'),
        description: t('webuiSettings.DescFasttrackEndpoint'),
      },
      allowAppDownloadPanel: {
        title: t('webuiSettings.AllowAppDownloadPanel'),
        description: t('webuiSettings.DescAllowAppDownloadPanel'),
      },
      appDownloadUrl: {
        title: t('webuiSettings.AppDownloadUrl'),
        description: t('webuiSettings.DescAppDownloadUrl'),
      },
      allowCLIDownloadPanel: {
        title: t('webuiSettings.AllowCLIDownloadPanel'),
        description: t('webuiSettings.DescAllowCLIDownloadPanel'),
      },
      cliDownloadUrl: {
        title: t('webuiSettings.CliDownloadUrl'),
        description: t('webuiSettings.DescCliDownloadUrl'),
      },
      maskUserInfo: {
        title: t('webuiSettings.MaskUserInfo'),
        description: t('webuiSettings.DescMaskUserInfo'),
      },
      allowSignout: {
        title: t('webuiSettings.AllowSignout'),
        description: t('webuiSettings.DescAllowSignout'),
      },
      allowThemeMode: {
        title: t('webuiSettings.AllowThemeMode'),
        description: t('webuiSettings.DescAllowThemeMode'),
      },
      enableExtendLoginSession: {
        title: t('webuiSettings.EnableExtendLoginSession'),
        description: t('webuiSettings.DescEnableExtendLoginSession'),
      },
    },
    groups: {
      login: t('webuiSettings.group.Login'),
      session: t('webuiSettings.group.Session'),
      appLauncher: t('webuiSettings.group.AppLauncher'),
      environments: t('webuiSettings.group.Environments'),
      storage: t('webuiSettings.group.Storage'),
      menu: t('webuiSettings.group.Menu'),
      downloads: t('webuiSettings.group.Downloads'),
      account: t('webuiSettings.group.Account'),
      diagnostics: t('webuiSettings.group.Diagnostics'),
      plugins: t('webuiSettings.group.Plugins'),
    },
  };
};
