/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useCurrentDomainValue } from '.';
import { useAppConfigMyQuery } from '../__generated__/useAppConfigMyQuery.graphql';
import { useAppConfigMyUpsertMutation } from '../__generated__/useAppConfigMyUpsertMutation.graphql';
import { useAppConfigPublicRawQuery } from '../__generated__/useAppConfigPublicRawQuery.graphql';
import { useAppConfigUpsertMutation } from '../__generated__/useAppConfigUpsertMutation.graphql';
import { useAppConfigUserRawQuery } from '../__generated__/useAppConfigUserRawQuery.graphql';
import { useMutationWithPromise } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import {
  fetchQuery,
  graphql,
  useLazyLoadQuery,
  useRelayEnvironment,
} from 'react-relay';

/**
 * App config documents this app reads (FR-1964). Each hook fetches where it
 * is used; reads are the server-side deep-merged view across allow-listed
 * scopes. Writes replace ONE scope's whole document, so setters re-read the
 * raw document first and edit on top of it.
 */
export type AppConfigName =
  'userConfig' | 'domainConfig' | 'publicConfigByDomain';
export type AppConfigDocument = Record<string, any>;

const myQuery = graphql`
  query useAppConfigMyQuery($configNames: [String!]!) {
    myAppConfigs(configNames: $configNames) {
      configName
      config
    }
  }
`;

// PUBLIC is baked into the query (not a variable) so this raw read cannot be
// pointed at another scope; it exists solely as the public write base.
const publicRawQuery = graphql`
  query useAppConfigPublicRawQuery($configNames: [String!]!) {
    scopedAppConfigFragmentsByNames(
      scope: { scopeType: PUBLIC }
      configNames: $configNames
    ) {
      id
      configName
      config
    }
  }
`;

// The own-user write base: the raw USER-scope fragment, not the merged
// `myAppConfigs` view (which folds domain defaults into the user doc).
const userRawQuery = graphql`
  query useAppConfigUserRawQuery($configNames: [String!]!) {
    myAppConfigFragmentsByNames(configNames: $configNames) {
      id
      configName
      config
    }
  }
`;

const upsertMutation = graphql`
  mutation useAppConfigUpsertMutation(
    $input: ScopedUpsertAppConfigFragmentsInput!
  ) {
    scopedUpsertAppConfigFragments(input: $input) {
      items {
        id
        configName
        config
      }
      failed {
        configName
        message
      }
    }
  }
`;

// The scoped mutation refuses `userConfig` at USER scope; the own-user write
// goes through the `my*` mutation, which needs no scope.
const myUpsertMutation = graphql`
  mutation useAppConfigMyUpsertMutation(
    $input: MyUpsertAppConfigFragmentsInput!
  ) {
    myUpsertAppConfigFragments(input: $input) {
      items {
        id
        configName
        config
      }
      failed {
        configName
        message
      }
    }
  }
`;

const applySubKey = (
  base: AppConfigDocument,
  subKey: string | Array<string>,
  nextValue: unknown,
): AppConfigDocument => {
  const next = _.cloneDeep(base);
  if (nextValue === undefined) {
    _.unset(next, subKey);
  } else {
    _.set(next, subKey, nextValue);
  }
  return next;
};

const throwOnFailed = (
  failed: ReadonlyArray<{
    readonly configName: string;
    readonly message: string;
  }>,
) => {
  if (failed.length > 0) {
    throw new Error(
      failed.map((f) => `${f.configName}: ${f.message}`).join('\n'),
    );
  }
};

/**
 * The current user's personal config (`userConfig`), merged server-side
 * across the allow-listed scopes (domain defaults < own overrides). Read
 * only. Suspends; post-login surfaces inside `RelayEnvironmentProvider`
 * only.
 */
export const useMyAppConfig = <T = AppConfigDocument>(
  subKey?: string | Array<string>,
): T | undefined => {
  'use memo';
  const data = useLazyLoadQuery<useAppConfigMyQuery>(myQuery, {
    configNames: ['userConfig'],
  });
  const doc = data?.myAppConfigs?.find((c) => c.configName === 'userConfig')
    ?.config as AppConfigDocument | undefined;
  return (subKey === undefined ? doc : _.get(doc, subKey)) as T | undefined;
};

/**
 * The domain-wide config (`domainConfig`) readable by every signed-in user
 * of the domain (admin-writable only). Read only. Suspends; post-login
 * surfaces inside `RelayEnvironmentProvider` only.
 */
export const useDomainAppConfig = <T = AppConfigDocument>(
  subKey?: string | Array<string>,
): T | undefined => {
  'use memo';
  const data = useLazyLoadQuery<useAppConfigMyQuery>(myQuery, {
    configNames: ['domainConfig'],
  });
  const doc = data.myAppConfigs.find((c) => c.configName === 'domainConfig')
    ?.config as AppConfigDocument | undefined;
  return (subKey === undefined ? doc : _.get(doc, subKey)) as T | undefined;
};

/**
 * Superadmin setter for ONE domain's slice of `publicConfigByDomain`:
 * re-reads the raw public document and replaces only `[domainName, ...subKey]`
 * so other domains' slices survive the whole-document write. Post-login admin
 * surfaces only. The anonymous read path picks the new document up on the
 * next load — the caller reloads for the own session (FR-1964).
 */
export const useUpdatePublicDomainAppConfig = () => {
  'use memo';
  const relayEnv = useRelayEnvironment();
  const currentDomainName = useCurrentDomainValue();
  const upsert =
    useMutationWithPromise<useAppConfigUpsertMutation>(upsertMutation);

  return async (
    subKey: string | Array<string>,
    nextValue: unknown,
    domainName?: string,
  ) => {
    const targetDomainName = domainName ?? currentDomainName;
    const raw = await fetchQuery<useAppConfigPublicRawQuery>(
      relayEnv,
      publicRawQuery,
      { configNames: ['publicConfigByDomain'] },
      { fetchPolicy: 'network-only' },
    ).toPromise();
    const rawDoc =
      (raw?.scopedAppConfigFragmentsByNames?.[0]?.config as
        AppConfigDocument | undefined) ?? {};
    const response = await upsert({
      input: {
        scope: { scopeType: 'PUBLIC' },
        items: [
          {
            configName: 'publicConfigByDomain',
            config: applySubKey(
              rawDoc,
              [targetDomainName, ..._.toPath(subKey)],
              nextValue,
            ),
          },
        ],
      },
    });
    throwOnFailed(response.scopedUpsertAppConfigFragments.failed);
  };
};

/**
 * Setter for the current user's own `userConfig` fragment: re-reads the raw
 * USER-scope document (not the merged view) and replaces only `subKey`.
 * Post-login surfaces only.
 */
export const useUpdateMyUserAppConfig = () => {
  'use memo';
  const relayEnv = useRelayEnvironment();
  const upsert =
    useMutationWithPromise<useAppConfigMyUpsertMutation>(myUpsertMutation);

  return async (subKey: string | Array<string>, nextValue: unknown) => {
    const raw = await fetchQuery<useAppConfigUserRawQuery>(
      relayEnv,
      userRawQuery,
      { configNames: ['userConfig'] },
      { fetchPolicy: 'network-only' },
    ).toPromise();
    const rawDoc =
      (raw?.myAppConfigFragmentsByNames?.[0]?.config as
        AppConfigDocument | undefined) ?? {};
    const response = await upsert({
      input: {
        items: [
          {
            configName: 'userConfig',
            config: applySubKey(rawDoc, _.toPath(subKey), nextValue),
          },
        ],
      },
    });
    throwOnFailed(response.myUpsertAppConfigFragments.failed);
  };
};
