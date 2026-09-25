/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { WebMCPDeploymentTools_deployments$key } from '../__generated__/WebMCPDeploymentTools_deployments.graphql';
import {
  createCurrentItemTool,
  openedItem,
  usePageReadTools,
  viewStateResult,
  visibleRowsResult,
  type PageToolColumn,
  type PageToolRow,
  type ViewParamValue,
} from '../helper/webmcpPageTools';
import {
  filterOutNullAndUndefined,
  toLocalId,
  useBAIWebMCPActive,
  useWebMCPTool,
  type BAITableColumnOverrideRecord,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React from 'react';
import { graphql, useFragment } from 'react-relay';
import { useLocation } from 'react-router-dom';

/** The columns `DeploymentListPage` lets `BAIModelDeploymentNodes` render. */
export const DEPLOYMENT_TOOL_COLUMNS: ReadonlyArray<PageToolColumn> = [
  { key: 'name', fields: ['name'], required: true },
  { key: 'currentRevisionNumber', fields: ['revisionNumber'] },
  { key: 'status', fields: ['status'] },
  {
    key: 'replicaSummary',
    fields: ['runningReplicas', 'desiredReplicas'],
  },
  { key: 'model', fields: ['modelFolder'] },
  { key: 'createdAt', fields: ['createdAt'] },
  { key: 'endpointUrl', fields: ['endpointUrl'], defaultHidden: true },
  { key: 'tags', fields: ['tags'], defaultHidden: true },
  { key: 'updatedAt', fields: ['updatedAt'], defaultHidden: true },
  { key: 'openToPublic', fields: ['openToPublic'], defaultHidden: true },
  { key: 'resourceGroup', fields: ['resourceGroup'], defaultHidden: true },
];

const DEPLOYMENT_ROW_FIELDS =
  'Row fields: id (deployment UUID), name, revisionNumber, status, runningReplicas, desiredReplicas, modelFolder, createdAt, endpointUrl, tags, updatedAt, openToPublic, resourceGroup.';

/** `/deployments/<id>` next to the list's own path. */
const detailPath = (listPathname: string, id: string): string =>
  `${listPathname.replace(/\/$/, '')}/${encodeURIComponent(id)}`;

export interface WebMCPDeploymentListToolsProps {
  deploymentsFrgmt: WebMCPDeploymentTools_deployments$key;
  columnOverrides?: BAITableColumnOverrideRecord | null;
  page: number;
  pageSize: number;
  total?: number | null;
  /** The list's URL params (`statusCategory`, `filter`, `order`). */
  viewParams: Readonly<Record<string, ViewParamValue>>;
  /** Global id of the deployment whose settings modal is open. */
  editingDeploymentId?: string | null;
}

const DeploymentListToolsRegistrar: React.FC<
  WebMCPDeploymentListToolsProps
> = ({
  deploymentsFrgmt,
  columnOverrides,
  page,
  pageSize,
  total,
  viewParams,
  editingDeploymentId,
}) => {
  'use memo';
  const { pathname } = useLocation();

  const deployments = useFragment(
    graphql`
      fragment WebMCPDeploymentTools_deployments on ModelDeployment
      @relay(plural: true) {
        id
        metadata {
          name
          status
          tags
          createdAt
          updatedAt
          resourceGroupName
        }
        networkAccess {
          endpointUrl
          openToPublic
        }
        replicaState {
          desiredReplicaCount
        }
        runningReplicas: replicas(filter: { status: { equals: RUNNING } }) {
          count
        }
        currentRevision @since(version: "26.4.3") {
          revisionNumber
          modelMountConfig {
            vfolder {
              name
            }
          }
        }
      }
    `,
    deploymentsFrgmt,
  );

  const rows: Array<PageToolRow> = _.map(
    filterOutNullAndUndefined(deployments),
    (deployment) => ({
      id: toLocalId(deployment.id) ?? deployment.id,
      name: deployment.metadata?.name ?? null,
      revisionNumber: deployment.currentRevision?.revisionNumber ?? null,
      status: deployment.metadata?.status ?? null,
      runningReplicas: deployment.runningReplicas?.count ?? 0,
      desiredReplicas: deployment.replicaState?.desiredReplicaCount ?? 0,
      modelFolder:
        deployment.currentRevision?.modelMountConfig?.vfolder?.name ?? null,
      createdAt: deployment.metadata?.createdAt ?? null,
      endpointUrl: deployment.networkAccess?.endpointUrl ?? null,
      tags: deployment.metadata?.tags ?? [],
      updatedAt: deployment.metadata?.updatedAt ?? null,
      openToPublic: deployment.networkAccess?.openToPublic ?? null,
      resourceGroup: deployment.metadata?.resourceGroupName ?? null,
    }),
  );
  const list = visibleRowsResult({
    rows,
    columns: DEPLOYMENT_TOOL_COLUMNS,
    columnOverrides,
    page,
    pageSize,
    total,
  });
  const openedId = editingDeploymentId
    ? (toLocalId(editingDeploymentId) ?? editingDeploymentId)
    : null;

  usePageReadTools({
    noun: 'deployment',
    plural: 'deployments',
    rowFields: DEPLOYMENT_ROW_FIELDS,
    currentMeaning:
      'on the list, the deployment whose settings modal is open; path opens its detail page',
    readRows: () => list,
    readViewState: () =>
      viewStateResult(pathname, { ...viewParams, current: page, pageSize }),
    readCurrent: () =>
      openedItem(list.rows, openedId, detailPath(pathname, openedId ?? '')),
  });

  return null;
};

/**
 * `bai_list_visible_deployment`, `bai_get_deployment_filter` and
 * `bai_get_current_deployment` for the deployment list (ADR 0009).
 */
const WebMCPDeploymentListTools: React.FC<WebMCPDeploymentListToolsProps> = (
  props,
) => {
  'use memo';
  const isActive = useBAIWebMCPActive();
  return isActive ? <DeploymentListToolsRegistrar {...props} /> : null;
};

export default WebMCPDeploymentListTools;

/** The scalars `DeploymentDetailPage` renders for the deployment it shows. */
export interface ViewedDeployment {
  id: string;
  name: string | null;
  status: string | null;
  projectId: string | null;
  projectName: string | null;
  endpointUrl: string | null;
  openToPublic: boolean | null;
  runningReplicas: number;
  desiredReplicas: number;
}

const DeploymentDetailToolsRegistrar: React.FC<{
  deployment: ViewedDeployment;
}> = ({ deployment }) => {
  'use memo';
  const { pathname } = useLocation();
  useWebMCPTool(
    createCurrentItemTool({
      noun: 'deployment',
      currentMeaning:
        'the deployment shown on this detail page (fields: id, name, status, projectId, projectName, endpointUrl, openToPublic, runningReplicas, desiredReplicas)',
      readCurrent: () => ({ ...deployment, path: pathname }),
    }),
  );
  return null;
};

/** `bai_get_current_deployment` on `/deployments/<id>`, where the deployment is the page. */
export const WebMCPDeploymentDetailTools: React.FC<{
  deployment: ViewedDeployment;
}> = (props) => {
  'use memo';
  const isActive = useBAIWebMCPActive();
  return isActive ? <DeploymentDetailToolsRegistrar {...props} /> : null;
};
