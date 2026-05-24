import {
  DeploymentHistoryFilter,
  DeploymentHistoryOrderBy,
  DeploymentSchedulingHistoryModalQuery,
} from '../__generated__/DeploymentSchedulingHistoryModalQuery.graphql';
import { convertToOrderBy } from '../helper';
import {
  BAIButton,
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
import { graphql, useLazyLoadQuery } from 'react-relay';

interface DeploymentSchedulingHistoryModalProps extends Omit<
  BAIModalProps,
  'children' | 'title'
> {
  deploymentId: string;
}

const DeploymentSchedulingHistoryModal = ({
  open,
  loading,
  deploymentId,
  onCancel,
  ...modalProps
}: DeploymentSchedulingHistoryModalProps) => {
  'use memo';
  const { t } = useTranslation();
  const [fetchKey, updateFetchKey] = useFetchKey();
  const [filter, setFilter] = useState<DeploymentHistoryFilter>();
  const [order, setOrder] = useState<string | null>('-updatedAt');

  const deferredOpenValue = useDeferredValue(open);
  const deferredFetchKey = useDeferredValue(fetchKey);
  const deferredFilter = useDeferredValue(filter);
  const deferredOrder = useDeferredValue(order);
  const queryRef = useLazyLoadQuery<DeploymentSchedulingHistoryModalQuery>(
    graphql`
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
    `,
    {
      scope: {
        deploymentId: deploymentId,
      },
      filter: deferredFilter ?? undefined,
      orderBy: convertToOrderBy<DeploymentHistoryOrderBy>(deferredOrder) ?? [
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
      title={t('deployment.DeploymentSchedulingHistory')}
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
              onChange={updateFetchKey}
              loading={deferredFetchKey !== fetchKey}
              autoUpdateDelay={null}
            />
          </BAIFlex>
        </BAIFlex>
        <BAIDeploymentSchedulingHistoryNodes
          resizable
          loading={
            deferredFetchKey !== fetchKey ||
            deferredFilter !== filter ||
            deferredOrder !== order
          }
          order={order}
          onChangeOrder={setOrder}
          schedulingHistoryFrgmt={_.map(
            queryRef.deploymentScopedSchedulingHistories?.edges,
            'node',
          )}
        />
      </BAIFlex>
    </BAIModal>
  );
};

export default DeploymentSchedulingHistoryModal;
