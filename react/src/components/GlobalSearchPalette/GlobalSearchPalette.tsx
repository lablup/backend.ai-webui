/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient, useWebUINavigate } from '../../hooks';
import { useOpenHelp } from '../../hooks/useHelpURL';
import { useActiveProjectName } from '../../hooks/useRouteScope';
import {
  useNotificationDrawerState,
  useSiderCollapsedState,
} from '../../hooks/useShellPanels';
import { useThemeMode } from '../../hooks/useThemeMode';
import { plainText } from './rank';
import type { PaletteActionContext, SearchHit } from './types';
import { toTranslator, useGlobalSearchSource } from './useGlobalSearchSource';
import { useRecentSearchHits } from './useRecentSearchHits';
import {
  CommandPalette,
  CommandPaletteInput,
} from '@astryxdesign/core/CommandPalette';
import { Kbd } from '@astryxdesign/core/Kbd';
import { HStack, VStack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
import { textSizeVars } from '@astryxdesign/core/theme/tokens.stylex';
import * as stylex from '@stylexjs/stylex';
import { useBAILogger } from 'backend.ai-ui';
import { Settings } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

const styles = stylex.create({
  // Flex items default to `min-width: auto`, which lets a long "found in" line
  // push past the dialog instead of truncating at `maxLines`.
  rowText: { minWidth: 0 },
  // A long secondary line must eat the text column, never the glyph.
  iconSlot: {
    flexShrink: 0,
    width: textSizeVars['--font-size-xl'],
    height: textSizeVars['--font-size-xl'],
  },
});

export interface GlobalSearchPaletteProps {
  open: boolean;
  onRequestClose: () => void;
}

// Astryx's own default width, capped so the dialog never outgrows a phone
// viewport (standing decision 8 — the header trigger stays visible below `sm`).
const PALETTE_WIDTH = 'min(640px, 92vw)';

const GlobalSearchPalette: React.FC<GlobalSearchPaletteProps> = ({
  open,
  onRequestClose,
}) => {
  'use memo';

  const { t } = useTranslation();
  const { logger } = useBAILogger();
  const navigate = useWebUINavigate();
  const baiClient = useSuspendedBackendaiClient();
  const projectName = useActiveProjectName();
  const { setThemeMode } = useThemeMode();
  const [, setNotificationDrawerOpen] = useNotificationDrawerState();
  const [, setSiderCollapsed] = useSiderCollapsedState();
  const openHelp = useOpenHelp();
  // Deliberately undebounced: the index is in-memory and `search()` is
  // synchronous, so Astryx commits its optimistic narrowing and the ranked
  // rows in one paint. A delay splits that into a visible two-phase jump.
  const searchSource = useGlobalSearchSource();
  const [, { push }] = useRecentSearchHits();

  const actionContext: PaletteActionContext = {
    navigate,
    projectName: projectName ?? null,
    config: {
      hideAgents: baiClient?._config?.hideAgents ?? true,
      enableReservoir: !!baiClient?._config?.enableReservoir,
      fasttrackEndpoint: baiClient?._config?.fasttrackEndpoint ?? null,
    },
    setThemeMode,
    openNotifications: () => setNotificationDrawerOpen(true),
    toggleSider: () => setSiderCollapsed((collapsed) => !collapsed),
    openHelp,
  };

  const translate = toTranslator(t);

  // Body-key matches surface as the page row, so the secondary line says where
  // the word was found instead of repeating the page's own breadcrumb.
  const secondaryTextOf = (hit: SearchHit) =>
    hit.matchedIn
      ? t('webui.search.FoundIn', {
          text: plainText(translate(hit.matchedIn.key)),
        })
      : hit.breadcrumbKeys.map(translate).join(' › ');

  return (
    <CommandPalette
      isOpen={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onRequestClose();
      }}
      label={t('webui.menu.Search')}
      width={PALETTE_WIDTH}
      searchSource={searchSource}
      input={
        <CommandPaletteInput
          placeholder={t('webui.search.Placeholder')}
          endContent={<Kbd keys="mod+k" />}
        />
      }
      emptySearchText={t('webui.search.NoResults')}
      onValueChange={(value) => {
        const hit = searchSource.getHit(value);
        if (!hit) {
          logger.warn('GlobalSearchPalette: no hit for', value);
          return;
        }
        push(hit);
        if (hit.run) {
          Promise.resolve(hit.run(actionContext)).catch((error) =>
            logger.error('GlobalSearchPalette: action failed', hit.id, error),
          );
        } else if (hit.target) {
          navigate({
            pathname: hit.target.path,
            search: new URLSearchParams(hit.target.search ?? {}).toString(),
          });
        }
        onRequestClose();
      }}
      renderItem={(hit: SearchHit) => {
        const secondaryText = secondaryTextOf(hit);
        return (
          <HStack gap={2} align="center" width="100%">
            <HStack align="center" justify="center" xstyle={styles.iconSlot}>
              {/* Pages the sidebar never lists (user settings) carry no menu
                  icon; the fallback keeps every row's text on one baseline. */}
              {hit.icon ?? <Settings size="1em" />}
            </HStack>
            <VStack gap={0} xstyle={styles.rowText}>
              <Text type="body" maxLines={1}>
                {hit.label}
              </Text>
              {!!secondaryText && (
                <Text type="supporting" maxLines={1}>
                  {secondaryText}
                </Text>
              )}
            </VStack>
          </HStack>
        );
      }}
    />
  );
};

export default GlobalSearchPalette;
