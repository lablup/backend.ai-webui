/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ResourceGroupDefaultSessionOptionsModalFragment$key } from '../__generated__/ResourceGroupDefaultSessionOptionsModalFragment.graphql';
import { ResourceGroupDefaultSessionOptionsModalMutation } from '../__generated__/ResourceGroupDefaultSessionOptionsModalMutation.graphql';
import {
  ResourceGroupDefaultSessionOptionsModal_options$key,
  SessionAgentSelectionPolicy,
  SessionFailurePolicy,
} from '../__generated__/ResourceGroupDefaultSessionOptionsModal_options.graphql';
import { App } from '../app-shim';
import { Form, FormInstance } from '../form-engine';
import BAIFormItem from './BAIFormItem';
import {
  HandlerNameOption,
  HandlerOptionsFormFields,
  HandlerOptionsFormValue,
  toHandlerOptionsFormValue,
  toHandlerOptionsInput,
} from './ResourceGroupHandlerOptionsFields';
import ResourceGroupOptionsCollapsible from './ResourceGroupOptionsCollapsible';
import {
  SessionExecutionSpecFormFields,
  SessionExecutionSpecFormValue,
  toKernelExecutionSpecInput,
  toSessionExecutionSpecFormValue,
} from './ResourceGroupSessionExecutionSpecFields';
import { Grid } from '@lablup/ui-common/Grid';
import {
  BAIAlert,
  BAIFlex,
  BAIModal,
  BAIModalProps,
  BAINumberInput,
  BAISelector,
  BAISwitch,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useMutation } from 'react-relay';

type FormValues = {
  priority: number;
  isPreemptible: boolean;
  clusterMode: string;
  defaultFailurePolicy: SessionFailurePolicy;
  agentSelectionPolicy: SessionAgentSelectionPolicy;
  handlerOptions?: HandlerOptionsFormValue;
  sessionExecutionSpec?: SessionExecutionSpecFormValue;
};

export type ResourceGroupDefaultSessionOptionsSection =
  'sessionExecutionSpec' | 'schedulerOptions' | 'handlerOptions';

// TODO(needs-backend): BA-8372 — the manager validates these names against its
// live registry but exposes no query for the session set (deployment has
// `schedulingHandlers`); read them from the server once it does.
const SESSION_HANDLER_NAME_OPTIONS: ReadonlyArray<HandlerNameOption> = [
  'check-precondition',
  'deprioritize-sessions',
  'preempt-sessions',
  'release-reserved-sessions',
  'reschedule-sessions',
  'schedule-sessions',
  'start-sessions',
  'sweep-sessions',
  'terminate-sessions',
].map((value) => ({ value }));

interface ResourceGroupDefaultSessionOptionsModalProps extends Omit<
  BAIModalProps,
  'onOk' | 'onCancel'
> {
  resourceGroupFrgmt: ResourceGroupDefaultSessionOptionsModalFragment$key;
  // When set, only this section starts expanded; the others stay in the form, collapsed.
  initialOpenSection?: ResourceGroupDefaultSessionOptionsSection;
  onRequestClose: (success: boolean) => void;
}

// The manager answers `SINGLE_NODE` or `single-node` depending on the path.
const normalizeClusterMode = (value?: string | null) =>
  _.replace(_.toLower(value ?? 'single-node'), '_', '-');

const ResourceGroupDefaultSessionOptionsModal: React.FC<
  ResourceGroupDefaultSessionOptionsModalProps
> = ({
  resourceGroupFrgmt,
  initialOpenSection,
  onRequestClose,
  ...modalProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const isInitiallyOpen = (
    section: ResourceGroupDefaultSessionOptionsSection,
  ) => !initialOpenSection || initialOpenSection === section;
  const { message } = App.useApp();
  const formRef = useRef<FormInstance<FormValues>>(null);

  const resourceGroup = useFragment(
    graphql`
      fragment ResourceGroupDefaultSessionOptionsModalFragment on ResourceGroup {
        id
        name
        defaultSessionOptions {
          ...ResourceGroupDefaultSessionOptionsModal_options
        }
      }
    `,
    resourceGroupFrgmt,
  );
  const options =
    useFragment<ResourceGroupDefaultSessionOptionsModal_options$key>(
      graphql`
        fragment ResourceGroupDefaultSessionOptionsModal_options on DefaultSessionOptionsInfo {
          priority
          isPreemptible
          clusterMode
          defaultFailurePolicy
          agentSelectionPolicy
          handlerOptions {
            default {
              timeoutSec
              maxRetryCount
            }
            byHandler {
              handlerName
              timeoutSec
              maxRetryCount
            }
          }
          defaultKernelExecutionSpec {
            imageId
            resources {
              resourceType
              quantity
            }
            resourceOpts {
              shmem
            }
            startupCommand
            bootstrapScript
            startsAt
            batchTimeoutSec
          }
        }
      `,
      resourceGroup.defaultSessionOptions ?? null,
    );

  const [commitReplace, isInFlightReplace] =
    useMutation<ResourceGroupDefaultSessionOptionsModalMutation>(graphql`
      mutation ResourceGroupDefaultSessionOptionsModalMutation(
        $input: ReplaceResourceGroupDefaultSessionOptionsInput!
      ) {
        replaceResourceGroupDefaultSessionOptions(input: $input) {
          defaultSessionOptions {
            ...ResourceGroupDefaultSessionOptionsPanel_options
            ...ResourceGroupDefaultSessionOptionsModal_options
          }
        }
      }
    `);

  const initialValues: FormValues = {
    priority: options?.priority ?? 10,
    isPreemptible: options?.isPreemptible ?? false,
    clusterMode: normalizeClusterMode(options?.clusterMode),
    defaultFailurePolicy: options?.defaultFailurePolicy ?? 'STRICT',
    agentSelectionPolicy: options?.agentSelectionPolicy ?? 'PREFERRED',
    handlerOptions: toHandlerOptionsFormValue(options?.handlerOptions),
    sessionExecutionSpec: toSessionExecutionSpecFormValue(
      options?.defaultKernelExecutionSpec,
    ),
  };

  const handleOk = () =>
    formRef.current
      ?.validateFields()
      .then((values) => {
        commitReplace({
          variables: {
            input: {
              resourceGroupName: resourceGroup.name,
              options: {
                priority: values.priority,
                isPreemptible: values.isPreemptible,
                clusterMode: values.clusterMode,
                defaultFailurePolicy: values.defaultFailurePolicy,
                agentSelectionPolicy: values.agentSelectionPolicy,
                handlerOptions: toHandlerOptionsInput(values.handlerOptions),
                defaultKernelExecutionSpec: toKernelExecutionSpecInput(
                  values.sessionExecutionSpec,
                ),
              },
            },
          },
          // The payload carries no node id, so link the new value onto the
          // resource group record by hand.
          updater: (store) => {
            const payload = store.getRootField(
              'replaceResourceGroupDefaultSessionOptions',
            );
            const newOptions = payload?.getLinkedRecord(
              'defaultSessionOptions',
            );
            const record = store.get(resourceGroup.id);
            if (record && newOptions) {
              record.setLinkedRecord(newOptions, 'defaultSessionOptions');
            }
          },
          onCompleted: (_data, errors) => {
            if (errors && errors.length > 0) {
              _.forEach(errors, (error) => message.error(error.message));
              return;
            }
            message.success(t('resourceGroup.DefaultOptionsSaved'));
            onRequestClose(true);
          },
          onError: (error) => {
            message.error(error.message);
          },
        });
      })
      .catch(() => {});

  return (
    <BAIModal
      title={t('resourceGroup.EditDefaultSessionOptions')}
      okText={t('button.Save')}
      onOk={handleOk}
      onCancel={() => onRequestClose(false)}
      okButtonProps={{ loading: isInFlightReplace }}
      width={720}
      {...modalProps}
    >
      <BAIFlex direction="column" align="stretch" gap="md">
        <BAIAlert
          type="info"
          showIcon
          title={t('resourceGroup.DefaultOptionsReplaceNotice')}
        />
        <Form ref={formRef} initialValues={initialValues} layout="vertical">
          <BAIFlex direction="column" align="stretch" gap="sm">
            <SessionExecutionSpecFormFields
              name="sessionExecutionSpec"
              clusterModeName="clusterMode"
              resourceGroupName={resourceGroup.name}
              defaultIsOpen={isInitiallyOpen('sessionExecutionSpec')}
            />
            <ResourceGroupOptionsCollapsible
              title={t('resourceGroup.SchedulerOptions')}
              defaultIsOpen={isInitiallyOpen('schedulerOptions')}
            >
              <Grid columns={2} columnGap={3}>
                <BAIFormItem
                  label={t('session.Priority')}
                  name="priority"
                  rules={[{ required: true }]}
                >
                  <BAINumberInput
                    width="100%"
                    aria-label={t('session.Priority')}
                    min={0}
                    max={100}
                    isIntegerOnly
                    hasClear={false}
                  />
                </BAIFormItem>
                <BAIFormItem
                  label={t('resourceGroup.Preemptible')}
                  name="isPreemptible"
                  tooltip={t('resourceGroup.PreemptibleDesc')}
                >
                  <BAISwitch aria-label={t('resourceGroup.Preemptible')} />
                </BAIFormItem>
                <BAIFormItem
                  label={t('resourceGroup.FailurePolicy')}
                  name="defaultFailurePolicy"
                  tooltip={
                    // pre-line so the `\n` between the policy lines renders as a line break.
                    <span style={{ whiteSpace: 'pre-line' }}>
                      {t('resourceGroup.FailurePolicyDesc')}
                    </span>
                  }
                  rules={[{ required: true }]}
                  style={{ marginBottom: 0 }}
                >
                  <BAISelector
                    aria-label={t('resourceGroup.FailurePolicy')}
                    options={[
                      {
                        label: t('resourceGroup.FailurePolicyStrict'),
                        value: 'STRICT',
                      },
                      {
                        label: t('resourceGroup.FailurePolicyBootAll'),
                        value: 'BOOT_ALL',
                      },
                      {
                        label: t('resourceGroup.FailurePolicyTolerant'),
                        value: 'TOLERANT',
                      },
                    ]}
                  />
                </BAIFormItem>
                <BAIFormItem
                  label={t('resourceGroup.AgentSelectionPolicy')}
                  name="agentSelectionPolicy"
                  tooltip={
                    <span style={{ whiteSpace: 'pre-line' }}>
                      {t('resourceGroup.AgentSelectionPolicyDesc')}
                    </span>
                  }
                  rules={[{ required: true }]}
                  style={{ marginBottom: 0 }}
                >
                  <BAISelector
                    aria-label={t('resourceGroup.AgentSelectionPolicy')}
                    options={[
                      {
                        label: t('resourceGroup.AgentSelectionStrict'),
                        value: 'STRICT',
                      },
                      {
                        label: t('resourceGroup.AgentSelectionPreferred'),
                        value: 'PREFERRED',
                      },
                    ]}
                  />
                </BAIFormItem>
              </Grid>
            </ResourceGroupOptionsCollapsible>
            <HandlerOptionsFormFields
              name="handlerOptions"
              handlerNameOptions={SESSION_HANDLER_NAME_OPTIONS}
              defaultIsOpen={isInitiallyOpen('handlerOptions')}
            />
          </BAIFlex>
        </Form>
      </BAIFlex>
    </BAIModal>
  );
};

export default ResourceGroupDefaultSessionOptionsModal;
