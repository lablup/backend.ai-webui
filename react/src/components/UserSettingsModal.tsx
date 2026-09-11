/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 The user-settings surface, as a dialog over whatever page is underneath
 (`UserSettingsModalOpener` owns the `?settings=` param that drives it).

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
import { Divider } from '@astryxdesign/core/Divider';
import { Icon } from '@astryxdesign/core/Icon';
import { List, ListItem } from '@astryxdesign/core/List';
import { HStack, VStack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
import { BAIModal, BAISkeleton } from 'backend.ai-ui';
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

// Astryx's dialog surface is `height: fit-content`, so the rail and the pane
// need a resolved height before either can own a scrollport. `dvh` so mobile
// browser chrome does not push the bottom edge off-screen.
const DIALOG_INSET_BLOCK = 'var(--spacing-12)';
const DIALOG_HEIGHT_VALUE = `calc(100dvh - ${DIALOG_INSET_BLOCK} * 2)`;
const DIALOG_HEIGHT: CSSProperties = { height: DIALOG_HEIGHT_VALUE };
const BODY_FILL: CSSProperties = { height: '100%', minHeight: 0 };

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
    <BAIModal
      open
      onCancel={onRequestClose}
      // The rail names the open category, so the bar names the surface; below
      // `md` the rail is gone and the bar carries the category.
      title={
        <HStack gap={2} vAlign="center">
          {isNarrow && !showNavOnly ? (
            <Button
              label={t('webui.menu.GoBack')}
              variant="ghost"
              size="sm"
              isIconOnly
              icon={<Icon icon={ArrowLeft} size="sm" />}
              onClick={() => setNarrowView('nav')}
            />
          ) : null}
          <Text weight="semibold">
            {isNarrow && !showNavOnly
              ? t(CATEGORY_LABEL_KEYS[category])
              : t('webui.menu.Settings&Logs')}
          </Text>
          {/* The page's own help button is behind the mask while this is open. */}
          <WEBUIHelpButton />
        </HStack>
      }
      footer={null}
      variant={isNarrow ? 'fullscreen' : 'standard'}
      width={DIALOG_WIDTH}
      // Astryx caps a standard dialog at 75dvh; raise it so `style.height` wins.
      maxHeight={DIALOG_HEIGHT_VALUE}
      // `purpose="form"` in Astryx terms: Escape closes, the backdrop does not.
      maskClosable={false}
      style={isNarrow ? undefined : DIALOG_HEIGHT}
      styles={{ body: BODY_FILL }}
      // The accessible name would otherwise come from the title, which changes
      // per category below `md`.
      aria-label={t('webui.menu.Settings&Logs')}
      data-testid="user-settings-modal"
    >
      {/* `BAIModal` already owns the dialog's one `Layout`, so the rail is a
          stack beside the pane rather than a second `LayoutPanel`. */}
      <HStack height="100%" align="stretch">
        {isNarrow ? null : (
          <>
            <VStack
              as="nav"
              width={NAV_PANEL_WIDTH}
              isScrollable
              paddingInlineEnd={3}
            >
              {categoryNav}
            </VStack>
            <Divider orientation="vertical" />
          </>
        )}
        <VStack
          width="100%"
          isScrollable
          paddingInlineStart={isNarrow ? 0 : 4}
          paddingBlockEnd={2}
        >
          {showNavOnly ? (
            categoryNav
          ) : (
            // Keyed so a failed category does not latch the whole surface: the
            // page this replaced mounted one boundary per tab, which switching
            // tabs unmounted.
            <BAIErrorBoundary key={category}>
              <Suspense fallback={<BAISkeleton />}>{pane}</Suspense>
            </BAIErrorBoundary>
          )}
        </VStack>
      </HStack>
    </BAIModal>
  );
};

export default UserSettingsModal;
