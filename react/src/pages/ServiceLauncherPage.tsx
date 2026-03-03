/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ServiceLauncherPageQuery } from '../__generated__/ServiceLauncherPageQuery.graphql';
import ServiceLauncherPageContent from '../components/ServiceLauncherPageContent';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { useParams } from 'react-router-dom';

const ServiceLauncherPage: React.FC = () => {
  const { endpointId } = useParams<{ endpointId: string }>();
  const { endpoint } = useLazyLoadQuery<ServiceLauncherPageQuery>(
    graphql`
      query ServiceLauncherPageQuery($endpointId: UUID!) {
        endpoint(endpoint_id: $endpointId) {
          ...ServiceLauncherPageContentFragment
        }
      }
    `,
    {
      endpointId: endpointId || '',
    },
    {
      fetchPolicy: 'store-and-network',
    },
  );

  return <ServiceLauncherPageContent endpointFrgmt={endpoint} />;
};

export default ServiceLauncherPage;
