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
import { useWebUINavigate, useSuspendedBackendaiClient } from '../hooks';
import { App, Form, Typography, theme } from 'antd';
import { BAIFlex, useBAILogger, useMutationWithPromise } from 'backend.ai-ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { useParams } from 'react-router-dom';

const buildModelDefinitionInput = (
  value: ModelDefinitionFormValue | undefined,
) => {
  if (!value?.models?.length) return null;
  return {
    models: value.models.map((m) => ({
      name: m.name,
      modelPath: m.modelPath,
      service:
        m.enableService && m.service?.port != null
          ? {
              port: m.service.port,
              shell: m.service.shell || '/bin/bash',
              startCommand: m.service.startCommand?.trim()
                ? m.service.startCommand.trim().split(/\s+/)
                : null,
              preStartActions: (m.service.preStartActions ?? []).map((a) => ({
                action: a.action,
                args: (() => {
                  try {
                    return JSON.parse(a.args || '{}');
                  } catch {
                    return {};
                  }
                })(),
              })),
              healthCheck:
                m.service.enableHealthCheck && m.service.healthCheck?.path
                  ? {
                      path: m.service.healthCheck.path,
                      interval: m.service.healthCheck.interval,
                      maxRetries: m.service.healthCheck.maxRetries,
                      maxWaitTime: m.service.healthCheck.maxWaitTime,
                      expectedStatusCode:
                        m.service.healthCheck.expectedStatusCode,
                      initialDelay: m.service.healthCheck.initialDelay,
                    }
                  : null,
            }
          : null,
      metadata:
        m.enableMetadata && m.metadata
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
    })),
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
  // Preset create/update inputs gained many fields in 26.4.4 (imageId, clusterMode,
  // resourceSlots, etc.). On 26.4.3 the GraphQL input type does not expose them, so
  // send only the base fields.
  //
  // KNOWN BACKEND LIMITATION (26.4.3): the Strawberry input type
  // `CreateDeploymentRevisionPresetInput` does NOT expose `imageId`, yet the Pydantic
  // DTO it maps to declares `image_id` as required. The two layers are out of sync in
  // the 26.4.3 release, so preset creation cannot succeed from any client on 26.4.3:
  // sending imageId fails GraphQL validation ("Field imageId is not defined"), and
  // omitting it fails Pydantic validation ("image_id Field required"). This is the same
  // class of GQL-vs-DTO mismatch as the createAccessToken bug noted in the PR
  // description; it was fixed in 26.4.4 (BA-5923 added imageId to the GQL input type).
  // No client-side workaround exists.
  const isRevisedDeploymentSchema = baiClient.supports(
    'model-deployment-revised-schema',
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

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
            }
          }
        }
      `,
    );

  const navigateToList = () => {
    const params = new URLSearchParams();
    params.set('tab', 'deployment-presets');
    webuiNavigate({
      pathname: '/admin-deployments',
      search: params.toString(),
    });
  };

  const handleSubmit = async () => {
    // validateFields() triggers field-level validation (shows error messages).
    // We discard its return value because setFieldValue-set fields (enableService,
    // enableMetadata) are not registered Form.Items and therefore omitted from
    // the validated result. Instead we read the full store via getFieldsValue(true).
    const valid = await form.validateFields().catch(() => null);
    if (!valid) return;
    const values: AdminDeploymentPresetFormValue = form.getFieldsValue(true);

    setIsSubmitting(true);
    try {
      if (mode === 'edit' && presetId) {
        await commitUpdate({
          input: {
            id: presetId,
            name: values.name,
            openToPublic: values.openToPublic ?? null,
            replicaCount: values.replicaCount ?? null,
            revisionHistoryLimit: values.revisionHistoryLimit ?? null,
            // TODO: Add BLUE_GREEN support when the backend implements it.
            deploymentStrategy: { type: 'ROLLING' as const },
            // The 26.4.3 input type only accepts the base fields above; every
            // field below was added in the revised schema (26.4.4+). Sending any
            // of them to a 26.4.3 manager fails GraphQL validation, so gate the
            // whole block behind the model-deployment-revised-schema capability.
            ...(isRevisedDeploymentSchema && {
              imageId: values.imageId ?? null,
              clusterMode: values.clusterMode ?? null,
              clusterSize: values.clusterSize ?? null,
              description: values.description ?? null,
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
              ),
            }),
          },
        });
        message.success(t('adminDeploymentPreset.PresetUpdated'));
        navigateToList();
      } else {
        await commitCreate({
          input: {
            runtimeVariantId: values.runtimeVariantId,
            name: values.name,
            openToPublic: values.openToPublic ?? null,
            replicaCount: values.replicaCount!,
            revisionHistoryLimit: values.revisionHistoryLimit ?? null,
            // TODO: Add BLUE_GREEN support when the backend implements it.
            deploymentStrategy: { type: 'ROLLING' as const },
            // The 26.4.3 input type only accepts the base fields above; every
            // field below was added in the revised schema (26.4.4+). Sending any
            // of them to a 26.4.3 manager fails GraphQL validation, so gate the
            // whole block behind the model-deployment-revised-schema capability.
            ...(isRevisedDeploymentSchema && {
              imageId: values.imageId,
              clusterMode: values.clusterMode!,
              clusterSize: values.clusterSize!,
              description: values.description ?? null,
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
              ),
            }),
          } as unknown as Parameters<typeof commitCreate>[0]['input'],
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
        onCancel={navigateToList}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </BAIFlex>
  );
};

export default AdminDeploymentPresetSettingPage;
