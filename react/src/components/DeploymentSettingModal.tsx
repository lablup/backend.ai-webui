/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { DeploymentSettingModalCreateMutation } from '../__generated__/DeploymentSettingModalCreateMutation.graphql';
import { DeploymentSettingModalUpdateMutation } from '../__generated__/DeploymentSettingModalUpdateMutation.graphql';
import { DeploymentSettingModal_deployment$key } from '../__generated__/DeploymentSettingModal_deployment.graphql';
import { App } from '../app-shim';
import { Form } from '../form-engine';
import { useCurrentDomainValue, useWebUINavigate } from '../hooks';
import { useProjectPath } from '../hooks/useRouteScope';
import { theme } from '../theme-shim';
import { ProjectContext } from '../types/projectContext';
import BAIFormItem from './BAIFormItem';
import {
  AstryxFormNumberInput,
  AstryxFormTagsInput,
  AstryxFormTextInput,
} from './astryxFormControls';
import { Button } from '@astryxdesign/core/Button';
import { CheckboxInput } from '@astryxdesign/core/CheckboxInput';
import { Text } from '@astryxdesign/core/Text';
import {
  BAISkeleton,
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

/**
 * Explicit project prop contract (ADR-0001), expressed as a discriminated
 * union rather than a runtime check: the page decides the project context and
 * this modal never reads the ambient current project.
 *
 * - **Create** (`deploymentFrgmt` absent): a deployment is always created
 *   inside one project, and creation is offered only from the project-scoped
 *   user menu — so `project` is required and non-null. There is no in-modal
 *   selector and no "missing project" error path; the create mutation's
 *   `metadata.projectId` is exactly this project's id and the resource-group
 *   options are scoped to it.
 * - **Edit** (`deploymentFrgmt` present): the deployment already belongs to a
 *   project, so `project` is not accepted at all.
 */
type DeploymentSettingModalProjectProps =
  | {
      /** Edit-only call site: no project is accepted. */
      deploymentFrgmt: DeploymentSettingModal_deployment$key;
      project?: never;
    }
  | {
      /**
       * Project-scoped call site: may open in create mode (fragment absent)
       * or edit mode (fragment present), and therefore must supply a project.
       */
      deploymentFrgmt?: DeploymentSettingModal_deployment$key | null;
      project: ProjectContext;
    };

export type DeploymentSettingModalProps = BAIModalProps & {
  onRequestClose: (success: boolean) => void;
} & DeploymentSettingModalProjectProps;

// Bridge for `BAIFormItem name="openToPublic" valuePropName="checked"`: the
// form engine injects `checked` + `onChange`, Astryx CheckboxInput wants
// `value` + value-first `onChange`.
const PublicCheckbox: React.FC<{
  checked?: boolean;
  onChange?: (next: boolean) => void;
  label: string;
  disabled?: boolean;
}> = ({ checked, onChange, label, disabled }) => {
  'use memo';
  return (
    <CheckboxInput
      label={label}
      value={checked ?? false}
      onChange={(next) => onChange?.(next)}
      isDisabled={disabled}
    />
  );
};

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
            ...DeploymentSettingModal_deployment
            metadata {
              updatedAt
              ...BAIDeploymentTagChips_metadata
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
          // No "missing project" branch: the only props member that permits a
          // create (fragment absent) requires a non-null `project`, so this is
          // unreachable-by-construction rather than guarded at runtime. The
          // assertion is needed only because `deploymentFrgmt` is an opaque
          // fragment key, not a unit type, so TypeScript cannot use it as a
          // discriminant to narrow the union here.
          commitCreate({
            variables: {
              input: {
                metadata: {
                  projectId: project!.id,
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
          <Button
            label={t('button.Cancel')}
            onClick={() => onRequestClose(false)}
          />
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
      <Suspense fallback={<BAISkeleton />}>
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
          <BAIFormItem
            name="name"
            label={t('deployment.DeploymentName')}
            tooltip={t('deployment.DeploymentNameTooltip')}
            rules={[{ required: true, message: t('deployment.NameRequired') }]}
          >
            <AstryxFormTextInput
              label={t('deployment.DeploymentName')}
              placeholder={t('deployment.NamePlaceholder')}
            />
          </BAIFormItem>
          {deployment ? (
            <BAIFormItem
              label={t('modelStore.ResourceGroup')}
              tooltip={t('modelStore.ResourceGroupTooltip')}
              required
              // PILOT-DECISION: the extra note used antd
              // `Typography.Text type="warning"` — Astryx Text has no warning
              // TextColor, and BAIFormItem's `extra` slot already renders in
              // secondary color, so the warning tint is dropped and the plain
              // string is passed (defaults-first; a Banner would over-signal a
              // static informational note).
              extra={t('deployment.ResourceGroupCannotBeChanged')}
            >
              {currentResourceGroup ? (
                <Text>{currentResourceGroup}</Text>
              ) : (
                <Text color="secondary">—</Text>
              )}
            </BAIFormItem>
          ) : (
            <BAIFormItem
              name="resourceGroup"
              label={t('modelStore.ResourceGroup')}
              tooltip={t('modelStore.ResourceGroupTooltip')}
              rules={[{ required: true }]}
              extra={t('deployment.ResourceGroupCannotBeChanged')}
            >
              <BAIProjectResourceGroupSelect
                projectName={project?.name ?? ''}
                autoSelectDefault
                style={{ width: '100%' }}
              />
            </BAIFormItem>
          )}
          <BAIFormItem
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
            <AstryxFormNumberInput
              label={t('deployment.DesiredReplicas')}
              min={deployment ? 0 : 1}
            />
          </BAIFormItem>
          <BAIFormItem
            name="tags"
            label={t('deployment.Tags')}
            tooltip={t('deployment.TagsTooltip')}
          >
            {/* The shared adapter, not a local Tokenizer bridge: it is the
                same component, and it carries `tokenSeparators`, which this
                field's own placeholder ("Enter tags, separated by commas")
                promises. */}
            <AstryxFormTagsInput
              label={t('deployment.Tags')}
              placeholder={t('deployment.TagsPlaceholder')}
              tokenSeparators={[',', ' ']}
            />
          </BAIFormItem>
          {/* TODO(needs-backend): the manager currently rejects changes to
              openToPublic after a deployment is created, so the field is
              forced read-only in edit mode. Drop the `disabled` prop and the
              `extra` note once the backend supports updating this setting. */}
          <BAIFormItem
            name="openToPublic"
            valuePropName="checked"
            label={t('deployment.OpenToPublic')}
            tooltip={t('deployment.OpenToPublicTooltip')}
            // The constraint is field-level metadata, not an explanation of a
            // disabled control: it already holds while creating, when nothing
            // is disabled yet. So it sits in the same `extra` slot as Resource
            // Group's identical note above instead of CheckboxInput's
            // `disabledMessage`, which only surfaces on hover of an
            // already-disabled control and so never reached create mode.
            extra={t('deployment.OpenToPublicCannotBeChanged')}
          >
            <PublicCheckbox
              label={t('deployment.Public')}
              disabled={!!deployment}
            />
          </BAIFormItem>
        </Form>
      </Suspense>
    </BAIModal>
  );
};

export default DeploymentSettingModal;
