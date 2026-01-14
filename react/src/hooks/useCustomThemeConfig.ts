import { CustomThemeConfig, getCustomTheme } from '../helper/customThemeConfig';
import { useBAISettingUserState } from './useBAISetting';
import { useSessionStorageState } from 'ahooks';
import { useEffect, useEffectEvent, useState } from 'react';

export const useCustomThemeConfig = () => {
  const [customThemeConfig, setCustomThemeConfig] = useState<
    CustomThemeConfig | undefined
  >(getCustomTheme());
  const [userCustomThemeConfig] = useBAISettingUserState('custom_theme_config');
  const [isThemePreviewMode] = useSessionStorageState('isThemePreviewMode', {
    defaultValue: false,
  });

  const addEventListener = useEffectEvent(() => {
    if (isThemePreviewMode) {
      const themePreviewModeHandler = (e: StorageEvent) => {
        if (e.key === 'backendaiwebui.settings.user.custom_theme_config') {
          window.location.reload();
        }
      };
      window.addEventListener('storage', themePreviewModeHandler);
      return () => {
        window.removeEventListener('storage', themePreviewModeHandler);
      };
    }

    if (!customThemeConfig) {
      const handler = () => {
        setCustomThemeConfig(getCustomTheme());
      };
      document.addEventListener('custom-theme-loaded', handler);

      return () => {
        document.removeEventListener('custom-theme-loaded', handler);
      };
    }
  });

  useEffect(() => {
    addEventListener();
  }, []);

  return isThemePreviewMode ? userCustomThemeConfig : customThemeConfig;
};
