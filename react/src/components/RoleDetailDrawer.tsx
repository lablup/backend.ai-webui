/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { RoleDetailDrawerFragment$key } from '../__generated__/RoleDetailDrawerFragment.graphql';
import { RoleDetailDrawerRefetchQuery } from '../__generated__/RoleDetailDrawerRefetchQuery.graphql';
import RoleDetailDrawerContent from './RoleDetailDrawerContent';
import RoleFormModal from './RoleFormModal';
import BAICopyableText from './astryx-bui/BAICopyableText';
import BAIDrawer from './astryx-bui/BAIDrawerAstryx';
import BAISkeletonAstryx from './astryx-bui/BAISkeletonAstryx';
import { IconButton } from '@astryxdesign/core/IconButton';
import { BAIFetchKeyButton, BAIFlex, useFetchKey } from 'backend.ai-ui';
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
    roleFrgmt ?? null,
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
      // MAPPING §3.4: `Typography.Title copyable` -> BAICopyableText (the only
      // home for `copyable`). The role name is a `large`/`semibold` Text rather
      // than an `<h3>`: BAICopyableText wraps `Text`, and the drawer already
      // announces itself through `label`, so no heading level is lost.
      title={
        <BAICopyableText
          type="large"
          weight="semibold"
          copyLabel={t('button.Copy')}
        >
          {role?.name ?? t('rbac.RoleDetailInfo')}
        </BAICopyableText>
      }
      extra={
        <>
          {role?.source === 'CUSTOM' && (
            // MAPPING §3.3: an icon-only button with no children is an
            // Astryx `IconButton`, whose `label` doubles as the tooltip —
            // so the antd `Tooltip` wrapper disappears. The `colorInfo`
            // tint is dropped (P5, closed variant enum).
            <IconButton
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
