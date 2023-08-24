import React from 'react';
import graphql from 'babel-plugin-relay/macro';
import { useLazyLoadQuery } from 'react-relay';
import { DomainSelectorQuery } from './__generated__/DomainSelectorQuery.graphql';

import _ from 'lodash';
import { Select, SelectProps } from 'antd';
import { useTranslation } from 'react-i18next';

interface Props extends SelectProps {
  onSelectDomain?: (project: any) => void;
}
const DomainSelector: React.FC<Props> = ({
  onSelectDomain,
  ...selectProps
}) => {
  const { t } = useTranslation();

  const { domains } = useLazyLoadQuery<DomainSelectorQuery>(
    graphql`
      query DomainSelectorQuery {
        domains(is_active: true) {
          name
        }
      }
    `,
    {},
    {
      fetchPolicy: 'store-and-network',
    },
  );
  return (
    <Select
      onChange={(value, option) => {
        onSelectDomain?.(option);
      }}
      placeholder={t('storageHost.quotaSettings.SelectDomain')}
      {...selectProps}
    >
      {_.map(domains, (domain) => {
        return (
          <Select.Option key={domain?.name} domainName={domain?.name}>
            {domain?.name}
          </Select.Option>
        );
      })}
      ;
    </Select>
  );
};

export default DomainSelector;
