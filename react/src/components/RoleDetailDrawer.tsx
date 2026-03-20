/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { RoleDetailDrawerQuery } from '../__generated__/RoleDetailDrawerQuery.graphql';
import RoleDetailDrawerContent from './RoleDetailDrawerContent';
import { Drawer, Skeleton, Tooltip, Typography, theme } from 'antd';
import { DrawerProps } from 'antd/lib';
import {
  BAIButton,
  BAIFetchKeyButton,
  BAIFlex,
  toLocalId,
  useFetchKey,
} from 'backend.ai-ui';
import { EditIcon } from 'lucide-react';
import React, { Suspense, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

interface RoleDetailDrawerProps extends DrawerProps {
  roleId?: string;
  onClickEdit?: () => void;
}

const RoleDetailDrawer: React.FC<RoleDetailDrawerProps> = ({
  roleId,
  onClickEdit,
  ...drawerProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const [isPendingReload, startReloadTransition] = useTransition();
  const [fetchKey, updateFetchKey] = useFetchKey();

  return (
    <Drawer
      title={t('rbac.RoleDetailInfo')}
      width={800}
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
          <RoleDetailDrawerInner
            roleId={roleId}
            fetchKey={fetchKey}
            onClickEdit={onClickEdit}
          />
        )}
      </Suspense>
    </Drawer>
  );
};

interface RoleDetailDrawerInnerProps {
  roleId: string;
  fetchKey: string;
  onClickEdit?: () => void;
}

const RoleDetailDrawerInner: React.FC<RoleDetailDrawerInnerProps> = ({
  roleId,
  fetchKey,
  onClickEdit,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();

  const data = useLazyLoadQuery<RoleDetailDrawerQuery>(
    graphql`
      query RoleDetailDrawerQuery($id: UUID!) {
        adminRole(id: $id) {
          name
          source
          ...RoleDetailDrawerContentFragment
        }
      }
    `,
    { id: toLocalId(roleId) },
    {
      fetchPolicy: 'network-only',
      fetchKey,
    },
  );

  if (!data.adminRole) {
    return null;
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
        {isCustom && onClickEdit && (
          <Tooltip title={t('rbac.EditRole')}>
            <BAIButton
              size="large"
              icon={<EditIcon style={{ color: token.colorInfo }} />}
              onClick={onClickEdit}
            />
          </Tooltip>
        )}
      </BAIFlex>
      <RoleDetailDrawerContent
        roleDetailFrgmt={data.adminRole}
        fetchKey={fetchKey}
      />
    </BAIFlex>
  );
};

export default RoleDetailDrawer;
