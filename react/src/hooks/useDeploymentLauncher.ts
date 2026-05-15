/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useDeploymentLauncherDeployModelCardMutation } from '../__generated__/useDeploymentLauncherDeployModelCardMutation.graphql';
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

interface QuickDeployCommonInput {
  /** Deployment revision preset ID (UUID). Required by both `deployVfolderV2` and `deployModelCardV2`. */
  revisionPresetId: string;
  /** Optional resource group; falls back to the project's current resource group. */
  resourceGroup?: string;
  /** Replica count (default: 1). */
  replicas?: number;
  /** Public endpoint toggle (default: false). */
  openToPublic?: boolean;
}

/**
 * Entry context for Quick Deploy. Per FR-2862 spec, the hook branches to the
 * matching mutation based on `kind`:
 * - `vfolder` → `deployVfolderV2(vfolderId, input)`
 * - `modelCard` → `deployModelCardV2(cardId, input)`
 *
 * The `input` schemas are identical between the two mutations, so the form
 * layer and validation are shared — only the mutation dispatch differs.
 */
export type QuickDeployInput =
  | (QuickDeployCommonInput & {
      kind: 'vfolder';
      /** Virtual folder (model folder) id that backs the deployment. */
      vfolderId: string;
    })
  | (QuickDeployCommonInput & {
      kind: 'modelCard';
      /** Model card id that backs the deployment. */
      cardId: string;
    });

export interface DeployInstantlyResult {
  deploymentId: string;
}

/**
 * Hook that encapsulates Quick Deploy logic (Flow 7 of FR-1368). Exposes:
 *
 * - `deployInstantly`: fires either `deployVfolderV2` or `deployModelCardV2`
 *   depending on the entry context (`kind: 'vfolder' | 'modelCard'`), which
 *   creates the deployment and initial revision in a single server-side
 *   operation using the supplied `revisionPresetId`. Requires manager 26.4.2+
 *   (gated by `model-deployment-extended-filter`).
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

  const [commitDeployModelCard] =
    useMutation<useDeploymentLauncherDeployModelCardMutation>(graphql`
      mutation useDeploymentLauncherDeployModelCardMutation(
        $cardId: UUID!
        $input: DeployModelCardV2Input!
      ) {
        deployModelCardV2(cardId: $cardId, input: $input) {
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

    const targetId = input.kind === 'vfolder' ? input.vfolderId : input.cardId;
    const notificationKey = `deployment-launcher-${targetId}-${Date.now()}`;

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

    const mutationInput = {
      projectId,
      revisionPresetId: input.revisionPresetId,
      resourceGroup,
      desiredReplicaCount: input.replicas ?? 1,
      openToPublic: input.openToPublic ?? null,
    };

    const handleErrors = (errorMessage: string) => {
      setIsDeploying(false);
      upsertNotification({
        key: notificationKey,
        open: true,
        message: t('modelStore.DeployFailed'),
        description: errorMessage,
        duration: 0,
        backgroundTask: {
          status: 'rejected',
          percent: 99,
        },
      });
    };

    const handleSuccess = (deploymentId: string) => {
      setIsDeploying(false);
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
    };

    return new Promise<DeployInstantlyResult>((resolve, reject) => {
      if (input.kind === 'vfolder') {
        commitDeployVFolder({
          variables: {
            vfolderId: input.vfolderId,
            input: mutationInput,
          },
          onCompleted: (response, errors) => {
            if (errors && errors.length > 0) {
              const message = errors.map((e) => e.message).join('\n');
              logger.error(
                '[useDeploymentLauncher] deployVfolderV2 returned errors',
                errors,
              );
              handleErrors(message);
              reject(new Error(message));
              return;
            }

            const deploymentId = String(response.deployVfolderV2.deploymentId);
            handleSuccess(deploymentId);
            resolve({ deploymentId });
          },
          onError: (error) => {
            logger.error(
              '[useDeploymentLauncher] deployVfolderV2 failed',
              error,
            );
            handleErrors(error?.message ?? '');
            reject(error);
          },
        });
      } else {
        commitDeployModelCard({
          variables: {
            cardId: input.cardId,
            input: mutationInput,
          },
          onCompleted: (response, errors) => {
            if (errors && errors.length > 0) {
              const message = errors.map((e) => e.message).join('\n');
              logger.error(
                '[useDeploymentLauncher] deployModelCardV2 returned errors',
                errors,
              );
              handleErrors(message);
              reject(new Error(message));
              return;
            }

            const deploymentId = String(
              response.deployModelCardV2.deploymentId,
            );
            handleSuccess(deploymentId);
            resolve({ deploymentId });
          },
          onError: (error) => {
            logger.error(
              '[useDeploymentLauncher] deployModelCardV2 failed',
              error,
            );
            handleErrors(error?.message ?? '');
            reject(error);
          },
        });
      }
    });
  };

  return {
    deployInstantly,
    isDeploying,
    supportsQuickDeploy,
  };
};

export default useDeploymentLauncher;
