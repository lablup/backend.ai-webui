import { BAIUserResourcePolicySelectQuery } from '../../__generated__/BAIUserResourcePolicySelectQuery.graphql';
import BAISelect, { BAISelectProps } from '../BAISelect';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

export interface BAIUserResourcePolicySelectProps extends Omit<
  BAISelectProps,
  'options'
> {}

const BAIUserResourcePolicySelect = ({
  ...selectProps
}: BAIUserResourcePolicySelectProps) => {
  'use memo';
  const { t } = useTranslation();
  const { user_resource_policies } =
    useLazyLoadQuery<BAIUserResourcePolicySelectQuery>(
      graphql`
        query BAIUserResourcePolicySelectQuery {
          user_resource_policies {
            name
          }
        }
      `,
      {},
      {},
    );

  return (
    <BAISelect
      placeholder={t(
        'comp:BAIUserResourcePolicySelect.SelectUserResourcePolicy',
      )}
      options={_.map(_.sortBy(user_resource_policies, 'name'), (policy) => {
        return {
          label: policy?.name,
          value: policy?.name,
        };
      })}
      showSearch
      filterOption={(input, option) =>
        ((option?.label as string) ?? '')
          .toLowerCase()
          .includes(input.toLowerCase())
      }
      {...selectProps}
    />
  );
};

export default BAIUserResourcePolicySelect;
