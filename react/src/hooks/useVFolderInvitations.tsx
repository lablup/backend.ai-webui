/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { backendaiClientPromise } from '.';
import { RelayEnvironment } from '../RelayEnvironment';
import { useVFolderInvitationsAcceptMutation } from '../__generated__/useVFolderInvitationsAcceptMutation.graphql';
import { useVFolderInvitationsProjectAnswerersQuery } from '../__generated__/useVFolderInvitationsProjectAnswerersQuery.graphql';
import { useVFolderInvitationsProjectSharesQuery } from '../__generated__/useVFolderInvitationsProjectSharesQuery.graphql';
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
const PROJECT_ENTITY_TYPE = 'project';
// `myAtomicBulkScopePermissions` refuses more than 100 targets.
const MAX_PERMISSION_TARGETS = 100;

/** A pending folder share offered to the current user or to a project they answer for. */
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
  /** Set when the share is addressed to a project: accepting it answers for the project. */
  recipientProjectName?: string;
}

export interface RecipientShare {
  entityId: string;
  status: string;
  permissions: ReadonlyArray<string>;
  targetEntityType: string;
  targetEntityId: string;
  createdAt: string;
  recipientEntityType?: string | null;
  recipientEntityId?: string | null;
  recipientEntity?:
    | { __typename: 'ProjectV2'; basicInfo: { name: string } }
    | { __typename: string }
    | null;
  sharer?: { basicInfo: { email: string } } | null;
  targetEntity?:
    | { __typename: 'VFolder'; metadata: { name: string } }
    | { __typename: string }
    | null;
}

/**
 * The pending folder shares among the caller's received shares, newest first.
 * `projectNames` names a project share whose `recipientEntity` the caller may not read;
 * a share `selfEmail` sent is the caller's own offer, not an invitation.
 */
export const toInvitationItems = (
  shares: ReadonlyArray<RecipientShare>,
  {
    projectNames = {},
    selfEmail,
  }: {
    projectNames?: Readonly<Record<string, string>>;
    selfEmail?: string | null;
  } = {},
): InvitationItem[] =>
  _.orderBy(
    _.map(
      _.uniqBy(
        _.filter(
          shares,
          (share) =>
            share.status === 'PENDING' &&
            share.targetEntityType === VFOLDER_ENTITY_TYPE &&
            !(selfEmail && share.sharer?.basicInfo.email === selfEmail),
        ),
        'entityId',
      ),
      (share): InvitationItem => ({
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
        ...(share.recipientEntityType?.toLowerCase() ===
          PROJECT_ENTITY_TYPE && {
          recipientProjectName:
            (share.recipientEntity?.__typename === 'ProjectV2' &&
            'basicInfo' in share.recipientEntity
              ? share.recipientEntity.basicInfo.name
              : undefined) ??
            projectNames[share.recipientEntityId ?? ''] ??
            share.recipientEntityId ??
            undefined,
        }),
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
          recipientEntityType
          recipientEntityId
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
    myUserV2 {
      basicInfo {
        email
      }
      projects(filter: { isActive: true }, limit: 100) {
        edges {
          node {
            entityId
            basicInfo {
              name
            }
          }
        }
      }
    }
  }
`;

// Answering a project's share takes `update` on `entity_share` in that project
// (lablup/backend.ai#17162); `myEntityShares` never lists project shares.
const projectAnswerersQuery = graphql`
  query useVFolderInvitationsProjectAnswerersQuery(
    $targets: [PermissionTarget!]!
  ) {
    myAtomicBulkScopePermissions(input: { targets: $targets }) {
      items {
        scopeId
        permissions
      }
    }
  }
`;

const projectSharesQuery = graphql`
  query useVFolderInvitationsProjectSharesQuery($projects: [UUIDScope!]!) {
    entityShares(
      scope: { recipientProject: $projects }
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
          recipientEntityType
          recipientEntityId
          recipientEntity @catch(to: NULL) {
            __typename
            ... on ProjectV2 {
              basicInfo {
                name
              }
            }
          }
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

const loadProjectShares = async (
  projectIds: ReadonlyArray<string>,
): Promise<RecipientShare[]> => {
  if (_.isEmpty(projectIds)) return [];
  const permissions =
    await fetchQuery<useVFolderInvitationsProjectAnswerersQuery>(
      RelayEnvironment,
      projectAnswerersQuery,
      {
        targets: _.map(projectIds, (scopeId) => ({
          scopeType: PROJECT_ENTITY_TYPE,
          scopeId,
          entityType: 'entity_share',
        })),
      },
      { fetchPolicy: 'network-only' },
    ).toPromise();
  const answerableIds = _.map(
    _.filter(permissions?.myAtomicBulkScopePermissions?.items, (item) =>
      _.includes(item.permissions, 'UPDATE'),
    ),
    'scopeId',
  );
  if (_.isEmpty(answerableIds)) return [];
  const data = await fetchQuery<useVFolderInvitationsProjectSharesQuery>(
    RelayEnvironment,
    projectSharesQuery,
    { projects: _.map(answerableIds, (value) => ({ value })) },
    { fetchPolicy: 'network-only' },
  ).toPromise();
  return _.map(data?.entityShares?.edges, (edge) => edge.node);
};

const loadInvitations = async (): Promise<InvitationItem[]> => {
  const data = await fetchQuery<useVFolderInvitationsQuery>(
    RelayEnvironment,
    invitationsQuery,
    {},
    { fetchPolicy: 'network-only' },
  ).toPromise();
  const projects = _.map(data?.myUserV2?.projects?.edges, (edge) => edge.node);
  // A project's shares are an addition: failing to read them keeps the caller's own.
  const projectShares = await loadProjectShares(
    _.map(projects, 'entityId').slice(0, MAX_PERMISSION_TARGETS),
  ).catch(() => []);
  return toInvitationItems(
    [
      ..._.map(data?.myEntityShares?.edges, (edge) => edge.node),
      ...projectShares,
    ],
    {
      projectNames: _.fromPairs(
        _.map(projects, (project) => [
          project.entityId,
          project.basicInfo.name,
        ]),
      ),
      selfEmail: data?.myUserV2?.basicInfo?.email,
    },
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
