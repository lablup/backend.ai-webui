/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient } from '.';
import { hooksUsingRelay_ImageCanonicalNameQuery } from '../__generated__/hooksUsingRelay_ImageCanonicalNameQuery.graphql';
import { hooksUsingRelay_KeyPairQuery } from '../__generated__/hooksUsingRelay_KeyPairQuery.graphql';
import { hooksUsingRelay_KeyPairResourcePolicyQuery } from '../__generated__/hooksUsingRelay_KeyPairResourcePolicyQuery.graphql';
import { hooksUsingRelay_ScopedImageReferenceQuery } from '../__generated__/hooksUsingRelay_ScopedImageReferenceQuery.graphql';
import { SIGNED_32BIT_MAX_INT } from '../helper/const-vars';
import { useCurrentDomainScope } from './useCurrentDomainScope';
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

/** Snake-case field names kept so the session-form callers stay unchanged. */
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
  // Only for `concurrency_used`, which has no V2 counterpart.
  const [keypair] = useKeyPairLazyLoadQuery(baiClient?._config.accessKey);

  const { myKeypairResourcePolicyV2 } =
    useLazyLoadQuery<hooksUsingRelay_KeyPairResourcePolicyQuery>(
      graphql`
        query hooksUsingRelay_KeyPairResourcePolicyQuery {
          myKeypairResourcePolicyV2 {
            maxContainersPerSession
            maxConcurrentSessions
          }
        }
      `,
      {},
      {
        ...options,
        fetchKey: fetchKey + options.fetchKey,
      },
    );

  const keypairResourcePolicy: CurrentKeyPairResourcePolicy | null | undefined =
    myKeypairResourcePolicyV2 && {
      max_containers_per_session:
        myKeypairResourcePolicyV2.maxContainersPerSession,
      max_concurrent_sessions: myKeypairResourcePolicyV2.maxConcurrentSessions,
    };
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
 * Resolves an image id to its full reference `<canonicalName>@<architecture>`
 * through `scopedImagesV2` over the current domain and public registries
 * (ADR 0012), for admin pages. Falls back
 * to the canonical name alone, then the raw id. See `useImageCanonicalName` for
 * null-handling semantics.
 */
export const useScopedImageReference = (
  imageId: string | null | undefined,
  options: FetchOptions = { fetchPolicy: 'store-or-network' },
): string | undefined => {
  const { domainScope } = useCurrentDomainScope();
  const data = useLazyLoadQuery<hooksUsingRelay_ScopedImageReferenceQuery>(
    graphql`
      query hooksUsingRelay_ScopedImageReferenceQuery(
        $id: UUID!
        $scope: ImageSearchScope!
      ) {
        scopedImagesV2(
          scope: $scope
          filter: { id: { equals: $id } }
          limit: 1
        ) {
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
    { id: imageId ?? '', scope: { ...domainScope, public: true } },
    options,
  );
  if (!imageId) return undefined;
  const identity = data.scopedImagesV2?.edges?.[0]?.node?.identity;
  if (!identity?.canonicalName) return imageId;
  return identity.architecture
    ? `${identity.canonicalName}@${identity.architecture}`
    : identity.canonicalName;
};
