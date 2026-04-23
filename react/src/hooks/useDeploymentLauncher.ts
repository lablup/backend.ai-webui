/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useDeploymentLauncherCreateMutation } from '../__generated__/useDeploymentLauncherCreateMutation.graphql';
import { useCurrentDomainValue, useSuspendedBackendaiClient } from '../hooks';
import { useSetBAINotification } from '../hooks/useBAINotification';
import {
  useCurrentProjectValue,
  useCurrentResourceGroupValue,
} from '../hooks/useCurrentProject';
import { toLocalId, useBAILogger } from 'backend.ai-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useMutation } from 'react-relay';
import { useNavigate } from 'react-router-dom';

export interface QuickDeployInput {
  /** Virtual folder (model folder) id that backs the deployment. */
  modelFolderId: string;
  /** Optional model version; defaults to the folder's latest. */
  modelVersion?: string;
  /** Optional resource group; falls back to the project's current resource group. */
  resourceGroup?: string;
  /** Optional resource preset name (passed through as a tag for now). */
  resourcePreset?: string;
  /** Replica count (default: 1). */
  replicas?: number;
  /** Public endpoint toggle (default: false). */
  openToPublic?: boolean;
}

export interface DeployInstantlyResult {
  deploymentId: string;
}

/**
 * Hook that encapsulates Quick Deploy logic for model folders (Flow 7 of
 * FR-1368). Exposes two entry points:
 *
 * - `deployInstantly`: fires the GQL `createModelDeployment` mutation with
 *   sensible defaults (replicas=1, openToPublic=false, current project +
 *   domain, current resource group as a fallback). Returns the new
 *   deployment id and raises a BAI notification on success/failure.
 * - `openLauncher`: navigates to `/deployments/start?model=<folderId>` so the
 *   user can configure a deployment in the full launcher UI.
 *
 * The hook does not wrap the legacy REST-based `useModelServiceLauncher` —
 * callers should pick between the two based on `supportsQuickDeploy` (the
 * 26.4.2+ gate where `createModelDeployment` is stable).
 */
export const useDeploymentLauncher = (): {
  deployInstantly: (input: QuickDeployInput) => Promise<DeployInstantlyResult>;
  openLauncher: (input: QuickDeployInput) => void;
  isDeploying: boolean;
  supportsQuickDeploy: boolean;
} => {
  'use memo';

  const { t } = useTranslation();
  const navigate = useNavigate();
  const baiClient = useSuspendedBackendaiClient();
  const currentDomain = useCurrentDomainValue();
  const { id: projectId } = useCurrentProjectValue();
  const currentResourceGroup = useCurrentResourceGroupValue();
  const { upsertNotification } = useSetBAINotification();
  const { logger } = useBAILogger();

  // Track in-flight deploys ourselves so consumers can disable their entry
  // point while the mutation is resolving. Relay's `useMutation` does expose
  // an `isInFlight` flag but it resets between consecutive calls — we use an
  // explicit counter-ish flag so the notification upsert and the return path
  // agree on a single boolean.
  const [isDeploying, setIsDeploying] = useState<boolean>(false);

  const [commitCreateDeployment] =
    useMutation<useDeploymentLauncherCreateMutation>(graphql`
      mutation useDeploymentLauncherCreateMutation(
        $input: CreateDeploymentInput!
      ) {
        createModelDeployment(input: $input) {
          deployment {
            id
            metadata {
              name
            }
          }
        }
      }
    `);

  // Gate behind the `model-deployment-extended-filter` feature flag, which
  // is wired up in FR-2663 to mark manager 26.4.3+ as supporting the full
  // v2 deployment lifecycle (createModelDeployment / addModelRevision /
  // richer endpoint polling). Consumers that need the legacy
  // `useModelServiceLauncher` path should branch on this flag being false.
  const supportsQuickDeploy = baiClient.supports(
    'model-deployment-extended-filter',
  );

  const deployInstantly = async (
    input: QuickDeployInput,
  ): Promise<DeployInstantlyResult> => {
    if (!projectId) {
      const error = new Error('No current project selected.');
      logger.error('[useDeploymentLauncher] deployInstantly failed', error);
      throw error;
    }

    // TODO(needs-backend): FR-2683 — wire `modelFolderId` / `modelVersion` /
    // `resourceGroup` / `resourcePreset` into `initialRevision` once the
    // Quick Deploy preset contract is finalized. Today
    // `createModelDeployment` accepts `initialRevision: null` (nullable in
    // the schema), so the Deployment is created empty and FR-2684 callers
    // are expected to chain an `addModelRevision` mutation for the actual
    // runtime config. We still read `resourceGroup` so consumers can pass
    // it through unchanged once that wiring lands.
    void input.modelVersion;
    void input.resourcePreset;
    void (input.resourceGroup ?? currentResourceGroup);

    const replicas = input.replicas ?? 1;
    const openToPublic = input.openToPublic ?? false;

    // Key the notification by folder + timestamp so repeated Quick Deploys
    // from the same folder don't collide in the BAI notification store.
    const notificationKey = `deployment-launcher-${input.modelFolderId}-${Date.now()}`;

    setIsDeploying(true);
    upsertNotification({
      key: notificationKey,
      open: true,
      message: t('modelService.StartingModelService'),
      description: null,
      duration: 0,
      backgroundTask: {
        status: 'pending',
        percent: 0,
      },
    });

    return new Promise<DeployInstantlyResult>((resolve, reject) => {
      commitCreateDeployment({
        variables: {
          input: {
            metadata: {
              projectId,
              domainName: currentDomain,
              name: null,
              tags: null,
            },
            networkAccess: {
              preferredDomainName: null,
              openToPublic,
            },
            defaultDeploymentStrategy: {
              type: 'ROLLING',
            },
            desiredReplicaCount: replicas,
            initialRevision: null,
          },
        },
        onCompleted: (response, errors) => {
          setIsDeploying(false);
          if (errors && errors.length > 0) {
            const message = errors.map((e) => e.message).join('\n');
            logger.error(
              '[useDeploymentLauncher] createModelDeployment returned errors',
              errors,
            );
            upsertNotification({
              key: notificationKey,
              open: true,
              message: t('modelStore.DeployFailed'),
              description: message,
              duration: 0,
              backgroundTask: {
                status: 'rejected',
                percent: 99,
              },
            });
            reject(new Error(message));
            return;
          }

          const globalId = response.createModelDeployment.deployment.id;
          const deploymentId = toLocalId(globalId) ?? globalId;

          upsertNotification({
            key: notificationKey,
            open: true,
            message: t('modelStore.DeploySuccess'),
            description: null,
            duration: 0,
            backgroundTask: {
              status: 'resolved',
              percent: 100,
            },
            to: `/deployments/${deploymentId}`,
            toText: t('modelService.GoToServiceDetailPage'),
          });

          resolve({ deploymentId });
        },
        onError: (error) => {
          setIsDeploying(false);
          logger.error(
            '[useDeploymentLauncher] createModelDeployment failed',
            error,
          );
          upsertNotification({
            key: notificationKey,
            open: true,
            message: t('modelStore.DeployFailed'),
            description: error?.message ?? null,
            duration: 0,
            backgroundTask: {
              status: 'rejected',
              percent: 99,
            },
          });
          reject(error);
        },
      });
    });
  };

  const openLauncher = (input: QuickDeployInput): void => {
    const params = new URLSearchParams({ model: input.modelFolderId });
    if (input.resourceGroup) params.set('resourceGroup', input.resourceGroup);
    if (input.resourcePreset)
      params.set('resourcePresetId', input.resourcePreset);
    // Jump straight to the review step when the caller provides enough
    // pre-filled data (model + resource group + preset) so the user only
    // needs to confirm rather than re-enter fields they already selected.
    if (input.resourceGroup && input.resourcePreset) {
      params.set('step', 'review');
    }
    navigate(`/deployments/start?${params.toString()}`);
  };

  return {
    deployInstantly,
    openLauncher,
    isDeploying,
    supportsQuickDeploy,
  };
};

export default useDeploymentLauncher;
