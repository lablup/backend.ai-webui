/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { ModelCardDeployModalFragment$key } from '../__generated__/ModelCardDeployModalFragment.graphql';
import { ModelCardDeployModalMutation } from '../__generated__/ModelCardDeployModalMutation.graphql';
import { useWebUINavigate } from '../hooks';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import DeploymentPresetDetailModal from './DeploymentPresetDetailModal';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Alert, App, Button, Form, Space, Tooltip } from 'antd';
import {
  BAIAvailablePresetSelect,
  BAIButton,
  BAIFlex,
  BAIModal,
  type BAIModalProps,
  BAIProjectResourceGroupSelect,
  toLocalId,
  useProjectResourceGroups,
} from 'backend.ai-ui';
import { PlusIcon } from 'lucide-react';
import React, {
  Suspense,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useMutation } from 'react-relay';

interface ModelCardDeployModalProps extends Omit<
  BAIModalProps,
  'children' | 'onCancel'
> {
  /** Domain close callback — wired to `onCancel` on the underlying `BAIModal`. */
  onClose: () => void;
  /**
   * The model card the user wants to deploy. The fragment provides both the
   * card's id (for the mutation) and the card-scoped `availablePresets` list
   * — the modal does not query these itself.
   */
  modelCardFrgmt: ModelCardDeployModalFragment$key | null | undefined;
  onDeployed: (deploymentId: string) => void;
  /**
   * Called when the user wants to fall back to creating a new deployment
   * (via `DeploymentSettingModal`) because no preset is available. The
   * parent is expected to close this modal and open its own
   * `DeploymentSettingModal`.
   */
  onRequestCreateDeployment?: () => void;
}

const ModelCardDeployModal: React.FC<ModelCardDeployModalProps> = ({
  onClose,
  modelCardFrgmt,
  onDeployed,
  onRequestCreateDeployment,
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
  const webuiNavigate = useWebUINavigate();
  const { id: projectId, name: projectName } = useCurrentProjectValue();

  // TODO(needs-backend): `availablePresets` here is the server-filtered list
  // scoped to this specific model card. `BAIAvailablePresetSelect` below
  // fetches from the project-wide `deploymentRevisionPresets` because
  // `DeploymentRevisionPresetFilter` has no model-card-scoped filter yet.
  // Once that filter exists, plumb it through the select so the dropdown
  // matches this card's compatible-presets list.
  const modelCard = useFragment(
    graphql`
      fragment ModelCardDeployModalFragment on ModelCardV2 {
        id
        availablePresets(orderBy: [{ field: RANK, direction: "ASC" }]) {
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
    modelCardFrgmt ?? null,
  );
  const modelCardRowId = modelCard?.id ? toLocalId(modelCard.id) : undefined;
  const availablePresets =
    modelCard?.availablePresets?.edges
      ?.map((edge) => edge?.node)
      .filter((node): node is NonNullable<typeof node> => node != null) ?? [];

  // Fetch resource groups accessible to the current project. Uses the same
  // React Query cache as BAIProjectResourceGroupSelect below, so no duplicate
  // network request is made — we only need the count here to decide whether
  // to render the selection UI or auto-deploy.
  const { resourceGroups } = useProjectResourceGroups(projectName ?? '');

  const [commitDeploy, isInFlightDeploy] =
    useMutation<ModelCardDeployModalMutation>(graphql`
      mutation ModelCardDeployModalMutation(
        $cardId: UUID!
        $input: DeployModelCardV2Input!
      ) {
        deployModelCardV2(cardId: $cardId, input: $input) {
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
    if (!modelCardRowId || !projectId) return Promise.resolve();

    const presetId = isAutoDeployScenario
      ? toLocalId(availablePresets[0]?.id)
      : effectivePresetId;
    const resourceGroup = isAutoDeployScenario
      ? resourceGroups[0]?.name
      : form.getFieldValue('resourceGroup');

    if (!presetId || !resourceGroup) return Promise.resolve();

    return new Promise<void>((resolve, reject) => {
      commitDeploy({
        variables: {
          cardId: modelCardRowId,
          input: {
            projectId,
            revisionPresetId: presetId,
            resourceGroup,
            desiredReplicaCount: 1,
          },
        },
        onCompleted: (response) => {
          const payload = response.deployModelCardV2;
          if (!payload) {
            const error = new Error(t('modelStore.DeployFailed'));
            message.error(error.message);
            reject(error);
            return;
          }
          message.success(t('modelStore.DeploySuccess'));
          onDeployed(payload.deploymentId);
          webuiNavigate(`/deployments/${payload.deploymentId}`);
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
    handleDeploy();
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
  // model card would silently no-op. Mirror the close edge manually here.
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

  // Empty-state: per FR-2862, when no preset is available the modal stays
  // open with an inline Alert and a link to the deployment shell creation
  // modal (`DeploymentSettingModal`) — same UX as the `/deployments` page
  // "Create Deployment" entry.
  if (availablePresets.length === 0) {
    return (
      <BAIModal
        title={t('modelService.CreateNewDeploymentWithPreset')}
        destroyOnHidden
        width={480}
        footer={null}
        {...modalProps}
        open={open}
        afterClose={afterClose}
        onCancel={onClose}
      >
        <Alert
          type="info"
          showIcon
          title={t('deployment.NoPresetsAvailable')}
          description={t('deployment.NoPresetsAvailableDescription')}
          action={
            onRequestCreateDeployment ? (
              <BAIButton
                type="primary"
                icon={<PlusIcon />}
                onClick={() => {
                  onClose();
                  onRequestCreateDeployment();
                }}
              >
                {t('deployment.OpenCreateDeploymentModal')}
              </BAIButton>
            ) : undefined
          }
        />
      </BAIModal>
    );
  }

  // Selection UI — the user picks a preset and a resource group.
  return (
    <BAIModal
      title={t('modelService.CreateNewDeploymentWithPreset')}
      destroyOnHidden
      width={480}
      okText={t('modelStore.Deploy')}
      okButtonProps={{
        disabled:
          !modelCardRowId ||
          !projectId ||
          !effectivePresetId ||
          !selectedResourceGroup,
      }}
      confirmLoading={isInFlightDeploy}
      {...modalProps}
      open={open}
      afterClose={afterClose}
      onOk={handleDeploy}
      onCancel={onClose}
    >
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
            />
            <Space.Compact>
              <Tooltip title={t('modelService.DeploymentPresetDetail')}>
                <Button
                  icon={<InfoCircleOutlined />}
                  disabled={!effectivePresetId}
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

export default ModelCardDeployModal;
