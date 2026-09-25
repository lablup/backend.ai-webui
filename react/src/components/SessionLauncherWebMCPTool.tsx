/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { SessionLauncherWebMCPToolFoldersQuery } from '../__generated__/SessionLauncherWebMCPToolFoldersQuery.graphql';
import {
  AGENT_PREFILL_PARAM,
  buildSessionPrefill,
  isRequestedImage,
  parseFolderNames,
  PREPARE_SESSION_INPUT_SCHEMA,
  type MountableFolder,
  type PrepareSessionInput,
  type PrefillRejection,
  type ResolvedEnvironment,
} from '../helper/webmcpSessionPrefill';
import { useSuspendedBackendaiClient } from '../hooks';
import { useMountableStorageHosts } from '../hooks/useMountableStorageHosts';
import type { ProjectContext } from '../types/projectContext';
import {
  generateRandomString,
  isAutoMountFolderName,
  mountableVFolderFilter,
  mountableVFolderScope,
  useWebMCPTool,
  type WebMCPTool,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React from 'react';
import { fetchQuery, graphql, useRelayEnvironment } from 'react-relay';

/** Interactive and batch launchers both have five steps; the last is the review. */
export const LAUNCHER_REVIEW_STEP = 4;

export const PREPARE_SESSION_NEXT_STEP =
  'Give webui_url to the user. They open it in their own signed-in browser, review the form and press Launch (the user must do this; nothing has been started).';

export interface PrepareSessionToolDeps {
  /** Looks the requested names up among the folders this user can mount here. */
  findFolders: (
    names: ReadonlyArray<string>,
  ) => Promise<ReadonlyArray<MountableFolder>>;
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
    'Fill the session launcher form in this tab for the user to review. Reopens the launcher with the given values on its review step and marks the form as filled by an AI agent. Does NOT start the session and never submits: the user reviews the form and presses Launch. Returns { path, webui_url, applied, rejected: [{ field, reason }], nextStep, unverified? }; webui_url reopens the same prefilled form in any browser signed in as this user. Omitted fields keep the launcher defaults; the launcher auto-selects a resource preset when no amounts are given.',
  inputSchema: PREPARE_SESSION_INPUT_SCHEMA,
  annotations: { untrustedContentHint: true },
  execute: async (input) => {
    const request = input as PrepareSessionInput;
    const folderNames = parseFolderNames(request.folders ?? '');
    const folders =
      folderNames.length > 0 ? await findFolders(folderNames) : [];
    const { formValues, applied, rejected } = buildSessionPrefill(request, {
      folders,
      allowCustomResourceAllocation,
    });
    const prefillId = generateRandomString(8);
    const params = new URLSearchParams();
    params.set('step', String(LAUNCHER_REVIEW_STEP));
    params.set('formValues', JSON.stringify(formValues));
    params.set(AGENT_PREFILL_PARAM, prefillId);
    const search = `?${params.toString()}`;
    // The launcher's own browser path, so a router basename is kept.
    const path = `${window.location.pathname}${search}`;
    openLauncher(search);

    let environment: ResolvedEnvironment | null = null;
    for (let waited = 0; waited < timeoutMs; waited += pollMs) {
      await wait(pollMs);
      environment = readEnvironment(prefillId);
      if (environment) break;
    }

    const unverified: Array<PrefillRejection> = [];
    if (request.image !== undefined) {
      if (!environment) {
        unverified.push({
          field: 'image',
          reason:
            'The launcher had not resolved the image yet; check its Environments step.',
        });
      } else if (isRequestedImage(request.image, environment)) {
        applied.image = environment.manual || environment.version;
      } else {
        rejected.push({
          field: 'image',
          reason: `No available image matches "${request.image}"; the launcher selected "${environment.version ?? ''}" instead.`,
        });
      }
    }

    return {
      path,
      webui_url: new URL(path, window.location.origin).href,
      applied,
      rejected,
      ...(unverified.length > 0 && { unverified }),
      nextStep: PREPARE_SESSION_NEXT_STEP,
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
          $limit: Int!
        ) {
          scopedVFoldersV2(scope: $scope, filter: $filter, limit: $limit) {
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
        limit: FOLDER_LOOKUP_LIMIT,
      },
      { fetchPolicy: 'network-only' },
    ).toPromise();
    // Dotfile folders mount on their own, and NONE cannot be mounted.
    return _.compact(
      _.map(result?.scopedVFoldersV2?.edges, ({ node }) =>
        isAutoMountFolderName(node.metadata.name) ||
        node.accessControl.permission === 'NONE'
          ? null
          : { vfolderId: node.entityId, name: node.metadata.name },
      ),
    );
  };

  useWebMCPTool(
    createPrepareSessionTool({
      findFolders,
      allowCustomResourceAllocation:
        !!baiClient._config?.allowCustomResourceAllocation,
      openLauncher,
      readEnvironment,
    }),
    [project.id],
  );

  return null;
};

export default SessionLauncherWebMCPTool;
