/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { PurgeUsersModalBulkMutation } from '../__generated__/PurgeUsersModalBulkMutation.graphql';
import { PurgeUsersModalFragment$key } from '../__generated__/PurgeUsersModalFragment.graphql';
import { App, Checkbox, Form, theme } from 'antd';
import { FormInstance } from 'antd/lib';
import {
  BAIDeleteConfirmModal,
  BAIDeleteConfirmModalProps,
  filterOutNullAndUndefined,
  toLocalId,
  useBAILogger,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useMutation } from 'react-relay';

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

  const userList = filterOutNullAndUndefined(
    useFragment(
      graphql`
        fragment PurgeUsersModalFragment on UserV2 @relay(plural: true) {
          id
          basicInfo {
            email
          }
        }
      `,
      usersFrgmt,
    ),
  );

  const { t } = useTranslation();
  const { message } = App.useApp();
  const { logger } = useBAILogger();
  const formRef = useRef<FormInstance<PurgeUsersFormValues>>(null);
  const { token } = theme.useToken();
  const [isPending, setIsPending] = useState(false);

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

  const handleOk = (e: React.MouseEvent<HTMLButtonElement>) => {
    formRef.current
      ?.validateFields()
      .then((values) => {
        setIsPending(true);
        const purgeSharedVfolders = values['purgeSharedVfolders'] || false;
        // checked = delete endpoints (don't delegate), unchecked = delegate ownership
        const delegateEndpointOwnership = !(
          values['deleteModelServices'] || false
        );

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
          onCompleted: (res, errors) => {
            if (errors && errors.length > 0) {
              message.error(errors.map((e) => e.message).join(', '));
              setIsPending(false);
              return;
            }
            const adminBulkPurgeUsersV2 = res.adminBulkPurgeUsersV2;
            if (!adminBulkPurgeUsersV2) {
              message.error(t('error.UnknownError'));
              setIsPending(false);
              return;
            }
            const { purgedCount, failed } = adminBulkPurgeUsersV2;

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
      items={_.map(userList, (user) => ({
        key: user.id,
        label: user.basicInfo.email,
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
