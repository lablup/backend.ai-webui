/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { RoleDetailDrawerQuery } from '../__generated__/RoleDetailDrawerQuery.graphql';
import RoleDetailDrawerContent from './RoleDetailDrawerContent';
import { EditOutlined } from '@ant-design/icons';
import { Button, Drawer, Skeleton } from 'antd';
import { DrawerProps } from 'antd/lib';
import { BAIFetchKeyButton, BAIFlex, useFetchKey } from 'backend.ai-ui';
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
      title={t('rbac.Roles')}
      width={800}
      extra={
        <BAIFlex gap={'xs'}>
          <BAIFetchKeyButton
            loading={isPendingReload}
            value={fetchKey}
            onChange={(newFetchKey) => {
              startReloadTransition(() => {
                updateFetchKey(newFetchKey);
              });
            }}
          />
        </BAIFlex>
      }
      {...drawerProps}
    >
      <Suspense fallback={<Skeleton active />}>
        {roleId && (
          <RoleDetailDrawerInner
            roleId={roleId}
            fetchKey={fetchKey}
            onClickEdit={onClickEdit}
            onDataChange={() => updateFetchKey()}
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
  onDataChange?: () => void;
}

const RoleDetailDrawerInner: React.FC<RoleDetailDrawerInnerProps> = ({
  roleId,
  fetchKey,
  onClickEdit,
  onDataChange,
}) => {
  'use memo';
  const { t } = useTranslation();

  const data = useLazyLoadQuery<RoleDetailDrawerQuery>(
    graphql`
      query RoleDetailDrawerQuery($id: UUID!) {
        adminRole(id: $id) {
          source
          ...RoleDetailDrawerContentFragment
        }
      }
    `,
    { id: roleId },
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
    <>
      {isCustom && onClickEdit && (
        <BAIFlex justify="end" style={{ marginBottom: 16 }}>
          <Button icon={<EditOutlined />} onClick={onClickEdit}>
            {t('rbac.EditRole')}
          </Button>
        </BAIFlex>
      )}
      <RoleDetailDrawerContent
        roleDetailFrgmt={data.adminRole}
        fetchKey={fetchKey}
        onDataChange={onDataChange}
      />
    </>
  );
};

export default RoleDetailDrawer;
