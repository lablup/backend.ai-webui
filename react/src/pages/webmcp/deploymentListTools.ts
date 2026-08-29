/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * `/deployments` (FR-3766): `bai_list_visible_deployment`,
 * `bai_get_deployment_filter` and `bai_get_current_deployment`.
 *
 * The list page and `/deployments/:id` are sibling routes, so they never mount
 * together — `bai_get_current_deployment` is registered by whichever one is on
 * screen (`useDeploymentDetailWebMCPTools` below covers the detail page, where
 * "current" is the deployment being viewed rather than one opened in a modal).
 */
import { resourcePath } from '../../helper/resourcePath';
import {
  createCurrentItemTool,
  hiddenColumnKeys,
  resolveOpenedRow,
  usePageReadTools,
  type PageToolRow,
  type TableColumnOverrides,
} from '../../helper/webmcpPageTools';
import { useWebMCPTool } from '../../hooks/useWebMCPTool';
import type { JsonSchemaForInference } from '@mcp-b/webmcp-types';
import { toLocalId } from 'backend.ai-ui';
import * as _ from 'lodash-es';

/** The node fields `DeploymentListPageQuery` selects for these tools. */
export interface DeploymentRowSource {
  readonly id: string;
  readonly metadata?: {
    readonly name?: string | null;
    readonly status?: string | null;
  } | null;
  readonly currentRevision?: {
    readonly revisionNumber?: number | null;
  } | null;
}

export const DEPLOYMENT_ROW_PROPERTIES: Readonly<
  Record<string, JsonSchemaForInference>
> = {
  id: { type: 'string', description: 'Deployment (endpoint) id.' },
  name: { type: 'string' },
  status: { type: 'string' },
  revision: { type: 'integer', description: 'Current revision number.' },
};

/** `BAIModelDeploymentNodes` column key -> the row field it renders. */
const DEPLOYMENT_COLUMN_FIELDS: Readonly<Record<string, string>> = {
  name: 'name',
  status: 'status',
  currentRevisionNumber: 'revision',
};

export const toDeploymentRow = (node: DeploymentRowSource): PageToolRow => ({
  id: toLocalId(node.id) ?? node.id,
  name: node.metadata?.name ?? null,
  status: node.metadata?.status ?? null,
  revision: node.currentRevision?.revisionNumber ?? null,
});

const deploymentPath = (id: string): string =>
  resourcePath({ type: 'deployment', id });

export interface DeploymentListWebMCPToolsInput {
  deployments: ReadonlyArray<DeploymentRowSource>;
  columnOverrides?: TableColumnOverrides;
  pagination: { current: number; pageSize: number; total?: number | null };
  queryParams: {
    /** nuqs `parseAsJson` value; reported as the URL string it round-trips as. */
    filter?: object | null;
    statusCategory?: string | null;
    order?: string | null;
  };
  /** Global id of the deployment whose settings modal is open, if any. */
  openedDeploymentGlobalId?: string | null;
}

export const useDeploymentListWebMCPTools = ({
  deployments,
  columnOverrides,
  pagination,
  queryParams,
  openedDeploymentGlobalId,
}: DeploymentListWebMCPToolsInput): void => {
  const rows = _.map(deployments, toDeploymentRow);
  const hiddenColumns = _.compact(
    _.map(
      hiddenColumnKeys(columnOverrides),
      (key) => DEPLOYMENT_COLUMN_FIELDS[key],
    ),
  );
  const filterParam = _.isEmpty(queryParams.filter)
    ? null
    : JSON.stringify(queryParams.filter);
  const openedId = openedDeploymentGlobalId
    ? (toLocalId(openedDeploymentGlobalId) ?? openedDeploymentGlobalId)
    : null;

  usePageReadTools(
    {
      noun: 'deployment',
      plural: 'deployments',
      resource: 'deployment',
      rowProperties: DEPLOYMENT_ROW_PROPERTIES,
      rows,
      hiddenColumns,
      pagination,
      filter: {
        filter: filterParam,
        statusCategory: queryParams.statusCategory ?? null,
        order: queryParams.order ?? null,
        current: pagination.current,
        pageSize: pagination.pageSize,
      },
      current: resolveOpenedRow(rows, openedId, deploymentPath),
    },
    [
      JSON.stringify(rows),
      JSON.stringify(hiddenColumns),
      pagination.current,
      pagination.pageSize,
      pagination.total,
      filterParam,
      queryParams.statusCategory,
      queryParams.order,
      openedId,
    ],
  );
};

/**
 * `/deployments/:id` — only `bai_get_current_deployment`: the detail page is
 * not a list, so it has no rows and no filter to report.
 */
export const useDeploymentDetailWebMCPTools = (
  deployment: DeploymentRowSource | null | undefined,
): void => {
  const row = deployment ? toDeploymentRow(deployment) : null;
  const current = row ? { ...row, webui_path: deploymentPath(row.id) } : null;

  useWebMCPTool(
    createCurrentItemTool({
      noun: 'deployment',
      plural: 'deployments',
      resource: 'deployment',
      rowProperties: DEPLOYMENT_ROW_PROPERTIES,
      rows: [],
      pagination: { current: 1, pageSize: 0 },
      filter: {},
      current,
    }),
    [JSON.stringify(current)],
  );
};
