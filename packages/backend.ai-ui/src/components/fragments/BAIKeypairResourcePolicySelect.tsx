import { BAIKeypairResourcePolicySelectQuery } from '../../__generated__/BAIKeypairResourcePolicySelectQuery.graphql';
import BAISelect, { BAISelectProps } from '../BAISelect';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

export interface BAIKeypairResourcePolicySelectProps extends Omit<
  BAISelectProps,
  'options'
> {}

const BAIKeypairResourcePolicySelect = ({
  ...selectProps
}: BAIKeypairResourcePolicySelectProps) => {
  const { t } = useTranslation();
  const { keypair_resource_policies } =
    useLazyLoadQuery<BAIKeypairResourcePolicySelectQuery>(
      graphql`
        query BAIKeypairResourcePolicySelectQuery {
          keypair_resource_policies {
            name
          }
        }
      `,
      {},
      {},
    );

  return (
    <BAISelect
      options={_.map(_.sortBy(keypair_resource_policies, 'name'), (policy) => {
        return {
          label: policy?.name,
          value: policy?.name,
        };
      })}
      showSearch
      placeholder={t(
        'comp:BAIKeypairResourcePolicySelect.SelectKeypairResourcePolicy',
      )}
      {...selectProps}
    />
  );
};

export default BAIKeypairResourcePolicySelect;
