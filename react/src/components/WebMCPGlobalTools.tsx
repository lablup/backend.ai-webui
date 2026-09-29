/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { maskString } from '../helper';
import {
  isNavigableMenuKey,
  readMainHeading,
  resolveAppPath,
  searchParamsToRecord,
} from '../helper/webmcpNavigation';
import { useSuspendedBackendaiClient, useWebUINavigate } from '../hooks';
import { useCurrentUserRole } from '../hooks/backendai';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { useCurrentRouteLabel } from '../hooks/useCurrentRouteLabel';
import {
  useActiveProjectName,
  useCurrentMenuKey,
  useRouteScope,
} from '../hooks/useRouteScope';
import { useWebUIMenuItems } from '../hooks/useWebUIMenuItems';
import {
  useBAIWebMCPActive,
  useWebMCPTool,
  webMCPError,
  type WebMCPInputSchema,
  type WebMCPTool,
} from 'backend.ai-ui';
import React from 'react';
import { useLocation } from 'react-router-dom';

/** The email as the header shows it: masked when `maskUserInfo` is on. */
export const displayedEmail = (
  email: string | null | undefined,
  maskUserInfo: boolean | undefined,
): string | null => {
  if (!email) return null;
  if (!maskUserInfo) return email;
  const at = email.indexOf('@');
  const localLength = at < 0 ? email.length : at;
  return maskString(email, '*', 2, Math.max(localLength - 2, 0));
};

const NO_INPUT: WebMCPInputSchema = {
  type: 'object',
  properties: {},
  additionalProperties: false,
};

export interface WhoamiInfo {
  email: string | null;
  role: string | null;
  project: { id: string | null; name: string | null } | null;
  apiEndpoint: string | null;
  webuiVersion: string | null;
}

export const createWhoamiTool = (info: WhoamiInfo): WebMCPTool => ({
  name: 'bai_whoami',
  description:
    'The user signed in to this Backend.AI WebUI tab: email, role, current project (id and name), the Backend.AI API endpoint and the WebUI version.',
  inputSchema: NO_INPUT,
  annotations: { readOnlyHint: true, untrustedContentHint: true },
  execute: () => info,
});

export interface CurrentPageInfo {
  path: string;
  menuKey: string | null;
  title: string | null;
  scope: string;
  project: string | null;
  searchParams: Record<string, string | Array<string>>;
}

export const createCurrentPageTool = (
  readPage: () => CurrentPageInfo,
): WebMCPTool => ({
  name: 'bai_get_current_page',
  description:
    'Where this Backend.AI WebUI tab is: pathname, menu key, translated page title, route scope (project, projectAdmin or admin), the project in the URL, search params and the main heading on screen.',
  inputSchema: NO_INPUT,
  annotations: { readOnlyHint: true, untrustedContentHint: true },
  execute: () => ({ ...readPage(), heading: readMainHeading() }),
});

export interface NavigablePage {
  key: string;
  label: string;
  to: string;
}

const NAVIGATION_SETTLE_MS = 300;

export const createNavigateTool = ({
  pages,
  activeProjectName,
  navigate,
  settleMs = NAVIGATION_SETTLE_MS,
}: {
  pages: ReadonlyArray<NavigablePage>;
  activeProjectName: string | undefined;
  navigate: (to: string) => void;
  settleMs?: number;
}): WebMCPTool => ({
  name: 'bai_navigate',
  description:
    'Open a page in this Backend.AI WebUI tab. Pass exactly one of "page" (a menu key the user can access) or "path" (an app path under /project/<name>/ or /admin/; a flat menu path such as /session?x=1 opens in the current project). Only navigates — never submits or deletes anything. Returns the resulting path and tab title. To fill a new session form, open /session/start and call bai_prepare_session there.',
  inputSchema: {
    type: 'object',
    properties: {
      page: {
        type: 'string',
        enum: pages.map((page) => page.key),
        description: `Menu key. ${pages.map((page) => `${page.key} = ${page.label}`).join('; ')}.`,
      },
      path: {
        type: 'string',
        minLength: 1,
        maxLength: 2048,
        description: 'Same-origin app path, optionally with ?search and #hash.',
      },
    },
    additionalProperties: false,
  },
  annotations: { untrustedContentHint: true },
  execute: async (input) => {
    const { page, path } = input as { page?: string; path?: string };
    if ((page === undefined) === (path === undefined)) {
      return webMCPError(
        'invalid_input',
        'Pass exactly one of "page" or "path".',
      );
    }
    let to: string;
    if (page !== undefined) {
      const target = pages.find((candidate) => candidate.key === page);
      if (!target) {
        return webMCPError('page_not_available', `No page "${page}".`);
      }
      to = target.to;
    } else {
      const target = resolveAppPath(
        path as string,
        activeProjectName,
        window.location.origin,
      );
      if (!target.ok) return webMCPError(target.code, target.message);
      to = target.to;
    }
    navigate(to);
    // Lets the router commit and `RouteDocumentTitle` update before answering.
    await new Promise((resolve) => window.setTimeout(resolve, settleMs));
    const { pathname, search, hash } = window.location;
    return { path: `${pathname}${search}${hash}`, title: document.title };
  },
});

const WebMCPGlobalToolsRegistrar: React.FC = () => {
  'use memo';
  const baiClient = useSuspendedBackendaiClient();
  const role = useCurrentUserRole();
  // Sanctioned global reader (ADR 0001): bai_whoami reports the ambient project.
  const currentProject = useCurrentProjectValue();
  const activeProjectName = useActiveProjectName();
  const { generalMenu, adminMenu } = useWebUIMenuItems();
  const menuKey = useCurrentMenuKey();
  const scope = useRouteScope();
  const label = useCurrentRouteLabel();
  const location = useLocation();
  const navigate = useWebUINavigate();

  const pages: Array<NavigablePage> = [...generalMenu, ...adminMenu]
    .filter((item) => item.to && !item.disabled && isNavigableMenuKey(item.key))
    .map((item) => ({
      key: item.key,
      label: item.labelText,
      to: item.to as string,
    }));

  useWebMCPTool(
    createWhoamiTool({
      email: displayedEmail(baiClient.email, baiClient._config?.maskUserInfo),
      role: role ?? null,
      project: currentProject?.id
        ? { id: currentProject.id, name: currentProject.name ?? null }
        : null,
      apiEndpoint: baiClient._config?.endpoint ?? null,
      webuiVersion: globalThis.packageVersion ?? null,
    }),
  );

  useWebMCPTool(
    createCurrentPageTool(() => ({
      path: `${location.pathname}${location.search}${location.hash}`,
      menuKey: menuKey ?? null,
      title: label ?? null,
      scope,
      project: scope === 'admin' ? null : (activeProjectName ?? null),
      searchParams: searchParamsToRecord(location.search),
    })),
  );

  useWebMCPTool(
    createNavigateTool({
      pages,
      activeProjectName,
      navigate: (to) => navigate(to),
    }),
    [activeProjectName],
  );

  return null;
};

/** The app-shell WebMCP tools (ADR 0009). Mount inside a Suspense boundary: it waits for login. */
const WebMCPGlobalTools: React.FC = () => {
  'use memo';
  const isActive = useBAIWebMCPActive();
  return isActive ? <WebMCPGlobalToolsRegistrar /> : null;
};

export default WebMCPGlobalTools;
