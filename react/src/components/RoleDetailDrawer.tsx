/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { RoleDetailDrawerFragment$key } from '../__generated__/RoleDetailDrawerFragment.graphql';
import { RoleDetailDrawerRefetchQuery } from '../__generated__/RoleDetailDrawerRefetchQuery.graphql';
import RoleDetailDrawerContent from './RoleDetailDrawerContent';
import RoleFormModal from './RoleFormModal';
import BAICopyableText from './astryx-bui/BAICopyableText';
import BAISkeletonAstryx from './astryx-bui/BAISkeletonAstryx';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Drawer } from '@astryxdesign/lab';
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
    <Drawer
      isOpen={open}
      onClose={() => onClose?.()}
      side="end"
      // Slightly wider than antd's `size="large"` (736px): the Detailed
      // Permissions cards host a filter row, selection actions, and a
      // three-column table.
      size={800}
      label={t('rbac.RoleDetailInfo')}
    >
      {/* lab Drawer renders its content flush to the panel edges; reproduce
          the antd Drawer's 24px body padding with the spacing-6 token. */}
      <BAIFlex
        direction="column"
        gap="sm"
        align="stretch"
        style={{ padding: 'var(--spacing-6)' }}
      >
        {/* lab Drawer has no title bar (only its built-in close button), so
            the antd `title` + `extra` row becomes the first content row. */}
        <BAIFlex direction="row" justify="between" align="center" gap="sm">
          {/* MAPPING §3.4: `Typography.Title copyable` -> BAICopyableText
              (the only home for `copyable`). The role name is now a
              `large`/`semibold` Text rather than an `<h3>`: BAICopyableText
              wraps `Text`, and the drawer already announces itself through
              the lab Drawer's `label`, so no heading level is lost. */}
          <BAICopyableText
            type="large"
            weight="semibold"
            copyLabel={t('button.Copy')}
          >
            {role?.name ?? t('rbac.RoleDetailInfo')}
          </BAICopyableText>
          <BAIFlex direction="row" gap="xs" align="center">
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
          </BAIFlex>
        </BAIFlex>
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
      </BAIFlex>
    </Drawer>
  );
};

export default RoleDetailDrawer;
