import {
  DeploymentHistoryFilter,
  DeploymentHistoryOrderBy,
  DeploymentSchedulingHistoryModalQuery,
} from '../__generated__/DeploymentSchedulingHistoryModalQuery.graphql';
import { convertToOrderBy } from '../helper';
import {
  BAIDeploymentSchedulingHistoryNodes,
  BAIFetchKeyButton,
  BAIFlex,
  BAIGraphQLPropertyFilter,
  BAIModal,
  BAIModalProps,
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
export const DeploymentSchedulingHistoryQuery = graphql`
  query DeploymentSchedulingHistoryModalQuery(
    $scope: DeploymentScope!
    $filter: DeploymentHistoryFilter
    $orderBy: [DeploymentHistoryOrderBy!]
  ) {
    deploymentScopedSchedulingHistories(
      scope: $scope
      filter: $filter
      orderBy: $orderBy
    ) {
      edges {
        node {
          ...BAIDeploymentSchedulingHistoryNodesFragment
        }
      }
    }
  }
`;

interface DeploymentSchedulingHistoryModalProps extends Omit<
  BAIModalProps,
  'children' | 'title'
> {
  /** Preloaded query reference produced by the opener via `useQueryLoader`. */
  queryRef: PreloadedQuery<DeploymentSchedulingHistoryModalQuery>;
  /**
   * Re-run the query when filter / order / refresh changes. Same signature as
   * `useQueryLoader`'s `loadQuery`, so the opener can pass it directly.
   */
  onReload: (
    variables: DeploymentSchedulingHistoryModalQuery['variables'],
    options?: UseQueryLoaderLoadQueryOptions,
  ) => void;
}

const DeploymentSchedulingHistoryModal = ({
  open,
  queryRef,
  onReload,
  onCancel,
  ...modalProps
}: DeploymentSchedulingHistoryModalProps) => {
  'use memo';
  const { t } = useTranslation();
  const [fetchKey, updateFetchKey] = useFetchKey();
  const [filter, setFilter] = useState<DeploymentHistoryFilter>();
  const [order, setOrder] = useState<string | null>('-updatedAt');

  // Re-fetches happen from event handlers (filter / order / refresh), never from
  // render or an effect. We carry the existing variables forward via
  // `...queryRef.variables` (scope/deploymentId already live there) and override
  // only what changed, so no separate variable builder is needed.

  // Keep the previous result visible while the next one loads so re-fetches show
  // the old data with an inline loading indicator instead of flashing the
  // Suspense fallback. `deferredQueryRef !== queryRef` is the "additional
  // loading in progress" signal.
  const deferredQueryRef = useDeferredValue(queryRef);
  const isRefetchingInTransition = deferredQueryRef !== queryRef;

  const data = usePreloadedQuery<DeploymentSchedulingHistoryModalQuery>(
    DeploymentSchedulingHistoryQuery,
    deferredQueryRef,
  );

  return (
    <BAIModal
      title={t('deployment.DeploymentSchedulingHistory')}
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
                propertyLabel: t('deployment.ID'),
                type: 'uuid',
                fixedOperator: 'equals',
              },
              {
                key: 'phase',
                propertyLabel: t('deployment.Phase'),
                type: 'string',
                fixedOperator: 'contains',
              },
              {
                key: 'result',
                propertyLabel: t('deployment.Result'),
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
                propertyLabel: t('deployment.FromStatus'),
                type: 'string',
                valueMode: 'scalar',
              },
              {
                key: 'toStatus',
                propertyLabel: t('deployment.ToStatus'),
                type: 'string',
                valueMode: 'scalar',
              },
              {
                key: 'errorCode',
                propertyLabel: t('deployment.ErrorCode'),
                type: 'string',
                fixedOperator: 'contains',
              },
              {
                key: 'message',
                propertyLabel: t('deployment.Message'),
                type: 'string',
                fixedOperator: 'contains',
              },
              {
                key: 'createdAt',
                propertyLabel: t('deployment.CreatedAt'),
                type: 'datetime',
                defaultOperator: 'after',
              },
              {
                key: 'updatedAt',
                propertyLabel: t('deployment.UpdatedAt'),
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
        <BAIDeploymentSchedulingHistoryNodes
          resizable
          loading={isRefetchingInTransition}
          order={order}
          onChangeOrder={(nextOrder) => {
            setOrder(nextOrder);
            onReload(
              {
                ...queryRef.variables,
                orderBy: convertToOrderBy<DeploymentHistoryOrderBy>(nextOrder),
              },
              { fetchPolicy: 'network-only' },
            );
          }}
          schedulingHistoryFrgmt={_.map(
            data.deploymentScopedSchedulingHistories?.edges,
            'node',
          )}
        />
      </BAIFlex>
    </BAIModal>
  );
};

export default DeploymentSchedulingHistoryModal;
