/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { UserDropdownMenuQuery } from '../__generated__/UserDropdownMenuQuery.graphql';
import { useSuspendedBackendaiClient, useWebUINavigate } from '../hooks';
import {
  useCurrentUserInfo,
  useCurrentUserRole,
  useTOTPSupported,
} from '../hooks/backendai';
import { useBAIBreakpoint } from '../theme-shim';
import AboutBackendAIModal from './AboutBackendAIModal';
import DownloadModal from './DownloadModal';
import ErrorBoundaryWithNullFallback from './ErrorBoundaryWithNullFallback';
import {
  DropdownMenu,
  type DropdownMenuOption,
} from '@astryxdesign/core/DropdownMenu';
import {
  BAIUnmountAfterClose,
  filterOutEmpty,
  useFetchKey,
  useToggle,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import {
  User,
  Mail,
  ShieldCheck,
  CircleAlert,
  Lock,
  FileText,
  LogOut,
  Settings,
  Download,
} from 'lucide-react';
import React, { CSSProperties, Suspense, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

const UserProfileSettingModal = React.lazy(
  () => import('./UserProfileSettingModal'),
);

// PILOT-DECISION: antd `Dropdown menu={{items}} trigger={['click']}` →
// Astryx `DropdownMenu items` (MAPPING §3.7 — the `menu={{items}}` branch;
// `placement="bottomRight"` splits into `placement="below" alignment="end"`).
// Astryx `DropdownMenu` OWNS its trigger button (`button` prop), so the
// `buttonRender` escape hatch — whose only caller wrapped the trigger in
// `ReverseThemeProvider` — is dropped: the trigger carries the band's on-dark
// media context on itself (`button['data-astryx-media']`), which is also what
// keeps the panel out of it — see the call site.
// P7: the per-item `data-testid`s are dropped (Astryx `DropdownMenuItemData`
// has no passthrough). The e2e suite clicks these rows by TEXT
// (`getByText('My Account')`, `getByText('Log Out')`) and only anchors on
// `user-dropdown-button`, which rides on `DropdownMenu`'s own `data-testid`
// prop — see the call site for why it cannot go inside `button`.
const UserDropdownMenu: React.FC<{
  style?: CSSProperties;
}> = ({ style }) => {
  'use memo';
  const { t } = useTranslation();
  const [userInfo] = useCurrentUserInfo();
  // RESPONSIVE-POLICY R3: `Grid.useBreakpoint()` → theme-shim hook.
  const screens = useBAIBreakpoint();
  const baiClient = useSuspendedBackendaiClient();

  const [isOpenUserSettingModal, { set: setIsOpenUserSettingModal }] =
    useToggle(false);
  const [isDownloadModalOpen, { toggle: toggleDownloadModal }] =
    useToggle(false);
  const [isOpenAboutBAIModal, { toggle: toggleAboutBAIModal }] =
    useToggle(false);

  const userRole = useCurrentUserRole();

  const webuiNavigate = useWebUINavigate();
  const { isTOTPSupported } = useTOTPSupported();

  const [fetchKey, updateFetchKey] = useFetchKey();
  const [, startRefetchTransition] = useTransition();

  const { myUserV2: user, myClientIp } =
    useLazyLoadQuery<UserDropdownMenuQuery>(
      graphql`
        query UserDropdownMenuQuery($isNotSupportTotp: Boolean!) {
          myUserV2 {
            basicInfo {
              fullName
            }
            ...UserProfileSettingModalFragment
          }
          myClientIp {
            clientIp
          }
        }
      `,
      {
        isNotSupportTotp: !isTOTPSupported,
      },
      {
        fetchPolicy: 'store-and-network',
        fetchKey,
      },
    );

  const currentClientIp = myClientIp?.clientIp;

  const displayName =
    _.trim(user?.basicInfo?.fullName ?? '').length > 0
      ? (user?.basicInfo?.fullName ?? '')
      : userInfo.email;

  // The three leading rows (name / email / role) are read-only identity
  // display; antd expressed that with `disabled` + a `cursor: default` style
  // override. `isDisabled` keeps the same non-interactive semantics — the
  // cursor/colour overrides have no destination (P5, closed enums).
  const items: DropdownMenuOption[] = filterOutEmpty<DropdownMenuOption>([
    {
      label: displayName,
      icon: <User size="1em" />,
      isDisabled: true,
    },
    {
      label: userInfo.email,
      icon: <Mail size="1em" />,
      isDisabled: true,
    },
    { type: 'divider' },
    {
      label: userRole ?? '',
      icon: <ShieldCheck size="1em" />,
      isDisabled: true,
    },
    { type: 'divider' },
    {
      label: t('webui.menu.AboutBackendAI'),
      icon: <CircleAlert size="1em" />,
      onClick: () => {
        toggleAboutBAIModal();
      },
    },
    {
      label: t('webui.menu.MyAccount'),
      icon: <Lock size="1em" />,
      onClick: () => {
        setIsOpenUserSettingModal(true);
      },
    },
    {
      label: t('webui.menu.Preferences'),
      icon: <Settings size="1em" />,
      onClick: () => {
        webuiNavigate('/usersettings?tab=general');
      },
    },
    {
      label: t('webui.menu.LogsErrors'),
      icon: <FileText size="1em" />,
      onClick: () => {
        webuiNavigate('/usersettings?tab=logs');
      },
    },
    (baiClient._config.allowAppDownloadPanel ||
      baiClient._config.allowCLIDownloadPanel) && {
      label: t('summary.Downloads'),
      icon: <Download size="1em" />,
      onClick: () => toggleDownloadModal(),
    },
    {
      label: t('webui.menu.LogOut'),
      icon: <LogOut size="1em" />,
      onClick: () => {
        const event: CustomEvent = new CustomEvent('backend-ai-logout');
        document.dispatchEvent(event);
      },
    },
  ]);

  return (
    <>
      {/* antd wrapped a `<User>` glyph in a 17px `Avatar` purely to give it a
          light disc behind it; Astryx `Avatar` renders images/initials and
          takes no children (MAPPING §4), so the trigger uses the bare lucide
          icon as the Button's `icon`. On < lg the label collapses to the icon
          (`isIconOnly`), which is what the old `screens.lg &&` children
          expression did. */}
      {/* Only the TRIGGER sits on the orange header band, so only the trigger
          takes the on-dark media context — and it takes it on the element
          itself rather than through a wrapper.

          History: `WebUIHeader` used to declare `<MediaTheme mode="dark">`
          around the WHOLE `<UserDropdownMenu>`. Because Astryx `Dialog` is a
          native, NON-portalled `<dialog>` (measured: `showModal()` on an
          in-place element), every modal below was a DOM descendant of that
          context and inherited `color-scheme: dark` + the on-dark tokens, so
          the Downloads / About / My Account dialogs rendered at
          `rgb(20,20,20)` in LIGHT mode with equally dark labels on top
          (measured live during the FR-3482 Astryx migration). That
          fix moved the wrapper here — but `DropdownMenu` renders its trigger
          and its `[popover]` PANEL as SIBLINGS, so the panel was still inside
          the wrapper and kept resolving `color-scheme: dark` in both app
          modes: a `rgb(48,48,48)` menu with white text on a white page
          (measured, light AND dark). The menu is a floating page surface, not
          band chrome; it has to follow the APP's mode like every other menu in
          the app.

          A wrapper only exists to share a context between siblings, and here
          exactly one element needs it. `data-astryx-media` IS what `MediaTheme`
          renders (`<div data-astryx-media={mode} style="display:contents">`;
          the theme CSS keys the on-dark token block off that attribute), and
          `BaseProps` explicitly admits `data-*`, so declaring it on the trigger
          is the same primitive at element scope — and stops at the trigger.

          `data-testid` still belongs on `DropdownMenu` itself, NOT inside
          `button`: the component renders `<Button {...button} …
          data-testid={testId} />` — its own prop is applied AFTER the spread,
          so a `data-testid` passed inside `button` is overwritten with
          `undefined` and the attribute disappears from the DOM entirely. The
          whole e2e suite waits on `[data-testid="user-dropdown-button"]` —
          `loginAsAdmin` in `e2e/utils/test-util.ts` blocks on it. (Note the
          asymmetry: `data-astryx-media` is NOT re-declared by `DropdownMenu`,
          so the spread carries it through unharmed.) */}
      <DropdownMenu
        data-testid="user-dropdown-button"
        placement="below"
        alignment="end"
        // Legacy was `styles={{ root: { maxWidth: 300 } }}` — a CAP, not a
        // width: antd's dropdown shrink-wrapped to its widest row and only
        // stopped growing at 300. `menuWidth={300}` made that a fixed 300px
        // panel, so this menu painted ~120px of empty gutter (measured on an
        // antd 6.5.0 oracle rendering the SAME item strings: legacy 181.4px
        // vs 300px, measured during the FR-3482 Astryx migration).
        //
        // `fit-content(300px)` is the CSS spelling of exactly that pair —
        // `min(max-content, max(min-content, 300px))` — so the panel sizes to
        // its content and stops at legacy's cap. `menuWidth` is typed
        // `number | string` and lands on the popover's `width`, which is the
        // element legacy's `styles.root` also sized.
        menuWidth="fit-content(300px)"
        button={{
          'data-astryx-media': 'dark',
          variant: 'ghost',
          icon: <User size="1em" />,
          isIconOnly: !screens.lg,
          label: _.truncate(displayName, { length: 30 }),
          style,
        }}
        items={items}
      />
      {/* The overlays are page-level surfaces, not band content, and the
          trigger's media context no longer reaches them. They are still DOM
          descendants of the header row, which carries an inline
          `color: var(--color-on-dark)` for the antd-engine `ProjectSelect`
          value; `display: contents` + `--color-text-primary` re-establishes
          the page's inherited text colour without adding a layout box. This
          is the same two-declaration wrapper Astryx's own `Theme` and
          `MediaTheme` render (`@astryxdesign/core/theme`). */}
      <div style={{ display: 'contents', color: 'var(--color-text-primary)' }}>
        <ErrorBoundaryWithNullFallback>
          <Suspense>
            {isOpenUserSettingModal && (
              <BAIUnmountAfterClose>
                <UserProfileSettingModal
                  totpSupported={isTOTPSupported}
                  userFrgmt={user}
                  currentClientIp={currentClientIp}
                  open={isOpenUserSettingModal}
                  onRequestClose={() => {
                    setIsOpenUserSettingModal(false);
                  }}
                  onRequestRefresh={() => {
                    startRefetchTransition(() => {
                      updateFetchKey();
                    });
                  }}
                />
              </BAIUnmountAfterClose>
            )}
          </Suspense>
          <BAIUnmountAfterClose>
            <DownloadModal
              open={isDownloadModalOpen}
              onRequestClose={() => toggleDownloadModal()}
            />
          </BAIUnmountAfterClose>
          <BAIUnmountAfterClose>
            <AboutBackendAIModal
              open={isOpenAboutBAIModal}
              onRequestClose={toggleAboutBAIModal}
            />
          </BAIUnmountAfterClose>
        </ErrorBoundaryWithNullFallback>
      </div>
    </>
  );
};

export default UserDropdownMenu;
