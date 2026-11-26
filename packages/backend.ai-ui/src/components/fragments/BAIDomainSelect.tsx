import { BAIDomainSelectQuery } from '../../__generated__/BAIDomainSelectQuery.graphql';
import { useControllableValue } from '../../hooks';
import { useBAIi18n } from '../../hooks/useBAIi18n';
import BAISelect, { type BAISelectProps } from '../BAISelect';
import * as _ from 'lodash-es';
import React from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

interface Props extends Omit<BAISelectProps, 'options'> {
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
      onChange={(next) => setValue(next)}
      options={_.map(_.compact(_.map(domains, 'name')), (name) => ({
        label: name,
        value: name,
      }))}
    />
  );
};

export default BAIDomainSelect;
