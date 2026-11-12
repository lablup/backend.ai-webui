/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useCurrentDomain, useSuspendedBackendaiClient } from '.';
import { useAppConfigMergedQuery } from '../__generated__/useAppConfigMergedQuery.graphql';
import {
  useAppConfigScopedQuery,
  useAppConfigScopedQuery$variables,
} from '../__generated__/useAppConfigScopedQuery.graphql';
import { useAppConfigUpsertMutation } from '../__generated__/useAppConfigUpsertMutation.graphql';
import * as _ from 'lodash-es';
import { useEffect, useEffectEvent } from 'react';
import {
  commitMutation,
  fetchQuery,
  graphql,
  useLazyLoadQuery,
  useRelayEnvironment,
} from 'react-relay';
import {
  __internal,
  createOperationDescriptor,
  getRequest,
  type IEnvironment,
} from 'relay-runtime';

/**
 * App config documents (FR-1964): `useScopedAppConfig` reads and writes one
 * scope's raw document, `useMyAppConfig` reads the server-side merged view.
 * Hook layout and the write-base limit: ADR 0033.
 */
export type AppConfigName =
  'userConfig' | 'domainConfig' | 'publicConfigByDomain';
export type AppConfigDocument = Record<string, any>;

/** `scopeId` defaults to the signed-in user's domain (DOMAIN) or id (USER). */
export type AppConfigScope =
  | { scopeType: 'PUBLIC' }
  | { scopeType: 'DOMAIN'; scopeId?: string }
  | { scopeType: 'USER'; scopeId?: string };

export type AppConfigSubKey = string | Array<string>;

/** A sub-key's next value, or a function of its current raw value. */
export type AppConfigUpdate = unknown | ((current: unknown) => unknown);

/** Names read through the merged view: every user reads them, but only their DOMAIN/PUBLIC writers may read the raw scope. */
export type MergedAppConfigName = 'domainConfig' | 'publicConfigByDomain';

const mergedQuery = graphql`
  query useAppConfigMergedQuery($configNames: [String!]!) {
    myAppConfigs(configNames: $configNames) {
      configName
      config
    }
  }
`;

const scopedQuery = graphql`
  query useAppConfigScopedQuery(
    $scope: AppConfigScopeRef!
    $configNames: [String!]!
  ) {
    scopedAppConfigFragmentsByNames(scope: $scope, configNames: $configNames) {
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
    scopedAtomicBulkUpsertAppConfigFragments(input: $input) {
      items {
        id
        configName
        config
      }
    }
  }
`;

const applySubKey = (
  base: AppConfigDocument,
  subKey: AppConfigSubKey,
  update: AppConfigUpdate,
): AppConfigDocument => {
  const next = _.cloneDeep(base);
  const nextValue =
    typeof update === 'function' ? update(_.get(base, subKey)) : update;
  if (nextValue === undefined) {
    _.unset(next, subKey);
  } else {
    _.set(next, subKey, nextValue);
  }
  return next;
};

// The upsert replaces the whole document, so two overlapping writes to one
// document would drop a change: each runs after the previous one settles.
const writeQueues = new Map<string, Promise<unknown>>();
const serializeWrite = <T>(
  doc: string,
  write: () => Promise<T>,
): Promise<T> => {
  const next = (writeQueues.get(doc) ?? Promise.resolve()).then(write, write);
  writeQueues.set(
    doc,
    next.catch(() => undefined),
  );
  return next;
};

/**
 * The document as the store holds it now, after any read still in flight for
 * it lands (a late read would otherwise put an older copy back); read again
 * when Relay has collected it.
 */
const readDocument = async (
  environment: IEnvironment,
  variables: useAppConfigScopedQuery$variables,
): Promise<AppConfigDocument> => {
  const operation = createOperationDescriptor(
    getRequest(scopedQuery),
    variables,
  );
  await __internal
    .getPromiseForActiveRequest(environment, operation.request)
    ?.catch(() => undefined);
  const snapshot = environment.lookup(operation.fragment);
  const data = snapshot.isMissingData
    ? await fetchQuery<useAppConfigScopedQuery>(
        environment,
        scopedQuery,
        variables,
        { fetchPolicy: 'network-only' },
      ).toPromise()
    : (snapshot.data as useAppConfigScopedQuery['response']);
  return (data?.scopedAppConfigFragmentsByNames?.[0]?.config ??
    {}) as AppConfigDocument;
};

const upsertDocument = (
  environment: IEnvironment,
  variables: useAppConfigScopedQuery$variables,
  config: AppConfigDocument,
) =>
  new Promise<void>((resolve, reject) => {
    commitMutation<useAppConfigUpsertMutation>(environment, {
      mutation: upsertMutation,
      variables: {
        input: {
          scope: variables.scope,
          items: [{ configName: variables.configNames[0], config }],
        },
      },
      // Point the read at the fragment the upsert returned: a first write, or
      // one after the fragment was purged, returns an id the read does not hold.
      updater: (store) => {
        const written = store
          .getRootField('scopedAtomicBulkUpsertAppConfigFragments')
          ?.getLinkedRecords('items')?.[0];
        if (written) {
          store
            .getRoot()
            .setLinkedRecords(
              [written],
              'scopedAppConfigFragmentsByNames',
              variables,
            );
        }
      },
      onCompleted: (_response, errors) => {
        if (errors) {
          reject(new Error(errors.map((e) => e.message).join('\n')));
        } else {
          resolve();
        }
      },
      onError: reject,
    });
  });

const fetchMergedView = (
  environment: IEnvironment,
  configName: MergedAppConfigName,
) =>
  fetchQuery<useAppConfigMergedQuery>(
    environment,
    mergedQuery,
    { configNames: [configName] },
    { fetchPolicy: 'network-only' },
  ).toPromise();

// Documents a mount found missing, so useLazyLoadQuery fetched them for it.
const fetchedForMount = new Set<string>();

const useScopeVariables = (
  scope: AppConfigScope,
  configName: AppConfigName,
): useAppConfigScopedQuery$variables => {
  const baiClient = useSuspendedBackendaiClient();
  const { id: domainId } = useCurrentDomain();
  const scopeId =
    scope.scopeType === 'PUBLIC'
      ? undefined
      : (scope.scopeId ??
        (scope.scopeType === 'DOMAIN' ? domainId : baiClient.user_uuid));
  return {
    scope:
      scopeId === undefined
        ? { scopeType: scope.scopeType }
        : { scopeType: scope.scopeType, scopeId },
    configNames: [configName],
  };
};

/**
 * `setKey` alone, for a screen that writes one scope's document without
 * showing it: nothing suspends, and the write reads the document when the
 * store does not hold it. Post-login surfaces only.
 */
export const useScopedAppConfigSetter = (
  scope: AppConfigScope,
  configName: AppConfigName,
) => {
  'use memo';
  const relayEnv = useRelayEnvironment();
  const variables = useScopeVariables(scope, configName);

  return (subKey: AppConfigSubKey, update: AppConfigUpdate) =>
    serializeWrite(
      `${variables.scope.scopeType}:${variables.scope.scopeId ?? ''}:${configName}`,
      async () => {
        const base = await readDocument(relayEnv, variables);
        await upsertDocument(
          relayEnv,
          variables,
          applySubKey(base, subKey, update),
        );
        if (configName === 'domainConfig') {
          // Not awaited: the write has landed, and a failed refetch only leaves the merged view stale.
          fetchMergedView(relayEnv, configName).catch(() => undefined);
        }
      },
    );
};

/**
 * One scope's raw document, read once per mount and kept current from the
 * upsert responses. `setKey` sends that document with one sub-key replaced
 * (`undefined` removes it) as a single upsert. A `domainConfig` write also
 * refetches the merged view its every-user readers use. Suspends; post-login
 * surfaces only. DOMAIN is readable by superadmins only.
 */
export const useScopedAppConfig = <T = AppConfigDocument>(
  scope: AppConfigScope,
  configName: AppConfigName,
) => {
  'use memo';
  const relayEnv = useRelayEnvironment();
  const variables = useScopeVariables(scope, configName);
  const operation = createOperationDescriptor(
    getRequest(scopedQuery),
    variables,
  );
  const { identifier } = operation.request;
  if (relayEnv.check(operation).status === 'missing') {
    fetchedForMount.add(identifier);
  }
  const data = useLazyLoadQuery<useAppConfigScopedQuery>(
    scopedQuery,
    variables,
    { fetchPolicy: 'store-and-network' },
  );
  // useLazyLoadQuery does not fetch a query another mounted reader still
  // retains, so a mount served from the store reads the document once itself.
  const refreshOnMount = useEffectEvent(() => {
    if (fetchedForMount.delete(identifier)) return;
    fetchQuery<useAppConfigScopedQuery>(relayEnv, scopedQuery, variables, {
      fetchPolicy: 'network-only',
    })
      .toPromise()
      .catch(() => undefined);
  });
  useEffect(() => {
    refreshOnMount();
  }, []);
  const doc = (data.scopedAppConfigFragmentsByNames[0]?.config ?? undefined) as
    T | undefined;
  const setKey = useScopedAppConfigSetter(scope, configName);

  return { doc, setKey };
};

/**
 * The signed-in user's merged view of `domainConfig` or
 * `publicConfigByDomain` (pass `[domainName, ...]` for a domain's slice).
 * One request per name, so `domainConfig` reuses what the sign-in query
 * stored. Read only. Suspends; post-login surfaces only.
 */
export const useMyAppConfig = <T = AppConfigDocument>(
  configName: MergedAppConfigName,
  subKey?: AppConfigSubKey,
): T | undefined => {
  'use memo';
  const data = useLazyLoadQuery<useAppConfigMergedQuery>(mergedQuery, {
    configNames: [configName],
  });
  const doc = data.myAppConfigs.find((c) => c.configName === configName)
    ?.config as AppConfigDocument | undefined;
  return (subKey === undefined ? doc : _.get(doc, subKey)) as T | undefined;
};
