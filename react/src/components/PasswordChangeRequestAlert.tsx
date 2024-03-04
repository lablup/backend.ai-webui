import { PasswordChangeRequestAlertQuery } from './__generated__/PasswordChangeRequestAlertQuery.graphql';
import { Alert } from 'antd';
import { AlertProps } from 'antd/lib';
import graphql from 'babel-plugin-relay/macro';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLazyLoadQuery } from 'react-relay';

interface Props extends AlertProps {}
const PasswordChangeRequestAlert: React.FC<Props> = ({ ...alertProps }) => {
  const { t } = useTranslation();
  const { user } = useLazyLoadQuery<PasswordChangeRequestAlertQuery>(
    graphql`
      query PasswordChangeRequestAlertQuery {
        user {
          need_password_change
        }
      }
    `,
    {},
    {
      fetchPolicy: 'store-and-network',
    },
  );

  return (
    user?.need_password_change && (
      <Alert
        banner
        type="warning"
        message={t('webui.menu.PleaseChangeYourPassword')}
        description={t('webui.menu.PasswordChangePlace')}
        {...alertProps}
      />
    )
  );
};

export default PasswordChangeRequestAlert;
