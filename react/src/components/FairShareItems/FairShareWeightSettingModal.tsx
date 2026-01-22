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
import { FairShareWeightSettingModal_ModifyDomainWeightMutation } from 'src/__generated__/FairShareWeightSettingModal_ModifyDomainWeightMutation.graphql';

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

  const INITIAL_FORM_VALUES = {
    resourceGroup: resourceGroupName,
    domainName: domainNames[0] || '',
    weight: isBulkEdit ? undefined : domainFairShare?.spec?.weight || 1,
  };

  const formRef = useRef<FormInstance<typeof INITIAL_FORM_VALUES>>(null);

  const handleOk = () => {
    formRef.current
      ?.validateFields()
      .then((response) => {
        if (isBulkEdit) {
          commitBulkModifyDomainWeight({
            variables: {
              input: {
                resourceGroup: resourceGroupName,
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
        } else {
          commitModifyDomainWeight({
            variables: {
              input: {
                resourceGroup: resourceGroupName,
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
        }
      })
      .catch((error) => {
        logger.error(error);
      });
  };

  return (
    <BAIModal
      title={t('fairShare.FairShareSettingTitleWithName', {
        name: t('fairShare.Domain'),
      })}
      onCancel={() => onRequestClose?.(false)}
      okButtonProps={{
        loading:
          isInflightCommitModifyDomainWeight ||
          isInflightBulkModifyDomainWeight,
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
          hidden={!!projectIds && !_.isEmpty(projectIds)}
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
