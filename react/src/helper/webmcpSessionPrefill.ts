/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { SessionLauncherFormValue } from '../pages/SessionLauncherPage';
import { parseImageString, removeArchitectureFromImageFullName } from './index';
import type { VFolderMountConfigValue, WebMCPInputSchema } from 'backend.ai-ui';
import * as _ from 'lodash-es';

/** Search param marking a launcher URL opened by `bai_prepare_session`. */
export const AGENT_PREFILL_PARAM = 'agentPrefill';

export const PREPARE_SESSION_INPUT_SCHEMA: WebMCPInputSchema = {
  type: 'object',
  properties: {
    sessionType: {
      type: 'string',
      enum: ['interactive', 'batch'],
      description: 'Defaults to interactive.',
    },
    sessionName: {
      type: 'string',
      minLength: 4,
      maxLength: 64,
      description:
        'Letters, digits, "_", "-" and "."; starts and ends with a letter, digit or "_". Omit to let the server name it.',
    },
    startupCommand: {
      type: 'string',
      minLength: 1,
      maxLength: 4096,
      description: 'The command a batch session runs. Batch only.',
    },
    image: {
      type: 'string',
      minLength: 1,
      maxLength: 512,
      description:
        'Image as "registry/namespace:tag@architecture". Without "@architecture" any architecture of that tag matches; without ":tag" the latest tag is used.',
    },
    cpu: {
      type: 'integer',
      minimum: 1,
      maximum: 1024,
      description: 'CPU cores. Give together with memoryGiB.',
    },
    memoryGiB: {
      type: 'number',
      minimum: 0.125,
      maximum: 65536,
      description: 'Memory in GiB. Give together with cpu.',
    },
    accelerator: {
      type: 'number',
      minimum: 0,
      maximum: 1024,
      description: 'Accelerator amount (devices or fractional shares).',
    },
    acceleratorType: {
      type: 'string',
      minLength: 3,
      maxLength: 64,
      description:
        'Accelerator resource slot, e.g. "cuda.device" or "cuda.shares". Omitted, the launcher picks one the image supports.',
    },
    clusterMode: {
      type: 'string',
      enum: ['single-node', 'multi-node'],
    },
    clusterSize: {
      type: 'integer',
      minimum: 1,
      maximum: 1024,
    },
    folders: {
      type: 'string',
      minLength: 1,
      maxLength: 4096,
      description:
        'Comma-separated names of storage folders to mount, as the launcher lists them.',
    },
  },
  additionalProperties: false,
};

export interface PrepareSessionInput {
  sessionType?: 'interactive' | 'batch';
  sessionName?: string;
  startupCommand?: string;
  image?: string;
  cpu?: number;
  memoryGiB?: number;
  accelerator?: number;
  acceleratorType?: string;
  clusterMode?: 'single-node' | 'multi-node';
  clusterSize?: number;
  folders?: string;
}

export interface PrefillRejection {
  field: string;
  reason: string;
}

/** A folder the launcher's mount select offers. */
export interface MountableFolder {
  vfolderId: string;
  name: string;
}

export interface SessionPrefillContext {
  /** The mountable folders the launcher already loaded. */
  folders: ReadonlyArray<MountableFolder>;
  allowCustomResourceAllocation: boolean;
}

export interface SessionPrefill {
  formValues: DeepPartial<SessionLauncherFormValue>;
  applied: Record<string, unknown>;
  rejected: Array<PrefillRejection>;
}

const RESOURCE_FIELDS = [
  'cpu',
  'memoryGiB',
  'accelerator',
  'acceleratorType',
] as const;

/** The launcher's session name rules (`useValidateSessionName`). */
export const sessionNameProblem = (name: string): string | null => {
  if (!/^\w/.test(name)) return 'must start with a letter, digit or "_"';
  if (!/\w$/.test(name)) return 'must end with a letter, digit or "_"';
  if (!/^[\w.-]*$/.test(name)) {
    return 'may contain only letters, digits, "_", "-" and "."';
  }
  return null;
};

const ACCELERATOR_TYPE_PATTERN = /^[a-z][a-z0-9_-]*\.[a-z0-9_.-]+$/i;

const resolveFolders = (
  raw: string,
  folders: ReadonlyArray<MountableFolder>,
): { mounts: Array<VFolderMountConfigValue>; rejected: Array<string> } => {
  const names = _.uniq(
    raw
      .split(',')
      .map((name) => name.trim())
      .filter(Boolean),
  );
  const mounts: Array<VFolderMountConfigValue> = [];
  const rejected: Array<string> = [];
  for (const name of names) {
    const matches = folders.filter((folder) => folder.name === name);
    if (matches.length === 1) {
      mounts.push({
        vfolderId: matches[0].vfolderId,
        name,
        mountDestination: '',
        subpath: '',
      });
    } else {
      rejected.push(name);
    }
  }
  return { mounts, rejected };
};

/**
 * Maps `bai_prepare_session` input onto the launcher's `formValues` URL
 * param. Fields the launcher cannot take as given land in `rejected`.
 */
export const buildSessionPrefill = (
  input: PrepareSessionInput,
  context: SessionPrefillContext,
): SessionPrefill => {
  const formValues: DeepPartial<SessionLauncherFormValue> = {};
  const applied: Record<string, unknown> = {};
  const rejected: Array<PrefillRejection> = [];
  const reject = (field: string, reason: string) =>
    rejected.push({ field, reason });

  if (input.sessionType !== undefined) {
    formValues.sessionType = input.sessionType;
    applied.sessionType = input.sessionType;
  }

  if (input.sessionName !== undefined) {
    const problem = sessionNameProblem(input.sessionName);
    if (problem) {
      reject('sessionName', `Session name ${problem}.`);
    } else {
      formValues.sessionName = input.sessionName;
      applied.sessionName = input.sessionName;
    }
  }

  if (input.startupCommand !== undefined) {
    if (input.sessionType !== 'batch') {
      reject(
        'startupCommand',
        'A startup command applies only when sessionType is "batch".',
      );
    } else {
      formValues.batch = { command: input.startupCommand };
      applied.startupCommand = input.startupCommand;
    }
  }

  if (input.image !== undefined) {
    formValues.environments = { version: input.image };
  }

  const givenResourceFields = RESOURCE_FIELDS.filter(
    (field) => input[field] !== undefined,
  );
  if (givenResourceFields.length > 0) {
    const rejectResources = (reason: string) =>
      givenResourceFields.forEach((field) => reject(field, reason));
    if (!context.allowCustomResourceAllocation) {
      rejectResources(
        'This site does not allow custom resource amounts; the launcher selects a resource preset instead.',
      );
    } else if (input.cpu === undefined || input.memoryGiB === undefined) {
      rejectResources('Give cpu and memoryGiB together.');
    } else if (
      input.acceleratorType !== undefined &&
      (!ACCELERATOR_TYPE_PATTERN.test(input.acceleratorType) ||
        ['cpu', 'mem', 'shmem'].includes(input.acceleratorType.split('.')[0]))
    ) {
      rejectResources(
        'acceleratorType must be an accelerator slot name such as "cuda.device".',
      );
    } else {
      formValues.allocationPreset = 'custom';
      formValues.resource = {
        cpu: input.cpu,
        mem: `${input.memoryGiB}g`,
        ...(input.accelerator !== undefined && {
          accelerator: input.accelerator,
        }),
        ...(input.acceleratorType !== undefined && {
          acceleratorType: input.acceleratorType,
        }),
      };
      givenResourceFields.forEach((field) => {
        applied[field] = input[field];
      });
    }
  }

  if (input.clusterMode !== undefined) {
    formValues.cluster_mode = input.clusterMode;
    applied.clusterMode = input.clusterMode;
  }
  if (input.clusterSize !== undefined) {
    formValues.cluster_size = input.clusterSize;
    applied.clusterSize = input.clusterSize;
  }

  if (input.folders !== undefined) {
    const { mounts, rejected: missing } = resolveFolders(
      input.folders,
      context.folders,
    );
    missing.forEach((name) =>
      reject(
        'folders',
        `"${name}" is not a single mountable folder in this project. Pick one the launcher's Data & Storage step lists.`,
      ),
    );
    if (mounts.length > 0) {
      formValues.vfolderMounts = mounts;
      applied.folders = mounts.map((mount) => mount.name);
    }
  }

  return { formValues, applied, rejected };
};

/** The image the launcher settled on, read back from its form. */
export interface ResolvedEnvironment {
  version?: string;
  manual?: string;
}

/**
 * Whether the launcher selected the requested image. When it has no match it
 * silently falls back to another environment, so the choice is read back.
 */
export const isRequestedImage = (
  requested: string,
  resolved: ResolvedEnvironment,
): boolean => {
  if (resolved.manual) return resolved.manual === requested;
  const version = resolved.version;
  if (!version) return false;
  if (version === requested) return true;
  const { hasTag, hasArch } = parseImageString(requested);
  if (hasTag && !hasArch) {
    return removeArchitectureFromImageFullName(version) === requested;
  }
  if (!hasTag) {
    return parseImageString(version).registryAndNamespace === requested;
  }
  return false;
};
