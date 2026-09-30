import { BAIProjectResourcePolicySelectQuery } from '../../__generated__/BAIProjectResourcePolicySelectQuery.graphql';
import BAISelect, { BAISelectProps } from '../BAISelect';
import useConnectedBAIClient from '../provider/BAIClientProvider/hooks/useConnectedBAIClient';
import * as _ from 'lodash-es';
import { graphql, useLazyLoadQuery } from 'react-relay';

// Every policy in one page: the V2 connection has no server-side cap and the
// legacy list it replaces was unpaginated.
const POLICY_PAGE_LIMIT = 1000;

export interface BAIProjectResourcePolicySelectProps extends Omit<
  BAISelectProps,
  'options'
> {}

const BAIProjectResourcePolicySelect = ({
  ...selectProps
}: BAIProjectResourcePolicySelectProps) => {
  'use memo';
  const baiClient = useConnectedBAIClient();
  const supportsResourcePolicyV2 = baiClient.supports('resource-policy-v2');
  const { adminProjectResourcePoliciesV2, project_resource_policies } =
    useLazyLoadQuery<BAIProjectResourcePolicySelectQuery>(
      graphql`
        query BAIProjectResourcePolicySelectQuery(
          $limit: Int!
          $supportsResourcePolicyV2: Boolean!
        ) {
          adminProjectResourcePoliciesV2(
            limit: $limit
            orderBy: [{ field: NAME, direction: ASC }]
          ) @since(version: "26.4.2") @include(if: $supportsResourcePolicyV2) {
            edges {
              node {
                id
                name
              }
            }
          }
          project_resource_policies
            @deprecatedSince(version: "26.4.2")
            @skip(if: $supportsResourcePolicyV2) {
            id
            name
          }
        }
      `,
      { limit: POLICY_PAGE_LIMIT, supportsResourcePolicyV2 },
      {},
    );
  const policyNames = supportsResourcePolicyV2
    ? _.map(adminProjectResourcePoliciesV2?.edges, (edge) => edge.node.name)
    : _.map(project_resource_policies, (policy) => policy?.name);

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
