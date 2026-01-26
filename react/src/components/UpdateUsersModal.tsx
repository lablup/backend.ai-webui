import BulkEditFormItem from './BulkEditFormItem';
import ProjectSelect from './ProjectSelect';
import UserResourcePolicySelect from './UserResourcePolicySelect';
import { App, Form, InputNumber, theme } from 'antd';
import { FormInstance } from 'antd/lib';
import {
  BAIAlert,
  BAIDomainSelect,
  BAIFlex,
  BAIModal,
  BAIModalProps,
  BAISelect,
  useBAILogger,
  useErrorMessageResolver,
  useMutationWithPromise,
} from 'backend.ai-ui';
import _ from 'lodash';
import { Suspense, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';
import { PayloadError } from 'relay-runtime';
import { UpdateUsersModalFragment$key } from 'src/__generated__/UpdateUsersModalFragment.graphql';
import {
  ModifyUserInput,
  UpdateUsersModalMutation,
} from 'src/__generated__/UpdateUsersModalMutation.graphql';
import { SIGNED_32BIT_MAX_INT } from 'src/helper/const-vars';

interface UpdateUsersFormValues {
  domain_name?: string;
  group_ids?: string[];
  status?: 'active' | 'inactive' | 'before-verification' | 'deleted';
  resource_policy?: string;
  container_uid?: number;
  container_main_gid?: number;
  container_gids?: string[];
}

export interface UpdateUsersModalProps extends Omit<BAIModalProps, 'title'> {
  userFrgmt: UpdateUsersModalFragment$key;
}

const UpdateUsersModal = ({
  userFrgmt,
  ...modalProps
}: UpdateUsersModalProps) => {
  'use memo';
  const formRef = useRef<FormInstance<UpdateUsersFormValues>>(null);
  const [isPending, setIsPending] = useState(false);
  const { token } = theme.useToken();
  const { t } = useTranslation();
  const { message } = App.useApp();
  const { getErrorMessage } = useErrorMessageResolver();
  const { logger } = useBAILogger();

  const users = useFragment<UpdateUsersModalFragment$key>(
    graphql`
      fragment UpdateUsersModalFragment on UserNode @relay(plural: true) {
        id
        email
        username
        full_name
      }
    `,
    userFrgmt,
  );

  // TODO: when backend supports batch update, change to batch mutation
  const mutateUpdateUsersWithPromise =
    useMutationWithPromise<UpdateUsersModalMutation>(graphql`
      mutation UpdateUsersModalMutation(
        $email: String!
        $props: ModifyUserInput!
      ) {
        modify_user(email: $email, props: $props) {
          ok
          msg
        }
      }
    `);

  return (
    <BAIModal
      title={t('credential.UpdateUsers')}
      okText={t('button.Update')}
      confirmLoading={isPending}
      {...modalProps}
      onOk={(e) => {
        formRef.current
          ?.validateFields()
          .then((values) => {
            setIsPending(true);
            const userList = _.compact(users);

            // Build props with type safety and remove empty values
            const props = _.omitBy(
              {
                domain_name: values.domain_name,
                group_ids: values.group_ids,
                status: values.status,
                resource_policy: values.resource_policy,
                container_uid: values.container_uid,
                container_main_gid: values.container_main_gid,
                container_gids: !_.isEmpty(values.container_gids)
                  ? _.map(values.container_gids, (gid) => _.toNumber(gid))
                  : undefined,
              } satisfies ModifyUserInput,
              (value) => _.isNil(value) || value === '' || _.isEmpty(value),
            );

            const promises = userList.map((user) =>
              mutateUpdateUsersWithPromise({
                email: user.email || '',
                props,
              }).catch((error) => Promise.reject({ user, error })),
            );
            Promise.allSettled(promises)
              .then((results) => {
                const fulfilled = results.filter(
                  (r) => r.status === 'fulfilled',
                );
                const rejected = results.filter((r) => r.status === 'rejected');

                if (rejected.length > 0) {
                  const failedUserNames = rejected
                    .map((r) => {
                      const reason = r.reason;
                      return reason.user.email || t('credential.WrongEmail');
                    })
                    .join(', ');

                  failedUserNames &&
                    message.error(
                      t('credential.FailedToUpdateUsers', {
                        users: failedUserNames,
                      }),
                    );
                  const error =
                    rejected[0]?.reason?.error?.length > 0 &&
                    rejected[0].reason.error[0];
                  error &&
                    message.error(getErrorMessage(error as PayloadError));
                }

                if (fulfilled.length > 0) {
                  message.success(
                    t('credential.UpdatedUsers', {
                      count: fulfilled.length,
                      total: userList.length,
                    }),
                  );
                  modalProps.onOk?.(e);
                }
              })
              .finally(() => {
                setIsPending(false);
              });
          })
          .catch((error) => {
            logger.error('Validation failed:', error);
          });
      }}
    >
      <BAIFlex direction="column" align="stretch">
        <BAIAlert
          type="warning"
          showIcon
          title={t('credential.UpdateUsersWarningAlertTitle')}
          description={
            <ul
              style={{
                margin: 0,
                padding: 0,
                paddingTop: token.paddingXXS,
                listStyle: 'circle',
                listStylePosition: 'inside',
                maxHeight: 165,
                overflowY: 'auto',
              }}
            >
              {_.map(users, (user) => (
                <li key={user.id}>{user.email}</li>
              ))}
            </ul>
          }
          style={{ marginBottom: token.marginSM }}
        />
        <Form ref={formRef} layout="vertical" preserve={false}>
          <Suspense
            fallback={
              <Form.Item label={t('credential.Domain')}>
                <BAISelect loading />
              </Form.Item>
            }
          >
            <BulkEditFormItem
              name="domain_name"
              label={t('credential.Domain')}
              optional
            >
              <BAIDomainSelect
                onChange={() => {
                  formRef.current?.setFieldValue('group_ids', []);
                }}
                allowClear
              />
            </BulkEditFormItem>
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
                <BulkEditFormItem
                  name="group_ids"
                  label={t('credential.Projects')}
                  optional
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
                </BulkEditFormItem>
              )}
            </Form.Item>
          </Suspense>
          <BulkEditFormItem name="status" label={t('credential.UserStatus')}>
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
                  value: 'before-verification',
                  label: t('credential.BeforeVerification'),
                },
                {
                  value: 'deleted',
                  label: t('credential.Deleted'),
                },
              ]}
            />
          </BulkEditFormItem>
          <Suspense
            fallback={
              <Form.Item label={t('resourcePolicy.ResourcePolicy')}>
                <BAISelect loading />
              </Form.Item>
            }
          >
            <BulkEditFormItem
              name="resource_policy"
              label={t('resourcePolicy.ResourcePolicy')}
              optional
            >
              <UserResourcePolicySelect allowClear />
            </BulkEditFormItem>
          </Suspense>
          <BulkEditFormItem
            name="container_uid"
            label={t('credential.ContainerUID')}
            tooltip={t('credential.ContainerUIDTooltip')}
            optional
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
          </BulkEditFormItem>
          <BulkEditFormItem
            name="container_main_gid"
            label={t('credential.ContainerGID')}
            tooltip={t('credential.ContainerGIDTooltip')}
            optional
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
          </BulkEditFormItem>
          <BulkEditFormItem
            name="container_gids"
            label={t('credential.ContainerSupplementaryGIDs')}
            tooltip={t('credential.ContainerSupplementaryGIDsTooltip')}
            optional
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
          </BulkEditFormItem>
        </Form>
      </BAIFlex>
    </BAIModal>
  );
};

export default UpdateUsersModal;
