/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { PasswordChangeRequestAlertQuery } from '../__generated__/PasswordChangeRequestAlertQuery.graphql';
import { BAIAlert, BAIAlertProps } from 'backend.ai-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

interface Props extends BAIAlertProps {}
const PasswordChangeRequestAlert: React.FC<Props> = ({ ...alertProps }) => {
  const { t } = useTranslation();
  const { myUserV2 } = useLazyLoadQuery<PasswordChangeRequestAlertQuery>(
    graphql`
      query PasswordChangeRequestAlertQuery {
        myUserV2 {
          status {
            needPasswordChange
          }
        }
      }
    `,
    {},
    {
      fetchPolicy: 'store-and-network',
    },
  );

  return (
    myUserV2?.status?.needPasswordChange && (
      <BAIAlert
        banner
        type="warning"
        title={t('webui.menu.PleaseChangeYourPassword')}
        description={t('webui.menu.PasswordChangePlace')}
        {...alertProps}
      />
    )
  );
};

export default PasswordChangeRequestAlert;
