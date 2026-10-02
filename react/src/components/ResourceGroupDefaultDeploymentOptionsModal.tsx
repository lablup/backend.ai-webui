/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ResourceGroupDefaultDeploymentOptionsModalFragment$key } from '../__generated__/ResourceGroupDefaultDeploymentOptionsModalFragment.graphql';
import { ResourceGroupDefaultDeploymentOptionsModalMutation } from '../__generated__/ResourceGroupDefaultDeploymentOptionsModalMutation.graphql';
import { ResourceGroupDefaultDeploymentOptionsModal_options$key } from '../__generated__/ResourceGroupDefaultDeploymentOptionsModal_options.graphql';
import { App } from '../app-shim';
import { Form, FormInstance } from '../form-engine';
import {
  HandlerOptionsFormFields,
  HandlerOptionsFormValue,
  toHandlerOptionsFormValue,
  toHandlerOptionsInput,
} from './ResourceGroupHandlerOptionsFields';
import { BAIAlert, BAIFlex, BAIModal, BAIModalProps } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useMutation } from 'react-relay';

type FormValues = {
  handlerOptions?: HandlerOptionsFormValue;
};

interface ResourceGroupDefaultDeploymentOptionsModalProps extends Omit<
  BAIModalProps,
  'onOk' | 'onCancel'
> {
  resourceGroupFrgmt: ResourceGroupDefaultDeploymentOptionsModalFragment$key;
  onRequestClose: (success: boolean) => void;
}

const ResourceGroupDefaultDeploymentOptionsModal: React.FC<
  ResourceGroupDefaultDeploymentOptionsModalProps
> = ({ resourceGroupFrgmt, onRequestClose, ...modalProps }) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const formRef = useRef<FormInstance<FormValues>>(null);

  const resourceGroup = useFragment(
    graphql`
      fragment ResourceGroupDefaultDeploymentOptionsModalFragment on ResourceGroup {
        id
        name
        defaultDeploymentOptions @since(version: "26.4.4rc1") {
          ...ResourceGroupDefaultDeploymentOptionsModal_options
        }
      }
    `,
    resourceGroupFrgmt,
  );
  const options =
    useFragment<ResourceGroupDefaultDeploymentOptionsModal_options$key>(
      graphql`
        fragment ResourceGroupDefaultDeploymentOptionsModal_options on DeploymentOptionsInfo {
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
        }
      `,
      resourceGroup.defaultDeploymentOptions ?? null,
    );

  const [commitReplace, isInFlightReplace] =
    useMutation<ResourceGroupDefaultDeploymentOptionsModalMutation>(graphql`
      mutation ResourceGroupDefaultDeploymentOptionsModalMutation(
        $input: ReplaceResourceGroupDefaultDeploymentOptionsInput!
      ) {
        replaceResourceGroupDefaultDeploymentOptions(input: $input) {
          defaultDeploymentOptions {
            ...ResourceGroupDefaultDeploymentOptionsPanel_options
            ...ResourceGroupDefaultDeploymentOptionsModal_options
          }
        }
      }
    `);

  const handleOk = () =>
    formRef.current
      ?.validateFields()
      .then((values) => {
        commitReplace({
          variables: {
            input: {
              resourceGroupName: resourceGroup.name,
              options: {
                handlerOptions: toHandlerOptionsInput(values.handlerOptions),
              },
            },
          },
          // The payload carries no node id, so link the new value onto the
          // resource group record by hand.
          updater: (store) => {
            const payload = store.getRootField(
              'replaceResourceGroupDefaultDeploymentOptions',
            );
            const newOptions = payload?.getLinkedRecord(
              'defaultDeploymentOptions',
            );
            const record = store.get(resourceGroup.id);
            if (record && newOptions) {
              record.setLinkedRecord(newOptions, 'defaultDeploymentOptions');
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
      title={t('resourceGroup.EditDefaultDeploymentOptions')}
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
        <Form
          ref={formRef}
          initialValues={{
            handlerOptions: toHandlerOptionsFormValue(options?.handlerOptions),
          }}
          layout="vertical"
        >
          <HandlerOptionsFormFields name="handlerOptions" />
        </Form>
      </BAIFlex>
    </BAIModal>
  );
};

export default ResourceGroupDefaultDeploymentOptionsModal;
