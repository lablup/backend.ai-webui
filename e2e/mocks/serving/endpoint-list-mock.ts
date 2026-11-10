/**
 * Mock response for ServingPageQuery.
 *
 * Returns a single HEALTHY endpoint with all fields that the Relay
 * operation selects (including fragment spreads resolved to their leaf fields).
 */
import { MOCK_ENDPOINT_UUID } from './endpoint-detail-mock';

export function endpointListMockResponse() {
  return {
    endpoint_list: {
      __typename: 'EndpointList',
      total_count: 1,
      items: [
        {
          __typename: 'Endpoint',
          id: btoa(`Endpoint:${MOCK_ENDPOINT_UUID}`),
          name: 'mock-endpoint',
          endpoint_id: MOCK_ENDPOINT_UUID,
          status: 'HEALTHY',
          url: 'https://mock-endpoint.backend.ai/api',
          open_to_public: false,
          created_at: '2026-01-01T08:00:00+00:00',
          replicas: 2,
          desired_session_count: null,
          routings: [{ status: 'HEALTHY' }],
          created_user_email: 'admin@lablup.com',
          session_owner_email: 'admin@lablup.com',
          project: 'mock-project-id-001',
        },
      ],
    },
  };
}
