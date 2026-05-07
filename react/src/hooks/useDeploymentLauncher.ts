/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useDeploymentLauncherDeployVFolderMutation } from '../__generated__/useDeploymentLauncherDeployVFolderMutation.graphql';
import { useSuspendedBackendaiClient } from '../hooks';
import { useSetBAINotification } from '../hooks/useBAINotification';
import {
  useCurrentProjectValue,
  useCurrentResourceGroupValue,
} from '../hooks/useCurrentProject';
import { useBAILogger } from 'backend.ai-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useMutation } from 'react-relay';

export interface QuickDeployInput {
  /** Virtual folder (model folder) id that backs the deployment. */
  modelFolderId: string;
  /** Deployment revision preset ID (UUID). Required for deployInstantly. */
  revisionPresetId?: string;
  /** Optional resource group; falls back to the project's current resource group. */
  resourceGroup?: string;
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
 * FR-1368). Exposes:
 *
 * - `deployInstantly`: fires `deployVfolderV2` which creates the deployment
 *   and initial revision in a single server-side operation using the supplied
 *   `revisionPresetId`. Requires manager 26.4.2+ (gated by
 *   `model-deployment-extended-filter`).
 */
export const useDeploymentLauncher = (): {
  deployInstantly: (input: QuickDeployInput) => Promise<DeployInstantlyResult>;
  isDeploying: boolean;
  supportsQuickDeploy: boolean;
} => {
  'use memo';

  const { t } = useTranslation();
  const baiClient = useSuspendedBackendaiClient();
  const { id: projectId } = useCurrentProjectValue();
  const currentResourceGroup = useCurrentResourceGroupValue();
  const { upsertNotification } = useSetBAINotification();
  const { logger } = useBAILogger();

  const [isDeploying, setIsDeploying] = useState<boolean>(false);

  const [commitDeployVFolder] =
    useMutation<useDeploymentLauncherDeployVFolderMutation>(graphql`
      mutation useDeploymentLauncherDeployVFolderMutation(
        $vfolderId: UUID!
        $input: DeployVFolderV2Input!
      ) {
        deployVfolderV2(vfolderId: $vfolderId, input: $input) {
          deploymentId
        }
      }
    `);

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
    if (!input.revisionPresetId) {
      const error = new Error('No revision preset selected.');
      logger.error('[useDeploymentLauncher] deployInstantly failed', error);
      throw error;
    }

    const resourceGroup = input.resourceGroup ?? currentResourceGroup;
    if (!resourceGroup) {
      const error = new Error('No resource group available.');
      logger.error('[useDeploymentLauncher] deployInstantly failed', error);
      throw error;
    }

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
      commitDeployVFolder({
        variables: {
          vfolderId: input.modelFolderId,
          input: {
            projectId,
            revisionPresetId: input.revisionPresetId!,
            resourceGroup,
            desiredReplicaCount: input.replicas ?? 1,
            openToPublic: input.openToPublic ?? null,
          },
        },
        onCompleted: (response, errors) => {
          setIsDeploying(false);
          if (errors && errors.length > 0) {
            const message = errors.map((e) => e.message).join('\n');
            logger.error(
              '[useDeploymentLauncher] deployVfolderV2 returned errors',
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

          const deploymentId = String(response.deployVfolderV2.deploymentId);

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
          logger.error('[useDeploymentLauncher] deployVfolderV2 failed', error);
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

  return {
    deployInstantly,
    isDeploying,
    supportsQuickDeploy,
  };
};

export default useDeploymentLauncher;
