import { useViewerQuery } from '../__generated__/useViewerQuery.graphql';
import { graphql, useLazyLoadQuery } from 'react-relay';

export type ViewerRole = 'superadmin' | 'admin' | 'user' | 'monitor';

const roleFromV2: Record<string, ViewerRole> = {
  USER: 'user',
  ADMIN: 'admin',
  SUPERADMIN: 'superadmin',
  MONITOR: 'monitor',
};

export const resolveViewerRole = (
  v2Role: string | null | undefined,
): ViewerRole | null => (v2Role ? (roleFromV2[v2Role] ?? null) : null);

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
    userRole: resolveViewerRole(myUserV2?.organization.role),
  };
};

export default useViewer;
