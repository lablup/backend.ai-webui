import {
  SessionSchedulingHistoryFilter,
  SessionSchedulingHistoryModalQuery,
  SessionSchedulingHistoryOrderBy,
} from '../__generated__/SessionSchedulingHistoryModalQuery.graphql';
import { convertToOrderBy } from '../helper';
import { useBAIPaginationOptionState } from '../hooks/reactPaginationQueryOptions';
import { useBAISettingUserState } from '../hooks/useBAISetting';
import {
  BAIFetchKeyButton,
  BAIFlex,
  BAIGraphQLPropertyFilter,
  BAIModal,
  BAIModalProps,
  BAISchedulingHistoryTable,
  useFetchKey,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

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
  'use memo';
  const { t } = useTranslation();
  const [fetchKey, updateFetchKey] = useFetchKey();
  const [filter, setFilter] = useState<SessionSchedulingHistoryFilter>();
  const [order, setOrder] = useState<string | null>('-updatedAt');
  const [expandMode, setExpandMode] = useBAISettingUserState(
    'schedulingHistoryExpandMode',
  );
  const [columnOverrides, setColumnOverrides] = useBAISettingUserState(
    'table_column_overrides.SessionSchedulingHistory',
  );
  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionState({ current: 1, pageSize: 10 });

  const deferredOpenValue = useDeferredValue(open);
  const deferredFetchKey = useDeferredValue(fetchKey);
  const deferredFilter = useDeferredValue(filter);
  const deferredOrder = useDeferredValue(order);
  const deferredOffset = useDeferredValue(baiPaginationOption.offset);
  const deferredLimit = useDeferredValue(baiPaginationOption.limit);
  const queryRef = useLazyLoadQuery<SessionSchedulingHistoryModalQuery>(
    graphql`
      query SessionSchedulingHistoryModalQuery(
        $scope: SessionScope!
        $filter: SessionSchedulingHistoryFilter
        $orderBy: [SessionSchedulingHistoryOrderBy!]
        $limit: Int
        $offset: Int
      ) {
        sessionScopedSchedulingHistories(
          scope: $scope
          filter: $filter
          orderBy: $orderBy
          limit: $limit
          offset: $offset
        ) {
          count
          edges {
            node {
              ...BAISchedulingHistoryTableFragment
            }
          }
        }
      }
    `,
    {
      scope: {
        sessionId: sessionId,
      },
      filter: deferredFilter ?? undefined,
      orderBy: convertToOrderBy<SessionSchedulingHistoryOrderBy>(
        deferredOrder,
      ) ?? [{ field: 'UPDATED_AT', direction: 'DESC' }],
      limit: deferredLimit,
      offset: deferredOffset,
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
          minHeight: '80vh',
        },
      }}
      footer={null}
      onCancel={onCancel}
      {...modalProps}
    >
      <BAIFlex direction="column" align="stretch" gap="sm">
        <BAIFlex justify="between" wrap="wrap" gap="sm">
          <BAIGraphQLPropertyFilter
            value={filter}
            onChange={(next) => {
              setFilter(next);
              setTablePaginationOption({ current: 1 });
            }}
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
              {
                key: 'createdAt',
                propertyLabel: t('session.CreatedAt'),
                type: 'datetime',
                defaultOperator: 'after',
              },
              {
                key: 'updatedAt',
                propertyLabel: t('session.UpdatedAt'),
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
        <BAISchedulingHistoryTable
          resizable
          loading={
            deferredFetchKey !== fetchKey ||
            deferredFilter !== filter ||
            deferredOrder !== order ||
            deferredOffset !== baiPaginationOption.offset ||
            deferredLimit !== baiPaginationOption.limit
          }
          order={order}
          onChangeOrder={(nextOrder) => {
            setOrder(nextOrder);
            setTablePaginationOption({ current: 1 });
          }}
          expandMode={expandMode ?? undefined}
          onExpandModeChange={setExpandMode}
          tableSettings={{
            columnOverrides,
            onColumnOverridesChange: setColumnOverrides,
          }}
          pagination={{
            pageSize: tablePaginationOption.pageSize,
            current: tablePaginationOption.current,
            total: queryRef.sessionScopedSchedulingHistories?.count ?? 0,
            onChange: (current, pageSize) => {
              setTablePaginationOption({ current, pageSize });
            },
          }}
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
