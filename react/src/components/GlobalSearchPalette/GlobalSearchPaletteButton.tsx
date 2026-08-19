/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useBAISettingUserState } from '../../hooks/useBAISetting';
import { useThemeMode } from '../../hooks/useThemeMode';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Kbd } from '@astryxdesign/core/Kbd';
import { Tooltip } from '@astryxdesign/core/Tooltip';
import { useHotkeys } from '@astryxdesign/core/hooks';
import { MediaTheme } from '@astryxdesign/core/theme';
import { Search } from 'lucide-react';
import React, { lazy, Suspense, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

// Lazy so the generated hit index and fuse.js stay out of the entry bundle; the
// local Suspense below covers the chunk load.
const importPalette = () => import('./GlobalSearchPalette');
const GlobalSearchPalette = lazy(importPalette);

type GlobalSearchPaletteButtonProps = Pick<
  React.ComponentProps<typeof IconButton>,
  'style' | 'className' | 'isDisabled'
> & { 'data-testid'?: string };

/**
 * Header trigger + the single `mod+k` registration for the palette. Mounted
 * once, by `WebUIHeader`, and gated on the `experimental_global_search` user
 * setting (default off). Like `BAINotificationButton`, the band's on-dark
 * context sits on the BUTTON via `data-astryx-media`, never on a wrapper: the
 * tooltip panel and the palette's `<dialog>` render as inline siblings and
 * would inherit a `MediaTheme` wrapper's forced scheme.
 */
const GlobalSearchPaletteButton: React.FC<GlobalSearchPaletteButtonProps> = ({
  ...props
}) => {
  'use memo';

  const { t, i18n } = useTranslation();
  const { isDarkMode } = useThemeMode();
  const [isExperimentalGlobalSearchEnabled] = useBAISettingUserState(
    'experimental_global_search',
  );
  const [isOpen, setIsOpen] = useState(false);

  // `allowInInputs` so the palette is reachable while a form field has focus,
  // which is where a user most often reaches for it. Registering nothing while
  // the setting is off leaves `mod+k` to the browser.
  useHotkeys(
    isExperimentalGlobalSearchEnabled
      ? [{ keys: 'mod+k', allowInInputs: true, onPress: () => setIsOpen(true) }]
      : [],
  );

  // Warm the chunk AND the artifacts it builds while the header is idle:
  // `import()` caches its module promise, and `warmGlobalSearch` resolves the
  // whole index against the current locale and English, so neither the first
  // open nor the first keystroke pays for them. Stays above the gate's early
  // return — it is a hook.
  useEffect(() => {
    if (!isExperimentalGlobalSearchEnabled) return;
    const warm = () => {
      void importPalette().then((palette) => palette.warmGlobalSearch(i18n));
    };
    if (typeof requestIdleCallback === 'function') requestIdleCallback(warm);
    else setTimeout(warm, 200);
    // `changeLanguage` mutates this same `i18n` instance, so the locale must
    // be its own dependency for a language switch to re-warm the index.
  }, [isExperimentalGlobalSearchEnabled, i18n, i18n.resolvedLanguage]);

  if (!isExperimentalGlobalSearchEnabled) return null;

  const bandMediaMode = isDarkMode ? 'light' : 'dark';

  return (
    <>
      <Tooltip
        content={
          <MediaTheme mode="dark">
            {t('webui.menu.Search')} <Kbd keys="mod+k" />
          </MediaTheme>
        }
        placement="start"
      >
        <IconButton
          data-astryx-media={bandMediaMode}
          variant="ghost"
          label={t('webui.menu.Search')}
          icon={
            <Search size="1em" style={{ color: 'var(--color-icon-primary)' }} />
          }
          onClick={() => setIsOpen(true)}
          {...props}
          style={{ color: 'var(--color-icon-primary)', ...props.style }}
        />
      </Tooltip>
      {/* Mounted on open: while the palette is closed the index is neither
          downloaded nor built. The local boundary absorbs both the lazy chunk
          and the client suspend, so an urgent open never blanks the header. */}
      {isOpen && (
        <Suspense fallback={null}>
          <GlobalSearchPalette open onRequestClose={() => setIsOpen(false)} />
        </Suspense>
      )}
    </>
  );
};

export default GlobalSearchPaletteButton;
