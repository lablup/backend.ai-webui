/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ServiceLauncherPageQuery } from '../__generated__/ServiceLauncherPageQuery.graphql';
import ServiceLauncherPageContent from '../components/ServiceLauncherPageContent';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { toGlobalId } from 'backend.ai-ui';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { useParams } from 'react-router-dom';

const ServiceLauncherPage: React.FC = () => {
  const { endpointId } = useParams<{ endpointId: string }>();
  const currentProject = useCurrentProjectValue();
  const queryResult = useLazyLoadQuery<ServiceLauncherPageQuery>(
    graphql`
      query ServiceLauncherPageQuery(
        $endpointId: UUID!
        $deploymentId: ID!
        $project: UUID
      ) {
        endpoint(endpoint_id: $endpointId) {
          runtime_variant @since(version: "24.03.5") {
            name
          }
          ...ServiceLauncherPageContentFragment
        }
        modelDeployment: deployment(id: $deploymentId) {
          revisionHistory(
            limit: 1
            orderBy: [{ field: CREATED_AT, direction: DESC }]
          ) {
            edges {
              node {
                modelDefinition {
                  models {
                    service {
                      startCommand
                      port
                      healthCheck {
                        path
                        initialDelay
                        maxRetries
                      }
                    }
                  }
                }
              }
            }
          }
        }
        ...RecentServiceSpecsFragment @arguments(project: $project)
      }
    `,
    {
      endpointId: endpointId || '',
      deploymentId: toGlobalId('ModelDeployment', endpointId || ''),
      project: currentProject.id,
    },
    {
      fetchPolicy: 'store-and-network',
    },
  );

  const { endpoint, modelDeployment } = queryResult;

  const latestModelDef =
    endpoint?.runtime_variant?.name === 'custom'
      ? modelDeployment?.revisionHistory?.edges?.[0]?.node?.modelDefinition
      : undefined;

  return (
    <ServiceLauncherPageContent
      endpointFrgmt={endpoint}
      initialModelDef={latestModelDef}
      recentServiceSpecsQueryRef={queryResult}
    />
  );
};

export default ServiceLauncherPage;
