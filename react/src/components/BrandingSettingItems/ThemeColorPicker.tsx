/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  BAIThemeSeedValue,
  BAIThemeSeeds,
  getStaticAppearanceConfig,
  pickSeed,
} from '../../helper/customThemeConfig';
import { useDefaultTheme } from '../../hooks/useDefaultTheme';
import LightDarkColorPicker from '../LightDarkColorPicker';
import * as _ from 'lodash-es';

/**
 * A seed path into the v2 appearance document (FR-1964). The Branding page
 * edits the `default` family; other families are edited via the JSON modal.
 */
export type AppearanceSeedPath =
  | `theme.families.${string}.seeds.${keyof BAIThemeSeeds}`
  | `theme.families.${string}.headerBg`;

interface ThemeColorPickerSettingItemProps {
  seedPath: AppearanceSeedPath;
}

const ThemeColorPicker: React.FC<ThemeColorPickerSettingItemProps> = ({
  seedPath,
}) => {
  'use memo';

  const { getDefaultThemeValue, updateDefaultTheme } = useDefaultTheme();

  const draftValue = getDefaultThemeValue<BAIThemeSeedValue>(seedPath);
  // Shipped theme.json value backs an empty draft slot so the picker never
  // shows a blank swatch for a seed the app actually renders.
  const shippedValue = _.get(getStaticAppearanceConfig(), seedPath) as
    BAIThemeSeedValue | undefined;
  const currentValue = draftValue ?? shippedValue;

  // Seeds are stored whole (string or [light, dark] tuple); editing one
  // scheme rewrites the full tuple so a string seed never gets index-patched
  // into an object. A scheme the document leaves out has no color of its own
  // (the app renders Astryx's default there), so it takes the picked one.
  const updateScheme = (mode: 'light' | 'dark', value: string) => {
    const other = mode === 'light' ? 'dark' : 'light';
    const otherValue = pickSeed(currentValue, other) ?? value;
    const next: [string, string] =
      mode === 'light' ? [value, otherValue] : [otherValue, value];
    updateDefaultTheme(seedPath, next);
  };

  return (
    <LightDarkColorPicker
      light={{
        value: pickSeed(currentValue, 'light'),
        onChangeComplete: (value) => {
          updateScheme('light', value);
        },
      }}
      dark={{
        value: pickSeed(currentValue, 'dark'),
        onChangeComplete: (value) => {
          updateScheme('dark', value);
        },
      }}
    />
  );
};

export default ThemeColorPicker;
