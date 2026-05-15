/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { DeploymentPresetDetailContentFragment$key } from '../__generated__/DeploymentPresetDetailContentFragment.graphql';
import { VFolderDeployModalMutation } from '../__generated__/VFolderDeployModalMutation.graphql';
import { VFolderDeployModalQuery } from '../__generated__/VFolderDeployModalQuery.graphql';
import { useWebUINavigate } from '../hooks';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import useDeploymentLauncher from '../hooks/useDeploymentLauncher';
import DeploymentPresetDetailContent from './DeploymentPresetDetailContent';
import ErrorBoundaryWithNullFallback from './ErrorBoundaryWithNullFallback';
import { InfoCircleOutlined } from '@ant-design/icons';
import {
  Alert,
  App,
  Button,
  Form,
  Skeleton,
  Space,
  Tooltip,
  theme,
} from 'antd';
import {
  BAIAvailablePresetSelect,
  BAIButton,
  BAIFlex,
  BAIModal,
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
import { graphql, useLazyLoadQuery, useMutation } from 'react-relay';

interface VFolderDeployModalProps {
  open: boolean;
  onClose: () => void;
  /** Local UUID of the VFolder to deploy. */
  vfolderId?: string;
  onDeployed?: (deploymentId: string) => void;
  /**
   * Called when the user wants to fall back to creating a new deployment
   * (via `DeploymentSettingModal`) because no preset is available. The
   * parent is expected to close this modal and open its own
   * `DeploymentSettingModal`.
   */
  onRequestCreateDeployment?: () => void;
}

type VFolderDeployModalContentProps = Omit<VFolderDeployModalProps, 'open'>;

const VFolderDeployModalContent: React.FC<VFolderDeployModalContentProps> = ({
  onClose,
  vfolderId,
  onDeployed,
  onRequestCreateDeployment,
}) => {
  'use memo';

  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const navigate = useWebUINavigate();
  const { id: projectId, name: projectName } = useCurrentProjectValue();
  const { supportsQuickDeploy } = useDeploymentLauncher();

  // Fetch resource groups accessible to the current project. Shares the React
  // Query cache with BAIProjectResourceGroupSelect below, so no duplicate
  // network request is made — we only need the count here to decide whether
  // to render the selection UI or auto-deploy.
  const { resourceGroups } = useProjectResourceGroups(projectName ?? '');

  // TODO(needs-backend): FR-2599 — `deploymentRevisionPresets` currently has
  // no per-vfolder scope; `DeploymentRevisionPresetFilter` only supports
  // `name` and `runtimeVariantId`. Once a vfolder-compatibility scope is
  // available (e.g. a scope input similar to `modelCardAvailablePresets`),
  // filter by this vfolder's compatible presets here. For now we show the
  // full project-accessible list so the user can still select a preset.
  //
  // This top-level fetch is kept (rather than relying solely on the paginated
  // query inside `BAIAvailablePresetSelect`) because we need:
  //   • the total count to decide between the empty-state, auto-deploy, and
  //     the selection-UI render paths,
  //   • the preset node fragment refs for the detail-modal lookup.
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
                ...DeploymentPresetDetailContentFragment
              }
            }
          }
        }
      `,
      {},
      {},
    );

  const availablePresets =
    deploymentRevisionPresets?.edges
      ?.map((edge) => edge?.node)
      .filter((node): node is NonNullable<typeof node> => node != null) ?? [];

  const [commitDeploy] = useMutation<VFolderDeployModalMutation>(graphql`
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

  const hasNoPresets = availablePresets.length === 0;

  // Auto-deploy on mount when there's exactly one preset and one resource
  // group — same shortcut as ModelCardDeployModal. No modal is rendered;
  // the user goes straight from the trigger to the new deployment detail
  // page (`/deployments/${deploymentId}`).
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

  // Hold the resource-group selection on the antd Form. `Form.useWatch`
  // subscribes to changes so the Deploy button's `disabled` prop updates
  // immediately, and `form.getFieldValue` reads it at submit time.
  // `BAIProjectResourceGroupSelect` auto-fills the "default" (or first
  // available) group via its `autoSelectDefault` prop.
  const [form] = Form.useForm<{ resourceGroup?: string }>();
  const selectedResourceGroup = Form.useWatch('resourceGroup', form);

  const handleDeploy = (): Promise<void> => {
    if (!vfolderId || !projectId) return Promise.resolve();

    const presetId = effectivePresetId;
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
        onCompleted: (response) => {
          const deploymentId = response.deployVfolderV2.deploymentId;
          message.success(t('modelStore.DeploySuccess'));
          onDeployed?.(deploymentId);
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

  // Auto-deploy on mount when single preset + single resource group.
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

  // All hooks are declared above. Early returns come after all hook calls.
  // Empty-state: when no preset is available, the user can't proceed via
  // the preset path. Show an inline Alert and a link to the deployment
  // shell creation modal (`DeploymentSettingModal`) — same UX as the
  // `/deployments` page "Create Deployment" entry. Per FR-2862 the
  // modal stays open (used to auto-close, which felt like a dead-end).
  if (hasNoPresets) {
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

  // Auto-deploy: don't render a modal at all — the effect above will trigger
  // the mutation and navigation. Returning null here means the parent never
  // mounts any modal chrome, avoiding a flash of an empty modal before the
  // serving detail navigation kicks in.
  if (isAutoDeployScenario) {
    return null;
  }

  // Selection UI — render the modal only when selection is needed.
  return (
    <BAIModal
      title={t('modelService.CreateNewDeploymentWithPreset')}
      open
      onCancel={onClose}
      destroyOnHidden
      footer={null}
      width={480}
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
              disabled={hasNoPresets}
              placeholder={
                hasNoPresets ? t('modelStore.NoCompatiblePresets') : undefined
              }
              style={{ flex: 1 }}
            />
            <Space.Compact>
              <Tooltip title={t('modelService.DeploymentPresetDetail')}>
                <Button
                  icon={<InfoCircleOutlined />}
                  disabled={!effectivePresetId}
                  onClick={() => {
                    const node = deploymentRevisionPresets?.edges?.find(
                      (e) => toLocalId(e?.node?.id ?? '') === effectivePresetId,
                    )?.node;
                    if (node) setPresetDetailFrgmt(node);
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
      <BAIModal
        open={!!presetDetailFrgmt}
        centered
        title={t('modelService.DeploymentPresetDetail')}
        onCancel={() => setPresetDetailFrgmt(null)}
        destroyOnHidden
        footer={null}
      >
        <ErrorBoundaryWithNullFallback>
          <Suspense fallback={<Skeleton active paragraph={{ rows: 6 }} />}>
            {presetDetailFrgmt && (
              <DeploymentPresetDetailContent presetFrgmt={presetDetailFrgmt} />
            )}
          </Suspense>
        </ErrorBoundaryWithNullFallback>
      </BAIModal>
      <BAIFlex justify="end" gap="sm">
        <BAIButton onClick={onClose}>{t('button.Cancel')}</BAIButton>
        {supportsQuickDeploy && vfolderId ? (
          <BAIButton
            type="primary"
            action={handleDeploy}
            disabled={
              !vfolderId ||
              !projectId ||
              !effectivePresetId ||
              !selectedResourceGroup ||
              hasNoPresets
            }
          >
            {t('modelStore.Deploy')}
          </BAIButton>
        ) : (
          <BAIButton
            type="primary"
            action={handleDeploy}
            disabled={
              !vfolderId ||
              !projectId ||
              !effectivePresetId ||
              !selectedResourceGroup ||
              hasNoPresets
            }
          >
            {t('modelStore.Deploy')}
          </BAIButton>
        )}
      </BAIFlex>
    </BAIModal>
  );
};

const VFolderDeployModal: React.FC<VFolderDeployModalProps> = ({
  open,
  onClose,
  vfolderId,
  onDeployed,
  onRequestCreateDeployment,
}) => {
  'use memo';

  // Do not mount the content (or any modal chrome) until the caller has
  // opened it. The content component suspends on its data query, then
  // decides whether to render the selection modal or auto-deploy silently —
  // for the auto-deploy path no modal is ever rendered, so the user goes
  // directly from clicking Start Service to the new deployment detail page
  // (`/deployments/${deploymentId}`) without a flash.
  if (!open) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <VFolderDeployModalContent
        onClose={onClose}
        vfolderId={vfolderId}
        onDeployed={onDeployed}
        onRequestCreateDeployment={onRequestCreateDeployment}
      />
    </Suspense>
  );
};

export default VFolderDeployModal;
