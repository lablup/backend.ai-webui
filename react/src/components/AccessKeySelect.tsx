import { AccessKeySelectQuery } from '../__generated__/AccessKeySelectQuery.graphql';
import { BAISelect, BAISelectProps } from 'backend.ai-ui';
import _ from 'lodash';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

export interface AccessKeySelectProps extends BAISelectProps {
  userEmail: string;
  fetchKey?: string;
}

const AccessKeySelect: React.FC<AccessKeySelectProps> = ({
  userEmail,
  fetchKey,
  ...selectProps
}) => {
  const { t } = useTranslation();

  const { keypairs } = useLazyLoadQuery<AccessKeySelectQuery>(
    graphql`
      query AccessKeySelectQuery($email: String!) {
        keypairs(email: $email) {
          access_key
          is_active
        }
      }
    `,
    {
      email: userEmail,
    },
    {
      fetchPolicy: 'store-and-network',
      fetchKey: fetchKey,
    },
  );

  const options = _.map(keypairs, (kp) => ({
    value: kp?.access_key,
    label: kp?.access_key,
    disabled: !kp?.is_active,
  }));

  return (
    <BAISelect
      placeholder={t('credential.SelectAccessKey')}
      options={options}
      {...selectProps}
    />
  );
};

export default AccessKeySelect;
