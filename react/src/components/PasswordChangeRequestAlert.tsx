import { PasswordChangeRequestAlertQuery } from '../__generated__/PasswordChangeRequestAlertQuery.graphql';
import BAIAlert, { BAIAlertProps } from './BAIAlert';
import graphql from 'babel-plugin-relay/macro';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLazyLoadQuery } from 'react-relay';

interface Props extends BAIAlertProps {}
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
      <BAIAlert
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
