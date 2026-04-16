/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { RoleDetailDrawerQuery } from '../__generated__/RoleDetailDrawerQuery.graphql';
import RoleDetailDrawerContent from './RoleDetailDrawerContent';
import RoleFormModal from './RoleFormModal';
import { Alert, Drawer, Skeleton, Tooltip, Typography, theme } from 'antd';
import { DrawerProps } from 'antd/lib';
import {
  BAIButton,
  BAIFetchKeyButton,
  BAIFlex,
  toLocalId,
  useFetchKey,
} from 'backend.ai-ui';
import { EditIcon } from 'lucide-react';
import React, { Suspense, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

interface RoleDetailDrawerProps extends DrawerProps {
  roleId?: string;
}

const RoleDetailDrawer: React.FC<RoleDetailDrawerProps> = ({
  roleId,
  ...drawerProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const [isPendingReload, startReloadTransition] = useTransition();
  const [fetchKey, updateFetchKey] = useFetchKey();

  return (
    <Drawer
      title={t('rbac.RoleDetailInfo')}
      size="large"
      extra={
        <BAIFetchKeyButton
          loading={isPendingReload}
          value={fetchKey}
          onChange={(newFetchKey) => {
            startReloadTransition(() => {
              updateFetchKey(newFetchKey);
            });
          }}
        />
      }
      {...drawerProps}
    >
      <Suspense fallback={<Skeleton active />}>
        {roleId && (
          <RoleDetailDrawerInner roleId={roleId} fetchKey={fetchKey} />
        )}
      </Suspense>
    </Drawer>
  );
};

interface RoleDetailDrawerInnerProps {
  roleId: string;
  fetchKey: string;
  onDataChange?: () => void;
}

const RoleDetailDrawerInner: React.FC<RoleDetailDrawerInnerProps> = ({
  roleId,
  fetchKey,
  onDataChange,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const localRoleId = toLocalId(roleId);

  const data = useLazyLoadQuery<RoleDetailDrawerQuery>(
    graphql`
      query RoleDetailDrawerQuery(
        $id: UUID!
        $assignmentFilter: RoleAssignmentFilter
        $permissionFilter: PermissionFilter
        $scopeFilter: EntityFilter
        $scopeOrderBy: [EntityOrderBy!]
        $assignmentLimit: Int
        $assignmentOffset: Int
        $permissionLimit: Int
        $permissionOffset: Int
        $scopeLimit: Int
        $scopeOffset: Int
      ) {
        adminRole(id: $id) {
          name
          source
          ...RoleDetailDrawerContentFragment
          ...RoleFormModalFragment
        }
        ...RoleScopeTabFragment
          @arguments(
            roleId: $id
            filter: $scopeFilter
            orderBy: $scopeOrderBy
            limit: $scopeLimit
            offset: $scopeOffset
          )
        ...RoleAssignmentTabFragment
          @arguments(
            filter: $assignmentFilter
            limit: $assignmentLimit
            offset: $assignmentOffset
          )
        ...RolePermissionTabFragment
          @arguments(
            filter: $permissionFilter
            limit: $permissionLimit
            offset: $permissionOffset
          )
      }
    `,
    {
      id: localRoleId,
      assignmentFilter: { roleId: localRoleId },
      permissionFilter: { roleId: localRoleId },
      scopeFilter: null,
      scopeOrderBy: null,
      assignmentLimit: 10,
      assignmentOffset: 0,
      permissionLimit: 10,
      permissionOffset: 0,
      scopeLimit: 10,
      scopeOffset: 0,
    },
    {
      fetchPolicy: 'network-only',
      fetchKey,
    },
  );

  if (!data.adminRole) {
    return (
      <Alert type="warning" showIcon message={t('general.ErrorOccurred')} />
    );
  }

  const isCustom = data.adminRole.source === 'CUSTOM';

  return (
    <BAIFlex direction="column" gap={'sm'} align="stretch">
      <BAIFlex
        direction="row"
        justify="between"
        align="start"
        style={{ alignSelf: 'stretch' }}
        gap={'sm'}
      >
        <Typography.Title
          level={3}
          copyable
          style={{ margin: 0, lineHeight: '1.6em' }}
        >
          {data.adminRole.name}
        </Typography.Title>
        {isCustom && (
          <Tooltip title={t('rbac.EditRole')}>
            <BAIButton
              size="large"
              icon={<EditIcon style={{ color: token.colorInfo }} />}
              onClick={() => setIsEditModalOpen(true)}
            />
          </Tooltip>
        )}
      </BAIFlex>
      <RoleDetailDrawerContent
        roleDetailFrgmt={data.adminRole}
        scopeQueryRef={data}
        assignmentQueryRef={data}
        permissionQueryRef={data}
        onDataChange={onDataChange}
      />
      <RoleFormModal
        open={isEditModalOpen}
        editingRoleFrgmt={data.adminRole}
        onRequestClose={(success) => {
          setIsEditModalOpen(false);
          if (success) {
            onDataChange?.();
          }
        }}
      />
    </BAIFlex>
  );
};

export default RoleDetailDrawer;
