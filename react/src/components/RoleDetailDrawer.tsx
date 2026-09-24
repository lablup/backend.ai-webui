/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { RoleDetailDrawerFragment$key } from '../__generated__/RoleDetailDrawerFragment.graphql';
import { RoleDetailDrawerRefetchQuery } from '../__generated__/RoleDetailDrawerRefetchQuery.graphql';
import RoleDetailDrawerContent from './RoleDetailDrawerContent';
import RoleFormModal from './RoleFormModal';
import { IconButton } from '@astryxdesign/core/IconButton';
import {
  BAIDrawer,
  type BAIDrawerProps,
  BAISkeleton,
  BAIFetchKeyButton,
  BAIFlex,
  BAIText,
  useFetchKey,
} from 'backend.ai-ui';
import { SquarePenIcon } from 'lucide-react';
import React, { Suspense, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useRefetchableFragment } from 'react-relay';

interface RoleDetailDrawerProps extends Omit<
  BAIDrawerProps,
  'title' | 'extra' | 'label' | 'size' | 'side' | 'children'
> {
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
  ...drawerProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const [isPendingReload, startReloadTransition] = useTransition();
  const [fetchKey, updateFetchKey] = useFetchKey();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // The page nulls `roleFrgmt` in the same commit that closes the drawer, so
  // the last live ref keeps the body painted through the exit animation.
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
      {...drawerProps}
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
      <Suspense fallback={<BAISkeleton />}>
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
