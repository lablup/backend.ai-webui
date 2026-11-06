/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { DeploymentStatusPanelDomainQuery } from '../../../__generated__/DeploymentStatusPanelDomainQuery.graphql';
import type { DeploymentStatusPanelMineQuery } from '../../../__generated__/DeploymentStatusPanelMineQuery.graphql';
import type { DeploymentStatusPanelProjectQuery } from '../../../__generated__/DeploymentStatusPanelProjectQuery.graphql';
import { useBAIPaginationOptionState } from '../../../hooks/reactPaginationQueryOptions';
import type { CardScope } from '../cardScope';
import DeploymentHealthTable, {
  needsDeploymentDetails,
  type DeploymentHealthNode,
} from '../memberCards/DeploymentHealthTable';
import { readPrimary } from '../panelPermission';
import type { PanelComponentProps, PanelSettings } from '../types';
import { useResetPageOn } from '../useResetPageOn';
import ScopedCard from './ScopedCard';
import { filterOutNullAndUndefined } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { useDeferredValue } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

interface PageArgs {
  limit: number;
  offset: number;
  /** Fetches what the optional detail columns read. */
  withDetails: boolean;
  fetchKey: string;
}

type DeploymentPage = {
  nodes: ReadonlyArray<DeploymentHealthNode>;
  total: number;
};

type Connection = {
  readonly count: number;
  readonly edges: ReadonlyArray<
    | { readonly node: DeploymentHealthNode | null | undefined }
    | null
    | undefined
  >;
} | null;

const toPage = (connection: Connection | undefined): DeploymentPage => ({
  nodes: filterOutNullAndUndefined(connection?.edges.map((edge) => edge?.node)),
  total: connection?.count ?? 0,
});

// Destroyed deployments stay in the connections; only live ones are listed.
const LIVE = { destroyedAt: { isNull: true } } as const;

const useMineDeployments = (
  projectId: string,
  { limit, offset, withDetails, fetchKey }: PageArgs,
): DeploymentPage => {
  'use memo';
  const data = useLazyLoadQuery<DeploymentStatusPanelMineQuery>(
    graphql`
      query DeploymentStatusPanelMineQuery(
        $filter: DeploymentFilter!
        $limit: Int!
        $offset: Int!
        $withDetails: Boolean!
      ) {
        deployments: myDeployments(
          filter: $filter
          orderBy: [{ field: CREATED_AT, direction: DESC }]
          limit: $limit
          offset: $offset
        ) @catch(to: RESULT) {
          count
          edges {
            node {
              id
              replicaState {
                desiredReplicaCount
              }
              healthyReplicas: replicas(
                filter: { healthStatus: { equals: HEALTHY } }
              ) {
                count
              }
              ...BAIModelDeploymentNodesFragment
                @arguments(withDetails: $withDetails)
            }
          }
        }
      }
    `,
    {
      filter: { ...LIVE, projectId: { equals: projectId } },
      limit,
      offset,
      withDetails,
    },
    { fetchPolicy: 'store-and-network', fetchKey },
  );
  return toPage(readPrimary(data.deployments));
};

const useProjectDeployments = (
  projectId: string,
  { limit, offset, withDetails, fetchKey }: PageArgs,
): DeploymentPage => {
  'use memo';
  const data = useLazyLoadQuery<DeploymentStatusPanelProjectQuery>(
    graphql`
      query DeploymentStatusPanelProjectQuery(
        $projectId: UUID!
        $filter: DeploymentFilter!
        $limit: Int!
        $offset: Int!
        $withDetails: Boolean!
      ) {
        deployments: projectDeployments(
          scope: { projectId: $projectId }
          filter: $filter
          orderBy: [{ field: CREATED_AT, direction: DESC }]
          limit: $limit
          offset: $offset
        ) @catch(to: RESULT) {
          count
          edges {
            node {
              id
              replicaState {
                desiredReplicaCount
              }
              healthyReplicas: replicas(
                filter: { healthStatus: { equals: HEALTHY } }
              ) {
                count
              }
              ...BAIModelDeploymentNodesFragment
                @arguments(withDetails: $withDetails)
            }
          }
        }
      }
    `,
    { projectId, filter: LIVE, limit, offset, withDetails },
    { fetchPolicy: 'store-and-network', fetchKey },
  );
  return toPage(readPrimary(data.deployments));
};

const MineDeployments: React.FC<
  PageArgs & {
    projectId: string;
    children: (page: DeploymentPage) => React.ReactNode;
  }
> = ({ projectId, children, ...args }) => {
  'use memo';
  return children(useMineDeployments(projectId, args));
};

const ProjectDeployments: React.FC<
  PageArgs & {
    projectId: string;
    children: (page: DeploymentPage) => React.ReactNode;
  }
> = ({ projectId, children, ...args }) => {
  'use memo';
  return children(useProjectDeployments(projectId, args));
};

const DomainDeployments: React.FC<
  PageArgs & {
    domainId: string;
    children: (page: DeploymentPage) => React.ReactNode;
  }
> = ({ domainId, children, limit, offset, withDetails, fetchKey }) => {
  'use memo';
  const data = useLazyLoadQuery<DeploymentStatusPanelDomainQuery>(
    graphql`
      query DeploymentStatusPanelDomainQuery(
        $domainId: UUID!
        $filter: DeploymentFilter!
        $limit: Int!
        $offset: Int!
        $withDetails: Boolean!
      ) {
        deployments: scopedDeployments(
          scope: { domain: [{ value: $domainId }] }
          filter: $filter
          orderBy: [{ field: CREATED_AT, direction: DESC }]
          limit: $limit
          offset: $offset
        ) @catch(to: RESULT) {
          count
          edges {
            node {
              id
              replicaState {
                desiredReplicaCount
              }
              healthyReplicas: replicas(
                filter: { healthStatus: { equals: HEALTHY } }
              ) {
                count
              }
              ...BAIModelDeploymentNodesFragment
                @arguments(withDetails: $withDetails)
            }
          }
        }
      }
    `,
    { domainId, filter: LIVE, limit, offset, withDetails },
    { fetchPolicy: 'store-and-network', fetchKey },
  );
  return children(toPage(readPrimary(data.deployments)));
};

/** One page of live deployments in the scope, newest first. */
const DeploymentPageOf: React.FC<
  PageArgs & {
    scope: CardScope;
    children: (page: DeploymentPage) => React.ReactNode;
  }
> = ({ scope, ...args }) => {
  'use memo';
  switch (scope.kind) {
    case 'mine':
      return <MineDeployments projectId={scope.projectId} {...args} />;
    case 'project':
      return <ProjectDeployments projectId={scope.projectId} {...args} />;
    case 'domain':
      return <DomainDeployments domainId={scope.domainId} {...args} />;
  }
};

const DeploymentList: React.FC<{
  scope: CardScope;
  fetchKey: string;
  columnOverrides: PanelSettings['columnOverrides'];
  onChangeSettings?: PanelComponentProps['onChangeSettings'];
}> = ({ scope, fetchKey, columnOverrides, onChangeSettings }) => {
  'use memo';
  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionState({ current: 1, pageSize: 5 });
  useResetPageOn(scope, setTablePaginationOption);
  const view = {
    limit: baiPaginationOption.limit,
    offset: baiPaginationOption.offset,
    withDetails: needsDeploymentDetails(columnOverrides),
    columnOverrides,
  };
  // Deferred together, so a page or a detail column waits on the old rows instead of the skeleton.
  const deferredView = useDeferredValue(view);
  return (
    <DeploymentPageOf
      scope={scope}
      fetchKey={fetchKey}
      limit={deferredView.limit}
      offset={deferredView.offset}
      withDetails={deferredView.withDetails}
    >
      {({ nodes, total }) => (
        <DeploymentHealthTable
          nodes={nodes}
          total={total}
          loading={
            deferredView.offset !== view.offset ||
            deferredView.withDetails !== view.withDetails
          }
          pagination={{
            pageSize: tablePaginationOption.pageSize,
            current: tablePaginationOption.current,
            onChange: (current, pageSize) =>
              setTablePaginationOption({ current, pageSize }),
          }}
          columnOverrides={deferredView.columnOverrides}
          onColumnOverridesChange={
            onChangeSettings
              ? (overrides) =>
                  onChangeSettings({
                    columnOverrides: _.isEmpty(overrides)
                      ? undefined
                      : overrides,
                  })
              : undefined
          }
        />
      )}
    </DeploymentPageOf>
  );
};

/** Live deployments in the page's scope with replica health, newest first. */
const DeploymentStatusPanel: React.FC<PanelComponentProps> = ({
  scope,
  fetchKey,
  panel,
  onChangeSettings,
}) => {
  'use memo';
  const { t } = useTranslation();
  return (
    <ScopedCard
      scope={scope}
      fetchKey={fetchKey}
      heading={{
        mine: { title: t('dashboard.card.MyDeployments') },
        project: {
          title: t('dashboard.card.DeploymentStatus'),
          tooltip: t('dashboard.card.DeploymentStatusTooltip'),
        },
        domain: {
          title: t('dashboard.card.DeploymentStatus'),
          tooltip: t('dashboard.card.DomainDeploymentStatusTooltip'),
        },
      }}
    >
      {(cardScope, key) => (
        <DeploymentList
          scope={cardScope}
          fetchKey={key}
          columnOverrides={panel.settings?.columnOverrides}
          onChangeSettings={onChangeSettings}
        />
      )}
    </ScopedCard>
  );
};

export default DeploymentStatusPanel;
