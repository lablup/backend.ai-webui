/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { StorageHostDetailDrawerFragment$key } from '../__generated__/StorageHostDetailDrawerFragment.graphql';
import StorageHostDetailDrawerContent from './StorageHostDetailDrawerContent';
import { Drawer, type DrawerProps, Skeleton } from 'antd';
import { BAIFetchKeyButton } from 'backend.ai-ui';
import { Suspense, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

interface StorageHostDetailDrawerProps extends Omit<DrawerProps, 'title'> {
  storageVolumeFrgmt?: StorageHostDetailDrawerFragment$key | null;
  /**
   * Callback to refetch the parent list query. The detail drawer reads the
   * storage volume via fragment off the list, so the list query is the
   * source of truth for "refresh the volume's data". `StorageVolume` does
   * not implement `Node` and is not `@fetchable`, so we cannot use
   * `useRefetchableFragment` to refetch this single volume in isolation.
   */
  onRefetchParentList?: () => void;
  onRequestClose?: () => void;
}

const StorageHostDetailDrawer: React.FC<StorageHostDetailDrawerProps> = ({
  storageVolumeFrgmt,
  onRefetchParentList,
  onRequestClose,
  ...drawerProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const [isPendingRefetch, startRefetchTransition] = useTransition();

  const storageVolume = useFragment(
    graphql`
      fragment StorageHostDetailDrawerFragment on StorageVolume {
        ...StorageHostDetailDrawerContentFragment
          @alias(as: "storageVolumeFrgmt")
      }
    `,
    storageVolumeFrgmt ?? null,
  );

  const refreshAll = () => {
    startRefetchTransition(() => {
      onRefetchParentList?.();
    });
  };

  return (
    <Drawer
      title={t('storageHost.StorageHostInfo')}
      size={900}
      onClose={onRequestClose}
      {...drawerProps}
      extra={
        <BAIFetchKeyButton
          loading={isPendingRefetch}
          value=""
          onChange={refreshAll}
        />
      }
    >
      <Suspense fallback={<Skeleton active />}>
        {storageVolume?.storageVolumeFrgmt ? (
          <StorageHostDetailDrawerContent
            storageVolumeFrgmt={storageVolume.storageVolumeFrgmt}
          />
        ) : null}
      </Suspense>
    </Drawer>
  );
};

export default StorageHostDetailDrawer;
