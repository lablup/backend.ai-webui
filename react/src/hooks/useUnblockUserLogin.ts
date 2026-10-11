/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useUnblockUserLoginMutation } from '../__generated__/useUnblockUserLoginMutation.graphql';
import { App } from '../app-shim';
import { useBAILogger } from 'backend.ai-ui';
import { useTranslation } from 'react-i18next';
import { graphql, useMutation } from 'react-relay';

interface UnblockTarget {
  email: string;
  username?: string | null;
}

/**
 * Clears the failed-login block (manager >= 26.4.2, `adminUnblockUser`).
 * The webserver keys the block by the login-form text, which may be the email
 * or the username, so both are cleared.
 */
export const useUnblockUserLogin = () => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const { logger } = useBAILogger();

  const [commitUnblock] = useMutation<useUnblockUserLoginMutation>(graphql`
    mutation useUnblockUserLoginMutation(
      $email: String!
      $username: String!
      $includeUsername: Boolean!
    ) {
      byEmail: adminUnblockUser(username: $email) {
        success
      }
      byUsername: adminUnblockUser(username: $username)
        @include(if: $includeUsername) {
        success
      }
    }
  `);

  return ({ email, username }: UnblockTarget) => {
    const includeUsername = !!username && username !== email;
    return new Promise<void>((resolve) => {
      commitUnblock({
        variables: {
          email,
          username: includeUsername ? username : email,
          includeUsername,
        },
        onCompleted: (res, errors) => {
          if (errors?.[0]) {
            message.error(errors[0].message || t('error.UnknownError'));
            logger.error(errors);
          } else if (
            res.byEmail?.success &&
            (!includeUsername || res.byUsername?.success)
          ) {
            message.success(t('credential.LoginUnblocked'));
          } else {
            message.warning(t('credential.LoginNotUnblocked'));
          }
          resolve();
        },
        onError: (error) => {
          message.error(error?.message || t('error.UnknownError'));
          logger.error(error);
          resolve();
        },
      });
    });
  };
};
