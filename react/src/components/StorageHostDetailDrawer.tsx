/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { StorageHostDetailDrawerFragment$key } from '../__generated__/StorageHostDetailDrawerFragment.graphql';
import StorageHostDetailDrawerContent from './StorageHostDetailDrawerContent';
import BAISkeletonAstryx from './astryx-bui/BAISkeletonAstryx';
import { Heading } from '@astryxdesign/core/Heading';
import { HStack, VStack } from '@astryxdesign/core/Stack';
import { Drawer } from '@astryxdesign/lab';
import { BAIFetchKeyButton } from 'backend.ai-ui';
import { Suspense, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

// PILOT-DECISION: no longer extends antd `DrawerProps` (P1 grep — the only
// consumer, StorageProxyList, passes `open`/`storageVolumeFrgmt`/
// `onRefetchParentList`/`onRequestClose`). antd `Drawer` → lab `Drawer`
// (MAPPING §2 LAB), same shape as the AgentDetailDrawer/
// DeploymentRevisionDetailDrawer precedent (ticket 18): `open`→`isOpen`.
interface StorageHostDetailDrawerProps {
  open?: boolean;
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
  open = false,
  storageVolumeFrgmt,
  onRefetchParentList,
  onRequestClose,
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
      isOpen={open}
      onClose={() => onRequestClose?.()}
      side="end"
      size={900}
      label={t('storageHost.StorageHostInfo')}
    >
      {/* lab Drawer renders flush to the panel edges; reproduce the antd
          Drawer's 24px body padding with the spacing-6 token (ticket 18
          precedent). */}
      <VStack gap={4} align="stretch" style={{ padding: 'var(--spacing-6)' }}>
        <HStack gap={2} align="center" justify="between">
          <Heading level={5}>{t('storageHost.StorageHostInfo')}</Heading>
          <BAIFetchKeyButton
            loading={isPendingRefetch}
            value=""
            onChange={refreshAll}
          />
        </HStack>
        <Suspense fallback={<BAISkeletonAstryx />}>
          {storageVolume?.storageVolumeFrgmt ? (
            <StorageHostDetailDrawerContent
              storageVolumeFrgmt={storageVolume.storageVolumeFrgmt}
            />
          ) : null}
        </Suspense>
      </VStack>
    </Drawer>
  );
};

export default StorageHostDetailDrawer;
