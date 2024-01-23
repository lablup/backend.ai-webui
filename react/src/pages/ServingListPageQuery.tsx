import graphql from 'babel-plugin-relay/macro';

export const ServingListPageQuery = graphql`
  query ServingListPageQuery($offset: Int!, $limit: Int!, $projectID: UUID) {
    endpoint_list(
      offset: $offset
      limit: $limit
      project: $projectID
      filter: "name != 'koalpaca-test'"
    ) {
      total_count
      items {
        name
        endpoint_id
        image
        model
        domain
        status
        project
        resource_group
        resource_slots
        url
        open_to_public
        created_at @since(version: "23.09.0")
        desired_session_count @required(action: NONE)
        routings {
          routing_id
          endpoint
          session
          traffic_ratio
          status
        }
        ...ModelServiceSettingModal_endpoint
        ...EndpointOwnerInfoFragment
        ...EndpointStatusTagFragment
      }
    }
  }
`;
