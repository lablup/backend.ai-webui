/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { DeploymentAddRevisionModalPresetTransferFragment$key } from '../__generated__/DeploymentAddRevisionModalPresetTransferFragment.graphql';
import type { DeploymentAddRevisionModalQuery$data } from '../__generated__/DeploymentAddRevisionModalQuery.graphql';
import { DeploymentAddRevisionPresetContentDeployMutation } from '../__generated__/DeploymentAddRevisionPresetContentDeployMutation.graphql';
import type { DeploymentAddRevisionPresetContentFragment$key } from '../__generated__/DeploymentAddRevisionPresetContentFragment.graphql';
import type { DeploymentPresetDetailContentFragment$key } from '../__generated__/DeploymentPresetDetailContentFragment.graphql';
import { useWebUINavigate } from '../hooks';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { useModelStoreProject } from '../hooks/useModelStoreProject';
import DeploymentPresetDetailContent from './DeploymentPresetDetailContent';
import { InfoCircleOutlined } from '@ant-design/icons';
import {
  Alert,
  App,
  Button,
  Form,
  type FormInstance,
  Space,
  Tooltip,
  theme,
} from 'antd';
import {
  BAIAvailablePresetSelect,
  BAIFlex,
  BAIModal,
  BAIProjectResourceGroupSelect,
  BAIProjectVfolderSelect,
  convertToUUID,
  toLocalId,
  useBAILogger,
} from 'backend.ai-ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useMutation } from 'react-relay';

export type PresetFormValues = {
  revisionPresetId: string;
  resourceGroup: string;
  modelFolderId: string;
};

interface DeploymentAddRevisionPresetContentProps {
  deploymentFrgmt:
    | DeploymentAddRevisionPresetContentFragment$key
    | null
    | undefined;
  deploymentRevisionPresetsData: DeploymentAddRevisionModalQuery$data['deploymentRevisionPresets'];
  form: FormInstance<PresetFormValues>;
  onRequestClose: (success?: boolean) => void;
  onIsDeployingChange: (v: boolean) => void;
  /**
   * Notifies the wrapper of the currently selected preset's transfer fragment
   * key. The wrapper reads it via `readInlineData` when the user switches to
   * Custom Mode, so the prefill object's type stays in sync with the
   * fragment definition without a manually-maintained interface.
   */
  onSelectedPresetChange: (
    preset: DeploymentAddRevisionModalPresetTransferFragment$key | null,
  ) => void;
}

export const DeploymentAddRevisionPresetContent: React.FC<
  DeploymentAddRevisionPresetContentProps
> = ({
  deploymentFrgmt,
  deploymentRevisionPresetsData,
  form,
  onRequestClose,
  onIsDeployingChange,
  onSelectedPresetChange,
}) => {
  'use memo';

  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const navigate = useWebUINavigate();
  const { id: projectId, name: projectName } = useCurrentProjectValue();
  // The model folder picker scopes to the MODEL_STORE project, not the
  // user's currently selected project — model cards live in the
  // domain-wide model store regardless of which project the user is
  // browsing right now.
  const { id: modelStoreProjectId } = useModelStoreProject();
  const { logger } = useBAILogger();

  // Preset-mode slice of the wrapper's `DeploymentAddRevisionModalQuery`.
  // Only the default model folder is needed from `currentRevision` here;
  // the rest of the deployment payload is consumed by the Custom body
  // via its own fragment.
  const deployment = useFragment(
    graphql`
      fragment DeploymentAddRevisionPresetContentFragment on ModelDeployment {
        metadata {
          projectId
        }
        currentRevision {
          modelMountConfig {
            vfolderId
          }
        }
      }
    `,
    deploymentFrgmt,
  );

  const availablePresets = (deploymentRevisionPresetsData?.edges ?? [])
    .map((edge) => edge?.node)
    .filter((node): node is NonNullable<typeof node> => node != null);

  const hasNoPresets = availablePresets.length === 0;

  // The parent deployment's vfolder is the default Model Folder. Users can
  // override it in this mode (in contrast to the VFolder/ModelStore entry
  // point where the folder is locked in by context).
  const defaultModelFolderId =
    deployment?.currentRevision?.modelMountConfig?.vfolderId ?? undefined;

  const [commitDeploy] =
    useMutation<DeploymentAddRevisionPresetContentDeployMutation>(graphql`
      mutation DeploymentAddRevisionPresetContentDeployMutation(
        $vfolderId: UUID!
        $input: DeployVFolderV2Input!
      ) {
        deployVfolderV2(vfolderId: $vfolderId, input: $input) {
          deploymentId
          deploymentName
        }
      }
    `);

  const [presetDetailFrgmt, setPresetDetailFrgmt] =
    useState<DeploymentPresetDetailContentFragment$key | null>(null);

  // Bridge form state → wrapper: the wrapper needs the selected preset's
  // transfer-fragment ref to build a Preset → Custom prefill via
  // `readInlineData`. Each node already carries the fragment spread.
  const handlePresetChange = (presetId: string) => {
    const node =
      availablePresets.find((p) => (toLocalId(p.id) ?? p.id) === presetId) ??
      null;
    onSelectedPresetChange(node);
  };

  const handleFinish = () => {
    if (!projectId) {
      message.error(t('general.ErrorOccurred'));
      return;
    }

    form.validateFields().then((values) => {
      onIsDeployingChange(true);
      commitDeploy({
        variables: {
          vfolderId: convertToUUID(values.modelFolderId),
          input: {
            projectId,
            revisionPresetId: values.revisionPresetId,
            resourceGroup: values.resourceGroup,
            desiredReplicaCount: 1,
          },
        },
        onCompleted: (response, errors) => {
          onIsDeployingChange(false);
          if (errors && errors.length > 0) {
            const errMsg = errors.map((e) => e.message).join('\n');
            logger.error(
              '[DeploymentAddRevisionModal] deployVfolderV2 returned errors',
              errors,
            );
            message.error(errMsg || t('modelStore.DeployFailed'));
            return;
          }
          const newDeploymentId = String(response.deployVfolderV2.deploymentId);
          message.success(t('modelStore.DeploySuccess'));
          onRequestClose(true);
          navigate(`/deployments/${newDeploymentId}`);
        },
        onError: (error) => {
          onIsDeployingChange(false);
          logger.error(
            '[DeploymentAddRevisionModal] deployVfolderV2 failed',
            error,
          );
          message.error(error.message || t('modelStore.DeployFailed'));
        },
      });
    });
  };

  // Empty-state: per spec, when no preset is available in Preset Mode, guide
  // the user to switch to Custom Mode (this differs from the VFolder/ModelStore
  // empty-state which links to DeploymentSettingModal, since the user is
  // already inside an existing deployment here).
  if (hasNoPresets) {
    return (
      <Alert
        type="info"
        showIcon
        style={{ marginTop: token.marginXS }}
        title={t('deployment.NoPresetsAvailable')}
        description={t('deployment.NoPresetsAvailableSwitchToCustom')}
      />
    );
  }

  return (
    <Form<PresetFormValues>
      form={form}
      layout="vertical"
      style={{ marginTop: token.marginXS }}
      onFinish={handleFinish}
      initialValues={{
        modelFolderId: defaultModelFolderId,
      }}
    >
      <Form.Item
        label={t('modelStore.Preset')}
        tooltip={t('modelStore.PresetTooltip')}
        required
      >
        <BAIFlex direction="row" gap="xs">
          <Form.Item
            name="revisionPresetId"
            noStyle
            rules={[{ required: true }]}
          >
            <BAIAvailablePresetSelect
              onChange={handlePresetChange}
              style={{ flex: 1 }}
            />
          </Form.Item>
          <Form.Item dependencies={['revisionPresetId']} noStyle>
            {({ getFieldValue }) => {
              const selectedId = getFieldValue('revisionPresetId');
              return (
                <Space.Compact>
                  <Tooltip title={t('modelService.DeploymentPresetDetail')}>
                    <Button
                      icon={<InfoCircleOutlined />}
                      disabled={!selectedId}
                      onClick={() => {
                        const node = availablePresets.find(
                          (p) => (toLocalId(p.id) ?? p.id) === selectedId,
                        );
                        if (node) setPresetDetailFrgmt(node);
                      }}
                    />
                  </Tooltip>
                </Space.Compact>
              );
            }}
          </Form.Item>
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
          style={{ width: '100%' }}
        />
      </Form.Item>

      <Form.Item
        name="modelFolderId"
        label={t('deployment.ModelFolder')}
        rules={[{ required: true }]}
      >
        <BAIProjectVfolderSelect
          projectId={modelStoreProjectId ?? ''}
          disabled={!modelStoreProjectId}
          filter={{
            usageMode: { equals: 'MODEL' },
            status: { equals: 'READY' },
          }}
          style={{ width: '100%' }}
        />
      </Form.Item>

      <BAIModal
        open={!!presetDetailFrgmt}
        centered
        title={t('modelService.DeploymentPresetDetail')}
        onCancel={() => setPresetDetailFrgmt(null)}
        destroyOnHidden
        footer={null}
      >
        {presetDetailFrgmt && (
          <DeploymentPresetDetailContent presetFrgmt={presetDetailFrgmt} />
        )}
      </BAIModal>
    </Form>
  );
};

export default DeploymentAddRevisionPresetContent;
