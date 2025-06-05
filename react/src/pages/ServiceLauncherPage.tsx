import { ServiceLauncherPageQuery } from '../__generated__/ServiceLauncherPageQuery.graphql';
import ServiceLauncherPageContent from '../components/ServiceLauncherPageContent';
import graphql from 'babel-plugin-relay/macro';
import { useLazyLoadQuery } from 'react-relay';
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
