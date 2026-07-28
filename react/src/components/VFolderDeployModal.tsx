/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { VFolderDeployModalMutation } from '../__generated__/VFolderDeployModalMutation.graphql';
import { VFolderDeployModalQuery } from '../__generated__/VFolderDeployModalQuery.graphql';
import { useWebUINavigate } from '../hooks';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { useProjectPath } from '../hooks/useRouteScope';
import DeploymentPresetDetailModal from './DeploymentPresetDetailModal';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Alert, App, Button, Form, Space, theme, Tooltip } from 'antd';
import {
  BAIAvailablePresetSelect,
  BAIFlex,
  BAILink,
  BAIModal,
  type BAIModalProps,
  BAIProjectResourceGroupSelect,
  toLocalId,
  useErrorMessageResolver,
  useProjectResourceGroups,
} from 'backend.ai-ui';
import React, {
  Suspense,
  useDeferredValue,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery, useMutation } from 'react-relay';

export interface VFolderDeployModalProps extends Omit<
  BAIModalProps,
  'children' | 'onCancel'
> {
  /** Domain close callback — wired to `onCancel` on the underlying `BAIModal`. */
  onClose: () => void;
  /** Local UUID of the VFolder to deploy. */
  vfolderId?: string;
  onDeployed?: (deploymentId: string) => void;
}

const VFolderDeployModal: React.FC<VFolderDeployModalProps> = ({
  onClose,
  vfolderId,
  onDeployed,
  // `open` and `afterClose` come in via `BAIModalProps` (the latter is
  // typically injected by `BAIUnmountAfterClose`'s `cloneElement`). We
  // destructure them here so the auto-deploy effect can read `open` for
  // its true→false edge check and fire `afterClose` imperatively on the
  // null-return path where no `<BAIModal>` is rendered.
  open,
  afterClose,
  ...modalProps
}) => {
  'use memo';

  const { t } = useTranslation();
  const { message } = App.useApp();
  const { getErrorMessage } = useErrorMessageResolver();
  const webuiNavigate = useWebUINavigate();
  const buildProjectPath = useProjectPath();
  const { token } = theme.useToken();
  const { id: projectId, name: projectName } = useCurrentProjectValue();

  // Loading UX: `useDeferredValue(open)` lets this modal stay mounted with
  // `loading=true` (Ant Design skeleton) while the deferred re-render fetches
  // fresh data in the background. The first synchronous render uses
  // `store-only` so it never suspends; the deferred render upgrades to
  // `store-and-network` and suspends only if the cache is empty. The parent
  // wraps this component in `<Suspense>` to handle that first-time cache miss.
  const deferredOpen = useDeferredValue(open);

  // TODO(needs-backend): FR-2599 — `deploymentRevisionPresets` currently has
  // no per-vfolder scope (`DeploymentRevisionPresetFilter` only supports
  // `name` and `runtimeVariantId`). The list below is project-wide. Once a
  // vfolder-compatibility scope is exposed (e.g. similar to
  // `modelCardAvailablePresets`), wire it in here.
  const { deploymentRevisionPresets } =
    useLazyLoadQuery<VFolderDeployModalQuery>(
      graphql`
        query VFolderDeployModalQuery {
          deploymentRevisionPresets(
            orderBy: [{ field: RANK, direction: "ASC" }]
          ) {
            edges {
              node {
                id
                name
                runtimeVariantId
                ...DeploymentPresetDetailModalFragment
              }
            }
          }
        }
      `,
      {},
      {
        fetchPolicy: deferredOpen ? 'store-and-network' : 'store-only',
      },
    );

  const availablePresets =
    deploymentRevisionPresets?.edges
      ?.map((edge) => edge?.node)
      .filter((node): node is NonNullable<typeof node> => node != null) ?? [];

  // Fetch resource groups accessible to the current project. Uses the same
  // React Query cache as BAIProjectResourceGroupSelect below, so no duplicate
  // network request is made — we only need the count here to decide whether
  // to render the selection UI or auto-deploy.
  const { resourceGroups } = useProjectResourceGroups(projectName ?? '');

  const [commitDeploy, isInFlightDeploy] =
    useMutation<VFolderDeployModalMutation>(graphql`
      mutation VFolderDeployModalMutation(
        $vfolderId: UUID!
        $input: DeployVFolderV2Input!
      ) {
        deployVfolderV2(vfolderId: $vfolderId, input: $input) {
          deploymentId
          deploymentName
        }
      }
    `);

  // Determine scenario: auto-deploy (scenario 2) vs selection (scenario 3)
  const isAutoDeployScenario =
    availablePresets.length === 1 && resourceGroups.length === 1;

  // Track user-initiated selections separately from computed defaults.
  // Effective values fall back to computed defaults when user hasn't selected yet.
  const [userSelectedPresetId, setUserSelectedPresetId] = useState<
    string | undefined
  >(undefined);
  const [presetDetailId, setPresetDetailId] = useState<string | null>(null);
  const effectivePresetId =
    userSelectedPresetId ??
    (availablePresets[0]?.id ? toLocalId(availablePresets[0].id) : undefined);

  // The resource-group selection is held in an antd Form. `Form.useWatch`
  // subscribes to changes on the `resourceGroup` field so the Deploy button's
  // `disabled` prop reflects the current selection, and `form.getFieldValue`
  // reads it at submit time. `BAIProjectResourceGroupSelect` auto-fills the
  // "default" (or first available) group via its `autoSelectDefault` prop.
  const [form] = Form.useForm<{ resourceGroup?: string }>();
  const selectedResourceGroup = Form.useWatch('resourceGroup', form);

  const handleDeploy = (): Promise<void> => {
    if (!vfolderId || !projectId) return Promise.resolve();

    const presetId = isAutoDeployScenario
      ? toLocalId(availablePresets[0]?.id)
      : effectivePresetId;
    // In `isAutoDeployScenario`, `BAIProjectResourceGroupSelect` is never
    // mounted (the component returns `null` before reaching the form), so
    // its `autoSelectDefault` cannot populate the form value. Fall back to
    // the sole resource group here — same pattern as `ModelCardDeployModal`.
    const resourceGroup = isAutoDeployScenario
      ? resourceGroups[0]?.name
      : form.getFieldValue('resourceGroup');

    if (!presetId || !resourceGroup) return Promise.resolve();

    return new Promise<void>((resolve, reject) => {
      commitDeploy({
        variables: {
          vfolderId,
          input: {
            projectId,
            revisionPresetId: presetId,
            resourceGroup,
            desiredReplicaCount: 1,
          },
        },
        onCompleted: (response, errors) => {
          // Backend validation failures arrive as a null payload plus
          // top-level GraphQL errors routed here (not to `onError`, which
          // only fires for network errors). Surface the backend message.
          if (errors && errors.length > 0) {
            const firstError = errors[0];
            const errorMessage =
              firstError?.message ?? getErrorMessage(firstError);
            message.error(errorMessage);
            reject(new Error(errorMessage));
            return;
          }
          const payload = response.deployVfolderV2;
          if (!payload) {
            const error = new Error(t('modelStore.DeployFailed'));
            message.error(error.message);
            reject(error);
            return;
          }
          message.success(t('modelStore.DeploySuccess'));
          onDeployed?.(payload.deploymentId);
          webuiNavigate(
            buildProjectPath(`deployments/${payload.deploymentId}`),
          );
          resolve();
        },
        onError: (error) => {
          message.error(error.message || t('modelStore.DeployFailed'));
          reject(error);
        },
      });
    });
  };

  // Scenario 2: auto-deploy on mount when single preset + single resource group.
  // The ref guard keeps the mutation idempotent across StrictMode's double-
  // invocation of effects in dev — otherwise `handleDeploy` would fire twice
  // and the success toast would be shown twice.
  const didAutoDeployRef = useRef(false);
  const onAutoDeployed = useEffectEvent(() => {
    if (didAutoDeployRef.current) return;
    didAutoDeployRef.current = true;
    handleDeploy().catch(() => {
      // On failure there is no modal chrome the user can close, so close
      // imperatively: `onClose()` clears the parent state, flipping `open`
      // to false, which fires the mirrored `afterClose` below and lets
      // `BAIUnmountAfterClose` unmount us — the next Deploy click mounts a
      // fresh instance. The ref reset is a safety net in case this
      // instance survives.
      didAutoDeployRef.current = false;
      onClose();
    });
  });

  useEffect(() => {
    if (isAutoDeployScenario) {
      onAutoDeployed();
    }
  }, [isAutoDeployScenario]);

  // Auto-deploy renders no `<BAIModal>` (returns `null` further below), so
  // antd never fires `afterClose` when the parent flips `open` to false.
  // Without this, `BAIUnmountAfterClose` would keep us mounted forever —
  // `didAutoDeployRef` would stay `true` and the next click on the same
  // VFolder would silently no-op. Mirror the close edge manually here.
  const wasOpenRef = useRef(open);
  const fireAfterCloseForAutoDeploy = useEffectEvent(() => {
    afterClose?.();
  });
  useEffect(() => {
    if (wasOpenRef.current && !open && isAutoDeployScenario) {
      fireAfterCloseForAutoDeploy();
    }
    wasOpenRef.current = open;
  }, [open, isAutoDeployScenario]);

  // Scenario 2: don't render a modal at all — the effect above will trigger
  // the mutation and navigation. Returning null here means the parent never
  // mounts any modal chrome, avoiding a flash of an empty modal before the
  // serving detail navigation kicks in.
  if (isAutoDeployScenario) {
    return null;
  }

  const noAvailablePresets = availablePresets.length === 0;

  // Selection UI — the user picks a preset and a resource group.
  return (
    <BAIModal
      title={t('modelService.CreateNewDeploymentWithPreset')}
      destroyOnHidden
      width={480}
      okText={t('modelStore.Deploy')}
      okButtonProps={{
        disabled:
          !vfolderId ||
          !projectId ||
          !effectivePresetId ||
          !selectedResourceGroup ||
          noAvailablePresets,
      }}
      confirmLoading={isInFlightDeploy}
      loading={deferredOpen !== open}
      {...modalProps}
      open={open}
      afterClose={afterClose}
      onOk={handleDeploy}
      onCancel={onClose}
    >
      {noAvailablePresets && (
        <Alert
          type="info"
          showIcon
          title={t('deployment.NoPresetsAvailable')}
          description={
            <Trans
              i18nKey="deployment.NoPresetsAvailableDescription"
              components={{
                a: (
                  <BAILink
                    onClick={() => {
                      onClose();
                      webuiNavigate(buildProjectPath('deployments'));
                    }}
                  />
                ),
              }}
            />
          }
          style={{ marginBottom: token.marginMD }}
        />
      )}
      <Form form={form} layout="vertical">
        <Form.Item
          label={t('modelStore.Preset')}
          tooltip={t('modelStore.PresetTooltip')}
          required
        >
          <BAIFlex direction="row" gap="xs">
            <BAIAvailablePresetSelect
              value={effectivePresetId}
              onChange={(value) =>
                setUserSelectedPresetId(value as string | undefined)
              }
              style={{ flex: 1 }}
              disabled={noAvailablePresets}
            />
            <Space.Compact>
              <Tooltip title={t('modelService.DeploymentPresetDetail')}>
                <Button
                  icon={<InfoCircleOutlined />}
                  disabled={!effectivePresetId || noAvailablePresets}
                  onClick={() => {
                    if (!effectivePresetId) return;
                    setPresetDetailId(effectivePresetId);
                  }}
                />
              </Tooltip>
            </Space.Compact>
          </BAIFlex>
        </Form.Item>
        <Form.Item
          name="resourceGroup"
          label={t('modelStore.ResourceGroup')}
          tooltip={t('modelStore.ResourceGroupTooltip')}
          rules={[{ required: true }]}
        >
          <BAIProjectResourceGroupSelect
            projectName={projectName ?? ''}
            autoSelectDefault
            style={{ width: '100%' }}
            disabled={noAvailablePresets}
          />
        </Form.Item>
      </Form>
      <Suspense fallback={null}>
        <DeploymentPresetDetailModal
          open={!!presetDetailId}
          presetFrgmt={
            presetDetailId
              ? availablePresets.find((p) => toLocalId(p.id) === presetDetailId)
              : null
          }
          onCancel={() => setPresetDetailId(null)}
        />
      </Suspense>
    </BAIModal>
  );
};

export default VFolderDeployModal;
