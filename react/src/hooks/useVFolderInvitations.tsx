/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { backendaiClientPromise } from '.';
import { RelayEnvironment } from '../RelayEnvironment';
import { useVFolderInvitationsAcceptMutation } from '../__generated__/useVFolderInvitationsAcceptMutation.graphql';
import { useVFolderInvitationsQuery } from '../__generated__/useVFolderInvitationsQuery.graphql';
import { useVFolderInvitationsRejectMutation } from '../__generated__/useVFolderInvitationsRejectMutation.graphql';
import { mutationOptions } from './backendai';
import { useTanMutation } from './reactQueryAlias';
import { useMutationWithPromise } from 'backend.ai-ui';
import { useAtom } from 'jotai';
import { atomWithDefault } from 'jotai/utils';
import * as _ from 'lodash-es';
import { fetchQuery, graphql } from 'react-relay';

const VFOLDER_ENTITY_TYPE = 'vfolder';

/** A pending folder share offered to the current user. */
export interface InvitationItem {
  /** The share's `entityId`: what accept and reject take. */
  id: string;
  vfolderId: string;
  /** The folder's name, when the caller may read the folder. */
  vfolderName: string | null;
  /** The sharer's e-mail, when the caller may read that user. */
  sharerEmail: string | null;
  /** The entity share's permission cap. */
  permissions: ReadonlyArray<string>;
  createdAt: string;
}

export interface RecipientShare {
  entityId: string;
  status: string;
  permissions: ReadonlyArray<string>;
  targetEntityType: string;
  targetEntityId: string;
  createdAt: string;
  sharer?: { basicInfo: { email: string } } | null;
  targetEntity?:
    | { __typename: 'VFolder'; metadata: { name: string } }
    | { __typename: string }
    | null;
}

/** The pending folder shares among the caller's received shares, newest first. */
export const toInvitationItems = (
  shares: ReadonlyArray<RecipientShare>,
): InvitationItem[] =>
  _.orderBy(
    _.map(
      _.filter(
        shares,
        (share) =>
          share.status === 'PENDING' &&
          share.targetEntityType === VFOLDER_ENTITY_TYPE,
      ),
      (share) => ({
        id: share.entityId,
        vfolderId: share.targetEntityId,
        vfolderName:
          share.targetEntity?.__typename === 'VFolder' &&
          'metadata' in share.targetEntity
            ? share.targetEntity.metadata.name
            : null,
        sharerEmail: share.sharer?.basicInfo.email ?? null,
        permissions: share.permissions,
        createdAt: share.createdAt,
      }),
    ),
    'createdAt',
    'desc',
  );

// `sharer` and `targetEntity` are null when the caller may not read them
// (added in 26.10.0, lablup/backend.ai#15609).
const invitationsQuery = graphql`
  query useVFolderInvitationsQuery {
    myEntityShares(
      sides: [RECIPIENT]
      filter: { status: { equals: PENDING } }
      orderBy: [{ field: CREATED_AT, direction: "DESC" }]
      limit: 100
    ) {
      edges {
        node {
          entityId
          status
          permissions
          targetEntityType
          targetEntityId
          createdAt
          sharer {
            basicInfo {
              email
            }
          }
          targetEntity {
            __typename
            ... on VFolder {
              metadata {
                name
              }
            }
          }
        }
      }
    }
  }
`;

const loadInvitations = async (): Promise<InvitationItem[]> => {
  const data = await fetchQuery<useVFolderInvitationsQuery>(
    RelayEnvironment,
    invitationsQuery,
    {},
    { fetchPolicy: 'network-only' },
  ).toPromise();
  return toInvitationItems(
    _.map(data?.myEntityShares?.edges, (edge) => edge.node),
  );
};

const vFolderInvitationsAtom = atomWithDefault<
  InvitationItem[] | Promise<InvitationItem[]>
>(async () => {
  // The Relay environment signs requests with the client, so wait for its login.
  await backendaiClientPromise;
  return loadInvitations();
});

export const useVFolderInvitations = () => {
  'use memo';
  const [vFolderInvitations, setInvitations] = useAtom(vFolderInvitationsAtom);

  const updateInvitations = async () => {
    setInvitations(await loadInvitations());
  };

  const acceptShare =
    useMutationWithPromise<useVFolderInvitationsAcceptMutation>(graphql`
      mutation useVFolderInvitationsAcceptMutation($id: UUID!) {
        acceptEntityShare(id: $id) {
          share {
            id
            status
          }
        }
      }
    `);
  const rejectShare =
    useMutationWithPromise<useVFolderInvitationsRejectMutation>(graphql`
      mutation useVFolderInvitationsRejectMutation($id: UUID!) {
        rejectEntityShare(id: $id) {
          share {
            id
            status
          }
        }
      }
    `);

  const mutationToAcceptInvitation = useTanMutation({
    mutationFn: (values: { inv_id: string }) => {
      return acceptShare({ id: values.inv_id });
    },
    onSuccess: () => {
      updateInvitations();
    },
  });

  const mutationToRejectInvitation = useTanMutation({
    mutationFn: (values: { inv_id: string }) => {
      return rejectShare({ id: values.inv_id });
    },
    onSuccess: () => {
      updateInvitations();
    },
  });

  return [
    vFolderInvitations,
    {
      updateInvitations,
      acceptInvitation: (inv_id: string, options?: mutationOptions<string>) => {
        return mutationToAcceptInvitation.mutateAsync(
          { inv_id },
          {
            onSuccess: () => {
              options?.onSuccess?.(inv_id);
            },
            onError: (error: any) => {
              options?.onError?.(error);
            },
          },
        );
      },
      isPendingAcceptInvitation: mutationToAcceptInvitation.isPending,
      rejectInvitation: (inv_id: string, options?: mutationOptions<string>) => {
        return mutationToRejectInvitation.mutateAsync(
          { inv_id },
          {
            onSuccess: () => {
              options?.onSuccess?.(inv_id);
            },
            onError: (error: any) => {
              options?.onError?.(error);
            },
          },
        );
      },
      isPendingRejectInvitation: mutationToRejectInvitation.isPending,
    },
  ] as const;
};
