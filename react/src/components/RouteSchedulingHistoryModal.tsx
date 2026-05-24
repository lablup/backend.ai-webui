import {
  RouteHistoryFilter,
  RouteHistoryOrderBy,
  RouteSchedulingHistoryModalQuery,
} from '../__generated__/RouteSchedulingHistoryModalQuery.graphql';
import { convertToOrderBy } from '../helper';
import {
  BAIButton,
  BAIFetchKeyButton,
  BAIFlex,
  BAIGraphQLPropertyFilter,
  BAIModal,
  BAIModalProps,
  BAIRouteSchedulingHistoryNodes,
  useFetchKey,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

interface RouteSchedulingHistoryModalProps extends Omit<
  BAIModalProps,
  'children' | 'title'
> {
  routeId: string;
}

const RouteSchedulingHistoryModal = ({
  open,
  loading,
  routeId,
  onCancel,
  ...modalProps
}: RouteSchedulingHistoryModalProps) => {
  'use memo';
  const { t } = useTranslation();
  const [fetchKey, updateFetchKey] = useFetchKey();
  const [filter, setFilter] = useState<RouteHistoryFilter>();
  const [order, setOrder] = useState<string | null>('-updatedAt');

  const deferredOpenValue = useDeferredValue(open);
  const deferredFetchKey = useDeferredValue(fetchKey);
  const deferredFilter = useDeferredValue(filter);
  const deferredOrder = useDeferredValue(order);
  const queryRef = useLazyLoadQuery<RouteSchedulingHistoryModalQuery>(
    graphql`
      query RouteSchedulingHistoryModalQuery(
        $scope: RouteScope!
        $filter: RouteHistoryFilter
        $orderBy: [RouteHistoryOrderBy!]
      ) {
        routeScopedSchedulingHistories(
          scope: $scope
          filter: $filter
          orderBy: $orderBy
        ) {
          edges {
            node {
              ...BAIRouteSchedulingHistoryNodesFragment
            }
          }
        }
      }
    `,
    {
      scope: {
        routeId: routeId,
      },
      filter: deferredFilter ?? undefined,
      orderBy: convertToOrderBy<RouteHistoryOrderBy>(deferredOrder) ?? [
        { field: 'UPDATED_AT', direction: 'DESC' },
      ],
    },
    {
      fetchKey: deferredFetchKey,
      fetchPolicy: deferredOpenValue ? 'network-only' : 'store-only',
    },
  );
  return (
    <BAIModal
      title={t('route.RouteSchedulingHistory')}
      loading={loading || deferredOpenValue !== open}
      open={open}
      width={'90%'}
      style={{
        maxWidth: 1600,
      }}
      styles={{
        body: {
          minHeight: '80vh',
        },
      }}
      footer={
        <BAIButton
          onClick={(e) =>
            onCancel?.(
              e as Parameters<NonNullable<BAIModalProps['onCancel']>>[0],
            )
          }
        >
          {t('button.Close')}
        </BAIButton>
      }
      onCancel={onCancel}
      {...modalProps}
    >
      <BAIFlex direction="column" align="stretch" gap="sm">
        <BAIFlex justify="between" wrap="wrap" gap="sm">
          <BAIGraphQLPropertyFilter
            value={filter}
            onChange={setFilter}
            filterProperties={[
              {
                key: 'id',
                propertyLabel: t('route.ID'),
                type: 'uuid',
                fixedOperator: 'equals',
              },
              {
                key: 'phase',
                propertyLabel: t('route.Phase'),
                type: 'string',
                fixedOperator: 'contains',
              },
              {
                key: 'result',
                propertyLabel: t('route.Result'),
                type: 'enum',
                strictSelection: true,
                options: [
                  { label: 'SUCCESS', value: 'SUCCESS' },
                  { label: 'FAILURE', value: 'FAILURE' },
                  { label: 'STALE', value: 'STALE' },
                  { label: 'NEED_RETRY', value: 'NEED_RETRY' },
                  { label: 'EXPIRED', value: 'EXPIRED' },
                  { label: 'GIVE_UP', value: 'GIVE_UP' },
                  { label: 'SKIPPED', value: 'SKIPPED' },
                ],
              },
              {
                key: 'fromStatus',
                propertyLabel: t('route.FromStatus'),
                type: 'string',
                valueMode: 'scalar',
              },
              {
                key: 'toStatus',
                propertyLabel: t('route.ToStatus'),
                type: 'string',
                valueMode: 'scalar',
              },
              {
                key: 'errorCode',
                propertyLabel: t('route.ErrorCode'),
                type: 'string',
                fixedOperator: 'contains',
              },
              {
                key: 'message',
                propertyLabel: t('route.Message'),
                type: 'string',
                fixedOperator: 'contains',
              },
              {
                key: 'createdAt',
                propertyLabel: t('route.CreatedAt'),
                type: 'datetime',
                defaultOperator: 'after',
              },
              {
                key: 'updatedAt',
                propertyLabel: t('route.UpdatedAt'),
                type: 'datetime',
                defaultOperator: 'after',
              },
            ]}
          />
          <BAIFlex>
            <BAIFetchKeyButton
              value={fetchKey}
              onChange={updateFetchKey}
              loading={deferredFetchKey !== fetchKey}
              autoUpdateDelay={null}
            />
          </BAIFlex>
        </BAIFlex>
        <BAIRouteSchedulingHistoryNodes
          resizable
          loading={
            deferredFetchKey !== fetchKey ||
            deferredFilter !== filter ||
            deferredOrder !== order
          }
          order={order}
          onChangeOrder={setOrder}
          schedulingHistoryFrgmt={_.map(
            queryRef.routeScopedSchedulingHistories?.edges,
            'node',
          )}
        />
      </BAIFlex>
    </BAIModal>
  );
};

export default RouteSchedulingHistoryModal;
