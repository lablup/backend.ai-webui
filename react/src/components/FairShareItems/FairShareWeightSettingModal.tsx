import QuestionIconWithTooltip from '../QuestionIconWithTooltip';
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
import { graphql, useFragment, useMutation } from 'react-relay';
import { FairShareWeightSettingModal_BulkModifyDomainWeightMutation } from 'src/__generated__/FairShareWeightSettingModal_BulkModifyDomainWeightMutation.graphql';
import { FairShareWeightSettingModal_BulkModifyProjectWeightMutation } from 'src/__generated__/FairShareWeightSettingModal_BulkModifyProjectWeightMutation.graphql';
import { FairShareWeightSettingModal_DomainFragment$key } from 'src/__generated__/FairShareWeightSettingModal_DomainFragment.graphql';
import { FairShareWeightSettingModal_ModifyDomainWeightMutation } from 'src/__generated__/FairShareWeightSettingModal_ModifyDomainWeightMutation.graphql';
import { FairShareWeightSettingModal_ModifyProjectWeightMutation } from 'src/__generated__/FairShareWeightSettingModal_ModifyProjectWeightMutation.graphql';
import { FairShareWeightSettingModal_ProjectFragment$key } from 'src/__generated__/FairShareWeightSettingModal_ProjectFragment.graphql';

interface FairShareWeightSettingModalProps extends BAIModalProps {
  domainFairShareFrgmt?: FairShareWeightSettingModal_DomainFragment$key | null;
  projectFairShareFrgmt?: FairShareWeightSettingModal_ProjectFragment$key | null;
  isBulkEdit?: boolean;
  onRequestClose?: (success: boolean) => void;
}

const FairShareWeightSettingModal: React.FC<
  FairShareWeightSettingModalProps
> = ({
  domainFairShareFrgmt,
  projectFairShareFrgmt,
  isBulkEdit = false,
  onRequestClose,
  ...modalProps
}) => {
  'use memo';

  const { t } = useTranslation();
  const { logger } = useBAILogger();
  const { token } = theme.useToken();
  const { message } = App.useApp();

  const domainFairShares = useFragment(
    graphql`
      fragment FairShareWeightSettingModal_DomainFragment on DomainFairShare
      @relay(plural: true) {
        id
        resourceGroup
        domainName
        spec {
          weight
        }
      }
    `,
    domainFairShareFrgmt,
  );
  const projectFairShares = useFragment(
    graphql`
      fragment FairShareWeightSettingModal_ProjectFragment on ProjectFairShare
      @relay(plural: true) {
        id
        resourceGroup
        domainName
        projectId
        spec {
          weight
        }
      }
    `,
    projectFairShareFrgmt,
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
    !_.isEmpty(domainFairShares) && domainFairShares ? 'domain' : 'project';

  const INITIAL_FORM_VALUES = {
    resourceGroup:
      domainFairShares?.[0]?.resourceGroup ||
      projectFairShares?.[0]?.resourceGroup ||
      '',
    domainName:
      domainFairShares?.[0]?.domainName ||
      projectFairShares?.[0]?.domainName ||
      '',
    projectId: projectFairShares?.[0]?.projectId || '',
    weight: isBulkEdit
      ? undefined
      : domainFairShares?.[0]?.spec?.weight ||
        projectFairShares?.[0]?.spec?.weight ||
        1,
  };

  const formRef = useRef<FormInstance<typeof INITIAL_FORM_VALUES>>(null);

  const handleOk = () => {
    formRef.current
      ?.validateFields()
      .then((response) => {
        if (isBulkEdit) {
          editTarget === 'domain' &&
            commitBulkModifyDomainWeight({
              variables: {
                input: {
                  resourceGroup: response.resourceGroup,
                  inputs: _.map(domainFairShares, (domain) => ({
                    domainName: domain.domainName,
                    weight: response?.weight,
                  })),
                },
              },
              onCompleted: (res, errors) => {
                if (errors && errors?.length > 0) {
                  const errorMsgList = _.map(errors, (error) => error.message);
                  for (const error of errorMsgList) {
                    message.error(error);
                    logger.error(error);
                  }
                  return;
                }
                if (!res?.bulkUpsertDomainFairShareWeight) {
                  message.error(t('dialog.ErrorOccurred'));
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
          editTarget === 'project' &&
            commitBulkModifyProjectWeight({
              variables: {
                input: {
                  resourceGroup: response.resourceGroup,
                  inputs: _.map(projectFairShares, (project) => ({
                    domainName: project.domainName,
                    projectId: project.projectId,
                    weight: response?.weight,
                  })),
                },
              },
              onCompleted: (res, errors) => {
                if (errors && errors?.length > 0) {
                  const errorMsgList = _.map(errors, (error) => error.message);
                  for (const error of errorMsgList) {
                    message.error(error);
                    logger.error(error);
                  }
                  return;
                }
                if (!res?.bulkUpsertProjectFairShareWeight) {
                  message.error(t('dialog.ErrorOccurred'));
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
          editTarget === 'domain' &&
            commitModifyDomainWeight({
              variables: {
                input: {
                  resourceGroup: response.resourceGroup,
                  domainName: response?.domainName,
                  weight: response?.weight,
                },
              },
              onCompleted: (res, errors) => {
                if (errors && errors?.length > 0) {
                  const errorMsgList = _.map(errors, (error) => error.message);
                  for (const error of errorMsgList) {
                    message.error(error);
                    logger.error(error);
                  }
                  return;
                }
                if (!res?.upsertDomainFairShareWeight) {
                  message.error(t('dialog.ErrorOccurred'));
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
          editTarget === 'project' &&
            commitModifyProjectWeight({
              variables: {
                input: {
                  resourceGroup: response.resourceGroup,
                  domainName: response?.domainName,
                  projectId: response?.projectId,
                  weight: response?.weight,
                },
              },
              onCompleted: (res, errors) => {
                if (errors && errors?.length > 0) {
                  const errorMsgList = _.map(errors, (error) => error.message);
                  for (const error of errorMsgList) {
                    message.error(error);
                    logger.error(error);
                  }
                  return;
                }
                if (!res?.upsertProjectFairShareWeight) {
                  message.error(t('dialog.ErrorOccurred'));
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
          hidden={_.isEmpty(domainFairShares)}
        >
          {isBulkEdit ? (
            <BAIFlex wrap="wrap" gap="xs">
              {_.map(domainFairShares, (domain) => (
                <Tag key={domain.domainName}>{domain.domainName}</Tag>
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
              {_.map(projectFairShares, (project) => (
                <Tag key={project.projectId}>{project.projectId}</Tag>
              ))}
            </BAIFlex>
          ) : (
            <Input disabled />
          )}
        </Form.Item>
        <Form.Item
          label={
            <BAIFlex gap="xxs">
              {t('fairShare.Weight')}
              <QuestionIconWithTooltip
                title={t('fairShare.WeightDescription')}
              ></QuestionIconWithTooltip>
            </BAIFlex>
          }
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
