/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { RoleDetailDrawerFragment$key } from '../__generated__/RoleDetailDrawerFragment.graphql';
import { RoleDetailDrawerRefetchQuery } from '../__generated__/RoleDetailDrawerRefetchQuery.graphql';
import RoleDetailDrawerContent from './RoleDetailDrawerContent';
import RoleFormModal from './RoleFormModal';
import BAIDrawer from './astryx-bui/BAIDrawerAstryx';
import BAISkeletonAstryx from './astryx-bui/BAISkeletonAstryx';
import { IconButton } from '@astryxdesign/core/IconButton';
import {
  BAIFetchKeyButton,
  BAIFlex,
  BAIText,
  useFetchKey,
} from 'backend.ai-ui';
import { SquarePenIcon } from 'lucide-react';
import React, { Suspense, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useRefetchableFragment } from 'react-relay';

// PILOT-DECISION: props no longer extend antd `DrawerProps` (the type import
// was itself an antd import, P15). The only consumer — RBACManagementPage —
// passes `open`, `roleFrgmt`, `onClose`, so the explicit interface below is
// the whole live surface. Same treatment as ticket 18's
// `DeploymentRevisionDetailDrawer`; the antd spellings stay on the public
// surface and map to the lab Drawer internally (`open` -> `isOpen`).
interface RoleDetailDrawerProps {
  /** Whether the drawer is open. antd Drawer's `open`. */
  open?: boolean;
  /** Close request handler (Escape, scrim click, close button). */
  onClose?: () => void;
  /**
   * The role node selected in the list; `null`/`undefined` while the drawer is
   * closed. The drawer issues no fetch of its own on open — the list query
   * already holds the data — and the refresh button refetches just this role
   * via the `@refetchable` fragment.
   */
  roleFrgmt?: RoleDetailDrawerFragment$key | null;
}

const RoleDetailDrawer: React.FC<RoleDetailDrawerProps> = ({
  roleFrgmt,
  open = false,
  onClose,
}) => {
  'use memo';
  const { t } = useTranslation();
  const [isPendingReload, startReloadTransition] = useTransition();
  const [fetchKey, updateFetchKey] = useFetchKey();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // QA-FINDINGS Q-27: hold the last non-null fragment ref so the drawer still
  // has data to paint while it animates OUT.
  //
  // RBACManagementPage drives `open` and `roleFrgmt` from the same URL param,
  // so closing nulls the ref in the SAME commit that flips `open` to false.
  // `BAIDrawerAstryx` keeps the drawer mounted and fully laid out for the
  // exit transition, so for that whole window the user is looking at a live
  // drawer whose title has fallen back to `rbac.RoleDetailInfo` and whose body
  // is empty — measured at 182ms, with the slide-out not starting until
  // ~630ms. The usual escape hatches do not apply: `BAIUnmountAfterClose` is a
  // no-op here (`BAIDrawerAstryx` exposes no `afterClose`/`afterOpenChange` to
  // hang it on), and keying the drawer on the role id would remount it on every
  // selection change and throw away the animation entirely.
  //
  // The store is state, not a `useRef`: a ref written and read during render
  // is exactly what `react-hooks/refs` forbids, so this is React's documented
  // "adjust state while rendering" form instead. It cannot loop — within one
  // parent commit `roleFrgmt` is a fixed prop, so the immediate re-render
  // React schedules sees the guard as false.
  //
  // A live `roleFrgmt` always wins, and it is captured on the SAME render it
  // arrives, so opening a different role paints that role on its first frame;
  // the stored fragment ref is consulted only after the parent has already
  // cleared its selection, i.e. during the exit.
  const [lastRoleFrgmt, setLastRoleFrgmt] =
    useState<RoleDetailDrawerFragment$key | null>(roleFrgmt ?? null);
  if (roleFrgmt && roleFrgmt !== lastRoleFrgmt) {
    setLastRoleFrgmt(roleFrgmt);
  }
  const effectiveRoleFrgmt = roleFrgmt ?? lastRoleFrgmt;

  const [role, refetch] = useRefetchableFragment<
    RoleDetailDrawerRefetchQuery,
    RoleDetailDrawerFragment$key
  >(
    graphql`
      fragment RoleDetailDrawerFragment on Role
      @refetchable(queryName: "RoleDetailDrawerRefetchQuery") {
        name
        source
        ...RoleDetailDrawerContentFragment
        ...RoleFormModalFragment
      }
    `,
    effectiveRoleFrgmt,
  );

  return (
    <BAIDrawer
      open={open}
      onClose={onClose}
      side="end"
      // Slightly wider than antd's `size="large"` (736px): the Detailed
      // Permissions cards host a filter row, selection actions, and a
      // three-column table.
      size={800}
      label={t('rbac.RoleDetailInfo')}
      // Not an `<h3>`: the drawer already announces itself through `label`,
      // so the role name renders as large text with the shared copy control.
      title={
        <BAIText
          strong
          copyable
          style={{
            fontSize: 'var(--text-large-size)',
            lineHeight: 'var(--text-large-leading)',
          }}
        >
          {role?.name ?? t('rbac.RoleDetailInfo')}
        </BAIText>
      }
      extra={
        <>
          {role?.source === 'CUSTOM' && (
            // MAPPING §3.3: an icon-only button with no children is an
            // Astryx `IconButton`, whose `label` doubles as the tooltip —
            // so the antd `Tooltip` wrapper disappears.
            // QA-FINDINGS Q-37 — the `colorInfo` tint is RESTORED (the earlier
            // "dropped (P5, closed variant enum)" note is superseded). Legacy
            // was `icon={<SquarePenIcon style={{ color: token.colorInfo }} />}`.
            // This is an `/admin/*` route, where `--color-text-accent` resolves
            // through `AstryxAdminTheme` to #028DF2/#0387bf — `colorInfo`
            // exactly. See `packages/backend.ai-ui/src/styles/actionAccent.css`.
            <IconButton
              className="bai-action-accent"
              variant="ghost"
              icon={<SquarePenIcon aria-hidden />}
              label={t('rbac.EditRole')}
              tooltip={t('rbac.EditRole')}
              onClick={() => setIsEditModalOpen(true)}
            />
          )}
          <BAIFetchKeyButton
            loading={isPendingReload}
            value={fetchKey}
            onChange={(newFetchKey) => {
              if (!role) return;
              startReloadTransition(() => {
                updateFetchKey(newFetchKey);
                refetch({}, { fetchPolicy: 'network-only' });
              });
            }}
          />
        </>
      }
    >
      <Suspense fallback={<BAISkeletonAstryx />}>
        {role && (
          <BAIFlex direction="column" gap="sm" align="stretch">
            <RoleDetailDrawerContent roleNodeFrgmt={role} />
            <RoleFormModal
              open={isEditModalOpen}
              roleNodeFrgmt={role}
              onRequestClose={() => {
                setIsEditModalOpen(false);
              }}
            />
          </BAIFlex>
        )}
      </Suspense>
    </BAIDrawer>
  );
};

export default RoleDetailDrawer;
