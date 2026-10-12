import { useViewerQuery } from '../__generated__/useViewerQuery.graphql';
import { graphql, useLazyLoadQuery } from 'react-relay';

const useViewer = () => {
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
      fetchPolicy: 'store-or-network',
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
