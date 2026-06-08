import {
  RouteHistoryFilter,
  RouteHistoryOrderBy,
  RouteSchedulingHistoryModalQuery,
} from '../__generated__/RouteSchedulingHistoryModalQuery.graphql';
import { convertToOrderBy } from '../helper';
import { useBAISettingUserState } from '../hooks/useBAISetting';
import {
  BAIFetchKeyButton,
  BAIFlex,
  BAIGraphQLPropertyFilter,
  BAIModal,
  BAIModalProps,
  BAIRouteSchedulingHistoryTable,
  useFetchKey,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  graphql,
  PreloadedQuery,
  usePreloadedQuery,
  UseQueryLoaderLoadQueryOptions,
} from 'react-relay';

// Exported so the opener can `loadQuery` it in the click event (render-as-you-
// fetch). Operation name must match the generated artifact; the const name only
// differs to avoid clashing with the imported generated type.
export const RouteSchedulingHistoryQuery = graphql`
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
          ...BAIRouteSchedulingHistoryTableFragment
        }
      }
    }
  }
`;

interface RouteSchedulingHistoryModalProps extends Omit<
  BAIModalProps,
  'children' | 'title'
> {
  /** Preloaded query reference produced by the opener via `useQueryLoader`. */
  queryRef: PreloadedQuery<RouteSchedulingHistoryModalQuery>;
  /**
   * Re-run the query when filter / order / refresh changes. Same signature as
   * `useQueryLoader`'s `loadQuery`, so the opener can pass it directly.
   */
  onReload: (
    variables: RouteSchedulingHistoryModalQuery['variables'],
    options?: UseQueryLoaderLoadQueryOptions,
  ) => void;
}

const RouteSchedulingHistoryModal = ({
  open,
  queryRef,
  onReload,
  onCancel,
  ...modalProps
}: RouteSchedulingHistoryModalProps) => {
  'use memo';
  const { t } = useTranslation();
  const [fetchKey, updateFetchKey] = useFetchKey();
  const [filter, setFilter] = useState<RouteHistoryFilter>();
  const [order, setOrder] = useState<string | null>('-updatedAt');
  const [expandMode, setExpandMode] = useBAISettingUserState(
    'schedulingHistoryExpandMode',
  );
  const [columnOverrides, setColumnOverrides] = useBAISettingUserState(
    'table_column_overrides.RouteSchedulingHistory',
  );

  // Re-fetches happen from event handlers (filter / order / refresh), never from
  // render or an effect. We carry the existing variables forward via
  // `...queryRef.variables` (scope/routeId already live there) and override only
  // what changed, so no separate variable builder is needed.

  // Keep the previous result visible while the next one loads so re-fetches show
  // the old data with an inline loading indicator instead of flashing the
  // Suspense fallback. `deferredQueryRef !== queryRef` is the "additional
  // loading in progress" signal.
  const deferredQueryRef = useDeferredValue(queryRef);
  const isRefetchingInTransition = deferredQueryRef !== queryRef;

  const data = usePreloadedQuery<RouteSchedulingHistoryModalQuery>(
    RouteSchedulingHistoryQuery,
    deferredQueryRef,
  );

  return (
    <BAIModal
      title={t('route.RouteSchedulingHistory')}
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
      cancelText={t('button.Close')}
      footer={(_originNode, { CancelBtn }) => <CancelBtn />}
      onCancel={onCancel}
      {...modalProps}
    >
      <BAIFlex direction="column" align="stretch" gap="sm">
        <BAIFlex justify="between" wrap="wrap" gap="sm">
          <BAIGraphQLPropertyFilter
            value={filter}
            onChange={(next) => {
              setFilter(next);
              onReload(
                { ...queryRef.variables, filter: next },
                { fetchPolicy: 'network-only' },
              );
            }}
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
              onChange={(key) => {
                updateFetchKey(key);
                onReload(queryRef.variables, { fetchPolicy: 'network-only' });
              }}
              loading={isRefetchingInTransition}
              autoUpdateDelay={null}
            />
          </BAIFlex>
        </BAIFlex>
        <BAIRouteSchedulingHistoryTable
          resizable
          loading={isRefetchingInTransition}
          expandMode={expandMode ?? undefined}
          onExpandModeChange={setExpandMode}
          tableSettings={{
            columnOverrides,
            onColumnOverridesChange: setColumnOverrides,
          }}
          order={order}
          onChangeOrder={(nextOrder) => {
            setOrder(nextOrder);
            onReload(
              {
                ...queryRef.variables,
                orderBy: convertToOrderBy<RouteHistoryOrderBy>(nextOrder),
              },
              { fetchPolicy: 'network-only' },
            );
          }}
          schedulingHistoryFrgmt={_.map(
            data.routeScopedSchedulingHistories?.edges,
            'node',
          )}
        />
      </BAIFlex>
    </BAIModal>
  );
};
export default RouteSchedulingHistoryModal;
