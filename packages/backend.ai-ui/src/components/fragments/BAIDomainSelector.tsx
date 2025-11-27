import { BAIDomainSelectorQuery } from '../../__generated__/BAIDomainSelectorQuery.graphql';
import { Select, SelectProps } from 'antd';
import _ from 'lodash';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

interface Props extends SelectProps {
  onSelectDomain?: (project: any) => void;
}
const BAIDomainSelector: React.FC<Props> = ({
  onSelectDomain,
  ...selectProps
}) => {
  const { t } = useTranslation();

  const { domains } = useLazyLoadQuery<BAIDomainSelectorQuery>(
    graphql`
      query BAIDomainSelectorQuery {
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
      onChange={(_value, option) => {
        onSelectDomain?.(option);
      }}
      placeholder={t('comp:BAIDomainSelector.SelectDomain')}
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

export default BAIDomainSelector;
