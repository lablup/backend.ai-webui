/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { RoleDetailDrawerV2Fragment$key } from '../__generated__/RoleDetailDrawerV2Fragment.graphql';
import { RoleDetailDrawerV2RefetchQuery } from '../__generated__/RoleDetailDrawerV2RefetchQuery.graphql';
import RoleDetailDrawerContentV2 from './RoleDetailDrawerContentV2';
import RoleFormModal from './RoleFormModal';
import { IconButton } from '@astryxdesign/core/IconButton';
import {
  BAIDrawer,
  type BAIDrawerProps,
  BAISkeleton,
  BAIFetchKeyButton,
  BAIFlex,
  useFetchKey,
} from 'backend.ai-ui';
import { SquarePenIcon } from 'lucide-react';
import React, { Suspense, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useRefetchableFragment } from 'react-relay';

interface RoleDetailDrawerV2Props extends Omit<
  BAIDrawerProps,
  'title' | 'extra' | 'label' | 'size' | 'side' | 'children'
> {
  /**
   * The role node selected in the list; `null`/`undefined` while the drawer is
   * closed. The list query already holds the data, so opening issues no fetch;
   * the refresh button refetches just this role.
   */
  roleFrgmt?: RoleDetailDrawerV2Fragment$key | null;
}

/**
 * The role drawer for managers >= 26.9.0a4, where a role belongs to one scope.
 * `RBACManagementPage` renders `RoleDetailDrawer` instead while
 * `rbac-single-scope-role` is off (ADR 0006).
 */
const RoleDetailDrawerV2: React.FC<RoleDetailDrawerV2Props> = ({
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
    useState<RoleDetailDrawerV2Fragment$key | null>(roleFrgmt ?? null);
  if (roleFrgmt && roleFrgmt !== lastRoleFrgmt) {
    setLastRoleFrgmt(roleFrgmt);
  }
  const effectiveRoleFrgmt = roleFrgmt ?? lastRoleFrgmt;

  const [role, refetch] = useRefetchableFragment<
    RoleDetailDrawerV2RefetchQuery,
    RoleDetailDrawerV2Fragment$key
  >(
    graphql`
      fragment RoleDetailDrawerV2Fragment on Role
      @refetchable(queryName: "RoleDetailDrawerV2RefetchQuery") {
        source
        ...RoleDetailDrawerContentV2Fragment
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
      size={800}
      title={t('rbac.RoleDetailInfo')}
      extra={
        <>
          {role?.source === 'CUSTOM' && (
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
            <RoleDetailDrawerContentV2 roleNodeFrgmt={role} />
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

export default RoleDetailDrawerV2;
