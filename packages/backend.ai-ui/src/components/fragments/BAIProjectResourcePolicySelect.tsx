import { BAIProjectResourcePolicySelectQuery } from '../../__generated__/BAIProjectResourcePolicySelectQuery.graphql';
import BAISelect, { BAISelectProps } from '../BAISelect';
import * as _ from 'lodash-es';
import { graphql, useLazyLoadQuery } from 'react-relay';

// Every policy in one page: the V2 connection has no server-side cap and the
// list it replaced was unpaginated.
const POLICY_PAGE_LIMIT = 1000;

export interface BAIProjectResourcePolicySelectProps extends Omit<
  BAISelectProps,
  'options'
> {}

const BAIProjectResourcePolicySelect = ({
  ...selectProps
}: BAIProjectResourcePolicySelectProps) => {
  'use memo';
  const { adminProjectResourcePoliciesV2 } =
    useLazyLoadQuery<BAIProjectResourcePolicySelectQuery>(
      graphql`
        query BAIProjectResourcePolicySelectQuery($limit: Int!) {
          adminProjectResourcePoliciesV2(
            limit: $limit
            orderBy: [{ field: NAME, direction: ASC }]
          ) {
            edges {
              node {
                id
                name
              }
            }
          }
        }
      `,
      { limit: POLICY_PAGE_LIMIT },
      {},
    );
  const policyNames = _.map(
    adminProjectResourcePoliciesV2?.edges,
    (edge) => edge.node.name,
  );

  return (
    <BAISelect
      options={_.map(_.sortBy(policyNames), (name) => ({
        label: name,
        value: name,
      }))}
      showSearch
      {...selectProps}
    />
  );
};

export default BAIProjectResourcePolicySelect;
