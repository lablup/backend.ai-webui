/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { backendaiClientPromise } from '.';
import { RelayEnvironment } from '../RelayEnvironment';
import { useVFolderInvitationsAcceptMutation } from '../__generated__/useVFolderInvitationsAcceptMutation.graphql';
import { useVFolderInvitationsMemberProjectsQuery } from '../__generated__/useVFolderInvitationsMemberProjectsQuery.graphql';
import { useVFolderInvitationsProjectAnswerersQuery } from '../__generated__/useVFolderInvitationsProjectAnswerersQuery.graphql';
import { useVFolderInvitationsProjectSharesQuery } from '../__generated__/useVFolderInvitationsProjectSharesQuery.graphql';
import { useVFolderInvitationsQuery } from '../__generated__/useVFolderInvitationsQuery.graphql';
import { useVFolderInvitationsRejectMutation } from '../__generated__/useVFolderInvitationsRejectMutation.graphql';
import type { ProjectContext } from '../types/projectContext';
import { mutationOptions, useCurrentUserRole } from './backendai';
import { useTanMutation } from './reactQueryAlias';
import { useIsPersonalProject } from './useAccessibleProjects';
import { useMutationWithPromise } from 'backend.ai-ui';
import { useAtom } from 'jotai';
import { atomFamily } from 'jotai-family';
import { atomWithDefault } from 'jotai/utils';
import * as _ from 'lodash-es';
import { fetchQuery, graphql } from 'react-relay';

const VFOLDER_ENTITY_TYPE = 'vfolder';
const PROJECT_ENTITY_TYPE = 'project';
// `myAtomicBulkScopePermissions` refuses more than 100 targets.
const MAX_PERMISSION_TARGETS = 100;

/** A pending folder share offered to the current user or to the project the page is on. */
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
  /** Set only where several projects' invitations are listed together. */
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
  sharer?: { basicInfo: { email: string } } | null;
  targetEntity?:
    | { __typename: 'VFolder'; metadata: { name: string } }
    | { __typename: string }
    | null;
}

const isEntityType = (value: string | null | undefined, type: string) =>
  value?.toLowerCase() === type;

/**
 * The pending folder shares among `shares`, newest first. With `projectNames`
 * a share addressed to a project is named by it, falling back to its id.
 */
export const toInvitationItems = (
  shares: ReadonlyArray<RecipientShare>,
  projectNames?: Readonly<Record<string, string>>,
): InvitationItem[] =>
  _.orderBy(
    _.map(
      _.uniqBy(
        _.filter(
          shares,
          (share) =>
            share.status === 'PENDING' &&
            isEntityType(share.targetEntityType, VFOLDER_ENTITY_TYPE),
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
        ...(projectNames &&
          isEntityType(share.recipientEntityType, PROJECT_ENTITY_TYPE) && {
            recipientProjectName:
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

const memberProjectsQuery = graphql`
  query useVFolderInvitationsMemberProjectsQuery {
    myUserV2 {
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

/** The pending shares addressed to `projectIds`, those the caller may answer for only. */
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

const loadOwnShares = async (): Promise<RecipientShare[]> => {
  const data = await fetchQuery<useVFolderInvitationsQuery>(
    RelayEnvironment,
    invitationsQuery,
    {},
    { fetchPolicy: 'network-only' },
  ).toPromise();
  return _.map(data?.myEntityShares?.edges, (edge) => edge.node);
};

/** The caller's own invitations and those of every project they are a member of and answer for. */
const loadAllInvitations = async (): Promise<InvitationItem[]> => {
  const [own, members] = await Promise.all([
    loadOwnShares(),
    fetchQuery<useVFolderInvitationsMemberProjectsQuery>(
      RelayEnvironment,
      memberProjectsQuery,
      {},
      { fetchPolicy: 'network-only' },
    ).toPromise(),
  ]);
  const projects = _.map(members?.myUserV2?.projects?.edges, 'node');
  // A project's shares are an addition: failing to read them keeps the caller's own.
  const projectShares = await loadProjectShares(
    _.map(projects, 'entityId').slice(0, MAX_PERMISSION_TARGETS),
  ).catch(() => []);
  return toInvitationItems(
    [...own, ...projectShares],
    _.fromPairs(
      _.map(projects, (project) => [project.entityId, project.basicInfo.name]),
    ),
  );
};

/** Whose invitations a page shows: the caller's own, one project's, all of them, or none. */
type InvitationScope = 'personal' | `project:${string}` | 'all' | 'none';

const loadInvitations = async (
  scope: InvitationScope,
): Promise<InvitationItem[]> => {
  if (scope === 'none') return [];
  if (scope === 'all') return loadAllInvitations();
  if (scope === 'personal') return toInvitationItems(await loadOwnShares());
  // A project whose shares cannot be read shows none rather than failing the page.
  return toInvitationItems(
    await loadProjectShares([scope.slice('project:'.length)]).catch(() => []),
  );
};

const vFolderInvitationsAtomFamily = atomFamily((scope: InvitationScope) =>
  atomWithDefault<InvitationItem[] | Promise<InvitationItem[]>>(async () => {
    // The Relay environment signs requests with the client, so wait for its login.
    await backendaiClientPromise;
    return loadInvitations(scope);
  }),
);

/**
 * The pending folder invitations of the page's project: the caller's own on
 * their personal project (an accepted share lands there), that project's on
 * any other. Without a project a superadmin gets them all, each project share
 * named by its project; anyone else none.
 */
export const useVFolderInvitations = (
  project: Pick<ProjectContext, 'id'> | null,
) => {
  'use memo';
  const isPersonalProject = useIsPersonalProject(project?.id);
  const isSuperAdmin = useCurrentUserRole() === 'superadmin';
  const scope: InvitationScope = !project
    ? isSuperAdmin
      ? 'all'
      : 'none'
    : isPersonalProject
      ? 'personal'
      : `project:${project.id}`;
  const [vFolderInvitations, setInvitations] = useAtom(
    vFolderInvitationsAtomFamily(scope),
  );

  const updateInvitations = async () => {
    setInvitations(await loadInvitations(scope));
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
