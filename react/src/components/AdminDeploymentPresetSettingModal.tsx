/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { AdminDeploymentPresetSettingModalCreateMutation } from '../__generated__/AdminDeploymentPresetSettingModalCreateMutation.graphql';
import type { AdminDeploymentPresetSettingModalFragment$key } from '../__generated__/AdminDeploymentPresetSettingModalFragment.graphql';
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

type DeploymentStrategyType = 'ROLLING' | 'BLUE_GREEN';

type FormInputType = {
  name: string;
  description?: string;
  runtimeVariantId: string;
  // TODO(needs-backend): FR-2761 — imageId is required per spec but not yet in CreateDeploymentRevisionPresetInput schema
  // imageId?: string;
  // TODO(needs-backend): FR-2761 — cluster fields not yet in schema
  // clusterMode?: 'single-node' | 'multi-node';
  // clusterSize?: number;
  // TODO(needs-backend): FR-2761 — resource fields not yet in schema
  // resourceSlots?: Record<string, string>;
  // shmem?: number;
  // TODO(needs-backend): FR-2761 — execution fields not yet in schema
  // startupCommand?: string;
  // bootstrapScript?: string;
  // environ?: Array<{ name: string; value: string }>;
  // presetValues?: string;
  // Deployment defaults
  openToPublic?: boolean;
  replicaCount?: number;
  revisionHistoryLimit?: number;
  deploymentStrategy?: DeploymentStrategyType;
  // TODO(needs-backend): FR-2761 — modelDefinition not yet in schema
  // modelDefinition?: string;
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
      showSearch
      optionFilterProp="label"
    />
  );
};

const AdminDeploymentPresetSettingModal: React.FC<
  AdminDeploymentPresetSettingModalProps
> = ({ presetFrgmt, onRequestClose, ...modalProps }) => {
  'use memo';

  const { t } = useTranslation();
  const { message } = App.useApp();
  const { logger } = useBAILogger();
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
        rank: preset.rank,
        openToPublic: preset.deploymentDefaults?.openToPublic ?? undefined,
        replicaCount: preset.deploymentDefaults?.replicaCount ?? undefined,
        revisionHistoryLimit:
          preset.deploymentDefaults?.revisionHistoryLimit ?? undefined,
        deploymentStrategy:
          (preset.deploymentDefaults
            ?.deploymentStrategy as DeploymentStrategyType) ?? undefined,
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
              openToPublic: values.openToPublic,
              replicaCount: values.replicaCount,
              revisionHistoryLimit: values.revisionHistoryLimit,
              deploymentStrategy: values.deploymentStrategy
                ? { type: values.deploymentStrategy }
                : null,
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
              name: values.name,
              openToPublic: values.openToPublic ?? null,
              replicaCount: values.replicaCount ?? null,
              revisionHistoryLimit: values.revisionHistoryLimit ?? null,
              deploymentStrategy: values.deploymentStrategy
                ? { type: values.deploymentStrategy }
                : null,
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
        style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: 4 }}
      >
        {/* Basic Info */}
        <Divider titlePlacement="left" orientationMargin={0}>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
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
        {/*
          TODO(needs-backend): FR-2761 — `description` is supported by
          UpdateDeploymentRevisionPresetInput but not yet by
          CreateDeploymentRevisionPresetInput. Render the field only in edit
          mode for now so create-mode users do not silently lose their input.
        */}
        {isEditMode && (
          <Form.Item
            name="description"
            label={t('adminDeploymentPreset.Description')}
          >
            <Input.TextArea
              rows={2}
              placeholder={t('adminDeploymentPreset.DescriptionPlaceholder')}
            />
          </Form.Item>
        )}
        {isEditMode ? (
          <Form.Item label={t('adminDeploymentPreset.Runtime')}>
            <Typography.Text>
              {preset.runtimeVariant?.name ?? preset.runtimeVariantId}
            </Typography.Text>
          </Form.Item>
        ) : (
          <React.Suspense
            fallback={
              <Form.Item label={t('adminDeploymentPreset.Runtime')}>
                <Select disabled placeholder={t('general.Loading')} />
              </Form.Item>
            }
          >
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
              <RuntimeVariantSelect />
            </Form.Item>
          </React.Suspense>
        )}

        {/* TODO(needs-backend): FR-2761 — imageId field not yet in CreateDeploymentRevisionPresetInput schema */}
        {/* TODO(needs-backend): FR-2761 — cluster fields (clusterMode, clusterSize) not yet in schema */}
        {/* TODO(needs-backend): FR-2761 — resource fields (resourceSlots, shmem) not yet in schema */}
        {/* TODO(needs-backend): FR-2761 — execution fields (startupCommand, bootstrapScript, environ, presetValues) not yet in schema */}

        {/* Deployment Defaults */}
        <Divider titlePlacement="left" orientationMargin={0}>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
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
        <Form.Item
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
        </Form.Item>
        <Form.Item
          name="openToPublic"
          label={t('adminDeploymentPreset.OpenToPublic')}
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        {/* TODO(needs-backend): FR-2761 — modelDefinition textarea not yet in schema */}

        {/* Edit-only: rank */}
        {isEditMode && (
          <>
            <Divider titlePlacement="left" orientationMargin={0}>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
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
