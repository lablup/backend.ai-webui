import { useConnectedBAIClient } from '..';
import { useViewerQuery } from '../__generated__/useViewerQuery.graphql';
import { graphql, useLazyLoadQuery } from 'react-relay';

const useViewer = () => {
  const baiClient = useConnectedBAIClient();
  const isViewerAvailable = baiClient.isManagerVersionCompatibleWith('25.14.2');
  const { viewer } = useLazyLoadQuery<useViewerQuery>(
    graphql`
      query useViewerQuery {
        viewer {
          user {
            email
          }
          encoded_user_role
        }
      }
    `,
    {},
    {
      fetchPolicy: isViewerAvailable ? 'store-or-network' : 'store-only',
    },
  );

  return {
    viewer,
    decodedUserRole: viewer?.encoded_user_role
      ? atob(viewer.encoded_user_role)
      : null,
  };
};

export default useViewer;
