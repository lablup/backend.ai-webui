/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { AdminDeploymentPresetSettingPageCreateMutation } from '../__generated__/AdminDeploymentPresetSettingPageCreateMutation.graphql';
import type { AdminDeploymentPresetSettingPagePresetQuery } from '../__generated__/AdminDeploymentPresetSettingPagePresetQuery.graphql';
import type { AdminDeploymentPresetSettingPageResourceSlotTypesQuery } from '../__generated__/AdminDeploymentPresetSettingPageResourceSlotTypesQuery.graphql';
import type { AdminDeploymentPresetSettingPageRuntimeVariantsQuery } from '../__generated__/AdminDeploymentPresetSettingPageRuntimeVariantsQuery.graphql';
import type { AdminDeploymentPresetSettingPageUpdateMutation } from '../__generated__/AdminDeploymentPresetSettingPageUpdateMutation.graphql';
import AdminDeploymentPresetSettingPageContent, {
  type AdminDeploymentPresetFormValue,
  type ModelDefinitionFormValue,
} from '../components/AdminDeploymentPresetSettingPageContent';
import { resolveCommandShell } from '../helper/modelServiceCommand';
import { tokenizeShellCommand } from '../helper/parseCliCommand';
import { buildPath } from '../helper/pathBuilder';
import { useSuspendedBackendaiClient, useWebUINavigate } from '../hooks';
import { type RuntimeVariantPresetValueEntry } from '../hooks/useRuntimeParameterSchema';
import { App, Form, Typography, theme } from 'antd';
import {
  BAIFlex,
  toLocalId,
  useBAILogger,
  useMutationWithPromise,
} from 'backend.ai-ui';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { useParams } from 'react-router-dom';

const buildModelDefinitionInput = (
  value: ModelDefinitionFormValue | undefined,
  // 26.4.4rc7+ managers accept the `enable` flag on ModelHealthCheckInput;
  // older managers reject it, so we keep the legacy null-when-disabled shape.
  supportsHealthCheckEnable: boolean,
  // The single-string `command` + `shell` fields exist since 26.7.0; the WebUI
  // gates them at 26.8.0 (see `client.ts`).
  // older managers only understand the deprecated `startCommand` token list.
  supportsCommandShell: boolean,
  // Whether the selected runtime variant reads vfolder config files (custom).
  // When false, command/port fields are hidden in the UI, so any stale values
  // in the form store must be excluded from the mutation.
  readsVfolderConfigFiles: boolean,
) => {
  if (!value?.models?.length) return null;

  // Service config fields (port, command, health check, pre-start actions)
  // live in Step 1 and are independent of the model definition switch. The
  // switch (`enabled`) only gates model name, path, and metadata in Step 2.
  // When the switch is off but the first model carries service data (port,
  // command, health check, etc.), we still send the model definition with
  // just the service fields so the backend receives them.
  const firstModel = value.models[0];
  const svc = firstModel?.service;
  // Command/port are only relevant when the variant reads vfolder config
  // files (custom). When a non-custom variant is selected, any stale
  // command/port left in the form store must be excluded.
  const hasCommandData =
    readsVfolderConfigFiles && (svc?.port != null || svc?.startCommand);
  const hasServiceData =
    hasCommandData ||
    svc?.enableHealthCheck ||
    (svc?.preStartActions?.length ?? 0) > 0;

  // Neither the model definition switch nor any service fields are set → null.
  if (!value.enabled && !hasServiceData) return null;

  return {
    models: value.models.flatMap((m) => {
      const service = m.service;
      // Skip models with no service data at all.
      if (!service) {
        return [];
      }
      // When the model definition switch is off, only send service fields
      // (no name/modelPath/metadata — those belong to the gated section).
      const modelEnabled = !!value.enabled;
      return [
        {
          name: modelEnabled ? m.name : '',
          modelPath: modelEnabled ? m.modelPath : '',
          service: {
            port: hasCommandData ? (service.port ?? 8000) : 8000,
            // Start Command (FR-3205): when enabled (26.8.0+ by client policy)
            // send the raw command string in `command` plus a `shell` derived
            // from the Basic/Advanced controls. On older managers fall back to
            // the deprecated tokenized `startCommand`. When the variant does
            // not read config files, omit command/shell entirely.
            ...(hasCommandData
              ? supportsCommandShell
                ? {
                    command: service.startCommand || null,
                    shell: service.startCommand
                      ? resolveCommandShell({
                          advanced: !!service.advanced,
                          execution: service.execution ?? 'shell',
                          shell: service.shell,
                        })
                      : undefined,
                  }
                : {
                    startCommand: tokenizeShellCommand(
                      service.startCommand ?? '',
                    ),
                  }
              : {}),
            preStartActions: (service.preStartActions ?? []).map((a) => ({
              action: a.action,
              args: (() => {
                try {
                  return JSON.parse(a.args || '{}');
                } catch {
                  return {};
                }
              })(),
            })),
            healthCheck: (() => {
              const hc = service.healthCheck;
              const checked = !!service.enableHealthCheck;
              // Disabled → send health_check: null. The preset's strict
              // validation checks every inner field whenever the object is
              // present, and GraphQL injects null for omitted fields (which
              // pydantic rejects), so `{ enable: false }` alone still fails —
              // null is the only way to disable.
              if (!checked) return null;
              // Enabled → the form requires all HC fields, so they are present.
              const fields = {
                path: hc?.path,
                interval: hc?.interval,
                maxRetries: hc?.maxRetries,
                maxWaitTime: hc?.maxWaitTime,
                expectedStatusCode: hc?.expectedStatusCode,
                initialDelay: hc?.initialDelay,
              };
              // Managers < 26.4.4rc7 strip the `enable` flag; on 26.4.4rc7+ it
              // is sent explicitly to mark the check enabled.
              return supportsHealthCheckEnable
                ? { enable: true, ...fields }
                : fields;
            })(),
          },
          metadata:
            modelEnabled && m.metadata
              ? {
                  author: m.metadata.author || null,
                  title: m.metadata.title || null,
                  version: m.metadata.version || null,
                  created: null,
                  lastModified: null,
                  description: m.metadata.description || null,
                  task: m.metadata.task || null,
                  category: m.metadata.category || null,
                  architecture: m.metadata.architecture || null,
                  framework: m.metadata.framework?.length
                    ? m.metadata.framework
                    : null,
                  label: m.metadata.label?.length ? m.metadata.label : null,
                  license: m.metadata.license || null,
                  minResource: null,
                }
              : null,
        },
      ];
    }),
  };
};

const AdminDeploymentPresetSettingPage: React.FC = () => {
  'use memo';
  const { presetId } = useParams<{ presetId?: string }>();
  const [form] = Form.useForm<AdminDeploymentPresetFormValue>();
  const mode: 'create' | 'edit' = presetId ? 'edit' : 'create';

  const { t } = useTranslation();
  const { token } = theme.useToken();
  const webuiNavigate = useWebUINavigate();
  const { message } = App.useApp();
  const { logger } = useBAILogger();
  const baiClient = useSuspendedBackendaiClient();
  const supportsHealthCheckEnable = baiClient.supports(
    'model-health-check-enable',
  );
  // The single-string `command` + `shell` fields exist since 26.7.0; gated at 26.8.0 on the
  // preset service config (FR-3205); older managers only understand the
  // deprecated `startCommand` token list.
  const supportsCommandShell = baiClient.supports(
    'model-service-command-string',
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Runtime parameter state lives in `RuntimeParameterFormSection` (managed by
  // the content component, which also URL-syncs it and renders it in the review
  // step). The content component populates this collector so submit can read
  // the standalone preset values (`{ presetId, value }`) without re-rendering
  // the page on every slider/input change.
  const collectRuntimePresetValuesRef = useRef<
    () => RuntimeVariantPresetValueEntry[]
  >(() => []);

  // Fetch preset in edit mode (@skip avoids the request in create mode).
  const { deploymentRevisionPreset: presetFrgmt } =
    useLazyLoadQuery<AdminDeploymentPresetSettingPagePresetQuery>(
      graphql`
        query AdminDeploymentPresetSettingPagePresetQuery(
          $id: UUID!
          $skip: Boolean!
        ) {
          deploymentRevisionPreset(id: $id) @skip(if: $skip) {
            id
            ...AdminDeploymentPresetSettingPageContent_preset
          }
        }
      `,
      { id: presetId ?? '', skip: !presetId },
      { fetchPolicy: presetId ? 'store-and-network' : 'store-only' },
    );

  const { runtimeVariants } =
    useLazyLoadQuery<AdminDeploymentPresetSettingPageRuntimeVariantsQuery>(
      graphql`
        query AdminDeploymentPresetSettingPageRuntimeVariantsQuery {
          runtimeVariants(limit: 100) {
            edges {
              node {
                id
                name
                readsVfolderConfigFiles @since(version: "26.8.0")
              }
            }
          }
        }
      `,
      {},
      { fetchPolicy: 'store-or-network' },
    );

  const { resourceSlotTypes } =
    useLazyLoadQuery<AdminDeploymentPresetSettingPageResourceSlotTypesQuery>(
      graphql`
        query AdminDeploymentPresetSettingPageResourceSlotTypesQuery {
          resourceSlotTypes(
            limit: 100
            orderBy: [{ field: RANK, direction: ASC }]
          ) {
            edges {
              node {
                id
                slotName
                slotType
                displayName
                displayUnit
                numberFormat {
                  binary
                  roundLength
                }
              }
            }
          }
        }
      `,
      {},
      { fetchPolicy: 'store-or-network' },
    );

  const runtimeVariantList =
    runtimeVariants?.edges
      ?.map((e) => e?.node)
      ?.filter((n): n is NonNullable<typeof n> => Boolean(n)) ?? [];

  const resourceSlotTypeList =
    resourceSlotTypes?.edges
      ?.map((e) => e?.node)
      ?.filter((n): n is NonNullable<typeof n> => Boolean(n)) ?? [];

  const commitCreate =
    useMutationWithPromise<AdminDeploymentPresetSettingPageCreateMutation>(
      graphql`
        mutation AdminDeploymentPresetSettingPageCreateMutation(
          $input: CreateDeploymentRevisionPresetInput!
        ) {
          adminCreateDeploymentRevisionPreset(input: $input) {
            preset {
              id
              name
              # Refresh the full preset node in the Relay store so a later
              # edit-page open (store-and-network) hydrates from fresh data —
              # in particular runtimeVariant preset values, which the form
              # section seeds once on mount and would otherwise show stale.
              ...AdminDeploymentPresetSettingPageContent_preset
            }
          }
        }
      `,
    );

  const commitUpdate =
    useMutationWithPromise<AdminDeploymentPresetSettingPageUpdateMutation>(
      graphql`
        mutation AdminDeploymentPresetSettingPageUpdateMutation(
          $input: UpdateDeploymentRevisionPresetInput!
        ) {
          adminUpdateDeploymentRevisionPreset(input: $input) {
            preset {
              id
              name
              # Refresh the full preset node in the Relay store so re-opening the
              # edit page (store-and-network) hydrates from fresh data — in
              # particular runtimeVariant preset values, which the form section
              # seeds once on mount and would otherwise show the pre-edit value.
              ...AdminDeploymentPresetSettingPageContent_preset
            }
          }
        }
      `,
    );

  const navigateToList = () => {
    const params = new URLSearchParams();
    params.set('tab', 'deployment-presets');
    webuiNavigate({
      pathname: buildPath('admin', 'deployments'),
      search: params.toString(),
    });
  };

  const handleSubmit = async () => {
    // validateFields() triggers field-level validation (shows error messages).
    // We read the full store via getFieldsValue(true) so untouched fields and
    // the modelDefinition.models array are included regardless of validation.
    const valid = await form.validateFields().catch(() => null);
    if (!valid) return;
    const values: AdminDeploymentPresetFormValue = form.getFieldsValue(true);
    const presetValues = collectRuntimePresetValuesRef.current();

    // Resolve whether the selected variant reads vfolder config files so
    // buildModelDefinitionInput can exclude stale command/port data.
    const selectedVariant = runtimeVariantList.find(
      (rt) => toLocalId(rt.id) === values.runtimeVariantId,
    );
    const reads =
      selectedVariant?.readsVfolderConfigFiles ??
      selectedVariant?.name === 'custom';

    setIsSubmitting(true);
    try {
      if (mode === 'edit' && presetId) {
        await commitUpdate({
          input: {
            id: presetId,
            runtimeVariantId: values.runtimeVariantId ?? null,
            name: values.name,
            description: values.description ?? null,
            imageId: values.imageId ?? null,
            clusterMode: values.clusterMode ?? null,
            clusterSize: values.clusterSize ?? null,
            startupCommand: values.startupCommand ?? null,
            bootstrapScript: values.bootstrapScript ?? null,
            // Send an explicit (possibly empty) array so that clearing all
            // env vars actually replaces them server-side. `environ` defaults
            // to null in UpdateDeploymentRevisionPresetInput, which means
            // "leave unchanged" — collapsing an empty list to null would
            // silently drop the user's deletion. (FR-3127)
            environ: (values.environ ?? []).map((e) => ({
              key: e.variable,
              value: e.value,
            })),
            resourceSlots: [
              ...(values.cpu
                ? [{ resourceType: 'cpu', quantity: values.cpu }]
                : []),
              ...(values.mem
                ? [{ resourceType: 'mem', quantity: values.mem }]
                : []),
              ...(values.resourceSlots ?? []),
            ],
            // Same "Omit to leave unchanged" semantics as `environ`: send an
            // explicit (possibly empty) array so clearing all resource opts is
            // honored instead of being treated as no change. (FR-3127)
            resourceOpts: values.resourceOpts ?? [],
            modelDefinition: buildModelDefinitionInput(
              values.modelDefinition,
              supportsHealthCheckEnable,
              supportsCommandShell,
              !!reads,
            ),
            openToPublic: values.openToPublic ?? null,
            replicaCount: values.replicaCount ?? null,
            revisionHistoryLimit: values.revisionHistoryLimit ?? null,
            presetValues: presetValues.length ? presetValues : null,
            // TODO: Add BLUE_GREEN support when the backend implements it.
            deploymentStrategy: { type: 'ROLLING' as const },
          },
        });
        message.success(t('adminDeploymentPreset.PresetUpdated'));
        navigateToList();
      } else {
        await commitCreate({
          input: {
            runtimeVariantId: values.runtimeVariantId,
            imageId: values.imageId,
            name: values.name,
            description: values.description ?? null,
            clusterMode: values.clusterMode!,
            clusterSize: values.clusterSize!,
            startupCommand: values.startupCommand ?? null,
            bootstrapScript: values.bootstrapScript ?? null,
            environ: values.environ?.length
              ? values.environ.map((e) => ({
                  key: e.variable,
                  value: e.value,
                }))
              : null,
            resourceSlots: [
              ...(values.cpu
                ? [{ resourceType: 'cpu', quantity: values.cpu }]
                : []),
              ...(values.mem
                ? [{ resourceType: 'mem', quantity: values.mem }]
                : []),
              ...(values.resourceSlots ?? []),
            ],
            resourceOpts: values.resourceOpts?.length
              ? values.resourceOpts
              : null,
            modelDefinition: buildModelDefinitionInput(
              values.modelDefinition,
              supportsHealthCheckEnable,
              supportsCommandShell,
              !!reads,
            ),
            openToPublic: values.openToPublic ?? null,
            replicaCount: values.replicaCount!,
            revisionHistoryLimit: values.revisionHistoryLimit ?? null,
            presetValues: presetValues.length ? presetValues : null,
            // TODO: Add BLUE_GREEN support when the backend implements it.
            deploymentStrategy: { type: 'ROLLING' as const },
          },
        });
        message.success(t('adminDeploymentPreset.PresetCreated'));
        navigateToList();
      }
    } catch (error: unknown) {
      logger.error(error);
      const errMsg =
        error instanceof Error
          ? error.message
          : Array.isArray(error) && error[0]?.message
            ? error[0].message
            : t('general.ErrorOccurred');
      message.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BAIFlex
      direction="column"
      align="stretch"
      gap="md"
      style={{ paddingBottom: token.paddingContentVerticalLG }}
    >
      <BAIFlex direction="row" justify="between" align="center">
        <Typography.Title level={3} style={{ margin: 0 }}>
          {mode === 'edit'
            ? t('adminDeploymentPreset.EditPreset')
            : t('adminDeploymentPreset.CreatePreset')}
        </Typography.Title>
      </BAIFlex>

      <AdminDeploymentPresetSettingPageContent
        mode={mode}
        form={form}
        presetFrgmt={presetFrgmt}
        runtimeVariants={runtimeVariantList}
        resourceSlotTypes={resourceSlotTypeList}
        collectRuntimePresetValuesRef={collectRuntimePresetValuesRef}
        onCancel={navigateToList}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </BAIFlex>
  );
};

export default AdminDeploymentPresetSettingPage;
