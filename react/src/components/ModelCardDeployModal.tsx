/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ModelCardDeployModalEndpointPollQuery } from '../__generated__/ModelCardDeployModalEndpointPollQuery.graphql';
import { ModelCardDeployModalMutation } from '../__generated__/ModelCardDeployModalMutation.graphql';
import { ModelCardDeployModalQuery } from '../__generated__/ModelCardDeployModalQuery.graphql';
import { useModelStoreProject } from '../hooks/useModelStoreProject';
import { App, Form } from 'antd';
import type { DefaultOptionType } from 'antd/es/select';
import {
  BAIButton,
  BAIFlex,
  BAIModal,
  BAISelect,
  toLocalId,
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
import { useNavigate } from 'react-router-dom';

/**
 * Poll-before-navigate configuration for the post-deploy handoff to the
 * serving detail page. The v2 `deployModelCardV2` mutation creates a
 * ModelDeployment, but the v1 `endpoint(endpoint_id: …)` projection — which
 * the serving detail page depends on — is populated a beat later. Navigating
 * immediately produces a page full of `-` because the v1 lookup returns
 * null (or an endpoint with null fields) until that propagation catches up.
 * We poll the same v1 query here so the Relay store is warm and the detail
 * page renders complete data on first paint.
 */
const ENDPOINT_POLL_INTERVAL_MS = 300;
const ENDPOINT_POLL_MAX_ATTEMPTS = 10;

interface AvailablePreset {
  readonly id: string;
  readonly name: string;
  readonly rank: number;
  readonly runtimeVariantId: string;
}

interface ModelCardDeployModalProps {
  open: boolean;
  onClose: () => void;
  modelCardRowId?: string;
  availablePresets: ReadonlyArray<AvailablePreset>;
  onDeployed: (deploymentId: string) => void;
}

type ModelCardDeployModalContentProps = Omit<ModelCardDeployModalProps, 'open'>;

const ModelCardDeployModalContent: React.FC<
  ModelCardDeployModalContentProps
> = ({ onClose, modelCardRowId, availablePresets, onDeployed }) => {
  'use memo';

  const { t } = useTranslation();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { id: projectId } = useModelStoreProject();
  const relayEnvironment = useRelayEnvironment();

  const { runtimeVariants, scaling_groups } =
    useLazyLoadQuery<ModelCardDeployModalQuery>(
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
          scaling_groups {
            name
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

  // Minimal v1 endpoint projection used only for the post-deploy poll.
  // Kept intentionally small — we only need to confirm the endpoint is
  // addressable before handing off to the detail page.
  const endpointPollQuery = graphql`
    query ModelCardDeployModalEndpointPollQuery($endpointId: UUID!) {
      endpoint(endpoint_id: $endpointId) {
        endpoint_id
        name
        status
      }
    }
  `;

  const waitForEndpointReady = async (endpointId: string): Promise<void> => {
    for (let attempt = 0; attempt < ENDPOINT_POLL_MAX_ATTEMPTS; attempt++) {
      try {
        const result = await fetchQuery<ModelCardDeployModalEndpointPollQuery>(
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
      } catch {
        // Swallow transient errors and keep polling — on the last attempt
        // we fall through and navigate anyway; the detail page will still
        // render with whatever state the server can give us.
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

    // If all presets belong to the same runtime variant, show flat list
    if (variantIds.length <= 1) {
      return availablePresets.map((p) => ({
        label: p.name,
        value: toLocalId(p.id),
      }));
    }

    // Multiple runtime variants: show grouped options
    return variantIds.map((variantId) => ({
      label: runtimeVariantNameMap.get(variantId) ?? variantId,
      options: grouped[variantId].map((p) => ({
        label: p.name,
        value: toLocalId(p.id),
      })),
    }));
  }, [availablePresets, runtimeVariantNameMap]);

  // Get unique resource groups, filtering out null/undefined entries
  const resourceGroups = useMemo(
    () =>
      _.uniqBy(
        (scaling_groups ?? []).filter(
          (sg): sg is NonNullable<typeof sg> & { name: string } =>
            sg != null && !!sg.name,
        ),
        'name',
      ),
    [scaling_groups],
  );

  // Determine scenario: auto-deploy (scenario 2) vs selection (scenario 3)
  const isAutoDeployScenario =
    availablePresets.length === 1 && resourceGroups.length === 1;

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

  // Scenario 3: selection UI — render the modal only when selection is needed.
  return (
    <BAIModal
      title={t('modelStore.DeployModel')}
      open
      onCancel={onClose}
      destroyOnHidden
      footer={null}
      width={480}
    >
      <Form layout="vertical">
        <Form.Item label={t('modelStore.Preset')} required>
          <BAISelect
            value={effectivePresetId}
            onChange={(value: string) => setUserSelectedPresetId(value)}
            options={presetOptions}
            style={{ width: '100%' }}
          />
        </Form.Item>
        <Form.Item label={t('modelStore.ResourceGroup')} required>
          <BAISelect
            value={effectiveResourceGroup}
            onChange={(value: string) => setUserSelectedResourceGroup(value)}
            options={resourceGroups.map((sg) => ({
              label: sg.name,
              value: sg.name,
            }))}
            style={{ width: '100%' }}
          />
        </Form.Item>
      </Form>
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
}) => {
  'use memo';

  // Do not mount the content (or any modal chrome) until the user has clicked
  // Deploy. The content component suspends on its data query, then decides
  // whether to render the selection modal or auto-deploy silently — for the
  // auto-deploy path no modal is ever rendered, so the user goes directly
  // from the Deploy button to the serving detail page without a flash.
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
      />
    </Suspense>
  );
};

export default ModelCardDeployModal;
