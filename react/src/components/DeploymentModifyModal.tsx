import BAIModal, { BAIModalProps } from './BAIModal';
import DeploymentMetadataFormItem from './DeploymentMetadataFormItem';
import DeploymentNetworkAccessFormItem from './DeploymentNetworkAccessFormItem';
import DeploymentStrategyFormItem from './DeploymentStrategyFormItem';
import { App, Form, FormInstance } from 'antd';
import { toLocalId } from 'backend.ai-ui';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useMutation } from 'react-relay';
import {
  DeploymentModifyModalFragment$data,
  DeploymentModifyModalFragment$key,
} from 'src/__generated__/DeploymentModifyModalFragment.graphql';
import { DeploymentModifyModalMutation } from 'src/__generated__/DeploymentModifyModalMutation.graphql';

interface DeploymentModifyModalProps extends BAIModalProps {
  deploymentFrgmt?: DeploymentModifyModalFragment$key | null;
  onRequestClose: (success?: boolean) => void;
}

const DeploymentModifyModal: React.FC<DeploymentModifyModalProps> = ({
  onRequestClose,
  deploymentFrgmt,
  ...baiModalProps
}) => {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const formRef =
    useRef<FormInstance<DeploymentModifyModalFragment$data>>(null);

  const deployment = useFragment(
    graphql`
      fragment DeploymentModifyModalFragment on ModelDeployment {
        id
        metadata {
          name
          tags
        }
        networkAccess {
          openToPublic
          preferredDomainName
        }
        defaultDeploymentStrategy {
          type
        }
        replicaState {
          desiredReplicaCount
        }
      }
    `,
    deploymentFrgmt,
  );

  const [commitUpdateDeployment, isInFlightUpdateDeployment] =
    useMutation<DeploymentModifyModalMutation>(graphql`
      mutation DeploymentModifyModalMutation(
        $input: UpdateModelDeploymentInput!
      ) {
        updateModelDeployment(input: $input) {
          deployment {
            id
            metadata {
              name
              tags
            }
            networkAccess {
              openToPublic
            }
            defaultDeploymentStrategy {
              type
            }
          }
        }
      }
    `);

  const handleOk = () => {
    formRef.current?.validateFields().then((values) => {
      commitUpdateDeployment({
        variables: {
          input: {
            id: toLocalId(deployment?.id || ''),
            name: values.metadata?.name,
            tags: values.metadata?.tags,
            defaultDeploymentStrategy: values?.defaultDeploymentStrategy,
            desiredReplicaCount: values.replicaState?.desiredReplicaCount,
            preferredDomainName: values.networkAccess?.preferredDomainName,
            openToPublic: values.networkAccess?.openToPublic,
          },
        },
        onCompleted: (res, errors) => {
          if (!res?.updateModelDeployment?.deployment?.id) {
            message.error(
              t('message.FailedToUpdate', {
                name: t('deployment.launcher.Deployment'),
              }),
            );
            return;
          }
          if (errors && errors.length > 0) {
            const errorMsgList = errors.map((error) => error.message);
            for (const error of errorMsgList) {
              message.error(error);
            }
          } else {
            message.success(
              t('message.SuccessfullyUpdated', {
                name: t('deployment.launcher.Deployment'),
              }),
            );
            onRequestClose(true);
          }
        },
        onError: (err) => {
          message.error(
            err.message ||
              t('message.FailedToUpdate', {
                name: t('deployment.launcher.Deployment'),
              }),
          );
        },
      });
    });
  };

  return (
    <BAIModal
      {...baiModalProps}
      destroyOnClose
      onOk={handleOk}
      onCancel={() => onRequestClose(false)}
      okText={t('button.Update')}
      confirmLoading={isInFlightUpdateDeployment}
      title={t('deployment.ModifyDeployment')}
    >
      <Form
        ref={formRef}
        layout="vertical"
        initialValues={{
          ...deployment,
        }}
        style={{ maxWidth: '100%' }}
      >
        <DeploymentMetadataFormItem />
        <DeploymentStrategyFormItem />
        <DeploymentNetworkAccessFormItem />
      </Form>
    </BAIModal>
  );
};

export default DeploymentModifyModal;
