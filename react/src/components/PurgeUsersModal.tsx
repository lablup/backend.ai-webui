'use memo';

import { PurgeUsersModalFragment$key } from '../__generated__/PurgeUsersModalFragment.graphql';
import { PurgeUsersModalMutation } from '../__generated__/PurgeUsersModalMutation.graphql';
import { App, Checkbox, Form, theme } from 'antd';
import { FormInstance } from 'antd/lib';
import {
  BAIAlert,
  BAIConfirmModalWithInput,
  BAIFlex,
  BAIModalProps,
  BAIText,
  useErrorMessageResolver,
  useMutationWithPromise,
} from 'backend.ai-ui';
import _ from 'lodash';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';
import { PayloadError } from 'relay-runtime';

export interface PurgeUsersModalProps
  extends Omit<BAIModalProps, 'title' | 'okText' | 'okButtonProps'> {
  usersFrgmt: PurgeUsersModalFragment$key;
}

interface PurgeUsersFormValues {
  deleteVfolder: boolean;
}

const PurgeUsersModal: React.FC<PurgeUsersModalProps> = ({
  usersFrgmt,
  ...baiModalProps
}) => {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const formRef = useRef<FormInstance<PurgeUsersFormValues>>(null);
  const { token } = theme.useToken();
  const [isPending, setIsPending] = useState(false);
  const { getErrorMessage } = useErrorMessageResolver();

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

  // TODO: when bulk user purge mutation is available, use it instead of single user mutation in a loop
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
        const deleteVfolder = values['deleteVfolder'] || false;

        const promises = userList.map((user) =>
          mutatePurgeUserWithPromise({
            email: user.email ?? '',
            props: {
              purge_shared_vfolders: deleteVfolder,
              delegate_endpoint_ownership: deleteVfolder,
            },
          }).catch((error) => {
            // Include user info in rejection for error reporting
            return Promise.reject({ user, error });
          }),
        );

        Promise.allSettled(promises)
          .then((results) => {
            const fulfilled = results.filter((r) => r.status === 'fulfilled');
            const rejected = results.filter(
              (r) => r.status === 'rejected',
            ) as PromiseRejectedResult[];

            // Show error message with failed user names
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
      })
      .catch(() => {});
  };

  return (
    <BAIConfirmModalWithInput
      {...baiModalProps}
      title={t('credential.PermanentlyDeleteUsers')}
      okText={t('button.Delete')}
      onOk={(e) => handleOk(e)}
      confirmLoading={isPending}
      inputLabel={t('credential.TypePermanentlyDelete', {
        text: t('credential.PermanentlyDelete'),
      })}
      inputProps={{
        placeholder: t('credential.PermanentlyDelete'),
      }}
      confirmText={t('credential.PermanentlyDelete')}
      content={
        <BAIFlex direction="column" gap="sm" justify="start" align="stretch">
          <BAIAlert
            title={t('credential.PurgeUsersWarningAlertTitle')}
            type="warning"
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
            showIcon
          />

          <BAIText>
            {t('credential.UsersPermanentlyDeleteConfirmMessage')}
          </BAIText>
          <Form ref={formRef}>
            <Form.Item name="deleteVfolder" valuePropName="checked">
              <Checkbox>{t('credential.DeleteSharedVirtualFolders')}</Checkbox>
            </Form.Item>
          </Form>
        </BAIFlex>
      }
    />
  );
};

export default PurgeUsersModal;
