import { BAIProjectResourcePolicySelectQuery } from '../../__generated__/BAIProjectResourcePolicySelectQuery.graphql';
import BAISelect, { BAISelectProps } from '../BAISelect';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

export interface BAIProjectResourcePolicySelectProps extends Omit<
  BAISelectProps,
  'options'
> {}

const BAIProjectResourcePolicySelect = ({
  ...selectProps
}: BAIProjectResourcePolicySelectProps) => {
  'use memo';
  const { t } = useTranslation();
  const { project_resource_policies } =
    useLazyLoadQuery<BAIProjectResourcePolicySelectQuery>(
      graphql`
        query BAIProjectResourcePolicySelectQuery {
          project_resource_policies {
            id
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
        'comp:BAIProjectResourcePolicySelect.SelectProjectResourcePolicy',
      )}
      options={_.map(_.sortBy(project_resource_policies, 'name'), (policy) => {
        return {
          label: policy?.name,
          value: policy?.name,
        };
      })}
      showSearch
      {...selectProps}
    />
  );
};

export default BAIProjectResourcePolicySelect;
