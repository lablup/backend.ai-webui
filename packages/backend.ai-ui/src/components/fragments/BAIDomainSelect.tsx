/*
 to-astryx W2-D: antd `Select` -> `BAISelect`, which is now the Astryx-backed
 frontier wrapper (MAPPING §3.1 — static options, single value, so the
 `Selector` branch). The antd `SelectProps` type import goes with it, so this
 module carries no antd specifier (P15). The prop surface is unchanged.
*/
import { BAIDomainSelectQuery } from '../../__generated__/BAIDomainSelectQuery.graphql';
import { useControllableValue } from '../../hooks';
import { useBAIi18n } from '../../hooks/useBAIi18n';
import BAISelect, { type BAISelectProps } from '../BAISelect';
import * as _ from 'lodash-es';
import React from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

interface Props extends BAISelectProps {
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
    <BAISelect
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
