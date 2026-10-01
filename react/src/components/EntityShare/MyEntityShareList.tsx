/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type {
  EntityShareSide,
  MyEntityShareListQuery as MyEntityShareListQueryType,
} from '../../__generated__/MyEntityShareListQuery.graphql';
import AutoUpdateFetchKeyButton from '../AutoUpdateFetchKeyButton';
import EntityShareCreateModal from './EntityShareCreateModal';
import EntityShareManagerModal, {
  type EntityShareTarget,
} from './EntityShareManagerModal';
import EntityShareNodes, {
  ENTITY_SHARE_STATUSES,
  type EntityShareViewerSide,
} from './EntityShareNodes';
import { Button } from '@astryxdesign/core/Button';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {
  BAIFlex,
  BAIGraphQLPropertyFilter,
  BAIUnmountAfterClose,
  filterOutNullAndUndefined,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { Plus } from 'lucide-react';
import { useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  graphql,
  PreloadedQuery,
  usePreloadedQuery,
  UseQueryLoaderLoadQueryOptions,
} from 'react-relay';

export const MyEntityShareListQuery = graphql`
  query MyEntityShareListQuery(
    $sides: [EntityShareSide!]
    $filter: EntityShareFilter
    $limit: Int
    $offset: Int
  ) {
    myEntityShares(
      sides: $sides
      filter: $filter
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
`;

export interface MyEntityShareListProps {
  queryRef: PreloadedQuery<MyEntityShareListQueryType>;
  onReload: (
    variables: MyEntityShareListQueryType['variables'],
    options?: UseQueryLoaderLoadQueryOptions,
  ) => void;
}

/**
 * The shares the current user received or sent, one side at a time, with the
 * answers each side may give. Render inside `Suspense` + `BAIErrorBoundary`.
 */
const MyEntityShareList: React.FC<MyEntityShareListProps> = ({
  queryRef,
  onReload,
}) => {
  'use memo';
  const { t } = useTranslation();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [managingTarget, setManagingTarget] =
    useState<EntityShareTarget | null>(null);

  const side: EntityShareViewerSide =
    _.first(queryRef.variables.sides) === 'SHARER' ? 'SHARER' : 'RECIPIENT';
  const filter = queryRef.variables.filter ?? undefined;
  const pageSize = queryRef.variables.limit ?? 10;
  const offset = queryRef.variables.offset ?? 0;
  const current = pageSize ? Math.floor(offset / pageSize) + 1 : 1;

  const deferredQueryRef = useDeferredValue(queryRef);
  const isRefetching = deferredQueryRef !== queryRef;

  const { myEntityShares } = usePreloadedQuery<MyEntityShareListQueryType>(
    MyEntityShareListQuery,
    deferredQueryRef,
  );

  const reload = () =>
    onReload(queryRef.variables, { fetchPolicy: 'network-only' });

  return (
    <BAIFlex direction="column" align="stretch" gap="sm">
      <BAIFlex justify="between" wrap="wrap" gap="sm">
        <BAIFlex gap="sm" wrap="wrap">
          <SegmentedControl
            value={side}
            label={t('entityShare.Side')}
            onChange={(next) =>
              onReload(
                {
                  ...queryRef.variables,
                  sides: [next as EntityShareSide],
                  offset: 0,
                },
                { fetchPolicy: 'network-only' },
              )
            }
          >
            <SegmentedControlItem
              value="RECIPIENT"
              label={t('entityShare.Received')}
            />
            <SegmentedControlItem
              value="SHARER"
              label={t('entityShare.Sent')}
            />
          </SegmentedControl>
          <BAIGraphQLPropertyFilter
            value={filter}
            onChange={(next) =>
              onReload(
                { ...queryRef.variables, filter: next, offset: 0 },
                { fetchPolicy: 'network-only' },
              )
            }
            filterProperties={[
              {
                key: 'status',
                propertyLabel: t('entityShare.Status'),
                type: 'enum',
                fixedOperator: 'equals',
                strictSelection: true,
                options: ENTITY_SHARE_STATUSES.map((status) => ({
                  value: status,
                  label: t(`entityShare.status.${status}`),
                })),
              },
              {
                key: 'recipientEmail',
                propertyLabel: t('entityShare.RecipientEmail'),
                type: 'string',
                fixedOperator: 'equals',
              },
            ]}
          />
        </BAIFlex>
        <BAIFlex gap="xs" align="center">
          <AutoUpdateFetchKeyButton
            settingId="entity-shares"
            value=""
            onChange={reload}
            loading={isRefetching}
          />
          <Button
            variant="primary"
            icon={<Plus size="1em" />}
            label={t('entityShare.ShareEntity')}
            onClick={() => setIsCreateOpen(true)}
          />
        </BAIFlex>
      </BAIFlex>
      <EntityShareNodes
        side={side}
        loading={isRefetching}
        entitySharesFrgmt={filterOutNullAndUndefined(
          _.map(myEntityShares?.edges, 'node'),
        )}
        onShareChanged={filter?.status ? reload : undefined}
        onManageTarget={side === 'SHARER' ? setManagingTarget : undefined}
        pagination={{
          pageSize,
          current,
          total: myEntityShares?.count ?? 0,
          onChange: (nextCurrent, nextPageSize) =>
            onReload(
              {
                ...queryRef.variables,
                limit: nextPageSize,
                offset: nextCurrent > 1 ? (nextCurrent - 1) * nextPageSize : 0,
              },
              { fetchPolicy: 'network-only' },
            ),
        }}
      />
      <BAIUnmountAfterClose>
        <EntityShareCreateModal
          open={isCreateOpen}
          onRequestClose={(success) => {
            setIsCreateOpen(false);
            if (success && side === 'SHARER') reload();
          }}
        />
      </BAIUnmountAfterClose>
      <BAIUnmountAfterClose>
        <EntityShareManagerModal
          open={!!managingTarget}
          target={managingTarget}
          onRequestClose={() => {
            setManagingTarget(null);
            reload();
          }}
        />
      </BAIUnmountAfterClose>
    </BAIFlex>
  );
};

export default MyEntityShareList;
