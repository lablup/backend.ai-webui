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
} from '../components/AdminDeploymentPresetSettingPageContent';
import { useWebUINavigate } from '../hooks';
import { App, Form, Skeleton, Typography, theme } from 'antd';
import { BAIFlex, useBAILogger } from 'backend.ai-ui';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery, useMutation } from 'react-relay';
import { useParams } from 'react-router-dom';

/**
 * AdminDeploymentPresetSettingPage — router entry.
 *
 * Owns the FormInstance (must be stable across Suspense boundary) and
 * wraps the inner component that handles all data fetching and mutations.
 */
const AdminDeploymentPresetSettingPage: React.FC = () => {
  'use memo';
  const { presetId } = useParams<{ presetId?: string }>();
  const [form] = Form.useForm<AdminDeploymentPresetFormValue>();

  return (
    <Suspense fallback={<Skeleton active />}>
      <AdminDeploymentPresetSettingPageInner form={form} presetId={presetId} />
    </Suspense>
  );
};

// ---------------------------------------------------------------------------
// Inner — owns queries, mutations, navigation, and renders the form body.
// ---------------------------------------------------------------------------

interface AdminDeploymentPresetSettingPageInnerProps {
  form: ReturnType<typeof Form.useForm<AdminDeploymentPresetFormValue>>[0];
  presetId?: string;
}

const AdminDeploymentPresetSettingPageInner: React.FC<
  AdminDeploymentPresetSettingPageInnerProps
> = ({ form, presetId }) => {
  'use memo';
  const mode: 'create' | 'edit' = presetId ? 'edit' : 'create';

  const { t } = useTranslation();
  const { token } = theme.useToken();
  const webuiNavigate = useWebUINavigate();
  const { message } = App.useApp();
  const { logger } = useBAILogger();

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

  const [commitCreate, isCreating] =
    useMutation<AdminDeploymentPresetSettingPageCreateMutation>(graphql`
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
    `);

  const [commitUpdate, isUpdating] =
    useMutation<AdminDeploymentPresetSettingPageUpdateMutation>(graphql`
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
    `);

  const isSubmitting = isCreating || isUpdating;

  const navigateToList = () =>
    webuiNavigate('/admin-deployments?tab=deployment-presets');

  const handleSubmit = async () => {
    const values = await form.validateFields().catch(() => null);
    if (!values) return;

    await new Promise<void>((resolve, reject) => {
      if (mode === 'edit' && presetId) {
        commitUpdate({
          variables: {
            input: {
              id: presetId,
              name: values.name,
              description: values.description ?? null,
              imageId: values.imageId ?? null,
              clusterMode: values.clusterMode ?? null,
              clusterSize: values.clusterSize ?? null,
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
              modelDefinition: values.modelDefinition
                ? JSON.parse(values.modelDefinition)
                : null,
              openToPublic: values.openToPublic ?? null,
              replicaCount: values.replicaCount ?? null,
              revisionHistoryLimit: values.revisionHistoryLimit ?? null,
            },
          },
          onCompleted: (_data, errors) => {
            if (errors?.length) {
              logger.error(errors[0]);
              message.error(errors[0]?.message || t('general.ErrorOccurred'));
              reject();
              return;
            }
            message.success(t('adminDeploymentPreset.PresetUpdated'));
            navigateToList();
            resolve();
          },
          onError: (error) => {
            logger.error(error);
            message.error(error?.message || t('general.ErrorOccurred'));
            reject();
          },
        });
      } else {
        commitCreate({
          variables: {
            input: {
              runtimeVariantId: values.runtimeVariantId,
              imageId: values.imageId,
              name: values.name,
              description: values.description ?? null,
              clusterMode: values.clusterMode ?? null,
              clusterSize: values.clusterSize ?? null,
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
              modelDefinition: values.modelDefinition
                ? JSON.parse(values.modelDefinition)
                : null,
              openToPublic: values.openToPublic ?? null,
              replicaCount: values.replicaCount ?? null,
              revisionHistoryLimit: values.revisionHistoryLimit ?? null,
            },
          },
          onCompleted: (_data, errors) => {
            if (errors?.length) {
              logger.error(errors[0]);
              message.error(errors[0]?.message || t('general.ErrorOccurred'));
              reject();
              return;
            }
            message.success(t('adminDeploymentPreset.PresetCreated'));
            navigateToList();
            resolve();
          },
          onError: (error) => {
            logger.error(error);
            message.error(error?.message || t('general.ErrorOccurred'));
            reject();
          },
        });
      }
    });
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
