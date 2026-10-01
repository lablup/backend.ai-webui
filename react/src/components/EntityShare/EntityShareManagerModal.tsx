/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { EntityShareManagerModalQuery } from '../../__generated__/EntityShareManagerModalQuery.graphql';
import EntityShareCreateModal from './EntityShareCreateModal';
import EntityShareNodes from './EntityShareNodes';
import { Button } from '@astryxdesign/core/Button';
import {
  BAIFetchKeyButton,
  BAIFlex,
  BAIId,
  BAIModal,
  type BAIModalProps,
  BAISkeleton,
  BAIText,
  BAIUnmountAfterClose,
  filterOutNullAndUndefined,
  useFetchKey,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { Plus } from 'lucide-react';
import React, { Suspense, useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

export interface EntityShareTarget {
  entityType: string;
  entityId: string;
}

export interface EntityShareManagerModalProps extends Omit<
  BAIModalProps,
  'onOk' | 'onCancel'
> {
  target: EntityShareTarget | null;
  onRequestClose: () => void;
}

const PAGE_SIZE = 10;

const EntityShareManagerList: React.FC<{
  target: EntityShareTarget;
  fetchKey: string;
  onShareChanged: () => void;
}> = ({ target, fetchKey, onShareChanged }) => {
  'use memo';
  const [current, setCurrent] = useState(1);
  const deferredCurrent = useDeferredValue(current);
  const deferredFetchKey = useDeferredValue(fetchKey);

  const { entityShares } = useLazyLoadQuery<EntityShareManagerModalQuery>(
    graphql`
      query EntityShareManagerModalQuery(
        $scope: EntityShareScope!
        $limit: Int
        $offset: Int
      ) {
        entityShares(
          scope: $scope
          orderBy: [{ field: CREATED_AT, direction: "DESC" }]
          limit: $limit
          offset: $offset
        ) {
          count
          edges {
            node {
              ...EntityShareNodesFragment
            }
          }
        }
      }
    `,
    {
      scope: { target: [target] },
      limit: PAGE_SIZE,
      offset: (deferredCurrent - 1) * PAGE_SIZE,
    },
    { fetchPolicy: 'network-only', fetchKey: deferredFetchKey },
  );

  return (
    <EntityShareNodes
      side="SHARER"
      loading={deferredCurrent !== current || deferredFetchKey !== fetchKey}
      entitySharesFrgmt={filterOutNullAndUndefined(
        _.map(entityShares?.edges, 'node'),
      )}
      onShareChanged={onShareChanged}
      pagination={{
        pageSize: PAGE_SIZE,
        current,
        total: entityShares?.count ?? 0,
        onChange: (next) => setCurrent(next),
      }}
    />
  );
};

/**
 * Everything one entity has been offered to, from the sharing side: cancel a
 * pending offer, revoke a taken one, or make a new one. Any entity screen can
 * mount this with its own `{ entityType, entityId }`.
 */
const EntityShareManagerModal: React.FC<EntityShareManagerModalProps> = ({
  target,
  onRequestClose,
  ...modalProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const [fetchKey, updateFetchKey] = useFetchKey();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <BAIModal
      title={t('entityShare.ManageShares')}
      width="min(1000px, 92vw)"
      footer={null}
      onCancel={onRequestClose}
      {...modalProps}
    >
      {target ? (
        <BAIFlex direction="column" align="stretch" gap="sm">
          <BAIFlex justify="between" align="center" gap="sm" wrap="wrap">
            <BAIText>
              {target.entityType}
              {' · '}
              <BAIId uuid={target.entityId} />
            </BAIText>
            <BAIFlex gap="xs" align="center">
              <BAIFetchKeyButton
                value={fetchKey}
                onChange={() => updateFetchKey()}
                loading={false}
              />
              <Button
                variant="primary"
                icon={<Plus size="1em" />}
                label={t('entityShare.ShareEntity')}
                onClick={() => setIsCreateOpen(true)}
              />
            </BAIFlex>
          </BAIFlex>
          <Suspense fallback={<BAISkeleton />}>
            <EntityShareManagerList
              target={target}
              fetchKey={fetchKey}
              onShareChanged={() => updateFetchKey()}
            />
          </Suspense>
          <BAIUnmountAfterClose>
            <EntityShareCreateModal
              open={isCreateOpen}
              target={target}
              onRequestClose={(success) => {
                setIsCreateOpen(false);
                if (success) updateFetchKey();
              }}
            />
          </BAIUnmountAfterClose>
        </BAIFlex>
      ) : null}
    </BAIModal>
  );
};

export default EntityShareManagerModal;
