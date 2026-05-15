/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { DeploymentPresetDetailContentFragment$key } from '../__generated__/DeploymentPresetDetailContentFragment.graphql';
import { ModelCardDeployModalMutation } from '../__generated__/ModelCardDeployModalMutation.graphql';
import { ModelCardDeployModalQuery } from '../__generated__/ModelCardDeployModalQuery.graphql';
import { useWebUINavigate } from '../hooks';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import DeploymentPresetDetailContent from './DeploymentPresetDetailContent';
import { InfoCircleOutlined } from '@ant-design/icons';
import {
  Alert,
  App,
  Button,
  Form,
  Space,
  Tooltip,
  Typography,
  theme,
} from 'antd';
import type { DefaultOptionType } from 'antd/es/select';
import {
  BAIButton,
  BAIFlex,
  BAIModal,
  BAIProjectResourceGroupSelect,
  BAISelect,
  toLocalId,
  useProjectResourceGroups,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { PlusIcon } from 'lucide-react';
import React, {
  Suspense,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery, useMutation } from 'react-relay';
import type { FragmentRefs } from 'relay-runtime';

interface AvailablePreset {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly runtimeVariantId: string;
  readonly ' $fragmentSpreads': FragmentRefs<'DeploymentPresetDetailContentFragment'>;
}

interface ModelCardDeployModalProps {
  open: boolean;
  onClose: () => void;
  modelCardRowId?: string;
  availablePresets: ReadonlyArray<AvailablePreset>;
  onDeployed: (deploymentId: string) => void;
  /**
   * Called when the user wants to fall back to creating a new deployment
   * (via `DeploymentSettingModal`) because no preset is available. The
   * parent is expected to close this modal and open its own
   * `DeploymentSettingModal`.
   */
  onRequestCreateDeployment?: () => void;
}

type ModelCardDeployModalContentProps = Omit<ModelCardDeployModalProps, 'open'>;

const ModelCardDeployModalContent: React.FC<
  ModelCardDeployModalContentProps
> = ({
  onClose,
  modelCardRowId,
  availablePresets,
  onDeployed,
  onRequestCreateDeployment,
}) => {
  'use memo';

  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const navigate = useWebUINavigate();
  const { id: projectId, name: projectName } = useCurrentProjectValue();

  // Fetch resource groups accessible to the current project. Uses the same
  // React Query cache as BAIProjectResourceGroupSelect below, so no duplicate
  // network request is made — we only need the count here to decide whether
  // to render the selection UI or auto-deploy.
  const { resourceGroups } = useProjectResourceGroups(projectName ?? '');

  const { runtimeVariants } = useLazyLoadQuery<ModelCardDeployModalQuery>(
    graphql`
      query ModelCardDeployModalQuery {
        runtimeVariants {
          edges {
            node {
              id
              name
            }
          }
        }
      }
    `,
    {},
    {},
  );

  const [commitDeploy] = useMutation<ModelCardDeployModalMutation>(graphql`
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

  // Build runtime variant ID → name map for preset grouping
  const runtimeVariantNameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const edge of runtimeVariants?.edges ?? []) {
      const node = edge?.node;
      if (node?.id) {
        map.set(toLocalId(node.id), node.name ?? '');
      }
    }
    return map;
  }, [runtimeVariants]);

  // Group presets by runtime variant for optgroup display
  const presetOptions: DefaultOptionType[] = useMemo(() => {
    const grouped = _.groupBy(availablePresets, 'runtimeVariantId');
    const variantIds = Object.keys(grouped);

    const toOption = (p: AvailablePreset) => ({
      label: p.name,
      value: toLocalId(p.id),
      description: p.description,
    });

    // If all presets belong to the same runtime variant, show flat list
    if (variantIds.length <= 1) {
      return availablePresets.map(toOption);
    }

    // Multiple runtime variants: show grouped options
    return variantIds.map((variantId) => ({
      label: runtimeVariantNameMap.get(variantId) ?? variantId,
      options: grouped[variantId].map(toOption),
    }));
  }, [availablePresets, runtimeVariantNameMap]);

  // Determine scenario: auto-deploy (scenario 2) vs selection (scenario 3)
  const isAutoDeployScenario =
    availablePresets.length === 1 && resourceGroups.length === 1;

  // Track user-initiated selections separately from computed defaults.
  // Effective values fall back to computed defaults when user hasn't selected yet.
  const [userSelectedPresetId, setUserSelectedPresetId] = useState<
    string | undefined
  >(undefined);
  const [presetDetailFrgmt, setPresetDetailFrgmt] =
    useState<DeploymentPresetDetailContentFragment$key | null>(null);
  const effectivePresetId =
    userSelectedPresetId ??
    (availablePresets[0]?.id ? toLocalId(availablePresets[0].id) : undefined);

  const [userSelectedResourceGroup, setUserSelectedResourceGroup] = useState<
    string | undefined
  >(undefined);
  const effectiveResourceGroup =
    userSelectedResourceGroup ?? resourceGroups[0]?.name;

  const handleDeploy = (): Promise<void> => {
    if (!modelCardRowId || !projectId) return Promise.resolve();

    const presetId = isAutoDeployScenario
      ? toLocalId(availablePresets[0]?.id)
      : effectivePresetId;
    const resourceGroup = isAutoDeployScenario
      ? resourceGroups[0]?.name
      : effectiveResourceGroup;

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
          const deploymentId = response.deployModelCardV2.deploymentId;
          message.success(t('modelStore.DeploySuccess'));
          onDeployed(deploymentId);
          navigate(`/deployments/${deploymentId}`);
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
        open
        onCancel={onClose}
        destroyOnHidden
        footer={null}
        width={480}
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
        <BAIFlex justify="end" gap="sm" style={{ marginTop: token.marginMD }}>
          <BAIButton onClick={onClose}>{t('button.Cancel')}</BAIButton>
        </BAIFlex>
      </BAIModal>
    );
  }

  // Selection UI — the user picks a preset and a resource group.
  return (
    <BAIModal
      title={t('modelService.CreateNewDeploymentWithPreset')}
      open
      onCancel={onClose}
      destroyOnHidden
      footer={null}
      width={480}
    >
      <Form layout="vertical">
        <Form.Item
          label={t('modelStore.Preset')}
          tooltip={t('modelStore.PresetTooltip')}
          required
        >
          <BAIFlex direction="row" gap="xs">
            <BAISelect
              value={effectivePresetId}
              onChange={(value: string) => setUserSelectedPresetId(value)}
              options={presetOptions}
              optionRender={(option) => (
                <BAIFlex direction="column" align="start">
                  {option.label}
                  {option.data.description && (
                    <Typography.Text
                      type="secondary"
                      style={{ fontSize: token.fontSizeSM }}
                      ellipsis
                    >
                      {option.data.description}
                    </Typography.Text>
                  )}
                </BAIFlex>
              )}
              style={{ flex: 1 }}
            />
            <Space.Compact>
              <Tooltip title={t('modelService.DeploymentPresetDetail')}>
                <Button
                  icon={<InfoCircleOutlined />}
                  disabled={!effectivePresetId}
                  onClick={() => {
                    const node = availablePresets.find(
                      (p) => toLocalId(p.id) === effectivePresetId,
                    );
                    if (node) setPresetDetailFrgmt(node);
                  }}
                />
              </Tooltip>
            </Space.Compact>
          </BAIFlex>
        </Form.Item>
        <Form.Item
          label={t('modelStore.ResourceGroup')}
          tooltip={t('modelStore.ResourceGroupTooltip')}
          required
        >
          <BAIProjectResourceGroupSelect
            projectName={projectName ?? ''}
            value={effectiveResourceGroup}
            onChange={(value: string) => setUserSelectedResourceGroup(value)}
            style={{ width: '100%' }}
          />
        </Form.Item>
      </Form>
      <BAIModal
        open={!!presetDetailFrgmt}
        centered
        title={t('modelService.DeploymentPresetDetail')}
        onCancel={() => setPresetDetailFrgmt(null)}
        destroyOnHidden
        footer={null}
      >
        {presetDetailFrgmt && (
          <DeploymentPresetDetailContent presetFrgmt={presetDetailFrgmt} />
        )}
      </BAIModal>
      <BAIFlex justify="end" gap="sm">
        <BAIButton onClick={onClose}>{t('button.Cancel')}</BAIButton>
        <BAIButton
          type="primary"
          action={handleDeploy}
          disabled={
            !modelCardRowId ||
            !projectId ||
            !effectivePresetId ||
            !effectiveResourceGroup
          }
        >
          {t('modelStore.Deploy')}
        </BAIButton>
      </BAIFlex>
    </BAIModal>
  );
};

const ModelCardDeployModal: React.FC<ModelCardDeployModalProps> = ({
  open,
  onClose,
  modelCardRowId,
  availablePresets,
  onDeployed,
  onRequestCreateDeployment,
}) => {
  'use memo';

  // Do not mount the content (or any modal chrome) until the user has clicked
  // Deploy. The content component suspends on its data query, then decides
  // whether to render the selection modal or auto-deploy silently — for the
  // auto-deploy path no modal is ever rendered, so the user goes directly
  // from the Deploy button to the new deployment detail page
  // (`/deployments/${deploymentId}`) without a flash.
  if (!open) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <ModelCardDeployModalContent
        onClose={onClose}
        modelCardRowId={modelCardRowId}
        availablePresets={availablePresets}
        onDeployed={onDeployed}
        onRequestCreateDeployment={onRequestCreateDeployment}
      />
    </Suspense>
  );
};

export default ModelCardDeployModal;
