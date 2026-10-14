import { useViewerQuery } from '../__generated__/useViewerQuery.graphql';
import { graphql, useLazyLoadQuery } from 'react-relay';

const useViewer = () => {
  const { myUserV2 } = useLazyLoadQuery<useViewerQuery>(
    graphql`
      query useViewerQuery {
        myUserV2 {
          organization {
            role
          }
        }
      }
    `,
    {},
    {
      fetchPolicy: 'store-or-network',
    },
  );

  return {
    userRole: myUserV2?.organization.role ?? null,
  };
};

export default useViewer;
