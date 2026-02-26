/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import QuestionIconWithTooltip from '../QuestionIconWithTooltip';
import DomainResourceGroupAlert from './DomainResourceGroupAlert';
import ProjectResourceGroupAlert from './ProjectResourceGroupAlert';
import UserResourceGroupAlert from './UserResourceGroupAlert';
import { Alert, App, Form, Input, InputNumber, Skeleton, theme } from 'antd';
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
import { Suspense, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useMutation } from 'react-relay';
import { FairShareWeightSettingModal_BulkModifyDomainWeightMutation } from 'src/__generated__/FairShareWeightSettingModal_BulkModifyDomainWeightMutation.graphql';
import { FairShareWeightSettingModal_BulkModifyProjectWeightMutation } from 'src/__generated__/FairShareWeightSettingModal_BulkModifyProjectWeightMutation.graphql';
import { FairShareWeightSettingModal_BulkModifyUserWeightMutation } from 'src/__generated__/FairShareWeightSettingModal_BulkModifyUserWeightMutation.graphql';
import { FairShareWeightSettingModal_DomainFragment$key } from 'src/__generated__/FairShareWeightSettingModal_DomainFragment.graphql';
import { FairShareWeightSettingModal_ModifyDomainWeightMutation } from 'src/__generated__/FairShareWeightSettingModal_ModifyDomainWeightMutation.graphql';
import { FairShareWeightSettingModal_ModifyProjectWeightMutation } from 'src/__generated__/FairShareWeightSettingModal_ModifyProjectWeightMutation.graphql';
import { FairShareWeightSettingModal_ModifyUserWeightMutation } from 'src/__generated__/FairShareWeightSettingModal_ModifyUserWeightMutation.graphql';
import { FairShareWeightSettingModal_ProjectFragment$key } from 'src/__generated__/FairShareWeightSettingModal_ProjectFragment.graphql';
import { FairShareWeightSettingModal_ResourceGroupFragment$key } from 'src/__generated__/FairShareWeightSettingModal_ResourceGroupFragment.graphql';
import { FairShareWeightSettingModal_UserFragment$key } from 'src/__generated__/FairShareWeightSettingModal_UserFragment.graphql';

interface FairShareWeightSettingModalProps extends BAIModalProps {
  resourceGroupFrgmt?: FairShareWeightSettingModal_ResourceGroupFragment$key | null;
  domainFairShareFrgmt?: FairShareWeightSettingModal_DomainFragment$key | null;
  projectFairShareFrgmt?: FairShareWeightSettingModal_ProjectFragment$key | null;
  userFairShareFrgmt?: FairShareWeightSettingModal_UserFragment$key | null;
  onRequestClose?: (success: boolean) => void;
}

const FairShareWeightSettingModal: React.FC<
  FairShareWeightSettingModalProps
> = ({
  domainFairShareFrgmt,
  projectFairShareFrgmt,
  userFairShareFrgmt,
  resourceGroupFrgmt,
  onRequestClose,
  ...modalProps
}) => {
  'use memo';

  const { t } = useTranslation();
  const { logger } = useBAILogger();
  const { token } = theme.useToken();
  const { message } = App.useApp();

  const resourceGroup = useFragment(
    graphql`
      fragment FairShareWeightSettingModal_ResourceGroupFragment on ResourceGroup {
        scheduler {
          type
        }
        name
      }
    `,
    resourceGroupFrgmt,
  );

  const domainsFairShares = useFragment(
    graphql`
      fragment FairShareWeightSettingModal_DomainFragment on DomainFairShare
      @relay(plural: true) {
        resourceGroup {
          name
        }
        domain {
          basicInfo {
            name
          }
        }
        spec {
          weight
        }
        ...DomainResourceGroupAlertFragment
      }
    `,
    domainFairShareFrgmt,
  );
  const projectFairShares = useFragment(
    graphql`
      fragment FairShareWeightSettingModal_ProjectFragment on ProjectFairShare
      @relay(plural: true) {
        resourceGroup {
          name
        }
        domain {
          basicInfo {
            name
          }
        }
        project {
          basicInfo {
            name
          }
        }
        projectId
        spec {
          weight
        }
        ...ProjectResourceGroupAlertFragment
      }
    `,
    projectFairShareFrgmt,
  );
  const userFairShares = useFragment(
    graphql`
      fragment FairShareWeightSettingModal_UserFragment on UserFairShare
      @relay(plural: true) {
        resourceGroup {
          name
        }
        domain {
          basicInfo {
            name
          }
        }
        project {
          basicInfo {
            name
          }
        }
        user {
          basicInfo {
            email
          }
        }
        id
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
        adminUpsertDomainFairShareWeight(input: $input) {
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
          adminBulkUpsertDomainFairShareWeight(input: $input) {
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
          adminUpsertProjectFairShareWeight(input: $input) {
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
          adminBulkUpsertProjectFairShareWeight(input: $input) {
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
        adminUpsertUserFairShareWeight(input: $input) {
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
          adminBulkUpsertUserFairShareWeight(input: $input) {
            upsertedCount
          }
        }
      `,
    );

  const isBulkEdit =
    (domainsFairShares?.length || 0) > 1 ||
    (projectFairShares?.length || 0) > 1 ||
    (userFairShares?.length || 0) > 1 ||
    false;

  const editTarget =
    !_.isEmpty(domainsFairShares) && domainsFairShares
      ? 'domain'
      : !_.isEmpty(projectFairShares) && projectFairShares
        ? 'project'
        : 'user';

  const INITIAL_FORM_VALUES = {
    resourceGroupName:
      domainsFairShares?.[0]?.resourceGroup?.name ||
      projectFairShares?.[0]?.resourceGroup?.name ||
      userFairShares?.[0]?.resourceGroup?.name ||
      '',
    domainName:
      domainsFairShares?.[0]?.domain?.basicInfo?.name ||
      projectFairShares?.[0]?.domain?.basicInfo?.name ||
      userFairShares?.[0]?.domain?.basicInfo?.name ||
      '',
    projectId:
      projectFairShares?.[0]?.projectId || userFairShares?.[0]?.projectId || '',
    projectName: projectFairShares?.[0]?.project?.basicInfo?.name || '',
    userId: userFairShares?.[0]?.userUuid || '',
    userEmail: userFairShares?.[0]?.user?.basicInfo?.email || '',
    weight: isBulkEdit
      ? undefined
      : domainsFairShares?.[0]?.spec?.weight ||
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
                  resourceGroupName: response.resourceGroupName,
                  inputs: _.map(domainsFairShares, (domain) => ({
                    domainName: domain.domain?.basicInfo?.name || '',
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
                if (!res?.adminBulkUpsertDomainFairShareWeight) {
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
                  resourceGroupName: response.resourceGroupName,
                  inputs: _.map(projectFairShares, (project) => ({
                    domainName: project.domain?.basicInfo?.name || '',
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
                if (!res?.adminBulkUpsertProjectFairShareWeight) {
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
                  resourceGroupName: response.resourceGroupName,
                  inputs: _.map(userFairShares, (user) => {
                    return {
                      domainName: user.domain?.basicInfo?.name || '',
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
                if (!res?.adminBulkUpsertUserFairShareWeight) {
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
                  resourceGroupName: response.resourceGroupName,
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
                if (!res?.adminUpsertDomainFairShareWeight) {
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
                  resourceGroupName: response.resourceGroupName,
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
                if (!res?.adminUpsertProjectFairShareWeight) {
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
                  resourceGroupName: response.resourceGroupName,
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
                if (!res?.adminUpsertUserFairShareWeight) {
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
      <Suspense fallback={<Skeleton active />}>
        {resourceGroup && resourceGroup?.scheduler?.type !== 'FAIR_SHARE' && (
          <Alert
            type="warning"
            title={t('fairShare.SchedulerDoesNotAppliedToResourceGroup', {
              resourceGroup: resourceGroup?.name || '',
            })}
            showIcon
            style={{ marginBottom: token.marginMD }}
          />
        )}
        {!isBulkEdit && domainsFairShares?.[0] && (
          <DomainResourceGroupAlert
            domainFairShareFrgmt={domainsFairShares[0]}
            isModalOpen={modalProps?.open ?? false}
            style={{ marginBottom: token.marginMD }}
          />
        )}
        {!isBulkEdit && projectFairShares?.[0] && (
          <ProjectResourceGroupAlert
            projectFairShareFrgmt={projectFairShares[0]}
            isModalOpen={modalProps?.open ?? false}
            style={{ marginBottom: token.marginMD }}
          />
        )}
        {!isBulkEdit && userFairShares?.[0] && (
          <UserResourceGroupAlert
            isModalOpen={modalProps?.open ?? false}
            style={{ marginBottom: token.marginMD }}
          />
        )}
        <Alert
          type="info"
          title={t('fairShare.FairShareSettingDescription')}
          showIcon
          style={{ marginBottom: token.marginMD }}
        />
        <Form
          ref={formRef}
          layout="vertical"
          initialValues={INITIAL_FORM_VALUES}
        >
          <Form.Item
            label={t('fairShare.ResourceGroup')}
            name="resourceGroupName"
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
                items={_.map(
                  domainsFairShares,
                  (domain) => domain.domain?.basicInfo?.name || '',
                )}
                popoverTitle={t('fairShare.Domain')}
              />
            ) : (
              <Input disabled />
            )}
          </Form.Item>
          <Form.Item label={t('fairShare.Project')} name="projectId" hidden>
            <Input />
          </Form.Item>
          <Form.Item
            label={t('fairShare.Name')}
            name="projectName"
            required
            hidden={editTarget !== 'project'}
          >
            {isBulkEdit ? (
              <BAITagList
                items={_.map(
                  projectFairShares,
                  (project) => project.project?.basicInfo?.name || '',
                )}
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
            hidden
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            label={t('fairShare.Email')}
            name="userEmail"
            hidden={editTarget !== 'user'}
          >
            {isBulkEdit ? (
              <BAITagList
                items={_.map(
                  userFairShares,
                  (user) => user.user?.basicInfo?.email || '',
                )}
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
      </Suspense>
    </BAIModal>
  );
};

export default FairShareWeightSettingModal;
