/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useCurrentDomain, useSuspendedBackendaiClient } from '.';
import { useAppConfigMergedQuery } from '../__generated__/useAppConfigMergedQuery.graphql';
import {
  useAppConfigScopedQuery,
  useAppConfigScopedQuery$data,
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
  type OperationDescriptor,
} from 'relay-runtime';

/**
 * App config documents (FR-1964): `useScopedAppConfig` reads and writes the
 * raw documents of the PUBLIC, current DOMAIN and own USER scopes,
 * `useMyAppConfig` reads the server-side merged view. Design: ADR 0033.
 */
export type AppConfigName =
  'userConfig' | 'domainConfig' | 'publicConfigByDomain';
export type AppConfigDocument = Record<string, any>;

/** The scopes `useScopedAppConfig` reads: PUBLIC, the current domain, the signed-in user. */
export type AppConfigScopeKey = 'public' | 'domain' | 'user';
export type ScopedAppConfigRequest = Partial<
  Record<AppConfigScopeKey, Array<AppConfigName>>
>;
/** Per scope, each requested name's raw document (`undefined` when the scope holds none). */
export type ScopedAppConfigDocuments = Partial<
  Record<AppConfigName, AppConfigDocument | undefined>
>;

export type AppConfigSubKey = string | Array<string>;

/** A sub-key's next value, or a function of its current raw value. */
export type AppConfigUpdate = unknown | ((current: unknown) => unknown);

export interface AppConfigChange {
  scope: AppConfigScopeKey;
  configName: AppConfigName;
  subKey: AppConfigSubKey;
  /** `undefined` removes the sub-key. */
  value: AppConfigUpdate;
}

/** Names read through the merged view: every user reads them, but only their DOMAIN/PUBLIC writers may read the raw scope. */
export type MergedAppConfigName = 'domainConfig' | 'publicConfigByDomain';

const SCOPE_KEYS: Array<AppConfigScopeKey> = ['public', 'domain', 'user'];

const mergedQuery = graphql`
  query useAppConfigMergedQuery($configNames: [String!]!) {
    myAppConfigs(configNames: $configNames) {
      configName
      config
    }
  }
`;

// One request for every requested scope; a scope the caller may not read
// (DOMAIN for anyone but a superadmin) comes back null instead of failing the rest.
const scopedQuery = graphql`
  query useAppConfigScopedQuery(
    $publicScope: AppConfigScopeRef!
    $publicNames: [String!]!
    $skipPublic: Boolean!
    $domainScope: AppConfigScopeRef!
    $domainNames: [String!]!
    $skipDomain: Boolean!
    $userScope: AppConfigScopeRef!
    $userNames: [String!]!
    $skipUser: Boolean!
  ) {
    public: scopedAppConfigFragmentsByNames(
      scope: $publicScope
      configNames: $publicNames
    ) @skip(if: $skipPublic) @catch(to: NULL) {
      id
      configName
      config
    }
    domain: scopedAppConfigFragmentsByNames(
      scope: $domainScope
      configNames: $domainNames
    ) @skip(if: $skipDomain) @catch(to: NULL) {
      id
      configName
      config
    }
    user: scopedAppConfigFragmentsByNames(
      scope: $userScope
      configNames: $userNames
    ) @skip(if: $skipUser) @catch(to: NULL) {
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
// scope would drop a change: each runs after the previous one settles.
const writeQueues = new Map<string, Promise<unknown>>();
const serializeWrite = <T>(
  key: string,
  write: () => Promise<T>,
): Promise<T> => {
  const next = (writeQueues.get(key) ?? Promise.resolve()).then(write, write);
  writeQueues.set(
    key,
    next.catch(() => undefined),
  );
  return next;
};

const scopeVariable = (key: AppConfigScopeKey) =>
  `${key}Scope` as 'publicScope' | 'domainScope' | 'userScope';
const namesVariable = (key: AppConfigScopeKey) =>
  `${key}Names` as 'publicNames' | 'domainNames' | 'userNames';

const useScopedVariables = (
  request: ScopedAppConfigRequest,
): useAppConfigScopedQuery$variables => {
  const baiClient = useSuspendedBackendaiClient();
  const { id: domainId } = useCurrentDomain();
  return {
    publicScope: { scopeType: 'PUBLIC' },
    publicNames: request.public ?? [],
    skipPublic: !request.public?.length,
    domainScope: { scopeType: 'DOMAIN', scopeId: domainId },
    domainNames: request.domain ?? [],
    skipDomain: !request.domain?.length,
    userScope: { scopeType: 'USER', scopeId: baiClient.user_uuid },
    userNames: request.user ?? [],
    skipUser: !request.user?.length,
  };
};

/** Each requested name's document in one scope's answer; `undefined` when the scope was not readable. */
const documentsOf = (
  fragments: useAppConfigScopedQuery$data['public'],
  names: ReadonlyArray<string>,
): ScopedAppConfigDocuments | undefined => {
  if (!fragments) return undefined;
  return Object.fromEntries(
    names.map((name, index) => [
      name,
      (fragments[index]?.config ?? undefined) as AppConfigDocument | undefined,
    ]),
  );
};

/**
 * The hook's read as the store holds it now, after a read of it still in
 * flight lands (a late read would otherwise put an older copy back); read
 * again when Relay has collected it.
 */
const readCurrent = async (
  environment: IEnvironment,
  operation: OperationDescriptor,
): Promise<useAppConfigScopedQuery$data> => {
  await __internal
    .getPromiseForActiveRequest(environment, operation.request)
    ?.catch(() => undefined);
  const snapshot = environment.lookup(operation.fragment);
  if (!snapshot.isMissingData) {
    return snapshot.data as useAppConfigScopedQuery$data;
  }
  return fetchQuery<useAppConfigScopedQuery>(
    environment,
    scopedQuery,
    operation.request.variables as useAppConfigScopedQuery$variables,
    { fetchPolicy: 'network-only' },
  ).toPromise() as Promise<useAppConfigScopedQuery$data>;
};

const upsertScope = (
  environment: IEnvironment,
  variables: useAppConfigScopedQuery$variables,
  key: AppConfigScopeKey,
  items: Array<{ configName: string; config: AppConfigDocument }>,
) =>
  new Promise<void>((resolve, reject) => {
    const scope = variables[scopeVariable(key)];
    const names = variables[namesVariable(key)];
    commitMutation<useAppConfigUpsertMutation>(environment, {
      mutation: upsertMutation,
      variables: { input: { scope, items } },
      // Point the read at each fragment the upsert returned: a first write, or
      // one after the fragment was purged, returns an id the read does not hold.
      updater: (store) => {
        const root = store.getRoot();
        const args = { scope, configNames: names };
        const read =
          root.getLinkedRecords('scopedAppConfigFragmentsByNames', args) ??
          names.map(() => null);
        const written =
          store
            .getRootField('scopedAtomicBulkUpsertAppConfigFragments')
            ?.getLinkedRecords('items') ?? [];
        const next = names.map(
          (name, index) =>
            written.find((record) => record?.getValue('configName') === name) ??
            read[index] ??
            null,
        );
        root.setLinkedRecords(next, 'scopedAppConfigFragmentsByNames', args);
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

// A fetch younger than this was the mount's own suspending read.
const JUST_FETCHED_MS = 2000;

/**
 * The raw PUBLIC, current-DOMAIN and own-USER documents the request names, read
 * in one request: the store's copy renders first, and each mount reads the
 * documents once more (useLazyLoadQuery does not refetch a query another
 * mounted reader, such as MainLayout, still retains). `upsert` writes on the
 * documents the hook holds, one mutation per scope. Suspends; post-login only.
 */
export const useScopedAppConfig = (request: ScopedAppConfigRequest) => {
  'use memo';
  const relayEnv = useRelayEnvironment();
  const variables = useScopedVariables(request);
  const operation = createOperationDescriptor(
    getRequest(scopedQuery),
    variables,
  );
  const data = useLazyLoadQuery<useAppConfigScopedQuery>(
    scopedQuery,
    variables,
    { fetchPolicy: 'store-and-network' },
  );

  const refreshOnMount = useEffectEvent(() => {
    const availability = relayEnv.check(operation);
    if (
      availability.status === 'available' &&
      availability.fetchTime != null &&
      Date.now() - availability.fetchTime < JUST_FETCHED_MS
    ) {
      return;
    }
    fetchQuery<useAppConfigScopedQuery>(relayEnv, scopedQuery, variables, {
      fetchPolicy: 'network-only',
    })
      .toPromise()
      .catch(() => undefined);
  });
  useEffect(() => {
    refreshOnMount();
  }, [operation.request.identifier]);

  const upsert = async (changes: AppConfigChange | Array<AppConfigChange>) => {
    const byScope = _.groupBy(_.castArray(changes), (change) => change.scope);
    for (const key of SCOPE_KEYS) {
      const scopeChanges = byScope[key];
      if (!scopeChanges) continue;
      const names = variables[namesVariable(key)];
      const missing = scopeChanges.find((c) => !names.includes(c.configName));
      if (missing) {
        throw new Error(
          `useScopedAppConfig: ${key}.${missing.configName} was not requested`,
        );
      }
      const scope = variables[scopeVariable(key)];
      await serializeWrite(
        `${scope.scopeType}:${scope.scopeId ?? ''}`,
        async () => {
          const current = (await readCurrent(relayEnv, operation))[key];
          // A scope that failed to read must not be written: the base would be empty.
          if (!current) {
            throw new Error(`useScopedAppConfig: ${key} could not be read`);
          }
          const docs = documentsOf(current, names) ?? {};
          for (const change of scopeChanges) {
            docs[change.configName] = applySubKey(
              docs[change.configName] ?? {},
              change.subKey,
              change.value,
            );
          }
          const touched = _.uniq(scopeChanges.map((c) => c.configName));
          await upsertScope(
            relayEnv,
            variables,
            key,
            touched.map((configName) => ({
              configName,
              config: docs[configName] ?? {},
            })),
          );
          if (touched.includes('domainConfig')) {
            // Not awaited: the write has landed, and a failed refetch only leaves the merged view stale.
            fetchMergedView(relayEnv, 'domainConfig').catch(() => undefined);
          }
        },
      );
    }
  };

  return {
    public: documentsOf(data.public, variables.publicNames),
    domain: documentsOf(data.domain, variables.domainNames),
    user: documentsOf(data.user, variables.userNames),
    upsert,
  };
};

/**
 * The signed-in user's merged view of `domainConfig` or
 * `publicConfigByDomain` (pass `[domainName, ...]` for a domain's slice).
 * One request per name, so `domainConfig` can reuse what the sign-in query
 * or another reader left in the store. Read only. Suspends; post-login only.
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
