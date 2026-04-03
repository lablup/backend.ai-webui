/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ServiceLauncherPageQuery } from '../__generated__/ServiceLauncherPageQuery.graphql';
import ServiceLauncherPageContent from '../components/ServiceLauncherPageContent';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { useParams } from 'react-router-dom';

const ServiceLauncherPage: React.FC = () => {
  const { endpointId } = useParams<{ endpointId: string }>();
  const currentProject = useCurrentProjectValue();
  const queryResult = useLazyLoadQuery<ServiceLauncherPageQuery>(
    graphql`
      query ServiceLauncherPageQuery($endpointId: UUID!, $project: UUID) {
        endpoint(endpoint_id: $endpointId) {
          ...ServiceLauncherPageContentFragment
        }
        ...RecentServiceSpecsFragment @arguments(project: $project)
      }
    `,
    {
      endpointId: endpointId || '',
      project: currentProject.id,
    },
    {
      fetchPolicy: 'store-and-network',
    },
  );

  return (
    <ServiceLauncherPageContent
      endpointFrgmt={queryResult.endpoint}
      recentServiceSpecsQueryRef={queryResult}
    />
  );
};

export default ServiceLauncherPage;
