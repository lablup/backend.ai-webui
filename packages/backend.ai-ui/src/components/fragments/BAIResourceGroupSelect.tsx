import {
  BAIResourceGroupSelectQuery,
  ResourceGroupFilter,
  ResourceGroupScope,
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
 * Names of the resource groups `scope` reaches, ordered by name (ADR 0011).
 * Shares one request with `BAIResourceGroupSelect` given the same `scope` and `filter`.
 */
export const useResourceGroupNames = (
  scope: ResourceGroupScope,
  filter?: BAIResourceGroupFilter | null,
) => {
  'use memo';
  const { scopedResourceGroups } =
    useLazyLoadQuery<BAIResourceGroupSelectQuery>(
      graphql`
        query BAIResourceGroupSelectQuery(
          $scope: ResourceGroupScope!
          $filter: ResourceGroupFilter
        ) {
          scopedResourceGroups(
            scope: $scope
            filter: $filter
            orderBy: [{ field: NAME, direction: ASC }]
            limit: 100
          ) {
            edges {
              node {
                name
              }
            }
          }
        }
      `,
      { scope, filter: filter ?? null },
    );
  return _.compact(
    _.map(scopedResourceGroups?.edges, (edge) => edge?.node?.name),
  );
};

export interface BAIResourceGroupSelectProps extends Omit<
  BAISelectProps,
  'options'
> {
  /** The resource groups this scope reaches are listed, usually the current domain. */
  scope: ResourceGroupScope;
  /** Narrows the list; omit to list every resource group in reach. */
  filter?: BAIResourceGroupFilter | null;
}

const BAIResourceGroupSelect = ({
  scope,
  filter,
  ...selectProps
}: BAIResourceGroupSelectProps) => {
  'use memo';
  const { t } = useBAIi18n();
  const resourceGroupNames = useResourceGroupNames(scope, filter);

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
