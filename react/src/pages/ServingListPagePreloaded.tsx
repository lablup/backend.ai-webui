import { useCurrentProjectValue } from '../hooks';
import { ServingListPageQuery } from './ServingListPageQuery';
import type { ServingListPageQuery as QueryType } from './__generated__/ServingListPageQuery.graphql';
import React, { Suspense, useEffect } from 'react';
import { useQueryLoader } from 'react-relay';

const ServingListPage = React.lazy(() => import('./ServingListPage'));

const ServingListPagePreloaded = () => {
  const [queryRef, loadQuery] = useQueryLoader<QueryType>(ServingListPageQuery);
  const { id } = useCurrentProjectValue();
  useEffect(() => {
    loadQuery({
      limit: 100,
      offset: 0,
      projectID: id,
    });
  }, [id, loadQuery]);

  return (
    queryRef && (
      <Suspense>
        <ServingListPage
          queryRef={queryRef}
          onRequestReloadQuery={(variables, options) => {
            loadQuery(variables, {
              fetchPolicy: 'network-only',
            });
          }}
        />
      </Suspense>
    )
  );
};

export default ServingListPagePreloaded;
