/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 The user-settings surface, as a dialog over whatever page is underneath
 (`UserSettingsModalOpener` owns the `?settings=` param that drives it).

 Composition follows Astryx's `settings-dialog` template: `BAIDialog` with
 `padding={0}` holding one `Layout` whose `start` slot is the category rail and
 whose `content` scrolls. `BAIModal` is not usable here because it already owns
 a `Layout`, and Astryx forbids nesting one inside another.
*/
import type { LoginHistoryQuery as LoginHistoryQueryType } from '../__generated__/LoginHistoryQuery.graphql';
import type { LoginSessionQuery as LoginSessionQueryType } from '../__generated__/LoginSessionQuery.graphql';
import {
  USER_SETTINGS_CATEGORIES,
  type UserSettingsCategory,
} from '../helper/userSettingsModal';
import { useBAIBreakpoint } from '../theme-shim';
import BAIErrorBoundary from './BAIErrorBoundary';
import ErrorLogList from './ErrorLogList';
import LoginHistory, { LoginHistoryQuery } from './LoginHistory';
import LoginSession, { LoginSessionQuery } from './LoginSession';
import UserSettingsGeneralPane from './UserSettingsGeneralPane';
import WEBUIHelpButton from './WEBUIHelpButton';
import { Button } from '@astryxdesign/core/Button';
import { DialogHeader } from '@astryxdesign/core/Dialog';
import { Divider } from '@astryxdesign/core/Divider';
import { Icon } from '@astryxdesign/core/Icon';
import { Layout, LayoutContent, LayoutPanel } from '@astryxdesign/core/Layout';
import { List, ListItem } from '@astryxdesign/core/List';
import { VStack } from '@astryxdesign/core/Stack';
import { BAIDialog, BAISkeleton } from 'backend.ai-ui';
import {
  ArrowLeft,
  ChevronRight,
  History,
  MonitorSmartphone,
  ScrollText,
  SlidersHorizontal,
} from 'lucide-react';
import React, {
  CSSProperties,
  Suspense,
  useEffect,
  useEffectEvent,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryLoader } from 'react-relay';

// Astryx's dialog surface is `height: fit-content`, so `maxHeight` alone leaves
// nothing owning a scrollport — the rail and the pane need a resolved height.
const DIALOG_HEIGHT: CSSProperties = { height: '85vh' };

// The header rides along the scrolling pane; Astryx has no sticky prop for it.
// The pane's own inset lives on these two blocks rather than on `LayoutContent`,
// so the stuck bar covers the full width and nothing scrolls through the gap a
// `padding`ed scrollport would leave above it.
const HEADER_STICKY: CSSProperties = {
  position: 'sticky',
  top: 0,
  paddingInline: 'var(--spacing-4)',
  paddingBlock: 'var(--spacing-4) var(--spacing-2)',
  backgroundColor: 'var(--color-background-surface)',
  zIndex: 1,
};

const PANE_INSET: CSSProperties = {
  paddingInline: 'var(--spacing-4)',
  paddingBlockEnd: 'var(--spacing-4)',
  // Its own stacking context, so a pane's internal layering — BAITable's pinned
  // column and sticky header cells reach z-index 3 — cannot outrank the header
  // bar above it.
  position: 'relative',
  zIndex: 0,
};

// 1100 matches `MyKeypairManagementModal`, the widest dialog opened from here,
// so a child never overhangs its parent. Minus the rail it still leaves the
// pane above `ErrorLogList`'s eight-column minimum.
const DIALOG_WIDTH = 'min(1100px, 92vw)';
const NAV_PANEL_WIDTH = 240;

const CATEGORY_ICONS: Record<
  UserSettingsCategory,
  React.ComponentProps<typeof Icon>['icon']
> = {
  general: SlidersHorizontal,
  logs: ScrollText,
  'login-sessions': MonitorSmartphone,
  'login-history': History,
};

const CATEGORY_LABEL_KEYS: Record<UserSettingsCategory, string> = {
  general: 'userSettings.General',
  logs: 'userSettings.Logs',
  'login-sessions': 'userSettings.LoginSessions',
  'login-history': 'userSettings.LoginHistory',
};

export interface UserSettingsModalProps {
  category: UserSettingsCategory;
  onCategoryChange: (category: UserSettingsCategory) => void;
  onRequestClose: () => void;
}

const UserSettingsModal: React.FC<UserSettingsModalProps> = ({
  category,
  onCategoryChange,
  onRequestClose,
}) => {
  'use memo';
  const { t } = useTranslation();
  // RESPONSIVE-POLICY R3 — the theme-shim hook, never Astryx `useMediaQuery`.
  const { md } = useBAIBreakpoint();
  const isNarrow = !md;
  const [narrowView, setNarrowView] = useState<'nav' | 'detail'>('detail');

  const [loginSessionQueryRef, loadLoginSessionQuery] =
    useQueryLoader<LoginSessionQueryType>(LoginSessionQuery);
  const [loginHistoryQueryRef, loadLoginHistoryQuery] =
    useQueryLoader<LoginHistoryQueryType>(LoginHistoryQuery);
  // Lazily fetch a category's data only once it becomes active (covers both a
  // rail click and a direct `?settings=...` URL restore), so neither query runs
  // while the General/Logs categories are shown.
  const ensureActiveCategoryQueryLoaded = useEffectEvent(() => {
    if (category === 'login-sessions' && !loginSessionQueryRef) {
      loadLoginSessionQuery(
        {
          orderBy: [{ field: 'CREATED_AT', direction: 'DESC' }],
          limit: 10,
          offset: 0,
        },
        { fetchPolicy: 'store-and-network' },
      );
    }
    if (category === 'login-history' && !loginHistoryQueryRef) {
      loadLoginHistoryQuery(
        {
          orderBy: [{ field: 'CREATED_AT', direction: 'DESC' }],
          limit: 10,
          offset: 0,
        },
        { fetchPolicy: 'store-and-network' },
      );
    }
  });
  useEffect(
    function loadActiveCategoryQueryOnActivation() {
      ensureActiveCategoryQueryLoaded();
    },
    [category],
  );

  // Narrow drill-down: picking a category in the rail reveals its pane, the
  // back button returns to the rail (same idiom as `SettingList`).
  const selectCategory = (next: UserSettingsCategory) => {
    setNarrowView('detail');
    onCategoryChange(next);
  };

  const categoryNav = (
    <VStack gap={2}>
      <List density="spacious">
        <ListItem
          label={t(CATEGORY_LABEL_KEYS.general)}
          startContent={<Icon icon={CATEGORY_ICONS.general} size="sm" />}
          endContent={
            isNarrow ? (
              <Icon icon={ChevronRight} size="sm" color="secondary" />
            ) : undefined
          }
          isSelected={!isNarrow && category === 'general'}
          onClick={() => selectCategory('general')}
        />
      </List>
      <Divider />
      <List density="spacious">
        {USER_SETTINGS_CATEGORIES.filter((key) => key !== 'general').map(
          (key) => (
            <ListItem
              key={key}
              label={t(CATEGORY_LABEL_KEYS[key])}
              startContent={<Icon icon={CATEGORY_ICONS[key]} size="sm" />}
              endContent={
                isNarrow ? (
                  <Icon icon={ChevronRight} size="sm" color="secondary" />
                ) : undefined
              }
              isSelected={!isNarrow && category === key}
              onClick={() => selectCategory(key)}
            />
          ),
        )}
      </List>
    </VStack>
  );

  const pane =
    category === 'general' ? (
      <UserSettingsGeneralPane />
    ) : category === 'logs' ? (
      <ErrorLogList />
    ) : category === 'login-sessions' ? (
      loginSessionQueryRef ? (
        <LoginSession
          queryRef={loginSessionQueryRef}
          onReload={loadLoginSessionQuery}
        />
      ) : (
        <BAISkeleton />
      )
    ) : loginHistoryQueryRef ? (
      <LoginHistory
        queryRef={loginHistoryQueryRef}
        onReload={loadLoginHistoryQuery}
      />
    ) : (
      <BAISkeleton />
    );

  const showNavOnly = isNarrow && narrowView === 'nav';

  return (
    <BAIDialog
      isOpen
      onOpenChange={(next) => {
        if (!next) onRequestClose();
      }}
      variant={isNarrow ? 'fullscreen' : 'standard'}
      width={DIALOG_WIDTH}
      maxHeight="85vh"
      padding={0}
      purpose="form"
      style={isNarrow ? undefined : DIALOG_HEIGHT}
      // The dialog's accessible name would otherwise be derived from whichever
      // heading renders first inside it, which changes per category.
      aria-label={t('webui.menu.Settings&Logs')}
      data-testid="user-settings-modal"
    >
      <Layout
        height="fill"
        start={
          isNarrow ? undefined : (
            <LayoutPanel
              width={NAV_PANEL_WIDTH}
              hasDivider
              padding={3}
              role="navigation"
              label={t('webui.menu.Settings')}
            >
              {categoryNav}
            </LayoutPanel>
          )
        }
        content={
          <LayoutContent isScrollable padding={0}>
            <VStack gap={4}>
              <VStack style={HEADER_STICKY}>
                <DialogHeader
                  title={
                    showNavOnly
                      ? t('webui.menu.Settings&Logs')
                      : t(CATEGORY_LABEL_KEYS[category])
                  }
                  hasDivider={false}
                  onOpenChange={(next) => {
                    if (!next) onRequestClose();
                  }}
                  startContent={
                    isNarrow && !showNavOnly ? (
                      <Button
                        label={t('webui.menu.GoBack')}
                        variant="ghost"
                        size="sm"
                        isIconOnly
                        icon={<Icon icon={ArrowLeft} size="sm" />}
                        onClick={() => setNarrowView('nav')}
                      />
                    ) : undefined
                  }
                  endContent={<WEBUIHelpButton />}
                />
              </VStack>
              <VStack style={PANE_INSET}>
                {showNavOnly ? (
                  categoryNav
                ) : (
                  // Keyed so a failed category does not latch the whole
                  // surface: the page this replaced mounted one boundary per
                  // tab, which switching tabs unmounted.
                  <BAIErrorBoundary key={category}>
                    <Suspense fallback={<BAISkeleton />}>{pane}</Suspense>
                  </BAIErrorBoundary>
                )}
              </VStack>
            </VStack>
          </LayoutContent>
        }
      />
    </BAIDialog>
  );
};

export default UserSettingsModal;
