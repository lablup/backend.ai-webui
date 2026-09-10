import {
  BAIResourceGroupSelectQuery,
  ResourceGroupFilter,
} from '../../__generated__/BAIResourceGroupSelectQuery.graphql';
import { useBAIi18n } from '../../hooks/useBAIi18n';
import BAISelect, { BAISelectProps } from '../BAISelect';
import * as _ from 'lodash-es';
import { graphql, useLazyLoadQuery } from 'react-relay';

export type BAIResourceGroupFilter = Pick<
  ResourceGroupFilter,
  'isActive' | 'isPublic'
>;

/**
 * Every resource group name at admin scope, ordered by name. Runs the same
 * query as `BAIResourceGroupSelect`, so a parent that needs the list before
 * render (to pick a default, say) shares one request with the select when
 * both receive the same `filter`.
 */
export const useResourceGroupNames = (
  filter?: BAIResourceGroupFilter | null,
) => {
  'use memo';
  const { adminResourceGroups } = useLazyLoadQuery<BAIResourceGroupSelectQuery>(
    graphql`
      query BAIResourceGroupSelectQuery($filter: ResourceGroupFilter) {
        adminResourceGroups(
          filter: $filter
          orderBy: [{ field: NAME, direction: ASC }]
          limit: 100
        ) @since(version: "26.2.0") {
          edges {
            node {
              name
            }
          }
        }
      }
    `,
    { filter: filter ?? null },
  );
  return _.compact(
    _.map(adminResourceGroups?.edges, (edge) => edge?.node?.name),
  );
};

export interface BAIResourceGroupSelectProps extends Omit<
  BAISelectProps,
  'options'
> {
  /** Narrows the admin-scope list; omit to list every resource group. */
  filter?: BAIResourceGroupFilter | null;
}

const BAIResourceGroupSelect = ({
  filter,
  ...selectProps
}: BAIResourceGroupSelectProps) => {
  'use memo';
  const { t } = useBAIi18n();
  const resourceGroupNames = useResourceGroupNames(filter);

  return (
    <BAISelect
      options={_.map(resourceGroupNames, (name) => ({
        label: name,
        value: name,
        resourceGroup: name,
      }))}
      showSearch
      placeholder={t('comp:BAIResourceGroupSelect.SelectResourceGroup')}
      {...selectProps}
    />
  );
};

export default BAIResourceGroupSelect;
