import { BAIProjectResourcePolicySelectQuery } from '../../__generated__/BAIProjectResourcePolicySelectQuery.graphql';
import BAISelect, { BAISelectProps } from '../BAISelect';
import useConnectedBAIClient from '../provider/BAIClientProvider/hooks/useConnectedBAIClient';
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
  const baiClient = useConnectedBAIClient();
  // `adminProjectResourcePoliciesV2` is superadmin-only; a domain admin still
  // reads the legacy list.
  const isSuperAdmin = !!baiClient.is_superadmin;
  const { adminProjectResourcePoliciesV2, project_resource_policies } =
    useLazyLoadQuery<BAIProjectResourcePolicySelectQuery>(
      graphql`
        query BAIProjectResourcePolicySelectQuery(
          $limit: Int!
          $isSuperAdmin: Boolean!
        ) {
          adminProjectResourcePoliciesV2(
            limit: $limit
            orderBy: [{ field: NAME, direction: ASC }]
          ) @include(if: $isSuperAdmin) {
            edges {
              node {
                id
                name
              }
            }
          }
          project_resource_policies @skip(if: $isSuperAdmin) {
            id
            name
          }
        }
      `,
      { limit: POLICY_PAGE_LIMIT, isSuperAdmin },
      {},
    );
  const policyNames = isSuperAdmin
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
