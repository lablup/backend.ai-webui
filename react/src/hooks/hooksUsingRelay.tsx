/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient } from '.';
import { hooksUsingRelay_KeyPairQuery } from '../__generated__/hooksUsingRelay_KeyPairQuery.graphql';
import { hooksUsingRelay_KeyPairResourcePolicyQuery } from '../__generated__/hooksUsingRelay_KeyPairResourcePolicyQuery.graphql';
import { SIGNED_32BIT_MAX_INT } from '../helper/const-vars';
import { useUpdatableState } from 'backend.ai-ui';
import _ from 'lodash';
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

export const useCurrentKeyPairResourcePolicyLazyLoadQuery = (
  options: FetchOptions = {
    fetchPolicy: 'store-and-network',
  },
) => {
  const [fetchKey, updateFetchKey] = useUpdatableState('first');
  const baiClient = useSuspendedBackendaiClient();
  const [keypair] = useKeyPairLazyLoadQuery(baiClient?._config.accessKey);

  const { keypair_resource_policy } =
    useLazyLoadQuery<hooksUsingRelay_KeyPairResourcePolicyQuery>(
      graphql`
        query hooksUsingRelay_KeyPairResourcePolicyQuery($name: String!) {
          keypair_resource_policy(name: $name) {
            max_containers_per_session
            max_concurrent_sessions
          }
        }
      `,
      {
        name: keypair?.resource_policy || '',
      },
      {
        ...options,
        fetchKey: fetchKey + options.fetchKey,
      },
    );

  const refresh = useCallback(() => {
    updateFetchKey();
  }, [updateFetchKey]);

  return [
    {
      keypairResourcePolicy: (keypair_resource_policy || {}) as NonNullable<
        typeof keypair_resource_policy
      >,
      keypair: (keypair || {}) as NonNullable<typeof keypair>,
      sessionLimitAndRemaining: {
        max: _.min([
          (keypair_resource_policy || {}).max_concurrent_sessions ||
            SIGNED_32BIT_MAX_INT,
          3, //BackendAiResourceBroker.DEFAULT_CONCURRENT_SESSION_COUNT
        ]) as number,
        remaining:
          ((keypair_resource_policy || {}).max_concurrent_sessions || 3) -
          ((keypair || {}).concurrency_used || 0),
      },
    },
    { refresh },
  ] as const;
};
