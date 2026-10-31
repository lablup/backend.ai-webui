/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { SessionLauncherWebMCPToolFoldersQuery } from '../__generated__/SessionLauncherWebMCPToolFoldersQuery.graphql';
import { generateUUID } from '../helper/uuid';
import { AGENT_PREFILL_PARAM } from '../helper/webmcpConstants';
import {
  buildSessionPrefill,
  isRequestedImage,
  MAX_PREFILL_FOLDERS,
  parseFolderNames,
  PREPARE_SESSION_INPUT_SCHEMA,
  type FolderLookup,
  type PrepareSessionInput,
  type ResolvedEnvironment,
} from '../helper/webmcpSessionPrefill';
import { useSuspendedBackendaiClient } from '../hooks';
import { useMountableStorageHosts } from '../hooks/useMountableStorageHosts';
import type { ProjectContext } from '../types/projectContext';
import {
  isAutoMountFolderName,
  mountableVFolderFilter,
  mountableVFolderScope,
  useWebMCPTool,
  webMCPError,
  type WebMCPTool,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React from 'react';
import { fetchQuery, graphql, useRelayEnvironment } from 'react-relay';

/** Interactive and batch launchers both have five steps; the last is the review. */
export const LAUNCHER_REVIEW_STEP = 4;

export const PREPARE_SESSION_NEXT_STEP =
  'Give webui_url to the user. They open it in their own signed-in browser, review the form and press Launch (the user must do this; nothing has been started).';

export const PREPARE_SESSION_NOTHING_FILLED =
  'Nothing could be filled, so the launcher was left as it was. Fix the rejected fields and call again.';

export const PREPARE_SESSION_NO_INPUT =
  'No field to fill was given, so the launcher was left as it was. Pass at least one field.';

export const PREPARE_SESSION_PARTLY_FILLED =
  'The launcher form in this tab was replaced, but not everything was applied (see rejected; a rejected image means the launcher selected another one). Fix the rejected fields and call again, or tell the user what was not applied. Nothing has been started.';

export const PREPARE_SESSION_LINK_TOO_LONG =
  'webui_url is long enough that a server may refuse it (see warnings). Shorten startupCommand or mount fewer folders and call again, or tell the user the link may fail to open. Nothing has been started.';

// Below the 8 KB request line of default aiohttp and nginx; not measured on a deployment.
export const WEBUI_URL_SOFT_LIMIT = 6000;

export interface PrepareSessionToolDeps {
  /** Looks the requested names up among the folders this user can mount here. */
  findFolders: (names: ReadonlyArray<string>) => Promise<FolderLookup>;
  allowCustomResourceAllocation: boolean;
  /** Navigates this tab to the launcher with the given `?search`. */
  openLauncher: (search: string) => void;
  /** The launcher form's image once the form opened for `prefillId` resolved it. */
  readEnvironment: (prefillId: string) => ResolvedEnvironment | null;
  pollMs?: number;
  timeoutMs?: number;
}

const wait = (ms: number) =>
  new Promise((resolve) => window.setTimeout(resolve, ms));

/** `bai_prepare_session` (ADR 0017). It can only navigate: no submit or mutation is reachable from here. */
export const createPrepareSessionTool = ({
  findFolders,
  allowCustomResourceAllocation,
  openLauncher,
  readEnvironment,
  pollMs = 100,
  timeoutMs = 3000,
}: PrepareSessionToolDeps): WebMCPTool => ({
  name: 'bai_prepare_session',
  description:
    'Fill the session launcher form in this tab for the user to review. Reopens the launcher with the given values on its review step and marks the form as filled by an AI agent. Does NOT start the session and never submits: the user reviews the form and presses Launch. Returns { path, webui_url, applied, rejected: [{ field, reason }], nextStep, unverified?, warnings? }; webui_url reopens the same prefilled form in any browser signed in as this user. applied holds values set as given or read back from the form; unverified holds values written to the form that its rules or the server may still change, so tell the user to check them; warnings holds problems with the webui_url link itself. nextStep says what to do with the result: hand webui_url over only when it says so. When nothing can be filled the launcher is left alone and path and webui_url are null. Omitted fields keep the launcher defaults; the launcher auto-selects a resource preset when no amounts are given.',
  inputSchema: PREPARE_SESSION_INPUT_SCHEMA,
  annotations: { untrustedContentHint: true },
  execute: async (input) => {
    const request = input as PrepareSessionInput;
    // The launcher's own browser path, so a router basename is kept.
    const launcherPathname = window.location.pathname;
    const folderNames = parseFolderNames(request.folders ?? '');
    const { folders, truncated } =
      folderNames.length > 0 && folderNames.length <= MAX_PREFILL_FOLDERS
        ? await findFolders(folderNames)
        : { folders: [], truncated: false };
    // `execute` outlives the tool's unmount, and `openLauncher` would pull the tab back.
    if (window.location.pathname !== launcherPathname) {
      return webMCPError(
        'launcher_closed',
        'The session launcher was left while this call ran, so nothing was filled.',
      );
    }
    const { formValues, applied, rejected, unverified } = buildSessionPrefill(
      request,
      { folders, foldersTruncated: truncated, allowCustomResourceAllocation },
    );
    if (_.isEmpty(formValues)) {
      return {
        path: null,
        webui_url: null,
        applied,
        rejected,
        nextStep:
          rejected.length > 0
            ? PREPARE_SESSION_NOTHING_FILLED
            : PREPARE_SESSION_NO_INPUT,
      };
    }

    const prefillId = generateUUID();
    const params = new URLSearchParams();
    params.set('step', String(LAUNCHER_REVIEW_STEP));
    params.set('formValues', JSON.stringify(formValues));
    params.set(AGENT_PREFILL_PARAM, prefillId);
    const search = `?${params.toString()}`;
    const path = `${launcherPathname}${search}`;
    openLauncher(search);

    if (request.image !== undefined) {
      let environment: ResolvedEnvironment | null = null;
      // A deadline, not a count: hidden tabs throttle timers.
      const deadline = Date.now() + timeoutMs;
      while (!environment && Date.now() < deadline) {
        await wait(pollMs);
        environment = readEnvironment(prefillId);
      }
      if (!environment) {
        unverified.push({
          field: 'image',
          reason:
            'The launcher had not resolved the image yet; check its Environments step.',
        });
      } else if (!isRequestedImage(request.image, environment)) {
        rejected.push({
          field: 'image',
          reason: `No available image matches "${request.image}"; the launcher selected "${environment.version ?? ''}" instead.`,
        });
      } else if (environment.manual) {
        unverified.push({
          field: 'image',
          reason:
            'No registered image matches this name; the launcher kept it as a manual image, so a typo fails only at launch.',
        });
      } else {
        applied.image = environment.version;
      }
    }

    const webuiUrl = new URL(path, window.location.origin).href;
    const isLinkTooLong = webuiUrl.length > WEBUI_URL_SOFT_LIMIT;

    return {
      path,
      webui_url: webuiUrl,
      applied,
      rejected,
      ...(unverified.length > 0 && { unverified }),
      ...(isLinkTooLong && {
        warnings: [
          {
            field: 'webui_url',
            reason: `This link is ${webuiUrl.length} characters long and a server may refuse it.`,
          },
        ],
      }),
      nextStep:
        rejected.length > 0
          ? PREPARE_SESSION_PARTLY_FILLED
          : isLinkTooLong
            ? PREPARE_SESSION_LINK_TOO_LONG
            : PREPARE_SESSION_NEXT_STEP,
    };
  },
});

interface SessionLauncherWebMCPToolProps {
  project: ProjectContext;
  openLauncher: PrepareSessionToolDeps['openLauncher'];
  readEnvironment: PrepareSessionToolDeps['readEnvironment'];
}

const FOLDER_LOOKUP_LIMIT = 100;

/**
 * Registers `bai_prepare_session` for the launcher. Requested folders are looked
 * up by name only when the tool is called; registering it sends nothing.
 */
const SessionLauncherWebMCPTool: React.FC<SessionLauncherWebMCPToolProps> = ({
  project,
  openLauncher,
  readEnvironment,
}) => {
  'use memo';
  const baiClient = useSuspendedBackendaiClient();
  const mountableHosts = useMountableStorageHosts(project.id);
  const relayEnvironment = useRelayEnvironment();

  const findFolders: PrepareSessionToolDeps['findFolders'] = async (names) => {
    const result = await fetchQuery<SessionLauncherWebMCPToolFoldersQuery>(
      relayEnvironment,
      graphql`
        query SessionLauncherWebMCPToolFoldersQuery(
          $scope: VFolderScope!
          $filter: VFolderFilter
          $orderBy: [VFolderOrderBy!]
          $limit: Int!
        ) {
          scopedVFoldersV2(
            scope: $scope
            filter: $filter
            orderBy: $orderBy
            limit: $limit
          ) {
            edges {
              node {
                entityId
                accessControl {
                  permission
                }
                metadata {
                  name
                }
              }
            }
          }
        }
      `,
      {
        scope: mountableVFolderScope(baiClient.user_uuid, project.id),
        filter: {
          AND: [
            mountableVFolderFilter(mountableHosts),
            {
              status: { equals: 'READY' },
              OR: names.map((name) => ({ name: { equals: name } })),
            },
          ],
        },
        orderBy: [{ field: 'NAME', direction: 'ASC' }],
        limit: FOLDER_LOOKUP_LIMIT,
      },
      { fetchPolicy: 'network-only' },
    ).toPromise();
    const edges = result?.scopedVFoldersV2?.edges ?? [];
    return {
      // One name can match several rows, so a full page can hide a second match.
      truncated: edges.length >= FOLDER_LOOKUP_LIMIT,
      // Dotfile folders mount on their own, and NONE cannot be mounted.
      folders: _.compact(
        _.map(edges, ({ node }) =>
          isAutoMountFolderName(node.metadata.name) ||
          node.accessControl.permission === 'NONE'
            ? null
            : { vfolderId: node.entityId, name: node.metadata.name },
        ),
      ),
    };
  };

  useWebMCPTool(
    createPrepareSessionTool({
      findFolders,
      allowCustomResourceAllocation:
        !!baiClient._config?.allowCustomResourceAllocation,
      openLauncher,
      readEnvironment,
    }),
  );

  return null;
};

export default SessionLauncherWebMCPTool;
