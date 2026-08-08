/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 SKIPPED BY DESIGN — theme-producer layer (phase-3 wave 2, partition B).

 This component IS an antd `ConfigProvider`: it reads the parent's algorithm
 off `ConfigProvider.ConfigContext` and re-provides the inverted one. There is
 nothing here to convert — the Astryx half of the same inversion already exists
 as `astryx-theme/AstryxReverseTheme.tsx`, and every call site
 (`WebUIHeader`, `WebUISider`, `BAINotificationButton`, `UserDropdownMenu`)
 drives both, because the two dark-mode switches are independent (MAPPING §5).
 This file disappears with the final antd switch (ticket 35), not before.
*/
import { useCustomThemeConfig } from '../hooks/useCustomThemeConfig';
import { theme, ConfigProvider, type ConfigProviderProps } from 'antd';
import * as _ from 'lodash-es';
import React, { use } from 'react';

interface ReverseThemeProviderProps extends ConfigProviderProps {
  className?: string;
}
const ReverseThemeProvider: React.FC<ReverseThemeProviderProps> = ({
  ...props
}) => {
  'use memo';
  const { themeConfig } = useCustomThemeConfig();
  const config = use(ConfigProvider.ConfigContext);
  const isParentDark = config.theme?.algorithm === theme.darkAlgorithm;

  return (
    <ConfigProvider
      {...props}
      theme={{
        ...(isParentDark
          ? _.merge({}, themeConfig?.light, props.theme)
          : _.merge({}, themeConfig?.dark, props.theme)),
        algorithm: isParentDark ? theme.defaultAlgorithm : theme.darkAlgorithm,
      }}
    />
  );
};

export default ReverseThemeProvider;
