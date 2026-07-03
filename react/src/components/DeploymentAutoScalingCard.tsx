/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { DeploymentAutoScalingCardDeleteMutation } from '../__generated__/DeploymentAutoScalingCardDeleteMutation.graphql';
import { DeploymentAutoScalingCardListQuery } from '../__generated__/DeploymentAutoScalingCardListQuery.graphql';
import { DeploymentAutoScalingCardPresetsQuery } from '../__generated__/DeploymentAutoScalingCardPresetsQuery.graphql';
import { DeploymentAutoScalingCard_deployment$key } from '../__generated__/DeploymentAutoScalingCard_deployment.graphql';
import { useCurrentUserInfo } from '../hooks/backendai';
import { useBAIPaginationOptionStateOnSearchParam } from '../hooks/reactPaginationQueryOptions';
import { useBAISettingUserState } from '../hooks/useBAISetting';
import AutoScalingRuleEditorModal from './AutoScalingRuleEditorModal';
import AutoScalingRuleListNodes, {
  toAutoScalingRuleFilter,
} from './AutoScalingRuleListNodes';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { App, Skeleton, Tooltip, theme } from 'antd';
import {
  BAIButton,
  BAICard,
  BAIDeleteConfirmModal,
  BAIFetchKeyButton,
  BAIFlex,
  BAIGraphQLPropertyFilter,
  BAIUnmountAfterClose,
  filterOutNullAndUndefined,
  isDeploymentInStoppedCategory,
  toLocalId,
  useFetchKey,
  useMutationWithPromise,
} from 'backend.ai-ui';
import type { GraphQLFilter } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { PlusIcon } from 'lucide-react';
import { parseAsJson, parseAsStringLiteral, useQueryStates } from 'nuqs';
import React, {
  Suspense,
  useDeferredValue,
  useState,
  useTransition,
} from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';

interface DeploymentAutoScalingCardProps {
  deploymentFrgmt: DeploymentAutoScalingCard_deployment$key | null | undefined;
}

/**
 * DeploymentAutoScalingCard — top-level Auto-Scaling card on the Deployment
 * detail page. Owns the section title plus the auto-scaling rules data fetch
 * (lazy `deployment(id:).autoScalingRules`), the Prometheus preset lookup,
 * filter / sort / pagination, the create-edit flow, and deletion. The table
 * itself is rendered by the presentational `AutoScalingRuleListNodes`.
 *
 * Both the refresh button (`BAIFetchKeyButton`) and the primary "Add rules"
 * button live in the toolbar next to the property filter so the table controls
 * stay grouped together (per Jongeun's feedback).
 */
const DeploymentAutoScalingCard: React.FC<DeploymentAutoScalingCardProps> = ({
  deploymentFrgmt,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [currentUser] = useCurrentUserInfo();

  const deployment = useFragment(
    graphql`
      fragment DeploymentAutoScalingCard_deployment on ModelDeployment {
        id
        metadata {
          status
        }
        creator @since(version: "26.4.3") {
          basicInfo {
            email
          }
        }
      }
    `,
    deploymentFrgmt,
  );

  if (!deployment?.id) {
    return null;
  }

  const status = deployment.metadata?.status;
  const isEndpointDestroying = isDeploymentInStoppedCategory(status);
  const creatorEmail = deployment.creator?.basicInfo?.email ?? null;
  const isOwnedByCurrentUser =
    !creatorEmail || creatorEmail === currentUser.email;

  return (
    <BAICard
      title={
        <BAIFlex gap="xs" align="center">
          {t('deployment.tab.AutoScaling')}
          <Tooltip title={t('deployment.tab.description.AutoScaling')}>
            <QuestionCircleOutlined
              style={{ color: token.colorTextDescription }}
            />
          </Tooltip>
        </BAIFlex>
      }
      styles={{ body: { paddingTop: 0 } }}
    >
      <Suspense fallback={<Skeleton active />}>
        <DeploymentAutoScalingCardContent
          deploymentId={deployment.id}
          isEndpointDestroying={isEndpointDestroying}
          isOwnedByCurrentUser={isOwnedByCurrentUser}
        />
      </Suspense>
    </BAICard>
  );
};

// ---------------------------------------------------------------------------
// Inner content component — owns the lazy auto-scaling rules / presets queries
// so the BAICard header above stays visible while the list suspends.
// ---------------------------------------------------------------------------

interface DeploymentAutoScalingCardContentProps {
  deploymentId: string; // Relay global ID (e.g., toGlobalId('ModelDeployment', uuid))
  isEndpointDestroying: boolean;
  isOwnedByCurrentUser: boolean;
}

const DeploymentAutoScalingCardContent: React.FC<
  DeploymentAutoScalingCardContentProps
> = ({ deploymentId, isEndpointDestroying, isOwnedByCurrentUser }) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [isPendingRefetch, startRefetchTransition] = useTransition();
  const [fetchKey, updateFetchKey] = useFetchKey();

  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [isOpenEditorModal, setIsOpenEditorModal] = useState(false);
  const [deletingRule, setDeletingRule] = useState<{
    id: string;
    metricName: string;
  } | null>(null);

  const [columnOverrides, setColumnOverrides] = useBAISettingUserState(
    'table_column_overrides.AutoScalingRuleList',
  );

  // BAITable order string: "createdAt" (ASC) | "-createdAt" (DESC)
  const [queryParams, setQueryParams] = useQueryStates(
    {
      order: parseAsStringLiteral([
        'createdAt',
        '-createdAt',
      ] as const).withDefault('-createdAt'),
      filter: parseAsJson<GraphQLFilter>((value) => value as GraphQLFilter),
    },
    { history: 'replace' },
  );

  const orderString = queryParams.order;
  const graphQLFilter = queryParams.filter ?? undefined;

  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionStateOnSearchParam({ current: 1, pageSize: 10 });

  const filterInput = graphQLFilter
    ? toAutoScalingRuleFilter(graphQLFilter)
    : null;

  const queryVariables = {
    deploymentId,
    offset: baiPaginationOption.offset,
    limit: baiPaginationOption.limit,
    orderBy: [
      {
        field: 'CREATED_AT' as const,
        direction: (orderString.startsWith('-') ? 'DESC' : 'ASC') as
          | 'ASC'
          | 'DESC',
      },
    ],
    filter: filterInput,
  };
  const deferredQueryVariables = useDeferredValue(queryVariables);

  const data = useLazyLoadQuery<DeploymentAutoScalingCardListQuery>(
    graphql`
      query DeploymentAutoScalingCardListQuery(
        $deploymentId: ID!
        $offset: Int
        $limit: Int
        $orderBy: [AutoScalingRuleOrderBy!]
        $filter: AutoScalingRuleFilter
      ) {
        deployment(id: $deploymentId) {
          autoScalingRules(
            offset: $offset
            limit: $limit
            orderBy: $orderBy
            filter: $filter
          ) {
            count
            edges {
              node {
                id
                metricName
                ...AutoScalingRuleListNodesFragment
                ...AutoScalingRuleEditorModalFragment
              }
            }
          }
        }
      }
    `,
    deferredQueryVariables,
    {
      fetchPolicy: 'store-and-network',
      fetchKey,
    },
  );

  const { prometheusQueryPresets } =
    useLazyLoadQuery<DeploymentAutoScalingCardPresetsQuery>(
      graphql`
        query DeploymentAutoScalingCardPresetsQuery {
          prometheusQueryPresets {
            edges {
              node {
                id
                name
              }
            }
          }
        }
      `,
      {},
    );

  const presetMap = (() => {
    const map = new Map<string, string>();
    if (prometheusQueryPresets?.edges) {
      for (const edge of prometheusQueryPresets.edges) {
        if (edge?.node) {
          map.set(toLocalId(edge.node.id), edge.node.name);
        }
      }
    }
    return map;
  })();

  const autoScalingRuleNodes = filterOutNullAndUndefined(
    _.map(data?.deployment?.autoScalingRules?.edges, 'node'),
  );

  const totalCount = data?.deployment?.autoScalingRules?.count ?? 0;

  const commitDeleteMutation =
    useMutationWithPromise<DeploymentAutoScalingCardDeleteMutation>(graphql`
      mutation DeploymentAutoScalingCardDeleteMutation(
        $input: DeleteAutoScalingRuleInput!
      ) {
        deleteAutoScalingRule(input: $input) {
          id
        }
      }
    `);

  const handleRefetch = () => {
    startRefetchTransition(() => {
      updateFetchKey();
    });
  };

  const handleDeleteRule = (ruleId: string, metricName: string) => {
    setDeletingRule({ id: ruleId, metricName });
  };

  return (
    <>
      <BAIFlex direction="column" align="stretch" gap="sm">
        <BAIFlex align="center" gap="xs">
          <BAIGraphQLPropertyFilter
            style={{ flex: 1 }}
            filterProperties={[
              {
                key: 'createdAt',
                propertyLabel: t('autoScalingRule.CreatedAt'),
                type: 'datetime',
                operators: ['after', 'before'],
                defaultOperator: 'after',
              },
              {
                key: 'lastTriggeredAt',
                propertyLabel: t('autoScalingRule.LastTriggered'),
                type: 'datetime',
                operators: ['after', 'before'],
                defaultOperator: 'after',
              },
            ]}
            value={graphQLFilter}
            onChange={(filter) => {
              startRefetchTransition(() => {
                setQueryParams({ filter: filter ?? null });
                setTablePaginationOption({ current: 1 });
              });
            }}
          />
          <BAIFetchKeyButton
            loading={isPendingRefetch}
            value=""
            onChange={() => {
              startRefetchTransition(() => updateFetchKey());
            }}
          />
          <BAIButton
            type="primary"
            icon={<PlusIcon />}
            disabled={isEndpointDestroying || !isOwnedByCurrentUser}
            onClick={() => {
              setEditingRuleId(null);
              setIsOpenEditorModal(true);
            }}
          >
            {t('modelService.AddRules')}
          </BAIButton>
        </BAIFlex>
        <AutoScalingRuleListNodes
          autoScalingRulesFrgmt={autoScalingRuleNodes}
          presetMap={presetMap}
          order={orderString}
          loading={
            isPendingRefetch || deferredQueryVariables !== queryVariables
          }
          tableSettings={{
            columnOverrides: columnOverrides,
            onColumnOverridesChange: setColumnOverrides,
          }}
          onChangeOrder={(order) => {
            startRefetchTransition(() => {
              setQueryParams({
                order: order ? (order as 'createdAt' | '-createdAt') : null,
              });
            });
          }}
          pagination={{
            pageSize: tablePaginationOption.pageSize,
            current: tablePaginationOption.current,
            total: totalCount,
            onChange: (current, pageSize) => {
              setTablePaginationOption({ current, pageSize });
            },
          }}
          isEndpointDestroying={isEndpointDestroying}
          isOwnedByCurrentUser={isOwnedByCurrentUser}
          onEditRule={(id) => {
            setEditingRuleId(id);
            setIsOpenEditorModal(true);
          }}
          onDeleteRule={handleDeleteRule}
        />
      </BAIFlex>
      <BAIUnmountAfterClose>
        <AutoScalingRuleEditorModal
          open={isOpenEditorModal}
          modelDeploymentId={toLocalId(deploymentId)}
          autoScalingRuleFrgmt={
            editingRuleId
              ? (autoScalingRuleNodes.find((r) => r.id === editingRuleId) ??
                null)
              : null
          }
          onRequestClose={(success) => {
            setIsOpenEditorModal(false);
            if (success) {
              handleRefetch();
            }
          }}
          afterClose={() => {
            setEditingRuleId(null);
          }}
        />
      </BAIUnmountAfterClose>
      <BAIDeleteConfirmModal
        open={!!deletingRule}
        title={t('autoScalingRule.DeleteAutoScalingRule')}
        description={t('autoScalingRule.DeleteConfirmation')}
        items={
          deletingRule
            ? [{ key: deletingRule.id, label: deletingRule.metricName }]
            : []
        }
        reversible
        onOk={() => {
          if (!deletingRule) return;
          return commitDeleteMutation({
            input: { id: toLocalId(deletingRule.id) },
          })
            .then(() => {
              setDeletingRule(null);
              handleRefetch();
              message.success({
                key: 'autoscaling-rule-deleted',
                content: t('autoScalingRule.SuccessfullyDeleted'),
              });
            })
            .catch((error) => {
              const errors = Array.isArray(error) ? error : [error];
              for (const err of errors) {
                message.error(err?.message || t('dialog.ErrorOccurred'));
              }
            });
        }}
        onCancel={() => setDeletingRule(null)}
      />
    </>
  );
};

export default DeploymentAutoScalingCard;
