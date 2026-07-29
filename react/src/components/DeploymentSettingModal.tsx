/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { DeploymentSettingModalCreateMutation } from '../__generated__/DeploymentSettingModalCreateMutation.graphql';
import { DeploymentSettingModalUpdateMutation } from '../__generated__/DeploymentSettingModalUpdateMutation.graphql';
import { DeploymentSettingModal_deployment$key } from '../__generated__/DeploymentSettingModal_deployment.graphql';
import { useCurrentDomainValue, useWebUINavigate } from '../hooks';
import { useProjectPath } from '../hooks/useRouteScope';
import { ProjectContext, ProjectContextOrNull } from '../types/projectContext';
import ProjectSelectForAdminPage from './ProjectSelectForAdminPage';
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
import React, { Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useMutation } from 'react-relay';

interface FormValues {
  name: string;
  tags: string[];
  openToPublic: boolean;
  replicaCount: number;
  resourceGroup: string;
  projectId?: string;
}

export interface DeploymentSettingModalProps extends BAIModalProps {
  /** When provided → update mode; when null/undefined → create mode. */
  deploymentFrgmt?: DeploymentSettingModal_deployment$key | null;
  /**
   * Explicit project prop contract (ADR-0001). The page decides the project
   * context; this modal never reads the ambient current project.
   *
   * Create mode:
   * - Non-null: no in-modal selector is rendered and the create mutation's
   *   `metadata.projectId` is exactly this project's id. Resource-group
   *   options are scoped to this project.
   * - `null` ("no ambient project context", e.g. super-admin pages): a
   *   required in-modal project selector is rendered and the mutation
   *   targets the project chosen there.
   *
   * Edit mode (`deploymentFrgmt` present) does not need a project — the
   * deployment already belongs to one — so the prop is ignored there.
   */
  project: ProjectContextOrNull;
  onRequestClose: (success: boolean) => void;
}

const DeploymentSettingModal: React.FC<DeploymentSettingModalProps> = ({
  deploymentFrgmt,
  project,
  onRequestClose,
  ...baiModalProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [form] = Form.useForm<FormValues>();
  const navigate = useWebUINavigate();
  const buildProjectPath = useProjectPath();
  const { message } = App.useApp();
  const currentDomain = useCurrentDomainValue();
  // ADR-0001: the target project comes exclusively from the `project` prop.
  // When it is `null`, the user picks the target project with the in-modal
  // selector below; the chosen value is tracked here so the resource-group
  // options follow the chosen project, never the ambient one.
  const [selectedProject, setSelectedProject] = useState<ProjectContext | null>(
    null,
  );
  const effectiveProject = project ?? selectedProject;

  const deployment = useFragment(
    graphql`
      fragment DeploymentSettingModal_deployment on ModelDeployment {
        id
        metadata {
          name
          tags
          resourceGroupName
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
            metadata {
              name
              tags
              resourceGroupName
            }
            networkAccess {
              openToPublic
            }
            replicaState {
              desiredReplicaCount
            }
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
                replicaCount: values.replicaCount,
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
              message.success(t('deployment.DeploymentUpdated'));
              onRequestClose(true);
            },
            onError: (err) => {
              message.error(
                err.message ?? t('deployment.FailedToUpdateDeployment'),
              );
            },
          });
        } else {
          // The required rule on the in-modal project selector (null mode)
          // guarantees a chosen project before validation passes; this guard
          // only narrows the type.
          if (!effectiveProject) {
            return;
          }
          commitCreate({
            variables: {
              input: {
                metadata: {
                  projectId: effectiveProject.id,
                  domainName: currentDomain,
                  name: values.name,
                  tags: values.tags?.length ? values.tags : null,
                  resourceGroupName: values.resourceGroup,
                },
                networkAccess: {
                  // TODO: expose preferredDomainName once backend business logic is in place
                  preferredDomainName: null,
                  openToPublic: values.openToPublic,
                },
                // TODO: expose strategy type selection once BLUE_GREEN is supported server-side
                defaultDeploymentStrategy: { type: 'ROLLING' },
                replicaCount: values.replicaCount,
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
              message.success(t('deployment.DeploymentCreated'));
              onRequestClose(true);
              navigate(buildProjectPath(`deployments/${newId}`));
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
              : { openToPublic: false, replicaCount: 1, tags: [] }
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
          {!deployment && project === null && (
            <Form.Item
              name="projectId"
              label={t('data.folders.TargetProject')}
              required
              rules={[
                {
                  required: true,
                  message: t('deployment.TargetProjectRequired'),
                },
              ]}
            >
              {/* The Suspense boundary swallows Form.Item's injected props,
                  so the field value is written explicitly on selection —
                  same manual-wiring pattern as FolderCreateModalV2. */}
              <Suspense fallback={<Skeleton.Input active block />}>
                <ProjectSelectForAdminPage
                  data-testid="deployment-create-project-select"
                  domain={currentDomain}
                  onSelectProject={(projectInfo) => {
                    setSelectedProject({
                      id: projectInfo.projectId,
                      name: projectInfo.projectName,
                    });
                    form.setFieldValue('projectId', projectInfo.projectId);
                    form.validateFields(['projectId']);
                    // The resource-group options are keyed to the chosen
                    // project; drop any group picked for a previous choice.
                    form.setFieldValue('resourceGroup', undefined);
                  }}
                />
              </Suspense>
            </Form.Item>
          )}
          {deployment ? (
            <Form.Item
              label={t('modelStore.ResourceGroup')}
              tooltip={t('modelStore.ResourceGroupTooltip')}
              required
              extra={
                <Typography.Text type="warning">
                  {t('deployment.ResourceGroupCannotBeChanged')}
                </Typography.Text>
              }
            >
              {currentResourceGroup ? (
                <Typography.Text>{currentResourceGroup}</Typography.Text>
              ) : (
                <Typography.Text type="secondary">—</Typography.Text>
              )}
            </Form.Item>
          ) : (
            <Form.Item
              name="resourceGroup"
              label={t('modelStore.ResourceGroup')}
              tooltip={t('modelStore.ResourceGroupTooltip')}
              rules={[{ required: true }]}
              extra={
                <Typography.Text type="warning">
                  {t('deployment.ResourceGroupCannotBeChanged')}
                </Typography.Text>
              }
            >
              <BAIProjectResourceGroupSelect
                key={effectiveProject?.id ?? 'no-project'}
                projectName={effectiveProject?.name ?? ''}
                disabled={!effectiveProject}
                autoSelectDefault
                style={{ width: '100%' }}
              />
            </Form.Item>
          )}
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
          <Form.Item
            label={t('deployment.OpenToPublic')}
            tooltip={t('deployment.OpenToPublicTooltip')}
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
