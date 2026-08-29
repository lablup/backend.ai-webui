/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * The two WebMCP tools that exist on every page (FR-3764): `bai_whoami` and
 * `bai_open_resource`. Mounted once next to `<RouteDocumentTitle/>`, inside the
 * connected branch so the tab's Backend.AI client is available.
 *
 * Both are inert unless the dev server was started with `VITE_WEBMCP=on` — see
 * `helper/webmcp.ts` and `vite-plugins/webmcp.ts`.
 */
import { buildPath } from '../helper/pathBuilder';
import {
  LIST_RESOURCES_WITH_STATUS,
  LIST_RESOURCES_WITHOUT_STATUS,
  resourceLocation,
  type DeploymentView,
  type ListResource,
  type ResourceLocation,
  type ResourceRef,
  type SessionView,
} from '../helper/resourcePath';
import { webmcpError, webmcpResult } from '../helper/webmcp';
import {
  useSuspendedBackendaiClient,
  useWebUINavigate,
  type BackendAIClient,
} from '../hooks';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { useActiveProjectName } from '../hooks/useRouteScope';
import { useWebMCPTool, type WebMCPTool } from '../hooks/useWebMCPTool';
import type { CallToolResult, InputSchema } from '@mcp-b/webmcp-types';
import * as _ from 'lodash-es';
import React from 'react';
import type { NavigateFunction } from 'react-router-dom';

const SESSION_VIEWS: ReadonlyArray<SessionView> = [
  'detail',
  'scheduling_history',
  'container_log',
];
const DEPLOYMENT_VIEWS: ReadonlyArray<DeploymentView> = [
  'detail',
  'revisions',
  'access_tokens',
];
const LIST_RESOURCES: ReadonlyArray<ListResource> = [
  ...LIST_RESOURCES_WITH_STATUS,
  ...LIST_RESOURCES_WITHOUT_STATUS,
];

const isSessionView = (value: string): value is SessionView =>
  _.includes(SESSION_VIEWS, value as SessionView);
const isDeploymentView = (value: string): value is DeploymentView =>
  _.includes(DEPLOYMENT_VIEWS, value as DeploymentView);
const isListResource = (value: string): value is ListResource =>
  _.includes(LIST_RESOURCES, value as ListResource);

/** `helper/resourcePath`'s `ResourceRef` union, restated as JSON Schema. */
export const OPEN_RESOURCE_INPUT_SCHEMA: InputSchema = {
  type: 'object',
  required: ['type'],
  properties: {
    type: {
      type: 'string',
      enum: [
        'session',
        'vfolder',
        'deployment',
        'model_card',
        'role',
        'artifact',
        'list',
      ],
      description: 'Which kind of resource to open.',
    },
  },
  oneOf: [
    {
      title: 'session',
      properties: {
        type: { const: 'session' },
        id: { type: 'string', description: 'Session UUID (row_id).' },
        view: { type: 'string', enum: SESSION_VIEWS },
      },
      required: ['type', 'id'],
      additionalProperties: false,
    },
    {
      title: 'vfolder',
      properties: {
        type: { const: 'vfolder' },
        id: { type: 'string', description: 'VFolder id or name.' },
        path: { type: 'string', description: 'Path inside the folder.' },
      },
      required: ['type', 'id'],
      additionalProperties: false,
    },
    {
      title: 'deployment',
      properties: {
        type: { const: 'deployment' },
        id: { type: 'string', description: 'Deployment (endpoint) id.' },
        view: { type: 'string', enum: DEPLOYMENT_VIEWS },
      },
      required: ['type', 'id'],
      additionalProperties: false,
    },
    {
      title: 'model_card',
      properties: { type: { const: 'model_card' }, id: { type: 'string' } },
      required: ['type', 'id'],
      additionalProperties: false,
    },
    {
      title: 'role',
      properties: { type: { const: 'role' }, id: { type: 'string' } },
      required: ['type', 'id'],
      additionalProperties: false,
    },
    {
      title: 'artifact',
      properties: { type: { const: 'artifact' }, id: { type: 'string' } },
      required: ['type', 'id'],
      additionalProperties: false,
    },
    {
      title: 'list',
      properties: {
        type: { const: 'list' },
        resource: { type: 'string', enum: [...LIST_RESOURCES] },
        filter: {
          type: 'string',
          description:
            'Page filter, passed through verbatim (free text or JSON, per page).',
        },
        statusCategory: {
          type: 'string',
          description: `Status/category filter. Not accepted for: ${LIST_RESOURCES_WITHOUT_STATUS.join(', ')}.`,
        },
      },
      required: ['type', 'resource'],
      additionalProperties: false,
    },
  ],
};

/** A validated ref, or the error code + message to answer the tool call with. */
export type ParsedResourceRef =
  { ref: ResourceRef } | { code: string; message: string };

const optionalString = (value: unknown): string | undefined =>
  _.isString(value) ? value : undefined;

/**
 * Validates raw tool arguments against the `ResourceRef` union. Both the
 * polyfill and the relay already enforce the schema, so this is the gate for
 * callers that skip them — and for the rules the schema cannot express.
 */
export const parseResourceRef = (
  args: Record<string, unknown>,
): ParsedResourceRef => {
  const type = args?.type;
  const id = args?.id;
  const needsId = (): ParsedResourceRef | null =>
    _.isString(id) && id.length > 0
      ? null
      : { code: 'missing_id', message: `"id" is required for type "${type}".` };

  switch (type) {
    case 'session': {
      const view = optionalString(args.view);
      if (view !== undefined && !isSessionView(view)) {
        return {
          code: 'invalid_view',
          message: `"view" must be one of ${SESSION_VIEWS.join(', ')}.`,
        };
      }
      return (
        needsId() ?? {
          ref: {
            type: 'session',
            id: id as string,
            ...(view !== undefined ? { view } : {}),
          },
        }
      );
    }
    case 'vfolder':
      return (
        needsId() ?? {
          ref: {
            type: 'vfolder',
            id: id as string,
            ...(optionalString(args.path) !== undefined
              ? { path: args.path as string }
              : {}),
          },
        }
      );
    case 'deployment': {
      const view = optionalString(args.view);
      if (view !== undefined && !isDeploymentView(view)) {
        return {
          code: 'invalid_view',
          message: `"view" must be one of ${DEPLOYMENT_VIEWS.join(', ')}.`,
        };
      }
      return (
        needsId() ?? {
          ref: {
            type: 'deployment',
            id: id as string,
            ...(view !== undefined ? { view } : {}),
          },
        }
      );
    }
    case 'model_card':
    case 'role':
    case 'artifact':
      return needsId() ?? { ref: { type, id: id as string } };
    case 'list': {
      const resource = optionalString(args.resource);
      if (resource === undefined || !isListResource(resource)) {
        return {
          code: 'unknown_list_resource',
          message: `"resource" must be one of ${LIST_RESOURCES.join(', ')}.`,
        };
      }
      const statusCategory = optionalString(args.statusCategory);
      const filter = optionalString(args.filter);
      if (
        statusCategory !== undefined &&
        _.includes(LIST_RESOURCES_WITHOUT_STATUS, resource)
      ) {
        return {
          code: 'invalid_status_category',
          message: `The "${resource}" list page has no status filter.`,
        };
      }
      return {
        ref: {
          type: 'list',
          resource,
          ...(filter !== undefined ? { filter } : {}),
          ...(statusCategory !== undefined ? { statusCategory } : {}),
        } as ResourceRef,
      };
    }
    default:
      return {
        code: 'unknown_type',
        message: `Unknown resource type ${JSON.stringify(type)}.`,
      };
  }
};

/**
 * `resourceLocation` rebased onto the scope-aware routing scheme, mirroring
 * what the in-app links do (`useProjectPath()` + `resourceLocation().search`):
 * project-scoped flat paths become `/project/<name>/…`; `/admin/*` paths are
 * project-agnostic and pass through.
 */
export const scopedResourceLocation = (
  ref: ResourceRef,
  projectName?: string,
): ResourceLocation => {
  const location = resourceLocation(ref);
  if (_.startsWith(location.pathname, '/admin/')) {
    return location;
  }
  const [, feature, ...rest] = location.pathname.split('/');
  const base = buildPath('project', feature, projectName);
  return {
    ...location,
    pathname: rest.length > 0 ? `${base}/${rest.join('/')}` : base,
  };
};

const toHref = ({ pathname, search, hash }: ResourceLocation): string =>
  `${pathname}${search ? `?${search}` : ''}${hash}`;

/**
 * Lets the router commit before the tool answers, so `document.title` reflects
 * the destination. Best effort: a lazily loaded page may still be rendering.
 */
const settleAfterNavigation = async (): Promise<void> => {
  await new Promise((resolve) => {
    window.setTimeout(resolve, 200);
  });
};

export const createOpenResourceTool = (
  navigate: NavigateFunction,
  projectName?: string,
): WebMCPTool => ({
  name: 'bai_open_resource',
  description:
    'Navigate this Backend.AI WebUI tab to a resource: a session, vfolder, deployment, model card, role or artifact by id, or a resource list page. Returns the resulting path and document title.',
  inputSchema: OPEN_RESOURCE_INPUT_SCHEMA,
  execute: async (args): Promise<CallToolResult> => {
    const parsed = parseResourceRef(args ?? {});
    if (!('ref' in parsed)) {
      return webmcpError(parsed.code, parsed.message);
    }
    const location = scopedResourceLocation(parsed.ref, projectName);
    navigate(location);
    await settleAfterNavigation();
    return webmcpResult({ path: toHref(location), title: document.title });
  },
});

export const createWhoamiTool = (
  baiClient: BackendAIClient,
  projectName: string | null,
): WebMCPTool => ({
  name: 'bai_whoami',
  description:
    'Identity of the user logged in to this Backend.AI WebUI tab, plus where the tab currently is: email, role, domain, manager endpoint, current project, path and document title.',
  inputSchema: { type: 'object', properties: {} },
  annotations: { readOnlyHint: true },
  execute: (): CallToolResult =>
    webmcpResult({
      email: baiClient.email ?? null,
      role: baiClient.is_superadmin
        ? 'superadmin'
        : baiClient.is_admin
          ? 'admin'
          : 'user',
      domain: baiClient._config?.domainName ?? null,
      endpoint: baiClient._config?.endpoint ?? null,
      project: projectName,
      path: `${window.location.pathname}${window.location.search}${window.location.hash}`,
      title: document.title,
    }),
});

/**
 * Registers the page-independent `bai_*` tools. Renders nothing.
 */
const WebMCPGlobalTools: React.FC = () => {
  'use memo';
  const baiClient = useSuspendedBackendaiClient();
  // Sanctioned ambient read (ADR-0001): globally mounted, and reporting the
  // ambient project is precisely what `bai_whoami` is asked for.
  const currentProject = useCurrentProjectValue();
  const activeProjectName = useActiveProjectName();
  const navigate = useWebUINavigate();

  useWebMCPTool(createWhoamiTool(baiClient, currentProject?.name ?? null), [
    baiClient,
    currentProject?.name,
  ]);
  useWebMCPTool(createOpenResourceTool(navigate, activeProjectName), [
    navigate,
    activeProjectName,
  ]);

  return null;
};

export default WebMCPGlobalTools;
