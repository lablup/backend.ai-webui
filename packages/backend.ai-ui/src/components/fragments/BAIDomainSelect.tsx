import { BAIDomainSelectQuery } from '../../__generated__/BAIDomainSelectQuery.graphql';
import { useBAIi18n } from '../../hooks/useBAIi18n';
import { useControllableValue } from 'ahooks';
import { Select, type SelectProps } from 'antd';
import * as _ from 'lodash-es';
import React from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

interface Props extends SelectProps {
  activeOnly?: boolean;
}
const BAIDomainSelect: React.FC<Props> = ({
  activeOnly = true,
  ...selectProps
}) => {
  const { t } = useBAIi18n();
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
