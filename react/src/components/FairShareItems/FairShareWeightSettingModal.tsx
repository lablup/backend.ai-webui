import { App, Form, Input, InputNumber, Tag, theme } from 'antd';
import { FormInstance } from 'antd/lib';
import {
  BAIAlert,
  BAIFlex,
  BAIModal,
  BAIModalProps,
  useBAILogger,
} from 'backend.ai-ui';
import _ from 'lodash';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery, useMutation } from 'react-relay';
import { FairShareWeightSettingModalQuery } from 'src/__generated__/FairShareWeightSettingModalQuery.graphql';
import { FairShareWeightSettingModal_BulkModifyDomainWeightMutation } from 'src/__generated__/FairShareWeightSettingModal_BulkModifyDomainWeightMutation.graphql';
import { FairShareWeightSettingModal_BulkModifyProjectWeightMutation } from 'src/__generated__/FairShareWeightSettingModal_BulkModifyProjectWeightMutation.graphql';
import { FairShareWeightSettingModal_ModifyDomainWeightMutation } from 'src/__generated__/FairShareWeightSettingModal_ModifyDomainWeightMutation.graphql';
import { FairShareWeightSettingModal_ModifyProjectWeightMutation } from 'src/__generated__/FairShareWeightSettingModal_ModifyProjectWeightMutation.graphql';

interface FairShareWeightSettingModalProps extends BAIModalProps {
  resourceGroupName: string;
  domainNames: Array<string>;
  projectIds?: Array<string>;
  isBulkEdit?: boolean;
  onRequestClose?: (success: boolean) => void;
}

const FairShareWeightSettingModal: React.FC<
  FairShareWeightSettingModalProps
> = ({
  resourceGroupName,
  domainNames,
  projectIds,
  isBulkEdit = false,
  onRequestClose,
  ...modalProps
}) => {
  'use memo';

  const { t } = useTranslation();
  const { logger } = useBAILogger();
  const { token } = theme.useToken();
  const { message } = App.useApp();

  const { domainFairShare } =
    useLazyLoadQuery<FairShareWeightSettingModalQuery>(
      graphql`
        query FairShareWeightSettingModalQuery(
          $resourceGroup: String!
          $domainName: String!
        ) {
          domainFairShare(
            domainName: $domainName
            resourceGroup: $resourceGroup
          ) {
            id
            spec {
              weight
            }
            projectFairShares {
              edges {
                node {
                  spec {
                    weight
                  }
                }
              }
            }
          }
        }
      `,
      {
        resourceGroup: resourceGroupName || '',
        domainName: domainNames[0] || '',
      },
      {
        fetchPolicy:
          modalProps?.open && !isBulkEdit ? 'store-and-network' : 'store-only',
      },
    );
  const projectWeight =
    domainFairShare?.projectFairShares?.edges?.[0]?.node?.spec?.weight;

  const [commitModifyDomainWeight, isInflightCommitModifyDomainWeight] =
    useMutation<FairShareWeightSettingModal_ModifyDomainWeightMutation>(graphql`
      mutation FairShareWeightSettingModal_ModifyDomainWeightMutation(
        $input: UpsertDomainFairShareWeightInput!
      ) {
        upsertDomainFairShareWeight(input: $input) {
          domainFairShare {
            id
          }
        }
      }
    `);

  const [commitBulkModifyDomainWeight, isInflightBulkModifyDomainWeight] =
    useMutation<FairShareWeightSettingModal_BulkModifyDomainWeightMutation>(
      graphql`
        mutation FairShareWeightSettingModal_BulkModifyDomainWeightMutation(
          $input: BulkUpsertDomainFairShareWeightInput!
        ) {
          bulkUpsertDomainFairShareWeight(input: $input) {
            upsertedCount
          }
        }
      `,
    );

  const [commitModifyProjectWeight, isInflightCommitModifyProjectWeight] =
    useMutation<FairShareWeightSettingModal_ModifyProjectWeightMutation>(
      graphql`
        mutation FairShareWeightSettingModal_ModifyProjectWeightMutation(
          $input: UpsertProjectFairShareWeightInput!
        ) {
          upsertProjectFairShareWeight(input: $input) {
            projectFairShare {
              id
            }
          }
        }
      `,
    );

  const [commitBulkModifyProjectWeight, isInflightBulkModifyProjectWeight] =
    useMutation<FairShareWeightSettingModal_BulkModifyProjectWeightMutation>(
      graphql`
        mutation FairShareWeightSettingModal_BulkModifyProjectWeightMutation(
          $input: BulkUpsertProjectFairShareWeightInput!
        ) {
          bulkUpsertProjectFairShareWeight(input: $input) {
            upsertedCount
          }
        }
      `,
    );

  const editTarget =
    !projectIds || _.isEmpty(projectIds) ? 'domain' : 'project';

  const INITIAL_FORM_VALUES = {
    resourceGroup: resourceGroupName,
    domainName: domainNames[0] || '',
    projectId: projectIds?.[0] || '',
    weight:
      editTarget === 'domain' ? domainFairShare?.spec?.weight : projectWeight,
  };

  const formRef = useRef<FormInstance<typeof INITIAL_FORM_VALUES>>(null);

  const handleOk = () => {
    formRef.current
      ?.validateFields()
      .then((response) => {
        if (isBulkEdit) {
          if (editTarget === 'domain') {
            commitBulkModifyDomainWeight({
              variables: {
                input: {
                  resourceGroup: response?.resourceGroup,
                  inputs: _.map(domainNames, (name) => ({
                    domainName: name,
                    weight: response?.weight,
                  })),
                },
              },
              onCompleted: (res, errors) => {
                if (!res?.bulkUpsertDomainFairShareWeight) {
                  message.error(t('dialog.ErrorOccurred'));
                  return;
                }
                if (errors && errors?.length > 0) {
                  const errorMsgList = _.map(errors, (error) => error.message);
                  for (const error of errorMsgList) {
                    message.error(error);
                  }
                  return;
                }
                message.success(
                  t('fairShare.FairShareSettingsSuccessfullyUpdated'),
                );
                onRequestClose?.(true);
              },
              onError: (error) => {
                message.error(error.message);
                logger.error(error);
              },
            });
          } else if (editTarget === 'project') {
            commitBulkModifyProjectWeight({
              variables: {
                input: {
                  resourceGroup: response?.resourceGroup,
                  inputs: _.map(projectIds, (id) => ({
                    domainName: response?.domainName,
                    projectId: id,
                    weight: response?.weight,
                  })),
                },
              },
              onCompleted: (res, errors) => {
                if (!res?.bulkUpsertProjectFairShareWeight) {
                  message.error(t('dialog.ErrorOccurred'));
                  return;
                }
                if (errors && errors?.length > 0) {
                  const errorMsgList = _.map(errors, (error) => error.message);
                  for (const error of errorMsgList) {
                    message.error(error);
                  }
                  return;
                }
                message.success(
                  t('fairShare.FairShareSettingsSuccessfullyUpdated'),
                );
                onRequestClose?.(true);
              },
              onError: (error) => {
                message.error(error.message);
                logger.error(error);
              },
            });
          }
        } else {
          if (editTarget === 'domain') {
            commitModifyDomainWeight({
              variables: {
                input: {
                  resourceGroup: response?.resourceGroup,
                  domainName: response?.domainName,
                  weight: response?.weight,
                },
              },
              onCompleted: (res, errors) => {
                if (!res?.upsertDomainFairShareWeight) {
                  message.error(t('dialog.ErrorOccurred'));
                  return;
                }
                if (errors && errors?.length > 0) {
                  const errorMsgList = _.map(errors, (error) => error.message);
                  for (const error of errorMsgList) {
                    message.error(error);
                  }
                  return;
                }
                message.success(
                  t('fairShare.FairShareSettingsSuccessfullyUpdated'),
                );
                onRequestClose?.(true);
              },
              onError: (error) => {
                message.error(error.message);
                logger.error(error);
              },
            });
          } else if (editTarget === 'project') {
            commitModifyProjectWeight({
              variables: {
                input: {
                  resourceGroup: response?.resourceGroup,
                  domainName: response?.domainName,
                  projectId: response?.projectId,
                  weight: response?.weight,
                },
              },
              onCompleted: (res, errors) => {
                if (!res?.upsertProjectFairShareWeight) {
                  message.error(t('dialog.ErrorOccurred'));
                  return;
                }
                if (errors && errors?.length > 0) {
                  const errorMsgList = _.map(errors, (error) => error.message);
                  for (const error of errorMsgList) {
                    message.error(error);
                  }
                  return;
                }
                message.success(
                  t('fairShare.FairShareSettingsSuccessfullyUpdated'),
                );
                onRequestClose?.(true);
              },
              onError: (error) => {
                message.error(error.message);
                logger.error(error);
              },
            });
          }
        }
      })
      .catch((error) => {
        logger.error(error);
      });
  };

  return (
    <BAIModal
      title={t('fairShare.FairShareSettingTitleWithName', {
        name:
          editTarget === 'domain'
            ? t('fairShare.Domain')
            : t('fairShare.Project'),
      })}
      onCancel={() => onRequestClose?.(false)}
      okButtonProps={{
        loading:
          isInflightCommitModifyDomainWeight ||
          isInflightBulkModifyDomainWeight ||
          isInflightCommitModifyProjectWeight ||
          isInflightBulkModifyProjectWeight,
      }}
      onOk={handleOk}
      {...modalProps}
    >
      <BAIAlert
        type="warning"
        description={t('fairShare.FairShareSettingDescription')}
        showIcon
        style={{ marginBottom: token.marginMD }}
      />
      <Form ref={formRef} layout="vertical" initialValues={INITIAL_FORM_VALUES}>
        <Form.Item
          label={t('fairShare.ResourceGroup')}
          name="resourceGroup"
          required
          hidden
        >
          <Input disabled />
        </Form.Item>
        <Form.Item
          label={t('fairShare.Domain')}
          name="domainName"
          required
          hidden={editTarget !== 'domain'}
        >
          {isBulkEdit ? (
            <BAIFlex wrap="wrap" gap="xs">
              {_.map(domainNames, (name) => (
                <Tag key={name}>{name}</Tag>
              ))}
            </BAIFlex>
          ) : (
            <Input disabled />
          )}
        </Form.Item>
        <Form.Item
          label={t('fairShare.Project')}
          name="projectId"
          required={editTarget !== 'domain'}
          hidden={editTarget !== 'project'}
        >
          {isBulkEdit ? (
            <BAIFlex wrap="wrap" gap="xs">
              {_.map(projectIds, (id) => (
                <Tag key={id}>{id}</Tag>
              ))}
            </BAIFlex>
          ) : (
            <Input disabled />
          )}
        </Form.Item>
        <Form.Item
          label={t('fairShare.Weight')}
          name="weight"
          rules={[
            {
              required: true,
              message: t('fairShare.PleaseInputFieldWithFieldName', {
                field: t('fairShare.DefaultWeight'),
              }),
            },
          ]}
        >
          <InputNumber min={1} step={0.1} style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </BAIModal>
  );
};

export default FairShareWeightSettingModal;
