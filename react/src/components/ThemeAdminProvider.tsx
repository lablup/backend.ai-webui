/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 DOCUMENTED EXCLUSION (to-astryx phase 3 wave 2, partition C) — this is a
 theme-PRODUCER, not a theme consumer.

 It builds an antd `ThemeConfig` (algorithm + `colorPrimary`) and installs it
 through `ConfigProvider`, reading `ConfigProvider.ConfigContext` to inherit
 the parent's light/dark algorithm. MAPPING.md §5 grades `ConfigProvider` as
 COMPOSITION splitting into `<Theme>` + `<InternationalizationProvider>` +
 `<LayerProvider>`, and warns that a nested `<Theme>` with no explicit `mode`
 falls back to `system` rather than the parent's resolved mode — i.e. porting
 THIS file means deciding how the whole app's nested-theme layering works, not
 renaming props. That is the FINAL-SWITCH ticket's job (the same reason
 `theme-shim` and `BAIConfigProvider` are still antd): while any consumer of
 this provider still renders antd components, the antd theme has to keep being
 produced. Converting it in isolation would silently unstyle every antd
 descendant.

 The Astryx-side equivalent already exists and is live — the brand theme's
 admin/secondary accents come from `react/src/astryx-theme/`. This file is the
 antd half of the same pair and dies with the final switch, not before.
 */
import { useCustomThemeConfig } from '../hooks/useCustomThemeConfig';
import usePrimaryColors from '../hooks/usePrimaryColors';
import {
  theme,
  ConfigProvider,
  type ConfigProviderProps,
  type ThemeConfig,
} from 'antd';
import * as _ from 'lodash-es';
import React, { use } from 'react';

const ThemeAdminProvider: React.FC<ConfigProviderProps> = ({ ...props }) => {
  'use memo';
  const { themeConfig } = useCustomThemeConfig();
  const config = use(ConfigProvider.ConfigContext);
  const isParentDark = config.theme?.algorithm === theme.darkAlgorithm;
  const primaryColors = usePrimaryColors();

  const additionalThemeConfig = {
    token: { colorPrimary: primaryColors.admin },
  } as ThemeConfig;
  return (
    <ConfigProvider
      {...props}
      theme={{
        ...(isParentDark
          ? _.merge({}, themeConfig?.dark, additionalThemeConfig, props.theme)
          : _.merge(
              {},
              themeConfig?.light,
              additionalThemeConfig,
              props.theme,
            )),
        algorithm: isParentDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    />
  );
};

export default ThemeAdminProvider;
