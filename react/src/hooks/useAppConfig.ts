/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useAppConfigMergedQuery } from '../__generated__/useAppConfigMergedQuery.graphql';
import {
  useAppConfigMyFragmentsQuery,
  useAppConfigMyFragmentsQuery$data,
} from '../__generated__/useAppConfigMyFragmentsQuery.graphql';
import { useAppConfigMyUpsertMutation } from '../__generated__/useAppConfigMyUpsertMutation.graphql';
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
  type GraphQLTaggedNode,
  type IEnvironment,
  type OperationDescriptor,
  type OperationType,
  type RecordProxy,
} from 'relay-runtime';

/**
 * App config documents (FR-1964): `useScopedAppConfig` reads and writes the
 * raw documents of the scopes it is given, `useMyAppConfigFragments` the
 * signed-in user's own, and `useMyAppConfig` reads the server-side merged
 * view. Design: ADR 0033.
 */
export type AppConfigName =
  'userConfig' | 'domainConfig' | 'publicConfigByDomain';
export type AppConfigDocument = Record<string, any>;

export type AppConfigScopeKey = 'public' | 'domain' | 'user';
/** One app config scope: PUBLIC has no id, DOMAIN takes the domain id, USER the user id. */
export type AppConfigScope =
  { type: 'public' } | { type: 'domain' | 'user'; id: string };
export const PUBLIC_SCOPE: AppConfigScope = { type: 'public' };
export interface ScopedAppConfigRequestItem {
  scope: AppConfigScope;
  configNames: Array<AppConfigName>;
}
/** At most one item per scope type: the query holds one field per type. */
export type ScopedAppConfigRequest =
  ScopedAppConfigRequestItem | Array<ScopedAppConfigRequestItem>;
/** Per scope, each requested name's raw document (`undefined` when the scope holds none). */
export type ScopedAppConfigDocuments = Partial<
  Record<AppConfigName, AppConfigDocument | undefined>
>;

export type AppConfigSubKey = string | Array<string>;

/** A sub-key's next value, or a function of its current raw value. */
export type AppConfigUpdate = unknown | ((current: unknown) => unknown);

export interface AppConfigChange {
  /** One of the scopes the hook was called with. */
  scope: AppConfigScope;
  configName: AppConfigName;
  subKey: AppConfigSubKey;
  /** `undefined` removes the sub-key. */
  value: AppConfigUpdate;
}

/** Each written scope's documents after `upsertScopedAppConfig`, keyed by scope type. */
export type WrittenAppConfigDocuments = Partial<
  Record<AppConfigScopeKey, ScopedAppConfigDocuments>
>;

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

// `myAppConfigs` answers one merged document per name with no per-scope
// split, so the own-user raw document is read from the fragment field.
const myFragmentsQuery = graphql`
  query useAppConfigMyFragmentsQuery($configNames: [String!]!) {
    myAppConfigFragmentsByNames(configNames: $configNames) {
      id
      configName
      config
    }
  }
`;

const myUpsertMutation = graphql`
  mutation useAppConfigMyUpsertMutation(
    $input: MyUpsertAppConfigFragmentsInput!
  ) {
    myAtomicBulkUpsertAppConfigFragments(input: $input) {
      items {
        id
        configName
        config
      }
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

const SCOPE_TYPE = {
  public: 'PUBLIC',
  domain: 'DOMAIN',
  user: 'USER',
} as const;

const scopeIdOf = (scope: AppConfigScope) =>
  scope.type === 'public' ? undefined : scope.id;

const toScopedQueryVariables = (
  request: ScopedAppConfigRequest,
): useAppConfigScopedQuery$variables => {
  const items = _.castArray(request);
  const byType = _.groupBy(items, (item) => item.scope.type);
  const duplicate = SCOPE_KEYS.find((key) => (byType[key]?.length ?? 0) > 1);
  if (duplicate) {
    throw new Error(`useScopedAppConfig: ${duplicate} was requested twice`);
  }
  const variables = {} as Record<string, unknown>;
  for (const key of SCOPE_KEYS) {
    const item = byType[key]?.[0];
    // A skipped field still needs its non-null variable; PUBLIC's shape is valid for any type.
    variables[scopeVariable(key)] = item
      ? { scopeType: SCOPE_TYPE[key], scopeId: scopeIdOf(item.scope) }
      : { scopeType: SCOPE_TYPE[key] };
    variables[namesVariable(key)] = item?.configNames ?? [];
    variables[`skip${_.upperFirst(key)}`] = !item?.configNames.length;
  }
  return variables as unknown as useAppConfigScopedQuery$variables;
};

/** Each requested name's document in one scope's answer; `undefined` when the scope was not readable. */
const scopedDocumentsOf = (
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
const readCurrentDocuments = async <Q extends OperationType>(
  environment: IEnvironment,
  query: GraphQLTaggedNode,
  operation: OperationDescriptor,
): Promise<Q['response']> => {
  await __internal
    .getPromiseForActiveRequest(environment, operation.request)
    ?.catch(() => undefined);
  const snapshot = environment.lookup(operation.fragment);
  if (!snapshot.isMissingData) {
    return snapshot.data as Q['response'];
  }
  return fetchQuery<Q>(
    environment,
    query,
    operation.request.variables as Q['variables'],
    { fetchPolicy: 'network-only' },
  ).toPromise() as Promise<Q['response']>;
};

/** Points the read at each written fragment: a first write, or one after a purge, returns an id the read does not hold. */
const linkWrittenFragments = (
  root: RecordProxy,
  readField: string,
  args: Record<string, unknown>,
  names: ReadonlyArray<string>,
  written: ReadonlyArray<RecordProxy | null>,
) => {
  const read = root.getLinkedRecords(readField, args) ?? names.map(() => null);
  root.setLinkedRecords(
    names.map(
      (name, index) =>
        written.find((record) => record?.getValue('configName') === name) ??
        read[index] ??
        null,
    ),
    readField,
    args,
  );
};

const commitScopedUpsert = (
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
      updater: (store) =>
        linkWrittenFragments(
          store.getRoot(),
          'scopedAppConfigFragmentsByNames',
          { scope, configNames: names },
          names,
          store
            .getRootField('scopedAtomicBulkUpsertAppConfigFragments')
            ?.getLinkedRecords('items') ?? [],
        ),
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

const refetchMergedAppConfig = (
  environment: IEnvironment,
  configName: MergedAppConfigName,
) =>
  fetchQuery<useAppConfigMergedQuery>(
    environment,
    mergedQuery,
    { configNames: [configName] },
    { fetchPolicy: 'network-only' },
  ).toPromise();

/**
 * The raw documents of the scopes the request names, read in one request: the
 * store's copy renders first, and each mount reads them once more
 * (useLazyLoadQuery does not refetch a query another mounted reader still
 * retains). `upsert` writes on the documents the hook holds, one mutation per
 * scope, and resolves with what it wrote. Suspends; post-login only.
 */
export const useScopedAppConfig = (request: ScopedAppConfigRequest) => {
  'use memo';
  const relayEnv = useRelayEnvironment();
  const variables = toScopedQueryVariables(request);
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
    fetchQuery<useAppConfigScopedQuery>(relayEnv, scopedQuery, variables, {
      fetchPolicy: 'network-only',
    })
      .toPromise()
      .catch(() => undefined);
  });
  useEffect(() => {
    refreshOnMount();
  }, [operation.request.identifier]);

  const upsertScopedAppConfig = async (
    changes: AppConfigChange | Array<AppConfigChange>,
  ): Promise<WrittenAppConfigDocuments> => {
    const written: WrittenAppConfigDocuments = {};
    const list = _.castArray(changes);
    // Checked before any scope is sent, so a bad change leaves every scope unwritten.
    const missing = list.find((c) => {
      const key = c.scope.type;
      const scope = variables[scopeVariable(key)];
      return (
        !variables[namesVariable(key)].includes(c.configName) ||
        (scopeIdOf(c.scope) ?? null) !== (scope.scopeId ?? null)
      );
    });
    if (missing) {
      throw new Error(
        `useScopedAppConfig: ${missing.scope.type}.${missing.configName} was not requested`,
      );
    }
    const byScope = _.groupBy(list, (c) => c.scope.type);
    for (const key of SCOPE_KEYS) {
      const scopeChanges = byScope[key];
      if (!scopeChanges) continue;
      const names = variables[namesVariable(key)];
      const scope = variables[scopeVariable(key)];
      await serializeWrite(
        `${scope.scopeType}:${scope.scopeId ?? ''}`,
        async () => {
          const current = (
            await readCurrentDocuments<useAppConfigScopedQuery>(
              relayEnv,
              scopedQuery,
              operation,
            )
          )[key];
          // A scope that failed to read must not be written: the base would be empty.
          if (!current) {
            throw new Error(`useScopedAppConfig: ${key} could not be read`);
          }
          const docs = scopedDocumentsOf(current, names) ?? {};
          for (const change of scopeChanges) {
            docs[change.configName] = applySubKey(
              docs[change.configName] ?? {},
              change.subKey,
              change.value,
            );
          }
          const touched = _.uniq(scopeChanges.map((c) => c.configName));
          written[key] = _.pick(docs, touched);
          await commitScopedUpsert(
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
            refetchMergedAppConfig(relayEnv, 'domainConfig').catch(
              () => undefined,
            );
          }
        },
      );
    }
    return written;
  };

  return {
    scopedAppConfig: {
      public: scopedDocumentsOf(data.public, variables.publicNames),
      domain: scopedDocumentsOf(data.domain, variables.domainNames),
      user: scopedDocumentsOf(data.user, variables.userNames),
    },
    upsertScopedAppConfig,
  };
};

/** A change to the signed-in user's own document: the scope is implied. */
export type MyAppConfigChange = Omit<AppConfigChange, 'scope'>;

const myFragmentDocumentsOf = (
  fragments: useAppConfigMyFragmentsQuery$data['myAppConfigFragmentsByNames'],
  names: ReadonlyArray<string>,
): ScopedAppConfigDocuments =>
  Object.fromEntries(
    names.map((name, index) => [
      name,
      (fragments[index]?.config ?? undefined) as AppConfigDocument | undefined,
    ]),
  );

/**
 * The signed-in user's own USER documents, read and written through the
 * `my*` fields, which take no scope id. Same read and write rules as
 * `useScopedAppConfig`. Suspends; post-login only.
 */
export const useMyAppConfigFragments = (configNames: Array<AppConfigName>) => {
  'use memo';
  const relayEnv = useRelayEnvironment();
  const variables = { configNames };
  const operation = createOperationDescriptor(
    getRequest(myFragmentsQuery),
    variables,
  );
  const data = useLazyLoadQuery<useAppConfigMyFragmentsQuery>(
    myFragmentsQuery,
    variables,
    { fetchPolicy: 'store-and-network' },
  );

  const refreshOnMount = useEffectEvent(() => {
    fetchQuery<useAppConfigMyFragmentsQuery>(
      relayEnv,
      myFragmentsQuery,
      variables,
      { fetchPolicy: 'network-only' },
    )
      .toPromise()
      .catch(() => undefined);
  });
  useEffect(() => {
    refreshOnMount();
  }, [operation.request.identifier]);

  const upsertMyAppConfigFragments = async (
    changes: MyAppConfigChange | Array<MyAppConfigChange>,
  ): Promise<ScopedAppConfigDocuments> => {
    const list = _.castArray(changes);
    const missing = list.find((c) => !configNames.includes(c.configName));
    if (missing) {
      throw new Error(
        `useMyAppConfigFragments: ${missing.configName} was not requested`,
      );
    }
    return serializeWrite('USER:me', async () => {
      const current = await readCurrentDocuments<useAppConfigMyFragmentsQuery>(
        relayEnv,
        myFragmentsQuery,
        operation,
      );
      const docs = myFragmentDocumentsOf(
        current.myAppConfigFragmentsByNames,
        configNames,
      );
      for (const change of list) {
        docs[change.configName] = applySubKey(
          docs[change.configName] ?? {},
          change.subKey,
          change.value,
        );
      }
      const touched = _.uniq(list.map((c) => c.configName));
      await new Promise<void>((resolve, reject) => {
        commitMutation<useAppConfigMyUpsertMutation>(relayEnv, {
          mutation: myUpsertMutation,
          variables: {
            input: {
              items: touched.map((configName) => ({
                configName,
                config: docs[configName] ?? {},
              })),
            },
          },
          updater: (store) =>
            linkWrittenFragments(
              store.getRoot(),
              'myAppConfigFragmentsByNames',
              { configNames },
              configNames,
              store
                .getRootField('myAtomicBulkUpsertAppConfigFragments')
                ?.getLinkedRecords('items') ?? [],
            ),
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
      return _.pick(docs, touched);
    });
  };

  return {
    myAppConfigFragments: myFragmentDocumentsOf(
      data.myAppConfigFragmentsByNames,
      configNames,
    ),
    upsertMyAppConfigFragments,
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
  // The sign-in query reads the same field with `@catch(to: NULL)`, so the store may hold null.
  const doc = data?.myAppConfigs?.find((c) => c.configName === configName)
    ?.config as AppConfigDocument | undefined;
  return (subKey === undefined ? doc : _.get(doc, subKey)) as T | undefined;
};
