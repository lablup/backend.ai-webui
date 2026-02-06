import QuestionIconWithTooltip from '../QuestionIconWithTooltip';
import { Alert, App, Form, Input, InputNumber, theme } from 'antd';
import { FormInstance } from 'antd/lib';
import {
  BAIBulkEditFormItem,
  BAIFlex,
  BAIModal,
  BAIModalProps,
  BAITagList,
  useBAILogger,
} from 'backend.ai-ui';
import _ from 'lodash';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useMutation } from 'react-relay';
import { FairShareWeightSettingModal_BulkModifyDomainWeightMutation } from 'src/__generated__/FairShareWeightSettingModal_BulkModifyDomainWeightMutation.graphql';
import { FairShareWeightSettingModal_BulkModifyProjectWeightMutation } from 'src/__generated__/FairShareWeightSettingModal_BulkModifyProjectWeightMutation.graphql';
import { FairShareWeightSettingModal_BulkModifyUserWeightMutation } from 'src/__generated__/FairShareWeightSettingModal_BulkModifyUserWeightMutation.graphql';
import { FairShareWeightSettingModal_DomainFragment$key } from 'src/__generated__/FairShareWeightSettingModal_DomainFragment.graphql';
import { FairShareWeightSettingModal_LegacyResourceGroupFragment$key } from 'src/__generated__/FairShareWeightSettingModal_LegacyResourceGroupFragment.graphql';
import { FairShareWeightSettingModal_ModifyDomainWeightMutation } from 'src/__generated__/FairShareWeightSettingModal_ModifyDomainWeightMutation.graphql';
import { FairShareWeightSettingModal_ModifyProjectWeightMutation } from 'src/__generated__/FairShareWeightSettingModal_ModifyProjectWeightMutation.graphql';
import { FairShareWeightSettingModal_ModifyUserWeightMutation } from 'src/__generated__/FairShareWeightSettingModal_ModifyUserWeightMutation.graphql';
import { FairShareWeightSettingModal_ProjectFragment$key } from 'src/__generated__/FairShareWeightSettingModal_ProjectFragment.graphql';
import { FairShareWeightSettingModal_UserFragment$key } from 'src/__generated__/FairShareWeightSettingModal_UserFragment.graphql';

interface FairShareWeightSettingModalProps extends BAIModalProps {
  domainFairShareFrgmt?: FairShareWeightSettingModal_DomainFragment$key | null;
  projectFairShareFrgmt?: FairShareWeightSettingModal_ProjectFragment$key | null;
  userFairShareFrgmt?: FairShareWeightSettingModal_UserFragment$key | null;
  legacyResourceGroupFrgmt?: FairShareWeightSettingModal_LegacyResourceGroupFragment$key | null;
  onRequestClose?: (success: boolean) => void;
}

const FairShareWeightSettingModal: React.FC<
  FairShareWeightSettingModalProps
> = ({
  domainFairShareFrgmt,
  projectFairShareFrgmt,
  userFairShareFrgmt,
  legacyResourceGroupFrgmt,
  onRequestClose,
  ...modalProps
}) => {
  'use memo';

  const { t } = useTranslation();
  const { logger } = useBAILogger();
  const { token } = theme.useToken();
  const { message } = App.useApp();

  const legacyResourceGroup = useFragment(
    graphql`
      fragment FairShareWeightSettingModal_LegacyResourceGroupFragment on ScalingGroup {
        scheduler
        name
      }
    `,
    legacyResourceGroupFrgmt,
  );

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
  const userFairShares = useFragment(
    graphql`
      fragment FairShareWeightSettingModal_UserFragment on UserFairShare
      @relay(plural: true) {
        id
        resourceGroup
        domainName
        projectId
        userUuid
        spec {
          weight
        }
      }
    `,
    userFairShareFrgmt,
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

  const [commitModifyUserWeight, isInflightCommitModifyUserWeight] =
    useMutation<FairShareWeightSettingModal_ModifyUserWeightMutation>(graphql`
      mutation FairShareWeightSettingModal_ModifyUserWeightMutation(
        $input: UpsertUserFairShareWeightInput!
      ) {
        upsertUserFairShareWeight(input: $input) {
          userFairShare {
            id
          }
        }
      }
    `);

  const [commitBulkModifyUserWeight, isInflightBulkModifyUserWeight] =
    useMutation<FairShareWeightSettingModal_BulkModifyUserWeightMutation>(
      graphql`
        mutation FairShareWeightSettingModal_BulkModifyUserWeightMutation(
          $input: BulkUpsertUserFairShareWeightInput!
        ) {
          bulkUpsertUserFairShareWeight(input: $input) {
            upsertedCount
          }
        }
      `,
    );

  const isBulkEdit =
    (domainFairShares?.length || 0) > 1 ||
    (projectFairShares?.length || 0) > 1 ||
    (userFairShares?.length || 0) > 1 ||
    false;

  const editTarget =
    !_.isEmpty(domainFairShares) && domainFairShares
      ? 'domain'
      : !_.isEmpty(projectFairShares) && projectFairShares
        ? 'project'
        : 'user';

  const INITIAL_FORM_VALUES = {
    resourceGroup:
      domainFairShares?.[0]?.resourceGroup ||
      projectFairShares?.[0]?.resourceGroup ||
      userFairShares?.[0]?.resourceGroup ||
      '',
    domainName:
      domainFairShares?.[0]?.domainName ||
      projectFairShares?.[0]?.domainName ||
      userFairShares?.[0]?.domainName ||
      '',
    projectId:
      projectFairShares?.[0]?.projectId || userFairShares?.[0]?.projectId || '',
    userId: userFairShares?.[0]?.userUuid || '',
    weight: isBulkEdit
      ? undefined
      : domainFairShares?.[0]?.spec?.weight ||
        projectFairShares?.[0]?.spec?.weight ||
        userFairShares?.[0]?.spec?.weight ||
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
                    weight: _.isUndefined(response?.weight)
                      ? domain?.spec?.weight
                      : response?.weight,
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
                    weight: _.isUndefined(response?.weight)
                      ? project?.spec?.weight
                      : response?.weight,
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
          editTarget === 'user' &&
            commitBulkModifyUserWeight({
              variables: {
                input: {
                  resourceGroup: response.resourceGroup,
                  inputs: _.map(userFairShares, (user) => {
                    return {
                      domainName: user.domainName,
                      projectId: user.projectId,
                      userUuid: user.userUuid,
                      weight: _.isUndefined(response?.weight)
                        ? user?.spec?.weight
                        : response?.weight,
                    };
                  }),
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
                if (!res?.bulkUpsertUserFairShareWeight) {
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
          editTarget === 'user' &&
            commitModifyUserWeight({
              variables: {
                input: {
                  resourceGroup: response.resourceGroup,
                  domainName: response?.domainName,
                  projectId: response?.projectId,
                  userUuid: response?.userId,
                  weight: response?.weight,
                },
              },
              onCompleted: (res, errors) => {
                if (errors && errors?.length > 0) {
                  const errorMsgList = _.map(errors, (error) => error.message);
                  for (const error of errorMsgList) {
                    message.error(error);
                  }
                  return;
                }
                if (!res?.upsertUserFairShareWeight) {
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
            : editTarget === 'project'
              ? t('fairShare.Project')
              : t('fairShare.User'),
      })}
      {...modalProps}
      onCancel={() => onRequestClose?.(false)}
      okButtonProps={{
        loading:
          isInflightCommitModifyDomainWeight ||
          isInflightBulkModifyDomainWeight ||
          isInflightCommitModifyProjectWeight ||
          isInflightBulkModifyProjectWeight ||
          isInflightCommitModifyUserWeight ||
          isInflightBulkModifyUserWeight,
      }}
      onOk={handleOk}
    >
      {legacyResourceGroup &&
        legacyResourceGroup?.scheduler !== 'fair-share' && (
          <Alert
            type="warning"
            description={t('fairShare.SchedulerDoesNotAppliedToResourceGroup', {
              resourceGroup: legacyResourceGroup?.name || '',
            })}
            showIcon
            style={{ marginBottom: token.marginMD }}
          />
        )}
      <Alert
        type="info"
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
            <BAITagList
              items={_.map(domainFairShares, (domain) => domain.domainName)}
              popoverTitle={t('fairShare.Domain')}
            />
          ) : (
            <Input disabled />
          )}
        </Form.Item>
        <Form.Item
          label={t('fairShare.Project')}
          name="projectId"
          required={editTarget === 'project'}
          hidden={editTarget !== 'project'}
        >
          {isBulkEdit ? (
            <BAITagList
              items={_.map(projectFairShares, (project) => project.projectId)}
              popoverTitle={t('fairShare.Project')}
            />
          ) : (
            <Input disabled />
          )}
        </Form.Item>
        <Form.Item
          label={t('fairShare.User')}
          name="userId"
          required={editTarget === 'user'}
          hidden={editTarget !== 'user'}
        >
          {isBulkEdit ? (
            <BAITagList
              items={_.map(userFairShares, (user) => user.userUuid)}
              popoverTitle={t('fairShare.User')}
            />
          ) : (
            <Input disabled />
          )}
        </Form.Item>
        {isBulkEdit ? (
          <BAIBulkEditFormItem
            showClear
            label={
              <BAIFlex gap="xxs">
                {t('fairShare.Weight')}
                <QuestionIconWithTooltip
                  title={t('fairShare.WeightDescription')}
                ></QuestionIconWithTooltip>
              </BAIFlex>
            }
            name="weight"
          >
            <InputNumber min={1} step={0.1} style={{ width: '100%' }} />
          </BAIBulkEditFormItem>
        ) : (
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
          >
            <InputNumber min={1} step={0.1} style={{ width: '100%' }} />
          </Form.Item>
        )}
      </Form>
    </BAIModal>
  );
};

export default FairShareWeightSettingModal;
