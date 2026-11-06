/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  useWebUIMenuCatalog,
  type WebUIMenuTier,
} from '../../../hooks/useWebUIMenuCatalog';
import type { MultiSelectorOptionType } from '@lablup/ui-common/MultiSelector';
import {
  BAIFlex,
  BAIMultiSelector,
  type BAIMultiSelectorProps,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { useTranslation } from 'react-i18next';

export interface MenuKeySelectorProps extends Omit<
  BAIMultiSelectorProps,
  'options' | 'value' | 'onChange'
> {
  value: Array<string>;
  onChange: (keys: Array<string>) => void;
}

const TIERS: ReadonlyArray<WebUIMenuTier> = ['user', 'projectAdmin', 'admin'];

/**
 * Picks sidebar menu keys by their menu name and icon, grouped by sidebar tier.
 * Keys it does not know (plugin pages, typos) stay selected under their own
 * section so saving never drops them.
 */
const MenuKeySelector: React.FC<MenuKeySelectorProps> = ({
  value,
  onChange,
  ...multiSelectorProps
}) => {
  'use memo';
  const { t } = useTranslation();
  // The lists cannot affect System Settings (`useWebUIMenuItems`).
  const catalog = useWebUIMenuCatalog().filter(
    (entry) => entry.key !== 'system-settings',
  );
  const tierLabels: Record<WebUIMenuTier, string> = {
    user: t('webuiSettings.MenuGroupUser'),
    projectAdmin: t('webuiSettings.MenuGroupProjectAdmin'),
    admin: t('webuiSettings.MenuGroupAdmin'),
  };
  const tierOf = _.fromPairs(
    catalog.map((entry) => [entry.key as string, entry.tier]),
  );
  const unknownKeys = value.filter((key) => !(key in tierOf));
  // "Sessions" is both a user and an admin menu: the trigger names the tier.
  const sharedLabels = new Set(
    _.keys(_.pickBy(_.countBy(catalog, 'labelText'), (count) => count > 1)),
  );

  const options: Array<MultiSelectorOptionType> = [
    ...TIERS.map((tier): MultiSelectorOptionType => ({
      type: 'section',
      title: tierLabels[tier],
      options: catalog
        .filter((entry) => entry.tier === tier)
        .map((entry) => ({
          value: entry.key,
          label: entry.labelText,
          icon: entry.icon,
        })),
    })),
    ...(unknownKeys.length > 0
      ? [
          {
            type: 'section' as const,
            title: t('webuiSettings.UnknownMenuKeys'),
            options: unknownKeys.map((key) => ({ value: key, label: key })),
          },
        ]
      : []),
  ];

  return (
    <BAIMultiSelector
      hasSearch
      {...multiSelectorProps}
      options={options}
      value={value}
      onChange={(keys) => onChange(keys)}
      // Astryx's option row draws only the label; the icon is ours to place.
      renderOption={(option) => (
        <BAIFlex gap="xs" align="center" wrap="nowrap">
          {option.icon as React.ReactNode}
          {option.label ?? option.value}
        </BAIFlex>
      )}
      formatValue={(items) =>
        items
          .map(({ value: key, label }) =>
            sharedLabels.has(label) && tierOf[key] && tierOf[key] !== 'user'
              ? `${label} (${tierLabels[tierOf[key]]})`
              : label,
          )
          .join(', ')
      }
    />
  );
};

export default MenuKeySelector;
