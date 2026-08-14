/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useBAISettingUserState } from '../../hooks/useBAISetting';
import { useCurrentProjectValue } from '../../hooks/useCurrentProject';
import { useCurrentMenuKey } from '../../hooks/useRouteScope';
import { toProjectContext } from '../../types/projectContext';
import FolderCreateModalV2 from '../FolderCreateModalV2';
import {
  spotlightFolderCreateOpenAtom,
  spotlightOpenAtom,
} from './spotlightAtoms';
import { spotlightMatchScore } from './spotlightMatch';
import { SpotlightEntry, useSpotlightEntries } from './useSpotlightEntries';
import {
  CommandPalette,
  CommandPaletteInput,
} from '@astryxdesign/core/CommandPalette';
import type {
  SearchableItem,
  SearchSource,
} from '@astryxdesign/core/Typeahead';
import { useHotkeys } from '@astryxdesign/core/hooks';
import { BAIFlex } from 'backend.ai-ui';
import { useAtom } from 'jotai';
import React, { useEffect, useEffectEvent } from 'react';
import { useTranslation } from 'react-i18next';

export { spotlightOpenAtom } from './spotlightAtoms';

type SpotlightAux = { group: string; icon?: React.ReactNode };
type SpotlightSearchItem = SearchableItem<SpotlightAux>;

const RECENT_TRACK_MAX = 8;
const RECENT_SHOW_MAX = 5;

const toSearchItem = (
  entry: SpotlightEntry,
  group: string,
): SpotlightSearchItem => ({
  id: entry.id,
  label: entry.label,
  auxiliaryData: { group, icon: entry.icon },
});

const WebUISpotlight: React.FC = () => {
  'use memo';
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useAtom(spotlightOpenAtom);
  const [isFolderCreateOpen, setIsFolderCreateOpen] = useAtom(
    spotlightFolderCreateOpenAtom,
  );
  const currentProject = useCurrentProjectValue();
  const { entries } = useSpotlightEntries();
  const [recentMenuKeys, setRecentMenuKeys] = useBAISettingUserState(
    'spotlight_recent_menu_keys',
  );
  const currentMenuKey = useCurrentMenuKey();

  const trackVisit = useEffectEvent((menuKey: string) => {
    setRecentMenuKeys((prev) =>
      [menuKey, ...(prev ?? []).filter((k) => k !== menuKey)].slice(
        0,
        RECENT_TRACK_MAX,
      ),
    );
  });
  useEffect(() => {
    if (currentMenuKey) {
      trackVisit(currentMenuKey);
    }
  }, [currentMenuKey]);

  useHotkeys([
    {
      keys: 'mod+k',
      allowInInputs: true,
      onPress: () => {
        // v1 policy (FR-3548): the palette does not open over an open modal.
        if (document.querySelector('dialog[open]')) return;
        setIsOpen(true);
      },
    },
  ]);

  const groupLabels = {
    page: t('spotlight.Pages'),
    'admin-page': t('webui.menu.Administration'),
    action: t('spotlight.Actions'),
  } as const;

  const searchSource: SearchSource<SpotlightSearchItem> = {
    search: (query) => {
      const kindWeight = { page: 0, 'admin-page': 1, action: 2 } as const;
      return entries
        .map((entry) => ({
          entry,
          score: spotlightMatchScore(query, entry.label, entry.keywords),
        }))
        .filter(({ score }) => score > 0)
        .sort(
          (a, b) =>
            kindWeight[a.entry.kind] - kindWeight[b.entry.kind] ||
            b.score - a.score ||
            a.entry.label.localeCompare(b.entry.label),
        )
        .map(({ entry }) => toSearchItem(entry, groupLabels[entry.kind]));
    },
    bootstrap: () => {
      // Recents map through the live (permission-filtered) entry set, so a
      // menu key the user can no longer reach silently drops out.
      const recent = (recentMenuKeys ?? [])
        .flatMap((key) => entries.filter((e) => e.menuKey === key))
        .filter((e) => e.menuKey !== currentMenuKey)
        .slice(0, RECENT_SHOW_MAX)
        .map((e) => toSearchItem(e, t('spotlight.Recent')));
      const actions = entries
        .filter((e) => e.kind === 'action' && !e.isHiddenInBootstrap)
        .map((e) => toSearchItem(e, groupLabels.action));
      return [...recent, ...actions];
    },
  };

  return (
    <>
      <FolderCreateModalV2
        open={isFolderCreateOpen}
        project={toProjectContext(currentProject)}
        onRequestClose={() => setIsFolderCreateOpen(false)}
      />
      <CommandPalette
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        searchSource={searchSource}
        label={t('spotlight.Search')}
        onValueChange={(id) => {
          entries.find((e) => e.id === id)?.run();
        }}
        input={
          <CommandPaletteInput
            placeholder={t('spotlight.SearchPlaceholder')}
            onKeyDown={(e) => {
              // No isComposing guard in the palette's combobox path (FR-3548):
              // Enter that commits an IME composition must not select an item.
              if (e.key === 'Enter' && e.nativeEvent.isComposing) {
                e.preventDefault();
              }
            }}
          />
        }
        renderItem={(item) => (
          <BAIFlex gap="xs" align="center">
            {item.auxiliaryData?.icon}
            {item.label}
          </BAIFlex>
        )}
        emptySearchText={t('spotlight.NoResults')}
        emptyBootstrapText={t('spotlight.TypeToSearch')}
      />
    </>
  );
};

export default WebUISpotlight;
