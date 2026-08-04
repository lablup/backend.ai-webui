/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { theme, Typography } from 'antd';
import {
  BAIBulkErrorModal,
  type BAIBulkErrorModalProps,
  type BAIColumnsType,
} from 'backend.ai-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * One user `adminBulkCreateUsersWithKeypairV2` refused to create, shaped for a
 * table. `key` comes from the failure's `index` — its original position in the
 * submitted list, which is unique per response.
 */
export interface FailedUserCreation {
  key: string;
  email: string;
  username: string;
  message: string;
}

/** The `failed` list as returned by either bulk-create mutation. */
type BulkCreateFailures = ReadonlyArray<{
  readonly index: number;
  readonly email: string;
  readonly username: string;
  readonly message: string;
}>;

export const toFailedUserCreations = (
  failed: BulkCreateFailures,
): FailedUserCreation[] =>
  failed.map((failure) => ({
    key: String(failure.index),
    email: failure.email,
    username: failure.username,
    message: failure.message,
  }));

const useFailedUserColumns = (): BAIColumnsType<FailedUserCreation> => {
  'use memo';
  const { t } = useTranslation();

  return [
    {
      key: 'email',
      title: t('general.E-Mail'),
      dataIndex: 'email',
    },
    {
      key: 'username',
      title: t('credential.UserName'),
      dataIndex: 'username',
    },
    {
      key: 'message',
      title: t('dialog.error.Error'),
      dataIndex: 'message',
      render: (message: string) => (
        <Typography.Text type="danger">{message}</Typography.Text>
      ),
    },
  ];
};

interface BulkCreateUserErrorModalProps extends Omit<
  BAIBulkErrorModalProps<FailedUserCreation>,
  'columns' | 'dataSource' | 'alertDescription'
> {
  failedUsers: FailedUserCreation[];
  /**
   * How many users the server actually created. Reported by the mutation rather
   * than derived from the submitted count — the server may reject rows the
   * client considered valid.
   */
  createdCount: number;
}

/**
 * Lists the users a bulk create failed on, in its own modal — the single
 * failure report for both bulk-create entry points (FR-3419). Shown over the
 * still-open create form: immediately when every user failed (no keypairs to
 * show first), or as the next step after the admin dismisses the
 * generated-keypair modal when some users succeeded. Never shown alongside
 * the keypair modal — the two are sequential, single-purpose screens, not
 * merged into one.
 */
export const BulkCreateUserErrorModal: React.FC<
  BulkCreateUserErrorModalProps
> = ({ failedUsers, createdCount, ...bulkErrorModalProps }) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const columns = useFailedUserColumns();

  return (
    <BAIBulkErrorModal<FailedUserCreation>
      alertDescription={
        <>
          {t('credential.BulkCreateUserPartialFailureDescription')}{' '}
          <Typography.Text
            style={{
              color: token.colorTextSecondary,
              fontSize: token.fontSizeSM,
            }}
          >
            {t('credential.BulkCreateUserPartialFailure', {
              successCount: createdCount,
              failCount: failedUsers.length,
            })}
          </Typography.Text>
        </>
      }
      columns={columns}
      dataSource={failedUsers}
      {...bulkErrorModalProps}
    />
  );
};
