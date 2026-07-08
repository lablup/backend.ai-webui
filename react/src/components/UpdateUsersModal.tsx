/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  UpdateUsersModalBulkUpdateMutation,
  UserStatusV2,
} from '../__generated__/UpdateUsersModalBulkUpdateMutation.graphql';
import { UpdateUsersModalFragment$key } from '../__generated__/UpdateUsersModalFragment.graphql';
import { SIGNED_32BIT_MAX_INT } from '../helper/const-vars';
import ProjectSelect from './ProjectSelect';
import UserResourcePolicySelect from './UserResourcePolicySelect';
import { App, Form, InputNumber, theme } from 'antd';
import { FormInstance } from 'antd/lib';
import {
  BAIDomainSelect,
  BAIFlex,
  BAIListAlert,
  BAIModal,
  BAIModalProps,
  BAISelect,
  toLocalId,
  useBAILogger,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { Suspense, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useMutation } from 'react-relay';

interface UpdateUsersFormValues {
  domain_name?: string;
  group_ids?: string[];
  status?: 'active' | 'inactive' | 'before-verification' | 'deleted';
  resource_policy?: string;
  container_uid?: number;
  container_main_gid?: number;
  container_gids?: string[];
}

// Maps the form's v1 status strings to the v2 UserStatusV2 enum.
const statusToV2: Record<
  NonNullable<UpdateUsersFormValues['status']>,
  UserStatusV2
> = {
  active: 'ACTIVE',
  inactive: 'INACTIVE',
  'before-verification': 'BEFORE_VERIFICATION',
  deleted: 'DELETED',
};

export interface UpdateUsersModalProps extends Omit<BAIModalProps, 'title'> {
  usersFrgmt: UpdateUsersModalFragment$key;
}

const UpdateUsersModal = ({
  usersFrgmt,
  ...modalProps
}: UpdateUsersModalProps) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const { logger } = useBAILogger();
  const formRef = useRef<FormInstance<UpdateUsersFormValues>>(null);
  const [isPending, setIsPending] = useState(false);
  const users = useFragment(
    graphql`
      fragment UpdateUsersModalFragment on UserV2 @relay(plural: true) {
        id
        basicInfo {
          email
        }
      }
    `,
    usersFrgmt,
  );
  // >= 26.4.0: adminBulkUpdateUsersV2 — single round-trip, keyed by userId.
  const [commitBulkUpdate, isInFlightBulkUpdate] =
    useMutation<UpdateUsersModalBulkUpdateMutation>(graphql`
      mutation UpdateUsersModalBulkUpdateMutation(
        $input: BulkUpdateUserV2Input!
      ) {
        adminBulkUpdateUsersV2(input: $input) {
          updatedUsers {
            id
          }
          failed {
            userId
            message
          }
        }
      }
    `);

  return (
    <BAIModal
      title={t('credential.UpdateUsers')}
      okText={t('button.Update')}
      confirmLoading={isPending || isInFlightBulkUpdate}
      {...modalProps}
      okButtonProps={{
        ...modalProps.okButtonProps,
        disabled: users.length === 0,
      }}
      onOk={(e) => {
        formRef.current
          ?.validateFields()
          .then((values) => {
            setIsPending(true);

            // v2: same field-inclusion rules as the legacy path, but with
            // camelCase keys and the UserStatusV2 enum.
            const input = _.omitBy(
              {
                domainName: values.domain_name,
                groupIds: values.group_ids,
                status: values.status ? statusToV2[values.status] : undefined,
                resourcePolicy: values.resource_policy,
                containerUid: values.container_uid,
                containerMainGid: values.container_main_gid,
                containerGids: !_.isEmpty(values.container_gids)
                  ? _.map(values.container_gids, (gid) => _.toNumber(gid))
                  : undefined,
              },
              (value) =>
                _.isNil(value) ||
                value === '' ||
                (!_.isNumber(value) && _.isEmpty(value)),
            );

            commitBulkUpdate({
              variables: {
                input: {
                  users: users.map((user) => ({
                    userId: toLocalId(user.id),
                    input,
                  })),
                },
              },
              onCompleted: (res, errors) => {
                if (errors && errors.length > 0) {
                  message.error(errors.map((err) => err.message).join(', '));
                  setIsPending(false);
                  return;
                }
                const adminBulkUpdateUsersV2 = res.adminBulkUpdateUsersV2;
                if (!adminBulkUpdateUsersV2) {
                  message.error(t('error.UnknownError'));
                  setIsPending(false);
                  return;
                }
                const { updatedUsers, failed } = adminBulkUpdateUsersV2;

                if (failed.length > 0) {
                  message.error(failed.map((f) => f.message).join(', '));
                }

                if (updatedUsers.length > 0) {
                  message.success(
                    t('credential.UpdatedUsers', {
                      count: updatedUsers.length,
                      total: users.length,
                    }),
                  );
                  modalProps.onOk?.(e);
                }
                setIsPending(false);
              },
              onError: (error) => {
                message.error(error.message);
                setIsPending(false);
              },
            });
          })
          .catch((error) => {
            logger.error('Validation failed:', error);
          });
      }}
    >
      <BAIFlex direction="column" align="stretch">
        <BAIListAlert
          type="warning"
          showIcon
          title={t('credential.UpdateUsersWarningAlertTitle')}
          items={_.map(users, (user) => ({
            key: user.id,
            content: user.basicInfo.email,
          }))}
          style={{ marginBottom: token.marginSM }}
        />
        {/* TODO: We need to create a Form.Item component that can distinguish between keeping the default value and clearing the value. */}
        <Form ref={formRef} layout="vertical" preserve={false}>
          <Suspense
            fallback={
              <Form.Item label={t('credential.Domain')}>
                <BAISelect loading />
              </Form.Item>
            }
          >
            <Form.Item name="domain_name" label={t('credential.Domain')}>
              <BAIDomainSelect
                onChange={() => {
                  formRef.current?.setFieldValue('group_ids', []);
                }}
                allowClear
              />
            </Form.Item>
          </Suspense>
          <Suspense
            fallback={
              <Form.Item label={t('credential.Projects')}>
                <BAISelect loading />
              </Form.Item>
            }
          >
            <Form.Item noStyle dependencies={['domain_name']}>
              {({ getFieldValue }) => (
                <Form.Item
                  name="group_ids"
                  label={t('credential.Projects')}
                  validateStatus={
                    !getFieldValue('domain_name') ? 'warning' : undefined
                  }
                  help={
                    !getFieldValue('domain_name')
                      ? t('credential.validation.PleaseSelectDomain')
                      : undefined
                  }
                >
                  <ProjectSelect
                    mode="multiple"
                    domain={getFieldValue('domain_name')}
                    disableDefaultFilter
                    disabled={!getFieldValue('domain_name')}
                  />
                </Form.Item>
              )}
            </Form.Item>
          </Suspense>
          <Form.Item name="status" label={t('credential.UserStatus')}>
            <BAISelect
              options={[
                {
                  value: 'active',
                  label: t('general.Active'),
                },
                {
                  value: 'inactive',
                  label: t('general.Inactive'),
                },
                {
                  value: 'deleted',
                  label: t('credential.InactiveIncludeKeypair'),
                },
                {
                  value: 'before-verification',
                  label: t('credential.BeforeVerification'),
                },
              ]}
            />
          </Form.Item>
          <Suspense
            fallback={
              <Form.Item label={t('resourcePolicy.ResourcePolicy')}>
                <BAISelect loading />
              </Form.Item>
            }
          >
            <Form.Item
              name="resource_policy"
              label={t('resourcePolicy.ResourcePolicy')}
            >
              <UserResourcePolicySelect allowClear />
            </Form.Item>
          </Suspense>
          <Form.Item
            name="container_uid"
            label={t('credential.ContainerUID')}
            tooltip={t('credential.ContainerUIDTooltip')}
            rules={[
              {
                type: 'number',
                min: 1,
                message: t('credential.validation.PleaseEnterPositiveInteger'),
              },
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              max={SIGNED_32BIT_MAX_INT}
              min={1}
            />
          </Form.Item>
          <Form.Item
            name="container_main_gid"
            label={t('credential.ContainerGID')}
            tooltip={t('credential.ContainerGIDTooltip')}
            rules={[
              {
                type: 'number',
                min: 1,
                message: t('credential.validation.PleaseEnterPositiveInteger'),
              },
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              max={SIGNED_32BIT_MAX_INT}
              min={1}
            />
          </Form.Item>
          <Form.Item
            name="container_gids"
            label={t('credential.ContainerSupplementaryGIDs')}
            tooltip={t('credential.ContainerSupplementaryGIDsTooltip')}
            rules={[
              () => ({
                validator(_rule, values) {
                  if (
                    _.isEmpty(values) ||
                    _.every(values, (v) => {
                      const num = _.toNumber(v);
                      return num > 0 && num <= SIGNED_32BIT_MAX_INT;
                    })
                  ) {
                    return Promise.resolve();
                  } else {
                    return Promise.reject(
                      new Error(
                        t(
                          'credential.validation.PleaseEnterPositiveAndUnder2_31',
                        ),
                      ),
                    );
                  }
                },
              }),
              () => ({
                validator(_rule, values) {
                  if (
                    _.isEmpty(values) ||
                    _.every(values, (v) => {
                      return _.isInteger(_.toNumber(v));
                    })
                  ) {
                    return Promise.resolve();
                  } else {
                    return Promise.reject(
                      new Error(
                        t('credential.validation.PleaseEnterValidNumber'),
                      ),
                    );
                  }
                },
              }),
              () => ({
                validator(_rule, values) {
                  if (
                    _.isEmpty(values) ||
                    _.uniq(values).length === values.length
                  ) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error(
                      t('credential.validation.PleaseEnterUniqueNumbers'),
                    ),
                  );
                },
              }),
            ]}
          >
            <BAISelect
              mode="tags"
              tokenSeparators={[',', ' ']}
              open={false}
              suffixIcon={null}
              placeholder={t(
                'credential.ContainerSupplementaryGIDsPlaceholder',
              )}
            />
          </Form.Item>
        </Form>
      </BAIFlex>
    </BAIModal>
  );
};

export default UpdateUsersModal;
