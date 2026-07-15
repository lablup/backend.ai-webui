/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { RoleDetailDrawerFragment$key } from '../__generated__/RoleDetailDrawerFragment.graphql';
import { RoleDetailDrawerRefetchQuery } from '../__generated__/RoleDetailDrawerRefetchQuery.graphql';
import RoleDetailDrawerContent from './RoleDetailDrawerContent';
import RoleFormModal from './RoleFormModal';
import { Drawer, Skeleton, Tooltip, Typography, theme } from 'antd';
import { DrawerProps } from 'antd/lib';
import {
  BAIButton,
  BAIFetchKeyButton,
  BAIFlex,
  useFetchKey,
} from 'backend.ai-ui';
import { EditIcon } from 'lucide-react';
import React, { Suspense, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useRefetchableFragment } from 'react-relay';

interface RoleDetailDrawerProps extends DrawerProps {
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
  ...drawerProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
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
      title={t('rbac.RoleDetailInfo')}
      size="large"
      extra={
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
      }
      {...drawerProps}
    >
      <Suspense fallback={<Skeleton active />}>
        {role && (
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
                {role.name}
              </Typography.Title>
              {role.source === 'CUSTOM' && (
                <Tooltip title={t('rbac.EditRole')}>
                  <BAIButton
                    size="large"
                    icon={<EditIcon style={{ color: token.colorInfo }} />}
                    onClick={() => setIsEditModalOpen(true)}
                  />
                </Tooltip>
              )}
            </BAIFlex>
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
    </Drawer>
  );
};

export default RoleDetailDrawer;
