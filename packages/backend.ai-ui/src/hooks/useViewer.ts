import { useViewerQuery } from '../__generated__/useViewerQuery.graphql';
import { graphql, useLazyLoadQuery } from 'react-relay';

export type ViewerRole = 'superadmin' | 'admin' | 'user' | 'monitor';

const roleFromV2: Record<string, ViewerRole> = {
  USER: 'user',
  ADMIN: 'admin',
  SUPERADMIN: 'superadmin',
  MONITOR: 'monitor',
};

// Managers before 26.2.0 have no `myUserV2`; they only send the base64 `encoded_user_role`.
export const resolveViewerRole = (
  v2Role: string | null | undefined,
  encodedUserRole: string | null | undefined,
): ViewerRole | null => {
  if (v2Role) return roleFromV2[v2Role] ?? null;
  return encodedUserRole ? (atob(encodedUserRole) as ViewerRole) : null;
};

const useViewer = () => {
  const { viewer, myUserV2 } = useLazyLoadQuery<useViewerQuery>(
    graphql`
      query useViewerQuery {
        viewer {
          user {
            email
          }
          encoded_user_role @deprecatedSince(version: "26.2.0")
        }
        myUserV2 @since(version: "26.2.0") {
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
    viewer,
    userRole: resolveViewerRole(
      myUserV2?.organization.role,
      viewer?.encoded_user_role,
    ),
  };
};

export default useViewer;
