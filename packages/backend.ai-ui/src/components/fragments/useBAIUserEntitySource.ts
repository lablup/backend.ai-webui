/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
*/
import type { useBAIUserEntitySourceQuery } from '../../__generated__/useBAIUserEntitySourceQuery.graphql';
import { toLocalId } from '../../helper';
import type {
  FilterEntity,
  FilterEntitySource,
} from '../BAIPowerSearchAdapters';
import { mergeFilterValues } from '../BAIPropertyFilter';
import * as _ from 'lodash-es';
import { useEffect, useRef, useState } from 'react';
import { fetchQuery, graphql, useRelayEnvironment } from 'react-relay';

const SEARCH_LIMIT = 10;
/** Same predicate `BAIUserSelect` uses: `user_nodes` filters on the enum. */
const ACTIVE_USER_FILTER = 'status == "active"';

/** The queryfilter DSL quotes literals with `"`, so a typed quote must not close one. */
const escapeFilterLiteral = (value: string) =>
  value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');

const UserEntitySourceQuery = graphql`
  query useBAIUserEntitySourceQuery($filter: String, $first: Int!) {
    user_nodes(filter: $filter, first: $first, order: "email") {
      edges {
        node {
          id
          email
          full_name
        }
      }
    }
  }
`;

/**
 * `FilterEntitySource` over `user_nodes`: searches users by email and resolves
 * user UUIDs back to emails for `BAIGraphQLPropertyFilter` / `BAIPropertyFilter`.
 */
export const useBAIUserEntitySource = (): FilterEntitySource => {
  'use memo';
  const environment = useRelayEnvironment();
  const environmentRef = useRef(environment);
  useEffect(() => {
    environmentRef.current = environment;
  }, [environment]);

  const [source] = useState<FilterEntitySource>(() => {
    // `cancel()` bumps this so a late search response is discarded. `resolve`
    // stays outside the guard: its ids are requested once and never retried.
    let searchGeneration = 0;

    const fetchUsers = async (
      filter: string | undefined,
      first: number,
    ): Promise<Array<FilterEntity>> => {
      const data = await fetchQuery<useBAIUserEntitySourceQuery>(
        environmentRef.current,
        UserEntitySourceQuery,
        { filter, first },
      ).toPromise();
      return _.compact(
        _.map(data?.user_nodes?.edges, (edge) => {
          const node = edge?.node;
          if (!node?.email) return null;
          return {
            id: toLocalId(node.id),
            label: node.email,
            description: node.full_name ?? undefined,
          } satisfies FilterEntity;
        }),
      );
    };

    const searchUsers = async (query: string): Promise<Array<FilterEntity>> => {
      searchGeneration += 1;
      const generation = searchGeneration;
      const entities = await fetchUsers(
        mergeFilterValues([
          ACTIVE_USER_FILTER,
          query ? `email ilike "%${escapeFilterLiteral(query)}%"` : null,
        ]),
        SEARCH_LIMIT,
      );
      return generation === searchGeneration ? entities : [];
    };

    return {
      search: searchUsers,
      bootstrap: () => searchUsers(''),
      // One batched request; ids the backend does not return stay unresolved
      // and the filter keeps showing the raw uuid.
      resolve: (ids) => {
        const uniqueIds = _.uniq(_.compact([...ids]));
        if (_.isEmpty(uniqueIds)) return Promise.resolve([]);
        return fetchUsers(
          mergeFilterValues(
            _.map(uniqueIds, (id) => `uuid == "${escapeFilterLiteral(id)}"`),
            '|',
          ),
          uniqueIds.length,
        );
      },
      cancel: () => {
        searchGeneration += 1;
      },
    };
  });

  return source;
};

export default useBAIUserEntitySource;
