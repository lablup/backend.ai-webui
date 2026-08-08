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
import { useToggle } from 'ahooks';
import {
  BAIUnmountAfterClose,
  filterOutEmpty,
  useFetchKey,
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
// `ReverseThemeProvider` — is dropped: WebUIHeader now wraps the whole
// dropdown in `AstryxReverseTheme` instead.
// P7: the per-item `data-testid`s are dropped (Astryx `DropdownMenuItemData`
// has no passthrough). The e2e suite clicks these rows by TEXT
// (`getByText('My Account')`, `getByText('Log Out')`) and only anchors on
// `user-dropdown-button`, which survives on the trigger.
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
      <DropdownMenu
        placement="below"
        alignment="end"
        menuWidth={300}
        button={{
          'data-testid': 'user-dropdown-button',
          variant: 'ghost',
          icon: <User size="1em" />,
          isIconOnly: !screens.lg,
          label: _.truncate(displayName, { length: 30 }),
          style,
        }}
        items={items}
      />
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
    </>
  );
};

export default UserDropdownMenu;
