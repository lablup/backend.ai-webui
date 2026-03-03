import { BAIDomainSelectQuery } from '../../__generated__/BAIDomainSelectQuery.graphql';
import { useControllableValue } from 'ahooks';
import { Select, type SelectProps } from 'antd';
import _ from 'lodash';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

interface Props extends SelectProps {
  activeOnly?: boolean;
}
const BAIDomainSelect: React.FC<Props> = ({
  activeOnly = true,
  ...selectProps
}) => {
  const { t } = useTranslation();
  const [value, setValue] = useControllableValue(selectProps);

  const { domains } = useLazyLoadQuery<BAIDomainSelectQuery>(
    graphql`
      query BAIDomainSelectQuery($is_active: Boolean) {
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
      placeholder={t('comp:BAIDomainSelect.SelectDomain')}
      {...selectProps}
      value={value}
      onChange={(_value, option) => {
        setValue(_value, option);
      }}
      options={_.map(domains, (domain) => ({
        label: domain?.name,
        value: domain?.name,
      }))}
    />
  );
};

export default BAIDomainSelect;
