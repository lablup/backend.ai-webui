/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useWebUINavigate } from '../../hooks';
import type { SearchHit } from './types';
import { useDebouncedSearchSource } from './useDebouncedSearchSource';
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
  const searchSource = useDebouncedSearchSource(useGlobalSearchSource());
  const [, { push }] = useRecentSearchHits();

  const translate = toTranslator(t);

  // Setting descriptions carry inline markup (`<br />`, `<b>`); the row is one
  // line of plain text.
  const toPlainText = (key: string) =>
    translate(key)
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  // Body-key matches surface as the page row, so the secondary line says where
  // the word was found instead of repeating the page's own breadcrumb.
  const secondaryTextOf = (hit: SearchHit) =>
    hit.matchedIn
      ? t('webui.search.FoundIn', { text: toPlainText(hit.matchedIn.key) })
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
        navigate({
          pathname: hit.target.path,
          search: new URLSearchParams(hit.target.search ?? {}).toString(),
        });
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
