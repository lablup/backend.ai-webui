/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { VFolderDeployModalMutation } from '../__generated__/VFolderDeployModalMutation.graphql';
import { VFolderDeployModalQuery } from '../__generated__/VFolderDeployModalQuery.graphql';
import { App } from '../app-shim';
import { Form } from '../form-engine';
import { useWebUINavigate } from '../hooks';
import { useProjectPath } from '../hooks/useRouteScope';
import { theme } from '../theme-shim';
import { ProjectContext } from '../types/projectContext';
import DeploymentPresetDetailModal from './DeploymentPresetDetailModal';
import { Banner } from '@astryxdesign/core/Banner';
import { IconButton } from '@astryxdesign/core/IconButton';
import {
  BAIAvailablePresetSelectAstryx,
  BAIFlex,
  BAILink,
  BAIModal,
  type BAIModalProps,
  BAIProjectResourceGroupSelect,
  toLocalId,
  useErrorMessageResolver,
  useProjectResourceGroups,
} from 'backend.ai-ui';
import { Info } from 'lucide-react';
import React, {
  Suspense,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from 'react';
import { Trans, useTranslation } from 'react-i18next';
import {
  graphql,
  PreloadedQuery,
  useMutation,
  usePreloadedQuery,
} from 'react-relay';

// TODO(needs-backend): FR-2599 — `deploymentRevisionPresets` currently has
// no per-vfolder scope (`DeploymentRevisionPresetFilter` only supports
// `name` and `runtimeVariantId`). The list below is project-wide. Once a
// vfolder-compatibility scope is exposed (e.g. similar to
// `modelCardAvailablePresets`), wire it in here.
// ADR-0001 (FR-3410): this modal never reads the ambient current project — the
// deploy target is exactly the `project` prop the page passes in.
//
// Exported so the opener can `loadQuery` it in the click event (render-as-you-
// fetch). Operation name must match the generated artifact; the const name only
// differs to avoid clashing with the imported generated type.
export const VFolderDeployQuery = graphql`
  query VFolderDeployModalQuery {
    deploymentRevisionPresets(orderBy: [{ field: RANK, direction: "ASC" }]) {
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
`;

export interface VFolderDeployModalProps extends Omit<
  BAIModalProps,
  'children' | 'onCancel'
> {
  /** Domain close callback — wired to `onCancel` on the underlying `BAIModal`. */
  onClose: () => void;
  /**
   * Explicit project prop contract (ADR-0001). A deployment is always created
   * inside one project, and every surface that can reach this modal — the user
   * Data page and the project-admin Data page — is itself scoped to a project,
   * so the prop is **required and non-null** and there is no in-modal
   * selector. Openers without a project context must not offer the action.
   *
   * The folder's own owning project is deliberately not consulted: a mismatch
   * between this project and a project-type folder's owner is a reporting
   * concern (a future non-blocking alert), not a targeting one.
   */
  project: ProjectContext;
  /** Local UUID of the VFolder to deploy. */
  vfolderId: string;
  /** Preloaded query reference produced by the opener via `useQueryLoader`. */
  queryRef: PreloadedQuery<VFolderDeployModalQuery>;
  onDeployed?: (deploymentId: string) => void;
}

const VFolderDeployModal: React.FC<VFolderDeployModalProps> = ({
  onClose,
  project,
  vfolderId,
  queryRef,
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

  // Render-as-you-fetch: the request was already started by the opener's
  // `loadQuery` in the click event, so there is no `open`-derived fetch policy
  // here and no render-time variable derivation.
  const { deploymentRevisionPresets } =
    usePreloadedQuery<VFolderDeployModalQuery>(VFolderDeployQuery, queryRef);

  const availablePresets =
    deploymentRevisionPresets?.edges
      ?.map((edge) => edge?.node)
      .filter((node): node is NonNullable<typeof node> => node != null) ?? [];

  // Fetch resource groups accessible to the target project. Uses the same
  // React Query cache as BAIProjectResourceGroupSelect below, so no duplicate
  // network request is made — we only need the count here to decide whether
  // to render the selection UI or auto-deploy.
  const { resourceGroups } = useProjectResourceGroups(project.name);

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

  // Determine scenario: auto-deploy (scenario 2) vs selection (scenario 3).
  // The target project is always known (required prop), so the only inputs
  // are how many presets and resource groups are available.
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
    if (!vfolderId) return Promise.resolve();

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
            projectId: project.id,
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
          !effectivePresetId ||
          !selectedResourceGroup ||
          noAvailablePresets,
      }}
      confirmLoading={isInFlightDeploy}
      {...modalProps}
      open={open}
      afterClose={afterClose}
      onOk={handleDeploy}
      onCancel={onClose}
    >
      {noAvailablePresets && (
        // `type` -> `status`; `showIcon` dropped (Banner always shows it).
        <Banner
          status="info"
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
            <BAIAvailablePresetSelectAstryx
              label={t('modelStore.Preset')}
              isLabelHidden
              value={effectivePresetId}
              onChange={(value) =>
                setUserSelectedPresetId(value as string | undefined)
              }
              isDisabled={noAvailablePresets}
            />
            {/* MAPPING §3.3: an icon-only button is `IconButton`, which
                carries its own tooltip and required accessible name — so both
                the `Tooltip` wrapper and the single-child `Space.Compact`
                (which welded nothing to anything) disappear. */}
            <IconButton
              icon={<Info size="1em" />}
              label={t('modelService.DeploymentPresetDetail')}
              tooltip={t('modelService.DeploymentPresetDetail')}
              isDisabled={!effectivePresetId || noAvailablePresets}
              onClick={() => {
                if (!effectivePresetId) return;
                setPresetDetailId(effectivePresetId);
              }}
            />
          </BAIFlex>
        </Form.Item>
        <Form.Item
          name="resourceGroup"
          label={t('modelStore.ResourceGroup')}
          tooltip={t('modelStore.ResourceGroupTooltip')}
          rules={[{ required: true }]}
        >
          <BAIProjectResourceGroupSelect
            projectName={project.name}
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
