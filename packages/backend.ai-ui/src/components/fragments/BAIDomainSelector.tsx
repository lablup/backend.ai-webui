import { BAIDomainSelectorQuery } from '../../__generated__/BAIDomainSelectorQuery.graphql';
import { useControllableValue } from 'ahooks';
import { Select, SelectProps } from 'antd';
import _ from 'lodash';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

interface Props extends SelectProps {
  activeOnly?: boolean;
}
const BAIDomainSelector: React.FC<Props> = ({
  activeOnly = true,
  ...selectProps
}) => {
  const { t } = useTranslation();
  const [value, setValue] = useControllableValue(selectProps);

  const { domains } = useLazyLoadQuery<BAIDomainSelectorQuery>(
    graphql`
      query BAIDomainSelectorQuery($is_active: Boolean) {
        domains(is_active: $is_active) {
          name
        }
      }
    `,
    { is_active: activeOnly },
    {
      fetchPolicy: 'store-and-network',
    },
  );
  return (
    <Select
      placeholder={t('comp:BAIDomainSelector.SelectDomain')}
      {...selectProps}
      value={value}
      onChange={(_value, option) => {
        setValue(_value, option);
      }}
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
