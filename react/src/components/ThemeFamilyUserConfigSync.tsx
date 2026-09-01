/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useMyAppConfig } from '../hooks/useAppConfig';
import { useCustomThemeConfig } from '../hooks/useCustomThemeConfig';
import { useEffect, useEffectEvent } from 'react';

/**
 * Syncs the signed-in user's authoritative family choice
 * (`userConfig.themeFamily`) into the localStorage mirror the FOUC bootstrap
 * and `useCustomThemeConfig` read (FR-1964). Renders nothing; mount once
 * inside the authenticated Relay tree (logout clears the mirror in
 * `useLogout`).
 */
const ThemeFamilyUserConfigSync = () => {
  'use memo';
  const userConfigFamily = useMyAppConfig<string>('themeFamily');
  const { setActiveThemeFamily } = useCustomThemeConfig();

  const syncMirror = useEffectEvent(() => {
    setActiveThemeFamily(
      typeof userConfigFamily === 'string' ? userConfigFamily : undefined,
    );
  });
  useEffect(() => {
    syncMirror();
  }, [userConfigFamily]);

  return null;
};

export default ThemeFamilyUserConfigSync;
