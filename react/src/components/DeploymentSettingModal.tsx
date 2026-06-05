/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { DeploymentSettingModalCreateMutation } from '../__generated__/DeploymentSettingModalCreateMutation.graphql';
import { DeploymentSettingModalUpdateMutation } from '../__generated__/DeploymentSettingModalUpdateMutation.graphql';
import { DeploymentSettingModal_deployment$key } from '../__generated__/DeploymentSettingModal_deployment.graphql';
import {
  useCurrentDomainValue,
  useSuspendedBackendaiClient,
  useWebUINavigate,
} from '../hooks';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import {
  App,
  Button,
  Checkbox,
  Form,
  Input,
  InputNumber,
  Select,
  Skeleton,
  theme,
  Tooltip,
  Typography,
} from 'antd';
import {
  BAIButton,
  BAIFlex,
  BAIModal,
  BAIModalProps,
  BAIProjectResourceGroupSelect,
  toLocalId,
} from 'backend.ai-ui';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useMutation } from 'react-relay';

interface FormValues {
  name: string;
  tags: string[];
  openToPublic: boolean;
  replicaCount: number;
  resourceGroup: string;
}

export interface DeploymentSettingModalProps extends BAIModalProps {
  /** When provided → update mode; when null/undefined → create mode. */
  deploymentFrgmt?: DeploymentSettingModal_deployment$key | null;
  onRequestClose: (success: boolean) => void;
}

const DeploymentSettingModal: React.FC<DeploymentSettingModalProps> = ({
  deploymentFrgmt,
  onRequestClose,
  ...baiModalProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [form] = Form.useForm<FormValues>();
  const navigate = useWebUINavigate();
  const { message } = App.useApp();
  const { id: projectId, name: projectName } = useCurrentProjectValue();
  const currentDomain = useCurrentDomainValue();
  const baiClient = useSuspendedBackendaiClient();
  // The Model Deployment GraphQL surface was reworked in 26.4.4 (see the
  // `model-deployment-revised-schema` capability). We branch every deployment
  // query/mutation on this single flag: 26.4.3 (legacy) vs 26.4.4 (revised).
  // On the revised schema the deployment-level resource group lives on
  // `metadata` and the replica-count input is `replicaCount`; on legacy the
  // resource group is chosen per revision (add-revision modal) and the input is
  // `desiredReplicaCount`.
  const isRevisedDeploymentSchema = baiClient.supports(
    'model-deployment-revised-schema',
  );
  const buildReplicaCountInput = (
    count: number,
  ): { replicaCount: number } | { desiredReplicaCount: number } =>
    isRevisedDeploymentSchema
      ? { replicaCount: count }
      : { desiredReplicaCount: count };

  const deployment = useFragment(
    graphql`
      fragment DeploymentSettingModal_deployment on ModelDeployment {
        id
        metadata {
          name
          tags
          resourceGroupName @since(version: "26.4.4")
        }
        networkAccess {
          openToPublic
        }
        replicaState {
          desiredReplicaCount
        }
      }
    `,
    deploymentFrgmt ?? null,
  );

  const currentResourceGroup = deployment?.metadata.resourceGroupName ?? '';

  const [commitCreate, isCreating] =
    useMutation<DeploymentSettingModalCreateMutation>(graphql`
      mutation DeploymentSettingModalCreateMutation(
        $input: CreateDeploymentInput!
      ) {
        createModelDeployment(input: $input) {
          deployment {
            id
          }
        }
      }
    `);

  const [commitUpdate, isUpdating] =
    useMutation<DeploymentSettingModalUpdateMutation>(graphql`
      mutation DeploymentSettingModalUpdateMutation(
        $input: UpdateDeploymentInput!
      ) {
        updateModelDeployment(input: $input) {
          deployment {
            id
          }
        }
      }
    `);

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        if (deployment) {
          commitUpdate({
            variables: {
              input: {
                id: toLocalId(deployment.id) ?? deployment.id,
                name: values.name,
                tags: values.tags?.length ? values.tags : null,
                openToPublic: values.openToPublic,
                ...(buildReplicaCountInput(values.replicaCount) as {
                  replicaCount: number;
                }),
              },
            },
            onCompleted: (_response, errors) => {
              if (errors && errors.length > 0) {
                message.error(
                  errors.map((e) => e.message).join('\n') ||
                    t('deployment.FailedToUpdateDeployment'),
                );
                return;
              }
              onRequestClose(true);
            },
            onError: (err) => {
              message.error(
                err.message ?? t('deployment.FailedToUpdateDeployment'),
              );
            },
          });
        } else {
          if (!projectId) {
            message.error(t('general.ErrorOccurred'));
            return;
          }
          commitCreate({
            variables: {
              input: {
                metadata: {
                  projectId,
                  domainName: currentDomain,
                  name: values.name,
                  tags: values.tags?.length ? values.tags : null,
                  // `resourceGroupName` only exists on metadata from 26.4.4;
                  // older cores take the resource group per revision instead.
                  // The legacy branch is cast to the new shape because the
                  // generated input type marks `resourceGroupName` required.
                  ...(isRevisedDeploymentSchema
                    ? { resourceGroupName: values.resourceGroup }
                    : ({} as { resourceGroupName: string })),
                },
                networkAccess: {
                  // TODO: expose preferredDomainName once backend business logic is in place
                  preferredDomainName: null,
                  openToPublic: values.openToPublic,
                },
                // TODO: expose strategy type selection once BLUE_GREEN is supported server-side
                defaultDeploymentStrategy: { type: 'ROLLING' },
                ...(buildReplicaCountInput(values.replicaCount) as {
                  replicaCount: number;
                }),
                initialRevision: null,
              },
            },
            onCompleted: (response, errors) => {
              if (errors && errors.length > 0) {
                message.error(
                  errors.map((e) => e.message).join('\n') ||
                    t('deployment.FailedToCreateDeployment'),
                );
                return;
              }
              const createModelDeployment = response.createModelDeployment;
              if (!createModelDeployment) {
                message.error(t('deployment.FailedToCreateDeployment'));
                return;
              }
              const newId = toLocalId(createModelDeployment.deployment.id);
              onRequestClose(true);
              navigate(`/deployments/${newId}`);
            },
            onError: (err) => {
              message.error(
                err.message ?? t('deployment.FailedToCreateDeployment'),
              );
            },
          });
        }
      })
      .catch(() => {});
  };

  return (
    <BAIModal
      {...baiModalProps}
      title={
        deployment
          ? t('deployment.EditDeployment')
          : t('deployment.CreateDeployment')
      }
      onCancel={() => onRequestClose(false)}
      destroyOnHidden
      width={520}
      confirmLoading={isCreating || isUpdating}
      footer={
        <BAIFlex justify="end" gap="xs">
          <Button onClick={() => onRequestClose(false)}>
            {t('button.Cancel')}
          </Button>
          <BAIButton
            type="primary"
            loading={isCreating || isUpdating}
            onClick={handleOk}
          >
            {deployment ? t('button.Save') : t('button.Create')}
          </BAIButton>
        </BAIFlex>
      }
    >
      <Suspense fallback={<Skeleton active />}>
        <Form<FormValues>
          form={form}
          layout="vertical"
          preserve={false}
          initialValues={
            deployment
              ? {
                  name: deployment.metadata.name ?? '',
                  tags: (deployment.metadata.tags ?? []).flatMap((tag) =>
                    tag
                      .split(',')
                      .map((t) => t.trim())
                      .filter(Boolean),
                  ),
                  openToPublic: deployment.networkAccess.openToPublic ?? false,
                  replicaCount:
                    deployment.replicaState?.desiredReplicaCount ?? 1,
                }
              : {
                  openToPublic: !isRevisedDeploymentSchema,
                  replicaCount: 1,
                  tags: [],
                }
          }
          style={{ marginTop: token.marginXS }}
        >
          <Form.Item
            name="name"
            label={t('deployment.DeploymentName')}
            tooltip={t('deployment.DeploymentNameTooltip')}
            rules={[{ required: true, message: t('deployment.NameRequired') }]}
          >
            <Input placeholder={t('deployment.NamePlaceholder')} />
          </Form.Item>
          {deployment ? (
            <Form.Item
              label={t('modelStore.ResourceGroup')}
              tooltip={t('modelStore.ResourceGroupTooltip')}
            >
              {currentResourceGroup ? (
                <Typography.Text>{currentResourceGroup}</Typography.Text>
              ) : (
                <Typography.Text type="secondary">—</Typography.Text>
              )}
            </Form.Item>
          ) : isRevisedDeploymentSchema ? (
            <Form.Item
              name="resourceGroup"
              label={t('modelStore.ResourceGroup')}
              tooltip={t('modelStore.ResourceGroupTooltip')}
              rules={[{ required: true }]}
            >
              <BAIProjectResourceGroupSelect
                projectName={projectName ?? ''}
                autoSelectDefault
                style={{ width: '100%' }}
              />
            </Form.Item>
          ) : // Pre-26.4.4 cores have no deployment-level resource group;
          // it is selected per revision in the add-revision modal instead.
          null}
          <Form.Item
            name="replicaCount"
            label={t('deployment.DesiredReplicas')}
            tooltip={t('deployment.DesiredReplicasTooltip')}
            rules={[
              {
                required: true,
                message: t('deployment.DesiredReplicasRequired'),
              },
            ]}
          >
            <InputNumber min={deployment ? 0 : 1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="tags"
            label={t('deployment.Tags')}
            tooltip={t('deployment.TagsTooltip')}
          >
            <Select
              mode="tags"
              placeholder={t('deployment.TagsPlaceholder')}
              tokenSeparators={[',', '\n']}
              notFoundContent={null}
            />
          </Form.Item>
          {/* TODO(needs-backend): the manager currently rejects changes to
              openToPublic after a deployment is created, so the field is
              forced read-only in edit mode. Drop the `disabled` + Tooltip
              wrapping once the backend supports updating this setting. */}
          {/* On 26.4.3 (pre-revised schema) createAccessToken is broken, so
              private deployments cannot issue tokens and are effectively
              unusable. Force openToPublic=true by hiding the selector. */}
          <Form.Item
            label={t('deployment.OpenToPublic')}
            tooltip={t('deployment.OpenToPublicTooltip')}
            hidden={!isRevisedDeploymentSchema}
          >
            <Tooltip
              title={
                deployment ? t('deployment.OpenToPublicCannotBeChanged') : ''
              }
            >
              {/* Wrap with span so the Tooltip still receives mouseenter when
                  the inner Checkbox is disabled (disabled controls swallow
                  pointer events). */}
              <span style={{ display: 'inline-block' }}>
                <Form.Item name="openToPublic" valuePropName="checked" noStyle>
                  <Checkbox disabled={!!deployment}>
                    {t('deployment.Public')}
                  </Checkbox>
                </Form.Item>
              </span>
            </Tooltip>
          </Form.Item>
        </Form>
      </Suspense>
    </BAIModal>
  );
};

export default DeploymentSettingModal;
