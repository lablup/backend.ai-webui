/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { AdminDeploymentPresetSettingModalCreateMutation } from '../__generated__/AdminDeploymentPresetSettingModalCreateMutation.graphql';
import type { AdminDeploymentPresetSettingModalFragment$key } from '../__generated__/AdminDeploymentPresetSettingModalFragment.graphql';
import type { AdminDeploymentPresetSettingModalImagesQuery } from '../__generated__/AdminDeploymentPresetSettingModalImagesQuery.graphql';
import type { AdminDeploymentPresetSettingModalRuntimeVariantsQuery } from '../__generated__/AdminDeploymentPresetSettingModalRuntimeVariantsQuery.graphql';
import type { AdminDeploymentPresetSettingModalUpdateMutation } from '../__generated__/AdminDeploymentPresetSettingModalUpdateMutation.graphql';
import {
  App,
  Divider,
  Form,
  type FormInstance,
  Input,
  InputNumber,
  ModalProps,
  Select,
  Switch,
  Typography,
  theme,
} from 'antd';
import { BAIButton, BAIFlex, BAIModal, useBAILogger } from 'backend.ai-ui';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  graphql,
  useFragment,
  useLazyLoadQuery,
  useMutation,
} from 'react-relay';

type ClusterModeType = 'SINGLE_NODE' | 'MULTI_NODE';

type FormInputType = {
  name: string;
  description?: string;
  runtimeVariantId: string;
  imageId: string;
  clusterMode?: ClusterModeType;
  clusterSize?: number;
  startupCommand?: string;
  bootstrapScript?: string;
  // TODO(needs-ui): FR-2761 — environ (key-value list) needs dedicated UI component
  // environ?: Array<{ name: string; value: string }>;
  // TODO(needs-ui): FR-2761 — resourceSlots needs resource allocation UI
  // resourceSlots?: Record<string, string>;
  // TODO(needs-ui): FR-2761 — presetValues needs dedicated UI component
  // presetValues?: string;
  // TODO(needs-ui): FR-2761 — modelDefinition needs structured JSON editor
  // modelDefinition?: string;
  // Deployment defaults
  openToPublic?: boolean;
  replicaCount?: number;
  revisionHistoryLimit?: number;
  // deploymentStrategy is temporarily disabled per product decision
  // deploymentStrategy?: 'ROLLING' | 'BLUE_GREEN';
  // Edit-only
  rank?: number;
};

interface AdminDeploymentPresetSettingModalProps extends ModalProps {
  presetFrgmt?:
    | AdminDeploymentPresetSettingModalFragment$key
    | null
    | undefined;
  onRequestClose?: (success: boolean) => void;
}

const RuntimeVariantSelect: React.FC<{
  value?: string;
  onChange?: (value: string) => void;
}> = ({ value, onChange }) => {
  'use memo';
  const { t } = useTranslation();

  const queryRef =
    useLazyLoadQuery<AdminDeploymentPresetSettingModalRuntimeVariantsQuery>(
      graphql`
        query AdminDeploymentPresetSettingModalRuntimeVariantsQuery {
          runtimeVariants(limit: 100) {
            edges {
              node {
                id
                rowId
                name
                description
              }
            }
          }
        }
      `,
      {},
      { fetchPolicy: 'store-and-network' },
    );

  const options = (queryRef.runtimeVariants?.edges ?? []).map((edge) => ({
    value: edge?.node?.rowId ?? '',
    label: edge?.node?.name ?? '',
  }));

  return (
    <Select
      value={value}
      onChange={onChange}
      options={options}
      placeholder={t('adminDeploymentPreset.SelectRuntimeVariant')}
      showSearch={{
        filterOption: (input, option) =>
          String(option?.label ?? '')
            .toLowerCase()
            .includes(input.toLowerCase()),
      }}
    />
  );
};

// Wraps RuntimeVariantSelect with Suspense so Form.Item always renders,
// keeping the field registered in the form store even during loading.
const RuntimeVariantSelectField: React.FC<{
  value?: string;
  onChange?: (value: string) => void;
}> = ({ value, onChange }) => {
  'use memo';
  const { t } = useTranslation();
  return (
    <React.Suspense
      fallback={<Select disabled placeholder={t('general.Loading')} />}
    >
      <RuntimeVariantSelect value={value} onChange={onChange} />
    </React.Suspense>
  );
};

const ImageSelect: React.FC<{
  value?: string;
  onChange?: (value: string) => void;
}> = ({ value, onChange }) => {
  'use memo';
  const { t } = useTranslation();

  const queryRef =
    useLazyLoadQuery<AdminDeploymentPresetSettingModalImagesQuery>(
      graphql`
        query AdminDeploymentPresetSettingModalImagesQuery {
          images {
            id
            humanized_name
            tag
            registry
          }
        }
      `,
      {},
      { fetchPolicy: 'store-and-network' },
    );

  const options = (queryRef.images ?? [])
    .filter((img) => img?.id != null)
    .map((img) => ({
      value: img!.id!,
      label: img?.humanized_name
        ? `${img.humanized_name}:${img?.tag ?? ''}`
        : `${img?.registry ?? ''}:${img?.tag ?? ''}`,
    }));

  return (
    <Select
      value={value}
      onChange={onChange}
      options={options}
      placeholder={t('adminDeploymentPreset.SelectImage')}
      showSearch={{
        filterOption: (input, option) =>
          String(option?.label ?? '')
            .toLowerCase()
            .includes(input.toLowerCase()),
      }}
    />
  );
};

// Wraps ImageSelect with Suspense so Form.Item always renders,
// keeping the field registered in the form store even during loading.
const ImageSelectField: React.FC<{
  value?: string;
  onChange?: (value: string) => void;
}> = ({ value, onChange }) => {
  'use memo';
  const { t } = useTranslation();
  return (
    <React.Suspense
      fallback={<Select disabled placeholder={t('general.Loading')} />}
    >
      <ImageSelect value={value} onChange={onChange} />
    </React.Suspense>
  );
};

const AdminDeploymentPresetSettingModal: React.FC<
  AdminDeploymentPresetSettingModalProps
> = ({ presetFrgmt, onRequestClose, ...modalProps }) => {
  'use memo';

  const { t } = useTranslation();
  const { message } = App.useApp();
  const { logger } = useBAILogger();
  const { token } = theme.useToken();
  const formRef = useRef<FormInstance<FormInputType>>(null);

  const preset = useFragment(
    graphql`
      fragment AdminDeploymentPresetSettingModalFragment on DeploymentRevisionPreset {
        id
        rowId
        name
        description
        rank
        runtimeVariantId
        runtimeVariant {
          id
          name
        }
        cluster {
          clusterMode
          clusterSize
        }
        execution {
          image
          startupCommand
          bootstrapScript
        }
        deploymentDefaults {
          openToPublic
          replicaCount
          revisionHistoryLimit
          deploymentStrategy
        }
      }
    `,
    presetFrgmt ?? null,
  );

  const isEditMode = !!preset;

  const [commitCreate, _isCreateInFlight] =
    useMutation<AdminDeploymentPresetSettingModalCreateMutation>(graphql`
      mutation AdminDeploymentPresetSettingModalCreateMutation(
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

  const [commitUpdate, _isUpdateInFlight] =
    useMutation<AdminDeploymentPresetSettingModalUpdateMutation>(graphql`
      mutation AdminDeploymentPresetSettingModalUpdateMutation(
        $input: UpdateDeploymentRevisionPresetInput!
      ) {
        adminUpdateDeploymentRevisionPreset(input: $input) {
          preset {
            id
            name
            description
            rank
            cluster {
              clusterMode
              clusterSize
            }
            execution {
              image
              startupCommand
              bootstrapScript
            }
            deploymentDefaults {
              openToPublic
              replicaCount
              revisionHistoryLimit
              deploymentStrategy
            }
          }
        }
      }
    `);

  const initialValues: Partial<FormInputType> = preset
    ? {
        name: preset.name,
        description: preset.description ?? undefined,
        runtimeVariantId: preset.runtimeVariantId,
        clusterMode:
          (preset.cluster?.clusterMode as ClusterModeType) ?? undefined,
        clusterSize: preset.cluster?.clusterSize ?? undefined,
        startupCommand: preset.execution?.startupCommand ?? undefined,
        bootstrapScript: preset.execution?.bootstrapScript ?? undefined,
        rank: preset.rank,
        openToPublic: preset.deploymentDefaults?.openToPublic ?? undefined,
        replicaCount: preset.deploymentDefaults?.replicaCount ?? undefined,
        revisionHistoryLimit:
          preset.deploymentDefaults?.revisionHistoryLimit ?? undefined,
      }
    : {};

  const handleMutationError = (error: { message?: string }) => {
    logger.error(error);
    message.error(error?.message || t('general.ErrorOccurred'));
  };

  const handleOk = async () => {
    const values = await formRef.current?.validateFields().catch(() => null);
    if (!values) return;

    await new Promise<void>((resolve, reject) => {
      if (isEditMode) {
        commitUpdate({
          variables: {
            input: {
              id: preset.rowId,
              name: values.name,
              description: values.description ?? null,
              rank: values.rank ?? null,
              imageId: values.imageId ?? null,
              clusterMode: values.clusterMode ?? null,
              clusterSize: values.clusterSize ?? null,
              startupCommand: values.startupCommand ?? null,
              bootstrapScript: values.bootstrapScript ?? null,
              openToPublic: values.openToPublic,
              replicaCount: values.replicaCount,
              revisionHistoryLimit: values.revisionHistoryLimit,
              // deploymentStrategy: values.deploymentStrategy
              //   ? { type: values.deploymentStrategy }
              //   : null,
            },
          },
          onCompleted: (_data, errors) => {
            if (errors && errors.length > 0) {
              logger.error(errors[0]);
              message.error(errors[0]?.message || t('general.ErrorOccurred'));
              reject();
              return;
            }
            message.success(t('adminDeploymentPreset.PresetUpdated'));
            onRequestClose?.(true);
            resolve();
          },
          onError: (error) => {
            handleMutationError(error);
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
              openToPublic: values.openToPublic ?? null,
              replicaCount: values.replicaCount ?? null,
              revisionHistoryLimit: values.revisionHistoryLimit ?? null,
              // deploymentStrategy: values.deploymentStrategy
              //   ? { type: values.deploymentStrategy }
              //   : null,
            },
          },
          onCompleted: (_data, errors) => {
            if (errors && errors.length > 0) {
              logger.error(errors[0]);
              message.error(errors[0]?.message || t('general.ErrorOccurred'));
              reject();
              return;
            }
            message.success(t('adminDeploymentPreset.PresetCreated'));
            onRequestClose?.(true);
            resolve();
          },
          onError: (error) => {
            handleMutationError(error);
            reject();
          },
        });
      }
    });
  };

  return (
    <BAIModal
      title={
        isEditMode
          ? t('adminDeploymentPreset.EditPreset')
          : t('adminDeploymentPreset.CreatePreset')
      }
      onCancel={() => onRequestClose?.(false)}
      footer={[
        <BAIButton key="cancel" onClick={() => onRequestClose?.(false)}>
          {t('button.Cancel')}
        </BAIButton>,
        <BAIButton key="ok" type="primary" action={handleOk}>
          {isEditMode ? t('button.Update') : t('button.Create')}
        </BAIButton>,
      ]}
      {...modalProps}
    >
      <Form
        ref={formRef}
        layout="vertical"
        initialValues={initialValues}
        style={{
          maxHeight: '60vh',
          overflowY: 'auto',
          paddingRight: token.paddingXXS,
        }}
      >
        {/* Basic Info */}
        <Divider titlePlacement="left" styles={{ content: { margin: 0 } }}>
          <Typography.Text
            type="secondary"
            style={{ fontSize: token.fontSizeSM }}
          >
            {t('adminDeploymentPreset.SectionBasicInfo')}
          </Typography.Text>
        </Divider>
        <Form.Item
          name="name"
          label={t('adminDeploymentPreset.Name')}
          rules={[
            {
              required: true,
              message: t('adminDeploymentPreset.NameRequired'),
            },
          ]}
        >
          <Input placeholder={t('adminDeploymentPreset.NamePlaceholder')} />
        </Form.Item>
        <Form.Item
          name="description"
          label={t('adminDeploymentPreset.Description')}
        >
          <Input.TextArea
            rows={2}
            placeholder={t('adminDeploymentPreset.DescriptionPlaceholder')}
          />
        </Form.Item>
        {isEditMode ? (
          <Form.Item label={t('adminDeploymentPreset.Runtime')}>
            <Typography.Text>
              {preset.runtimeVariant?.name ?? preset.runtimeVariantId}
            </Typography.Text>
          </Form.Item>
        ) : (
          <Form.Item
            name="runtimeVariantId"
            label={t('adminDeploymentPreset.Runtime')}
            rules={[
              {
                required: true,
                message: t('adminDeploymentPreset.RuntimeRequired'),
              },
            ]}
          >
            <RuntimeVariantSelectField />
          </Form.Item>
        )}
        {isEditMode ? (
          <Form.Item label={t('adminDeploymentPreset.Image')}>
            <Typography.Text
              type="secondary"
              style={{ fontSize: token.fontSizeSM }}
            >
              {preset.execution?.image ?? '-'}
            </Typography.Text>
          </Form.Item>
        ) : (
          <Form.Item
            name="imageId"
            label={t('adminDeploymentPreset.Image')}
            rules={[
              {
                required: true,
                message: t('adminDeploymentPreset.ImageRequired'),
              },
            ]}
          >
            <ImageSelectField />
          </Form.Item>
        )}

        {/* Cluster */}
        <Divider titlePlacement="left" styles={{ content: { margin: 0 } }}>
          <Typography.Text
            type="secondary"
            style={{ fontSize: token.fontSizeSM }}
          >
            {t('adminDeploymentPreset.SectionCluster')}
          </Typography.Text>
        </Divider>
        <BAIFlex gap="md" wrap="wrap">
          <Form.Item
            name="clusterMode"
            label={t('adminDeploymentPreset.ClusterMode')}
            style={{ flex: 1, minWidth: 120 }}
          >
            <Select
              placeholder={t('adminDeploymentPreset.SelectClusterMode')}
              allowClear
              options={[
                {
                  value: 'SINGLE_NODE',
                  label: t('adminDeploymentPreset.SingleNode'),
                },
                {
                  value: 'MULTI_NODE',
                  label: t('adminDeploymentPreset.MultiNode'),
                },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="clusterSize"
            label={t('adminDeploymentPreset.ClusterSize')}
            style={{ flex: 1, minWidth: 120 }}
          >
            <InputNumber
              min={1}
              style={{ width: '100%' }}
              placeholder={t('adminDeploymentPreset.ClusterSizePlaceholder')}
            />
          </Form.Item>
        </BAIFlex>

        {/* Execution */}
        <Divider titlePlacement="left" styles={{ content: { margin: 0 } }}>
          <Typography.Text
            type="secondary"
            style={{ fontSize: token.fontSizeSM }}
          >
            {t('adminDeploymentPreset.SectionExecution')}
          </Typography.Text>
        </Divider>
        <Form.Item
          name="startupCommand"
          label={t('adminDeploymentPreset.StartupCommand')}
        >
          <Input.TextArea
            rows={2}
            placeholder={t('adminDeploymentPreset.StartupCommandPlaceholder')}
          />
        </Form.Item>
        <Form.Item
          name="bootstrapScript"
          label={t('adminDeploymentPreset.BootstrapScript')}
        >
          <Input.TextArea
            rows={3}
            placeholder={t('adminDeploymentPreset.BootstrapScriptPlaceholder')}
          />
        </Form.Item>
        {/* TODO(needs-ui): FR-2761 — environ (env var list) needs key-value editor component */}
        {/* TODO(needs-ui): FR-2761 — resourceSlots needs resource allocation UI */}
        {/* TODO(needs-ui): FR-2761 — presetValues needs dedicated UI component */}
        {/* TODO(needs-ui): FR-2761 — modelDefinition needs structured editor */}

        {/* Deployment Defaults */}
        <Divider titlePlacement="left" styles={{ content: { margin: 0 } }}>
          <Typography.Text
            type="secondary"
            style={{ fontSize: token.fontSizeSM }}
          >
            {t('adminDeploymentPreset.SectionDeploymentDefaults')}
          </Typography.Text>
        </Divider>
        <BAIFlex gap="md" wrap="wrap">
          <Form.Item
            name="replicaCount"
            label={t('adminDeploymentPreset.Replicas')}
            style={{ flex: 1, minWidth: 120 }}
          >
            <InputNumber
              min={1}
              style={{ width: '100%' }}
              placeholder={t('adminDeploymentPreset.ReplicasPlaceholder')}
            />
          </Form.Item>
          <Form.Item
            name="revisionHistoryLimit"
            label={t('adminDeploymentPreset.RevisionHistoryLimit')}
            style={{ flex: 1, minWidth: 120 }}
          >
            <InputNumber
              min={1}
              style={{ width: '100%' }}
              placeholder={t(
                'adminDeploymentPreset.RevisionHistoryLimitPlaceholder',
              )}
            />
          </Form.Item>
        </BAIFlex>
        {/* deploymentStrategy is temporarily disabled per product decision */}
        {/* <Form.Item
          name="deploymentStrategy"
          label={t('adminDeploymentPreset.Strategy')}
        >
          <Select
            placeholder={t('adminDeploymentPreset.SelectStrategy')}
            allowClear
            options={[
              { value: 'ROLLING', label: 'ROLLING' },
              { value: 'BLUE_GREEN', label: 'BLUE_GREEN' },
            ]}
          />
        </Form.Item> */}
        <Form.Item
          name="openToPublic"
          label={t('adminDeploymentPreset.OpenToPublic')}
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        {/* Edit-only: rank */}
        {isEditMode && (
          <>
            <Divider titlePlacement="left" styles={{ content: { margin: 0 } }}>
              <Typography.Text
                type="secondary"
                style={{ fontSize: token.fontSizeSM }}
              >
                {t('adminDeploymentPreset.SectionAdvanced')}
              </Typography.Text>
            </Divider>
            <Form.Item
              name="rank"
              label={t('adminDeploymentPreset.Rank')}
              tooltip={t('adminDeploymentPreset.RankTooltip')}
            >
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </>
        )}
      </Form>
    </BAIModal>
  );
};

export default AdminDeploymentPresetSettingModal;
