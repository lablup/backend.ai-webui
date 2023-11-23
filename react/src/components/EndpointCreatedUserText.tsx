import { EndpointCreatedUserTextQuery } from './__generated__/EndpointCreatedUserTextQuery.graphql';
import graphql from 'babel-plugin-relay/macro';
import React from 'react';
import { useLazyLoadQuery } from 'react-relay';

interface EndpointCreatedUserProps {
  userId: string | null;
}
const EndpointCreatedUserText: React.FC<EndpointCreatedUserProps> = ({
  userId,
}) => {
  const { user_from_uuid: user } =
    useLazyLoadQuery<EndpointCreatedUserTextQuery>(
      graphql`
        query EndpointCreatedUserTextQuery($userId: ID) {
          user_from_uuid(user_id: $userId) {
            id
            username
          }
        }
      `,
      {
        userId: userId,
      },
    );
  return <div>{user?.username}</div>;
};

export default EndpointCreatedUserText;
