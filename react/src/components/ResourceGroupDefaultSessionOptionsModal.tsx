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
  HandlerOptionsFormFields,
  HandlerOptionsFormValue,
  toHandlerOptionsFormValue,
  toHandlerOptionsInput,
} from './ResourceGroupHandlerOptionsFields';
import {
  AstryxFormNumberInput,
  AstryxFormSelector,
  AstryxFormSwitch,
} from './astryxFormControls';
import { Grid } from '@lablup/ui-common/Grid';
import { BAIAlert, BAIFlex, BAIModal, BAIModalProps } from 'backend.ai-ui';
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
};

interface ResourceGroupDefaultSessionOptionsModalProps extends Omit<
  BAIModalProps,
  'onOk' | 'onCancel'
> {
  resourceGroupFrgmt: ResourceGroupDefaultSessionOptionsModalFragment$key;
  onRequestClose: (success: boolean) => void;
}

// The manager answers `SINGLE_NODE` or `single-node` depending on the path.
const normalizeClusterMode = (value?: string | null) =>
  _.replace(_.toLower(value ?? 'single-node'), '_', '-');

const ResourceGroupDefaultSessionOptionsModal: React.FC<
  ResourceGroupDefaultSessionOptionsModalProps
> = ({ resourceGroupFrgmt, onRequestClose, ...modalProps }) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const formRef = useRef<FormInstance<FormValues>>(null);

  const resourceGroup = useFragment(
    graphql`
      fragment ResourceGroupDefaultSessionOptionsModalFragment on ResourceGroup {
        id
        name
        defaultSessionOptions @since(version: "26.4.4rc1") {
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

  // The mutation replaces the whole value, so the kernel spec this modal does
  // not edit is sent back as it was read.
  const spec = options?.defaultKernelExecutionSpec;
  const kernelExecutionSpecInput = spec
    ? {
        imageId: spec.imageId ?? null,
        resources: spec.resources
          ? _.map(spec.resources, (entry) => ({
              resourceType: entry.resourceType,
              quantity: String(entry.quantity),
            }))
          : null,
        resourceOpts: spec.resourceOpts
          ? {
              shmem: spec.resourceOpts.shmem
                ? { expr: spec.resourceOpts.shmem }
                : null,
            }
          : null,
        startupCommand: spec.startupCommand ?? null,
        bootstrapScript: spec.bootstrapScript ?? null,
        startsAt: spec.startsAt ?? null,
        batchTimeoutSec: spec.batchTimeoutSec ?? null,
      }
    : null;

  const initialValues: FormValues = {
    priority: options?.priority ?? 10,
    isPreemptible: options?.isPreemptible ?? false,
    clusterMode: normalizeClusterMode(options?.clusterMode),
    defaultFailurePolicy: options?.defaultFailurePolicy ?? 'STRICT',
    agentSelectionPolicy: options?.agentSelectionPolicy ?? 'PREFERRED',
    handlerOptions: toHandlerOptionsFormValue(options?.handlerOptions),
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
                defaultKernelExecutionSpec: kernelExecutionSpecInput,
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
          <Grid columns={2}>
            <BAIFormItem
              label={t('session.Priority')}
              name="priority"
              rules={[{ required: true }]}
            >
              <AstryxFormNumberInput
                label={t('session.Priority')}
                min={0}
                max={100}
                isIntegerOnly
                hasClear={false}
              />
            </BAIFormItem>
            <BAIFormItem
              label={t('session.ClusterMode')}
              name="clusterMode"
              rules={[{ required: true }]}
            >
              <AstryxFormSelector
                label={t('session.ClusterMode')}
                options={[
                  {
                    label: t('session.launcher.SingleNode'),
                    value: 'single-node',
                  },
                  {
                    label: t('session.launcher.MultiNode'),
                    value: 'multi-node',
                  },
                ]}
              />
            </BAIFormItem>
            <BAIFormItem
              label={t('resourceGroup.FailurePolicy')}
              name="defaultFailurePolicy"
              tooltip={t('resourceGroup.FailurePolicyDesc')}
              rules={[{ required: true }]}
            >
              <AstryxFormSelector
                label={t('resourceGroup.FailurePolicy')}
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
              tooltip={t('resourceGroup.AgentSelectionPolicyDesc')}
              rules={[{ required: true }]}
            >
              <AstryxFormSelector
                label={t('resourceGroup.AgentSelectionPolicy')}
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
          <BAIFormItem
            layout="horizontal"
            label={t('resourceGroup.Preemptible')}
            name="isPreemptible"
            tooltip={t('resourceGroup.PreemptibleDesc')}
          >
            <AstryxFormSwitch label={t('resourceGroup.Preemptible')} />
          </BAIFormItem>
          <HandlerOptionsFormFields name="handlerOptions" />
        </Form>
      </BAIFlex>
    </BAIModal>
  );
};

export default ResourceGroupDefaultSessionOptionsModal;
