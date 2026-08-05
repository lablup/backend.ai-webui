/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { VFolderDeployModalMutation } from '../__generated__/VFolderDeployModalMutation.graphql';
import { VFolderDeployModalQuery } from '../__generated__/VFolderDeployModalQuery.graphql';
import { App } from '../app-shim';
import { Form } from '../form-engine';
import { useCurrentDomainValue, useWebUINavigate } from '../hooks';
import { useProjectPath } from '../hooks/useRouteScope';
import { theme } from '../theme-shim';
import { ProjectContext, ProjectContextOrNull } from '../types/projectContext';
import DeploymentPresetDetailModal from './DeploymentPresetDetailModal';
import ProjectSelectForAdminPage from './ProjectSelectForAdminPage';
import BAISkeletonAstryx from './astryx-bui/BAISkeletonAstryx';
import { Banner } from '@astryxdesign/core/Banner';
import { IconButton } from '@astryxdesign/core/IconButton';
import {
  BAIAvailablePresetSelectAstryx,
  BAIFlex,
  BAILink,
  BAIModal,
  type BAIModalProps,
  BAIProjectResourceGroupSelect,
  toGlobalId,
  toLocalId,
  useErrorMessageResolver,
  useProjectResourceGroups,
} from 'backend.ai-ui';
import { Info } from 'lucide-react';
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
  const currentDomain = useCurrentDomainValue();

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
  // ADR-0001 (FR-3410): this modal never reads the ambient current project.
  // The target project is derived from the folder's own ownership —
  // `vfolder_node` is fetched alongside the presets so a project-owned
  // folder deploys into exactly the project that owns it. For user-owned
  // folders (no owning project) a required in-modal selector is rendered.
  const { deploymentRevisionPresets, vfolder_node } =
    useLazyLoadQuery<VFolderDeployModalQuery>(
      graphql`
        query VFolderDeployModalQuery($vfolderGlobalId: String!) {
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
          vfolder_node(id: $vfolderGlobalId) {
            ownership_type
            group
            group_name
          }
        }
      `,
      { vfolderGlobalId: toGlobalId('VirtualFolderNode', vfolderId ?? '') },
      {
        fetchPolicy: deferredOpen ? 'store-and-network' : 'store-only',
      },
    );

  // `ownership_type` / `group` / `group_name` are all nullable, so an
  // unreadable group folder must not fall through to the user-owned branch.
  const ownership: 'user' | 'group' | 'unresolved' =
    vfolder_node?.ownership_type === 'user'
      ? 'user'
      : vfolder_node?.ownership_type === 'group' &&
          vfolder_node.group &&
          vfolder_node.group_name
        ? 'group'
        : 'unresolved';

  const ownershipProject: ProjectContextOrNull =
    ownership === 'group' && vfolder_node?.group && vfolder_node.group_name
      ? { id: vfolder_node.group, name: vfolder_node.group_name }
      : null;

  const isOwnershipUnresolved = ownership === 'unresolved';
  const [selectedProject, setSelectedProject] = useState<ProjectContext | null>(
    null,
  );
  const effectiveProject = ownershipProject ?? selectedProject;

  const availablePresets =
    deploymentRevisionPresets?.edges
      ?.map((edge) => edge?.node)
      .filter((node): node is NonNullable<typeof node> => node != null) ?? [];

  // Fetch resource groups accessible to the effective project. Uses the same
  // React Query cache as BAIProjectResourceGroupSelect below, so no duplicate
  // network request is made — we only need the count here to decide whether
  // to render the selection UI or auto-deploy. The hook short-circuits on an
  // empty name (no project derived/chosen yet).
  const { resourceGroups } = useProjectResourceGroups(
    effectiveProject?.name ?? '',
  );

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
  // Auto-deploy additionally requires an ownership-derived project: for a
  // user-owned folder the target project is a user decision, so the modal
  // (with its required project selector) must always be shown.
  const isAutoDeployScenario =
    ownershipProject !== null &&
    availablePresets.length === 1 &&
    resourceGroups.length === 1;

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
    if (!vfolderId || !effectiveProject) return Promise.resolve();

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
            projectId: effectiveProject.id,
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
          isOwnershipUnresolved ||
          !effectiveProject ||
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
      {isOwnershipUnresolved && (
        <Alert
          type="error"
          showIcon
          title={t('deployment.FolderOwnershipUnresolved')}
          description={t('deployment.FolderOwnershipUnresolvedDescription')}
          style={{ marginBottom: token.marginMD }}
        />
      )}
      <Form form={form} layout="vertical">
        {ownership === 'user' && (
          <Form.Item
            label={t('data.folders.TargetProject')}
            // The selector is wired manually (see onSelectProject below);
            // the OK button stays disabled until a project is chosen.
            required
          >
            {/* The Suspense boundary swallows Form.Item's injected props, so
                the selection is tracked in component state — same manual-
                wiring pattern as FolderCreateModalV2. */}
            <Suspense fallback={<BAISkeletonAstryx variant="input" />}>
              <ProjectSelectForAdminPage
                data-testid="vfolder-deploy-project-select"
                domain={currentDomain}
                onSelectProject={(projectInfo) => {
                  setSelectedProject({
                    id: projectInfo.projectId,
                    name: projectInfo.projectName,
                  });
                  // The resource-group options are keyed to the chosen
                  // project; drop any group picked for a previous choice.
                  form.setFieldValue('resourceGroup', undefined);
                }}
              />
            </Suspense>
          </Form.Item>
        )}
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
            key={effectiveProject?.id ?? 'no-project'}
            projectName={effectiveProject?.name ?? ''}
            autoSelectDefault
            style={{ width: '100%' }}
            disabled={noAvailablePresets || !effectiveProject}
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
