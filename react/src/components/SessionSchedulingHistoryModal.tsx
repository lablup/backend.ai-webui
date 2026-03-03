import {
  BAIButton,
  BAIFetchKeyButton,
  BAIFlex,
  BAIGraphQLPropertyFilter,
  BAIModal,
  BAIModalProps,
  BAISchedulingHistoryNodes,
  GraphQLFilter,
  useFetchKey,
} from 'backend.ai-ui';
import _ from 'lodash';
import { useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';
import {
  SessionSchedulingHistoryModalQuery,
  SessionSchedulingHistoryOrderBy,
} from 'src/__generated__/SessionSchedulingHistoryModalQuery.graphql';
import { convertToOrderBy } from 'src/helper';

interface SessionSchedulingHistoryModalProps extends Omit<
  BAIModalProps,
  'children' | 'title'
> {
  sessionId: string;
}

const SessionSchedulingHistoryModal = ({
  open,
  loading,
  sessionId,
  onCancel,
  ...modalProps
}: SessionSchedulingHistoryModalProps) => {
  const { t } = useTranslation();
  const [fetchKey, updateFetchKey] = useFetchKey();
  const [filter, setFilter] = useState<GraphQLFilter>();
  const [order, setOrder] = useState<string | null>('createdAt');

  const deferredOpenValue = useDeferredValue(open);
  const deferredFetchKey = useDeferredValue(fetchKey);
  const deferredFilter = useDeferredValue(filter);
  const deferredOrder = useDeferredValue(order);
  const queryRef = useLazyLoadQuery<SessionSchedulingHistoryModalQuery>(
    graphql`
      query SessionSchedulingHistoryModalQuery(
        $scope: SessionScope!
        $filter: SessionSchedulingHistoryFilter
        $orderBy: [SessionSchedulingHistoryOrderBy!]
      ) {
        sessionScopedSchedulingHistories(
          scope: $scope
          filter: $filter
          orderBy: $orderBy
        ) {
          edges {
            node {
              ...BAISchedulingHistoryNodesFragment
            }
          }
        }
      }
    `,
    {
      scope: {
        sessionId: sessionId,
      },
      filter: deferredFilter
        ? _.pick(deferredFilter, [
            'id',
            'phase',
            'result',
            'fromStatus',
            'toStatus',
            'errorCode',
            'message',
          ])
        : undefined,
      orderBy: convertToOrderBy<SessionSchedulingHistoryOrderBy>(
        deferredOrder,
      ) ?? [{ field: 'CREATED_AT', direction: 'ASC' }],
    },
    {
      fetchKey: deferredFetchKey,
      fetchPolicy: deferredOpenValue ? 'network-only' : 'store-only',
    },
  );
  return (
    <BAIModal
      title={t('session.SessionSchedulingHistory')}
      loading={loading || deferredOpenValue !== open}
      open={open}
      width={'90%'}
      style={{
        maxWidth: 1600,
      }}
      styles={{
        body: {
          height: '100vh',
        },
      }}
      footer={<BAIButton onClick={onCancel}>{t('button.Close')}</BAIButton>}
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
                propertyLabel: t('session.ID'),
                type: 'uuid',
                fixedOperator: 'equals',
              },
              {
                key: 'phase',
                propertyLabel: t('session.Phase'),
                type: 'string',
                fixedOperator: 'contains',
              },
              {
                key: 'result',
                propertyLabel: t('session.Result'),
                type: 'enum',
                valueMode: 'scalar',
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
                propertyLabel: t('session.FromStatus'),
                type: 'string',
                valueMode: 'scalar',
              },
              {
                key: 'toStatus',
                propertyLabel: t('session.ToStatus'),
                type: 'string',
                valueMode: 'scalar',
              },
              {
                key: 'errorCode',
                propertyLabel: t('session.ErrorCode'),
                type: 'string',
                fixedOperator: 'contains',
              },
              {
                key: 'message',
                propertyLabel: t('session.Message'),
                type: 'string',
                fixedOperator: 'contains',
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
        <BAISchedulingHistoryNodes
          resizable
          loading={
            deferredFetchKey !== fetchKey ||
            deferredFilter !== filter ||
            deferredOrder !== order
          }
          order={order}
          onChangeOrder={setOrder}
          schedulingHistoryFrgmt={_.map(
            queryRef.sessionScopedSchedulingHistories?.edges,
            'node',
          )}
        />
      </BAIFlex>
    </BAIModal>
  );
};

export default SessionSchedulingHistoryModal;
