/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { VFolderDeployModalEndpointPollQuery } from '../__generated__/VFolderDeployModalEndpointPollQuery.graphql';
import { VFolderDeployModalMutation } from '../__generated__/VFolderDeployModalMutation.graphql';
import { VFolderDeployModalQuery } from '../__generated__/VFolderDeployModalQuery.graphql';
import { useWebUINavigate } from '../hooks';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import useDeploymentLauncher from '../hooks/useDeploymentLauncher';
import { EllipsisOutlined } from '@ant-design/icons';
import { App, Dropdown, Form, Space, Typography, theme } from 'antd';
import type { DefaultOptionType } from 'antd/es/select';
import {
  BAIButton,
  BAIFlex,
  BAIModal,
  BAIProjectResourceGroupSelect,
  BAISelect,
  toLocalId,
  useBAILogger,
  useProjectResourceGroups,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, {
  Suspense,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
  fetchQuery,
  graphql,
  useLazyLoadQuery,
  useMutation,
  useRelayEnvironment,
} from 'react-relay';

/**
 * Poll-before-navigate configuration for the post-deploy handoff to the
 * serving detail page. The v2 `deployVfolderV2` mutation creates a
 * ModelDeployment, but the v1 `endpoint(endpoint_id: …)` projection — which
 * the serving detail page depends on — is populated a beat later. Navigating
 * immediately produces a page full of `-` because the v1 lookup returns
 * null (or an endpoint with null fields) until that propagation catches up.
 * We poll the same v1 query here so the Relay store is warm and the detail
 * page renders complete data on first paint. This mirrors
 * `ModelCardDeployModal` — they are two entry points to the same deployment
 * pipeline and share the same v1/v2 propagation gap.
 */
const ENDPOINT_POLL_INTERVAL_MS = 300;
const ENDPOINT_POLL_MAX_ATTEMPTS = 10;

// Minimal v1 endpoint projection used only for the post-deploy poll.
// Kept intentionally small — we only need to confirm the endpoint is
// addressable before handing off to the detail page.
const endpointPollQuery = graphql`
  query VFolderDeployModalEndpointPollQuery($endpointId: UUID!) {
    endpoint(endpoint_id: $endpointId) {
      endpoint_id
      name
      status
    }
  }
`;

interface VFolderDeployModalProps {
  open: boolean;
  onClose: () => void;
  /** Local UUID of the VFolder to deploy. */
  vfolderId?: string;
  onDeployed?: (deploymentId: string) => void;
}

type VFolderDeployModalContentProps = Omit<VFolderDeployModalProps, 'open'>;

const VFolderDeployModalContent: React.FC<VFolderDeployModalContentProps> = ({
  onClose,
  vfolderId,
  onDeployed,
}) => {
  'use memo';

  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const navigate = useWebUINavigate();
  const { id: projectId, name: projectName } = useCurrentProjectValue();
  const relayEnvironment = useRelayEnvironment();
  const { logger } = useBAILogger();
  const { openLauncher, supportsQuickDeploy } = useDeploymentLauncher();

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
  const { deploymentRevisionPresets, runtimeVariants } =
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
                description
                rank
                runtimeVariantId
              }
            }
          }
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

  const availablePresets = useMemo(() => {
    return (
      deploymentRevisionPresets?.edges
        ?.map((edge) => edge?.node)
        .filter(
          (
            node,
          ): node is {
            readonly id: string;
            readonly name: string;
            readonly description: string | null;
            readonly rank: number;
            readonly runtimeVariantId: string;
          } => node != null,
        ) ?? []
    );
  }, [deploymentRevisionPresets]);

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

  const waitForEndpointReady = async (endpointId: string): Promise<void> => {
    for (let attempt = 0; attempt < ENDPOINT_POLL_MAX_ATTEMPTS; attempt++) {
      try {
        const result = await fetchQuery<VFolderDeployModalEndpointPollQuery>(
          relayEnvironment,
          endpointPollQuery,
          { endpointId },
          // Bypass the store on each attempt so we actually hit the server
          // — the whole point of the poll is to observe fresh server state.
          { fetchPolicy: 'network-only' },
        ).toPromise();
        if (result?.endpoint?.endpoint_id) {
          return;
        }
      } catch (error) {
        // Log transient errors at warn level but keep polling — on the
        // last attempt we fall through and navigate anyway; the detail
        // page will still render with whatever state the server can give
        // us.
        logger.warn(
          `VFolderDeployModal: endpoint poll attempt ${attempt + 1} failed`,
          error,
        );
      }
      await new Promise((resolve) =>
        setTimeout(resolve, ENDPOINT_POLL_INTERVAL_MS),
      );
    }
  };

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

    const toOption = (p: (typeof availablePresets)[number]) => ({
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

  const hasNoPresets = availablePresets.length === 0;

  // TODO(needs-backend): FR-2599 — auto-deploy is disabled until presets are
  // scoped to this vfolder's compatibility. `deploymentRevisionPresets` shows
  // the full project-level list; auto-deploying without user confirmation could
  // select an incompatible preset. Re-enable once the backend provides a
  // per-vfolder preset filter (similar to `ModelCardV2.availablePresets`).
  const isAutoDeployScenario = false;

  // Track user-initiated selections separately from computed defaults.
  // Effective values fall back to computed defaults when user hasn't selected yet.
  const [userSelectedPresetId, setUserSelectedPresetId] = useState<
    string | undefined
  >(undefined);
  const effectivePresetId =
    userSelectedPresetId ??
    (availablePresets[0]?.id ? toLocalId(availablePresets[0].id) : undefined);

  const [userSelectedResourceGroup, setUserSelectedResourceGroup] = useState<
    string | undefined
  >(undefined);
  const effectiveResourceGroup =
    userSelectedResourceGroup ?? resourceGroups[0]?.name;

  const handleDeploy = (): Promise<void> => {
    if (!vfolderId || !projectId) return Promise.resolve();

    const presetId = effectivePresetId;
    const resourceGroup = effectiveResourceGroup;

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
          // Wait for the v1 endpoint projection to become queryable before
          // navigating, so the serving detail page doesn't render a blank
          // page full of `-` placeholders during the v1/v2 propagation gap.
          waitForEndpointReady(deploymentId)
            .then(() => {
              navigate(`/serving/${deploymentId}`);
              resolve();
            })
            .catch(reject);
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
      title={t('modelService.SelectDeploymentPreset')}
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
          <BAISelect
            value={effectivePresetId}
            onChange={(value: string) => setUserSelectedPresetId(value)}
            options={presetOptions}
            disabled={hasNoPresets}
            placeholder={
              hasNoPresets ? t('modelStore.NoCompatiblePresets') : undefined
            }
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
            style={{ width: '100%' }}
          />
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
      <BAIFlex justify="end" gap="sm">
        <BAIButton onClick={onClose}>{t('button.Cancel')}</BAIButton>
        {supportsQuickDeploy && vfolderId ? (
          // Flow 7 (FR-2684): [Deploy | ▼] split button. Primary fires
          // deployVfolderV2 with selected preset/resource group; the dropdown
          // item navigates to the full launcher at /deployments/start?model=<id>.
          <Space.Compact>
            <BAIButton
              type="primary"
              action={handleDeploy}
              disabled={
                !vfolderId ||
                !projectId ||
                !effectivePresetId ||
                !effectiveResourceGroup ||
                hasNoPresets
              }
            >
              {t('modelStore.Deploy')}
            </BAIButton>
            <Dropdown
              disabled={hasNoPresets}
              trigger={['click']}
              menu={{
                items: [
                  {
                    key: 'configure',
                    label: t('modelStore.QuickDeployDetailed'),
                    onClick: () => {
                      openLauncher({
                        modelFolderId: vfolderId,
                        resourceGroup: effectiveResourceGroup,
                        revisionPresetId: effectivePresetId,
                      });
                    },
                  },
                ],
              }}
            >
              <BAIButton type="primary" icon={<EllipsisOutlined />} />
            </Dropdown>
          </Space.Compact>
        ) : (
          <BAIButton
            type="primary"
            action={handleDeploy}
            disabled={
              !vfolderId ||
              !projectId ||
              !effectivePresetId ||
              !effectiveResourceGroup ||
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
}) => {
  'use memo';

  // Do not mount the content (or any modal chrome) until the caller has
  // opened it. The content component suspends on its data query, then
  // decides whether to render the selection modal or auto-deploy silently —
  // for the auto-deploy path no modal is ever rendered, so the user goes
  // directly from clicking Start Service to the serving detail page without
  // a flash.
  if (!open) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <VFolderDeployModalContent
        onClose={onClose}
        vfolderId={vfolderId}
        onDeployed={onDeployed}
      />
    </Suspense>
  );
};

export default VFolderDeployModal;
