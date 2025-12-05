import { BAIProjectResourcePolicySelectorQuery } from '../../__generated__/BAIProjectResourcePolicySelectorQuery.graphql';
import BAISelect, { BAISelectProps } from '../BAISelect';
import _ from 'lodash';
import { graphql, useLazyLoadQuery } from 'react-relay';

export interface BAIProjectResourcePolicySelectorProps
  extends Omit<BAISelectProps, 'options'> {}

const BAIProjectResourcePolicySelector = ({
  ...selectProps
}: BAIProjectResourcePolicySelectorProps) => {
  const { project_resource_policies } =
    useLazyLoadQuery<BAIProjectResourcePolicySelectorQuery>(
      graphql`
        query BAIProjectResourcePolicySelectorQuery {
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

export default BAIProjectResourcePolicySelector;
