/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { PurgeUsersModalBulkMutation } from '../__generated__/PurgeUsersModalBulkMutation.graphql';
import { PurgeUsersModalFragment$key } from '../__generated__/PurgeUsersModalFragment.graphql';
import { PurgeUsersModalMutation } from '../__generated__/PurgeUsersModalMutation.graphql';
import { useSuspendedBackendaiClient } from '../hooks';
import { App, Checkbox, Form, theme } from 'antd';
import { FormInstance } from 'antd/lib';
import {
  BAIDeleteConfirmModal,
  BAIDeleteConfirmModalProps,
  toLocalId,
  useBAILogger,
  useErrorMessageResolver,
  useMutationWithPromise,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useMutation } from 'react-relay';
import { PayloadError } from 'relay-runtime';

export interface PurgeUsersModalProps extends Omit<
  BAIDeleteConfirmModalProps,
  'items' | 'title' | 'okText' | 'okButtonProps' | 'confirmText'
> {
  usersFrgmt: PurgeUsersModalFragment$key;
}

interface PurgeUsersFormValues {
  purgeSharedVfolders: boolean;
  deleteModelServices: boolean;
}

const PurgeUsersModal: React.FC<PurgeUsersModalProps> = ({
  usersFrgmt,
  ...baiModalProps
}) => {
  'use memo';

  const { t } = useTranslation();
  const { message } = App.useApp();
  const { logger } = useBAILogger();
  const formRef = useRef<FormInstance<PurgeUsersFormValues>>(null);
  const { token } = theme.useToken();
  const [isPending, setIsPending] = useState(false);
  const { getErrorMessage } = useErrorMessageResolver();
  const baiClient = useSuspendedBackendaiClient();
  const supportsBulkPurge = baiClient.supports('bulk-purge-users');

  const users = useFragment<PurgeUsersModalFragment$key>(
    graphql`
      fragment PurgeUsersModalFragment on UserNode @relay(plural: true) {
        id
        email
        username
        full_name
      }
    `,
    usersFrgmt,
  );

  // >= 26.3.0: adminBulkPurgeUsersV2
  const [commitBulkPurge, isInFlightBulkPurge] =
    useMutation<PurgeUsersModalBulkMutation>(graphql`
      mutation PurgeUsersModalBulkMutation($input: BulkPurgeUsersV2Input!) {
        adminBulkPurgeUsersV2(input: $input) {
          purgedCount
          failed {
            userId
            message
          }
        }
      }
    `);

  // < 26.3.0: legacy purge_user
  const mutatePurgeUserWithPromise =
    useMutationWithPromise<PurgeUsersModalMutation>(graphql`
      mutation PurgeUsersModalMutation(
        $email: String!
        $props: PurgeUserInput!
      ) {
        purge_user(email: $email, props: $props) {
          ok
          msg
        }
      }
    `);

  const handleOk = (e: React.MouseEvent<HTMLButtonElement>) => {
    const userList = _.compact(users);
    formRef.current
      ?.validateFields()
      .then((values) => {
        setIsPending(true);
        const purgeSharedVfolders = values['purgeSharedVfolders'] || false;
        // checked = delete endpoints (don't delegate), unchecked = delegate ownership
        const delegateEndpointOwnership = !(
          values['deleteModelServices'] || false
        );

        if (supportsBulkPurge) {
          const userIds = userList.map((user) => toLocalId(user.id));
          commitBulkPurge({
            variables: {
              input: {
                userIds,
                options: {
                  purgeSharedVfolders,
                  delegateEndpointOwnership,
                },
              },
            },
            onCompleted: (res) => {
              const { purgedCount, failed } = res.adminBulkPurgeUsersV2;

              if (failed.length > 0) {
                const failedMessages = failed.map((f) => f.message).join(', ');
                message.error(failedMessages);
              }

              if (purgedCount > 0) {
                message.success(
                  t('credential.UsersPermanentlyDeleted', {
                    total: userList.length,
                    count: purgedCount,
                  }),
                );
                baiModalProps.onOk?.(e);
              }
              setIsPending(false);
            },
            onError: (error) => {
              message.error(error.message);
              setIsPending(false);
            },
          });
        } else {
          // < 26.3.0: use legacy purge_user in a loop
          const promises = userList.map((user) =>
            mutatePurgeUserWithPromise({
              email: user.email ?? '',
              props: {
                purge_shared_vfolders: purgeSharedVfolders,
                delegate_endpoint_ownership: delegateEndpointOwnership,
              },
            }).catch((error) => {
              return Promise.reject({ user, error });
            }),
          );

          Promise.allSettled(promises)
            .then((results) => {
              const fulfilled = results.filter((r) => r.status === 'fulfilled');
              const rejected = results.filter(
                (r) => r.status === 'rejected',
              ) as PromiseRejectedResult[];

              if (rejected.length > 0) {
                const failedUserNames = rejected
                  .map((r: PromiseRejectedResult) => {
                    const reason = r.reason;
                    return reason.user.email || t('credential.WrongEmail');
                  })
                  .join(', ');

                failedUserNames &&
                  message.error(
                    t('credential.FailedToDeleteUsers', {
                      users: failedUserNames,
                    }),
                  );

                const error =
                  rejected[0]?.reason?.error?.length > 0 &&
                  rejected[0].reason.error[0];
                error && message.error(getErrorMessage(error as PayloadError));
              }

              if (fulfilled.length > 0) {
                message.success(
                  t('credential.UsersPermanentlyDeleted', {
                    total: userList.length,
                    count: fulfilled.length,
                  }),
                );
                baiModalProps.onOk?.(e);
              }
            })
            .finally(() => {
              setIsPending(false);
            });
        }
      })
      .catch((e) => {
        logger.error('Validation failed:', e);
      });
  };

  return (
    <BAIDeleteConfirmModal
      {...baiModalProps}
      title={t('credential.PermanentlyDeleteUsers')}
      target={t('general.User')}
      onOk={(e) => handleOk(e)}
      confirmLoading={isPending || isInFlightBulkPurge}
      items={_.map(_.compact(users), (user) => ({
        key: user.id,
        label: user.email ?? '',
      }))}
      requireConfirmInput
      confirmText={t('credential.PermanentlyDelete')}
      inputLabel={t('credential.TypePermanentlyDelete', {
        text: t('credential.PermanentlyDelete'),
      })}
      inputProps={{
        placeholder: t('credential.PermanentlyDelete'),
      }}
      extraContent={
        <Form ref={formRef} style={{ marginBottom: token.marginSM }}>
          <Form.Item
            name="purgeSharedVfolders"
            valuePropName="checked"
            style={{ marginBottom: 0 }}
          >
            <Checkbox>{t('credential.DeleteSharedVirtualFolders')}</Checkbox>
          </Form.Item>
          <Form.Item
            name="deleteModelServices"
            valuePropName="checked"
            style={{ marginBottom: 0 }}
          >
            <Checkbox>{t('credential.DeleteModelServicesAsWell')}</Checkbox>
          </Form.Item>
        </Form>
      }
    />
  );
};

export default PurgeUsersModal;
