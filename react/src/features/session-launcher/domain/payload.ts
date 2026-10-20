/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { transformPortValuesToNumbers } from '../../../components/PortSelectFormItem';
import type {
  SessionLauncherFormValue,
  SessionResources,
} from '../../../pages/SessionLauncherPage';
import {
  isUnifiedAcceleratorSlot,
  UNIFIED_SLOT_TAG_PREFIX,
} from './accelerator';
import { toMountCreationConfig } from 'backend.ai-ui';
import * as _ from 'lodash-es';

export interface CreateSessionInfo {
  kernelName: string;
  sessionName: string;
  // `undefined` (not '') without an `@arch` suffix, so `createIfNotExists()`
  // applies its own `x86_64` default.
  architecture: string | undefined;
  batchTimeout?: string;
  resources: SessionResources;
}

export type SessionPayloadValues = SessionLauncherFormValue & {
  dependencies?: string[];
  projectName?: string;
};

export interface SessionPayloadContext {
  /** The resolved image reference (`registry/ns:tag@arch`), or the manual name. */
  imageFullName: string | null | undefined;
  /** Called only when `values.sessionName` is empty. */
  generateSessionName: () => string;
  currentProjectName: string | null | undefined;
  domainName: string | undefined;
  hideAgents: boolean | undefined;
}

/** PAY-01..PAY-12: the `createIfNotExists` arguments for one launch. */
export const buildSessionPayload = (
  values: SessionPayloadValues,
  ctx: SessionPayloadContext,
): CreateSessionInfo => {
  const [kernelName = '', architecture] = ctx.imageFullName?.split('@') ?? [];

  const sessionName = _.isEmpty(values.sessionName)
    ? ctx.generateSessionName()
    : values.sessionName;

  return {
    sessionName: sessionName,
    kernelName,
    architecture,
    resources: {
      enqueueOnly: true,
      // `projectName` (explicit project contract, FR-3412) wins over the ambient project.
      group_name: values.projectName || ctx.currentProjectName || undefined,
      domain: ctx.domainName,

      type: values.sessionType,
      // multi-node x1 == single-node x1, and multi-node needs an overlay network (FR-2381).
      cluster_mode:
        values.cluster_mode === 'multi-node' && values.cluster_size === 1
          ? 'single-node'
          : values.cluster_mode,
      cluster_size: values.cluster_size,
      maxWaitSeconds: 15,
      reuseIfExists: values.reuseIfExists ?? false,

      ...(values.sessionType === 'batch'
        ? {
            starts_at: values.batch.enabled
              ? values.batch.scheduleDate
              : undefined,
            startupCommand: values.batch.command,
          }
        : {}),

      ...(values.bootstrap_script
        ? { bootstrap_script: values.bootstrap_script }
        : {}),

      ...(values?.batch?.timeoutEnabled &&
      !_.isUndefined(values?.batch?.timeout)
        ? {
            batchTimeout:
              _.toString(values.batch.timeout) + values?.batch?.timeoutUnit,
          }
        : undefined),

      ...(values.dependencies && values.dependencies.length > 0
        ? { dependencies: values.dependencies }
        : {}),

      // Temporary unified-memory marker (`unified-slot:cuda.unified`) until sessions expose it.
      ...(isUnifiedAcceleratorSlot(values.resource?.acceleratorType)
        ? {
            tag: `${UNIFIED_SLOT_TAG_PREFIX}${values.resource?.acceleratorType}`,
          }
        : {}),

      config: {
        ...(values?.resource && {
          resources: {
            cpu: values?.resource?.cpu,
            mem: values?.resource?.mem,
            // Unified slots auto-allocate from the host pool, so no quantity is sent.
            ...(values.resource?.acceleratorType &&
            values.resource?.accelerator &&
            values.resource?.accelerator > 0 &&
            !isUnifiedAcceleratorSlot(values.resource.acceleratorType)
              ? {
                  [values.resource.acceleratorType]:
                    values.resource.accelerator,
                }
              : undefined),
          },
        }),
        scaling_group: values.resourceGroup,
        ...(values?.resource && {
          resource_opts: {
            shmem: values?.resource?.shmem,
          },
        }),

        ...toMountCreationConfig(values.vfolderMounts),

        environ: {
          ..._.fromPairs(values.envvars.map((v) => [v.variable, v.value])),
          // "OMP_NUM_THREADS", "OPENBLAS_NUM_THREADS" when HPC auto is off
          ...(values.hpcOptimization.autoEnabled
            ? {}
            : _.omit(values.hpcOptimization, 'autoEnabled')),
        },

        preopen_ports: transformPortValuesToNumbers(values.ports),

        ...(!ctx.hideAgents &&
        values.agent !== undefined &&
        !_.isEqual(_.castArray(values.agent), ['auto'])
          ? {
              agent_list: _.filter(
                _.castArray(values.agent),
                (agent): agent is string => !!agent,
              ),
            }
          : undefined),
      },
    },
  };
};
