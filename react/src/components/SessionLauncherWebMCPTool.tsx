/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { isAutoMountFolderName } from '../helper/vfolderMounts';
import {
  AGENT_PREFILL_PARAM,
  buildSessionPrefill,
  isRequestedImage,
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
  convertToUUID,
  generateRandomString,
  isMountableLegacyVFolder,
  useSuspendedLegacyVFolders,
  useWebMCPTool,
  type WebMCPTool,
} from 'backend.ai-ui';
import React from 'react';

/** Interactive and batch launchers both have five steps; the last is the review. */
export const LAUNCHER_REVIEW_STEP = 4;

export const PREPARE_SESSION_NEXT_STEP =
  'Give webui_url to the user. They open it in their own signed-in browser, review the form and press Launch (the user must do this; nothing has been started).';

export interface PrepareSessionToolDeps {
  folders: ReadonlyArray<MountableFolder>;
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

/** `bai_prepare_session` (ADR 0009). It can only navigate: no submit or mutation is reachable from here. */
export const createPrepareSessionTool = ({
  folders,
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

// Dotfile folders are mounted by the session itself and never offered.
const isSelectableFolderName = (name: string) => !isAutoMountFolderName(name);

interface SessionLauncherWebMCPToolProps {
  project: ProjectContext;
  openLauncher: PrepareSessionToolDeps['openLauncher'];
  readEnvironment: PrepareSessionToolDeps['readEnvironment'];
}

/**
 * Registers `bai_prepare_session` for the launcher. The folder list and the
 * mountable hosts are the launcher storage step's own cached queries.
 */
const SessionLauncherWebMCPTool: React.FC<SessionLauncherWebMCPToolProps> = ({
  project,
  openLauncher,
  readEnvironment,
}) => {
  'use memo';
  const baiClient = useSuspendedBackendaiClient();
  const mountableHosts = useMountableStorageHosts(project.id);
  const { folders } = useSuspendedLegacyVFolders({ groupId: project.id });

  const mountableFolders: Array<MountableFolder> = folders
    .filter(
      (folder) =>
        folder.status === 'ready' &&
        isSelectableFolderName(folder.name) &&
        isMountableLegacyVFolder(folder, {
          currentProjectId: project.id,
          mountableHosts,
        }),
    )
    .map((folder) => ({
      vfolderId: convertToUUID(folder.id),
      name: folder.name,
    }));

  useWebMCPTool(
    createPrepareSessionTool({
      folders: mountableFolders,
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
