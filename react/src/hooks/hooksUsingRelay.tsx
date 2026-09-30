/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient } from '.';
import { hooksUsingRelay_AdminImageReferenceQuery } from '../__generated__/hooksUsingRelay_AdminImageReferenceQuery.graphql';
import { hooksUsingRelay_ImageCanonicalNameQuery } from '../__generated__/hooksUsingRelay_ImageCanonicalNameQuery.graphql';
import { hooksUsingRelay_KeyPairQuery } from '../__generated__/hooksUsingRelay_KeyPairQuery.graphql';
import { hooksUsingRelay_KeyPairResourcePolicyQuery } from '../__generated__/hooksUsingRelay_KeyPairResourcePolicyQuery.graphql';
import { SIGNED_32BIT_MAX_INT } from '../helper/const-vars';
import { useUpdatableState } from 'backend.ai-ui';
import { useCallback } from 'react';
import { graphql, FetchPolicy, useLazyLoadQuery } from 'react-relay';

interface FetchOptions {
  fetchKey?: string | number;
  fetchPolicy?: FetchPolicy;
}
export const useKeyPairLazyLoadQuery = (
  accessKey: string,
  options: FetchOptions = {
    fetchPolicy: 'store-and-network',
  },
) => {
  const [fetchKey, updateFetchKey] = useUpdatableState('first');
  const { keypair } = useLazyLoadQuery<hooksUsingRelay_KeyPairQuery>(
    graphql`
      query hooksUsingRelay_KeyPairQuery($accessKey: String!) {
        keypair(access_key: $accessKey) {
          id
          resource_policy
          concurrency_used
        }
      }
    `,
    {
      accessKey: accessKey,
    },
    {
      ...options,
      fetchKey: fetchKey + options.fetchKey,
    },
  );

  const refresh = useCallback(() => {
    updateFetchKey();
  }, [updateFetchKey]);

  return [keypair, { refresh }] as const;
};

/** The legacy field names, kept so V2 and legacy managers read the same. */
interface CurrentKeyPairResourcePolicy {
  max_containers_per_session: number | null | undefined;
  max_concurrent_sessions: number | null | undefined;
}

export const useCurrentKeyPairResourcePolicyLazyLoadQuery = (
  options: FetchOptions = {
    fetchPolicy: 'store-and-network',
  },
) => {
  'use memo';
  const [fetchKey, updateFetchKey] = useUpdatableState('first');
  const baiClient = useSuspendedBackendaiClient();
  const supportsResourcePolicyV2 = baiClient.supports('resource-policy-v2');
  // Still needed on V2 for `concurrency_used`, which has no V2 counterpart.
  const [keypair] = useKeyPairLazyLoadQuery(baiClient?._config.accessKey);

  const { myKeypairResourcePolicyV2, keypair_resource_policy } =
    useLazyLoadQuery<hooksUsingRelay_KeyPairResourcePolicyQuery>(
      graphql`
        query hooksUsingRelay_KeyPairResourcePolicyQuery(
          $name: String!
          $supportsResourcePolicyV2: Boolean!
        ) {
          myKeypairResourcePolicyV2
            @since(version: "26.4.2")
            @include(if: $supportsResourcePolicyV2) {
            maxContainersPerSession
            maxConcurrentSessions
          }
          keypair_resource_policy(name: $name)
            @deprecatedSince(version: "26.4.2")
            @skip(if: $supportsResourcePolicyV2) {
            max_containers_per_session
            max_concurrent_sessions
          }
        }
      `,
      {
        name: keypair?.resource_policy || '',
        supportsResourcePolicyV2,
      },
      {
        ...options,
        fetchKey: fetchKey + options.fetchKey,
      },
    );

  const keypairResourcePolicy: CurrentKeyPairResourcePolicy | null | undefined =
    supportsResourcePolicyV2
      ? myKeypairResourcePolicyV2 && {
          max_containers_per_session:
            myKeypairResourcePolicyV2.maxContainersPerSession,
          max_concurrent_sessions:
            myKeypairResourcePolicyV2.maxConcurrentSessions,
        }
      : keypair_resource_policy;
  const maxConcurrentSessions =
    keypairResourcePolicy?.max_concurrent_sessions || SIGNED_32BIT_MAX_INT;

  const refresh = () => {
    updateFetchKey();
  };

  return [
    {
      keypairResourcePolicy: (keypairResourcePolicy ||
        {}) as CurrentKeyPairResourcePolicy,
      keypair: (keypair || {}) as NonNullable<typeof keypair>,
      sessionLimitAndRemaining: {
        max: maxConcurrentSessions,
        remaining: maxConcurrentSessions - (keypair?.concurrency_used || 0),
      },
    },
    { refresh },
  ] as const;
};

/**
 * Resolve an image id (raw UUID stored on `execution.imageId`) to its
 * canonical name via the user-scoped `imageV2` query. Returns `undefined`
 * when no `imageId` is supplied; otherwise returns the canonical name or
 * falls back to the `imageId` itself when the image cannot be resolved.
 *
 * The hook always runs the query (hooks cannot be conditional), so when
 * `imageId` is empty it issues one no-op request with an empty id and
 * ignores the result.
 */
export const useImageCanonicalName = (
  imageId: string | null | undefined,
  options: FetchOptions = { fetchPolicy: 'store-or-network' },
): string | undefined => {
  const data = useLazyLoadQuery<hooksUsingRelay_ImageCanonicalNameQuery>(
    graphql`
      query hooksUsingRelay_ImageCanonicalNameQuery($id: ID!) {
        imageV2(id: $id) {
          identity {
            canonicalName
          }
        }
      }
    `,
    { id: imageId ?? '' },
    options,
  );
  if (!imageId) return undefined;
  return data.imageV2?.identity.canonicalName ?? imageId;
};

/**
 * Admin-scoped counterpart of `useImageCanonicalName`. Resolves an image id to
 * its full reference `<canonicalName>@<architecture>` via `adminImagesV2` for
 * admin pages where the user-scoped `imageV2` query is not available. Falls back
 * to the canonical name alone, then the raw id. See `useImageCanonicalName` for
 * null-handling semantics.
 */
export const useAdminImageReference = (
  imageId: string | null | undefined,
  options: FetchOptions = { fetchPolicy: 'store-or-network' },
): string | undefined => {
  const data = useLazyLoadQuery<hooksUsingRelay_AdminImageReferenceQuery>(
    graphql`
      query hooksUsingRelay_AdminImageReferenceQuery($id: UUID!) {
        adminImagesV2(filter: { id: { equals: $id } }, limit: 1) {
          edges {
            node {
              identity {
                canonicalName
                architecture
              }
            }
          }
        }
      }
    `,
    { id: imageId ?? '' },
    options,
  );
  if (!imageId) return undefined;
  const identity = data.adminImagesV2?.edges?.[0]?.node?.identity;
  if (!identity?.canonicalName) return imageId;
  return identity.architecture
    ? `${identity.canonicalName}@${identity.architecture}`
    : identity.canonicalName;
};
