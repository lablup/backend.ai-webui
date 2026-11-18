/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { RelayEnvironment } from '../RelayEnvironment';
import { useAppConfigLoadQuery } from '../__generated__/useAppConfigLoadQuery.graphql';
import { useAppConfigMyUpsertMutation } from '../__generated__/useAppConfigMyUpsertMutation.graphql';
import {
  useAppConfigScopedQuery,
  useAppConfigScopedQuery$data,
  useAppConfigScopedQuery$variables,
} from '../__generated__/useAppConfigScopedQuery.graphql';
import { useAppConfigUpsertMutation } from '../__generated__/useAppConfigUpsertMutation.graphql';
import { useCurrentDomain } from './index';
import { atom, createStore, useAtomValue, useStore } from 'jotai';
import * as _ from 'lodash-es';
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
  type RecordProxy,
} from 'relay-runtime';

/**
 * App config documents (FR-1964). Design: ADR 0033.
 * - `loadMyAppConfig` reads the signed-in user's merged view into an atom.
 * - `useMyAppConfig` / `useMyAppConfigValue` read that atom; only `userConfig` is written from it.
 * - `useScopedAppConfig` reads and writes one scope's raw documents (admin pages).
 */
export type AppConfigName =
  'userConfig' | 'domainConfig' | 'publicConfigByDomain';
export type AppConfigDocument = Record<string, any>;
export type AppConfigDocuments = Partial<
  Record<AppConfigName, AppConfigDocument | undefined>
>;

/** One app config scope: PUBLIC has no id, DOMAIN takes the domain id, USER the user id. */
export type AppConfigScope =
  { type: 'public' } | { type: 'domain' | 'user'; id: string };
export const PUBLIC_SCOPE: AppConfigScope = { type: 'public' };

export type AppConfigSubKey = string | Array<string>;

/** A sub-key's next value, or a function of its current value. */
export type AppConfigUpdate = unknown | ((current: unknown) => unknown);

export interface AppConfigChange {
  configName: AppConfigName;
  subKey: AppConfigSubKey;
  /** `undefined` removes the sub-key. */
  value: AppConfigUpdate;
}

/** Names read from the merged view only; their writers use `useScopedAppConfig`. */
export type MergedAppConfigName = 'domainConfig' | 'publicConfigByDomain';

export const MY_APP_CONFIG_NAMES: ReadonlyArray<AppConfigName> = [
  'publicConfigByDomain',
  'domainConfig',
  'userConfig',
];

type JotaiStore = ReturnType<typeof createStore>;

export interface MyAppConfigState {
  /** `failed`: the first read failed, so there is no base to write `userConfig` on. */
  status: 'idle' | 'loaded' | 'failed';
  configs: AppConfigDocuments;
}

export const myAppConfigState = atom<MyAppConfigState>({
  status: 'idle',
  configs: {},
});

const loadQuery = graphql`
  query useAppConfigLoadQuery($configNames: [String!]!) {
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
    scopedAppConfigFragmentsByNames(scope: $scope, configNames: $configNames)
      @catch(to: NULL) {
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
const MY_QUEUE_KEY = 'USER:me';

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

const toDocuments = (
  rows: ReadonlyArray<{ configName: string; config: unknown } | null>,
): AppConfigDocuments =>
  Object.fromEntries(
    _.compact(rows).map((row) => [
      row.configName,
      _.isPlainObject(row.config)
        ? (row.config as AppConfigDocument)
        : undefined,
    ]),
  );

/**
 * Stores a `myAppConfigs` answer (the sign-in query's or `loadMyAppConfig`'s).
 * A failed read keeps an earlier answer as the base; with none, writes are refused.
 */
export const setMyAppConfigs = (
  store: JotaiStore,
  rows:
    | ReadonlyArray<{ configName: string; config: unknown } | null>
    | null
    | undefined,
) => {
  if (rows) {
    store.set(myAppConfigState, {
      status: 'loaded',
      configs: toDocuments(rows),
    });
  } else if (store.get(myAppConfigState).status !== 'loaded') {
    store.set(myAppConfigState, { status: 'failed', configs: {} });
  }
};

/** Back to the state before sign-in, for joining another server. */
export const clearMyAppConfigs = (store: JotaiStore) =>
  store.set(myAppConfigState, { status: 'idle', configs: {} });

const readMyAppConfigs = async (
  store: JotaiStore,
  environment: IEnvironment,
): Promise<void> => {
  const data = await fetchQuery<useAppConfigLoadQuery>(
    environment,
    loadQuery,
    { configNames: [...MY_APP_CONFIG_NAMES] },
    { fetchPolicy: 'network-only' },
  )
    .toPromise()
    .catch(() => undefined);
  setMyAppConfigs(store, data?.myAppConfigs);
};

const runningLoads = new WeakMap<JotaiStore, Promise<void>>();
const queuedLoads = new WeakMap<JotaiStore, Promise<void>>();

/**
 * Reads the signed-in user's merged `publicConfigByDomain`, `domainConfig`
 * and `userConfig` into `myAppConfigState`. Calls made while a read runs
 * share one read that starts after it, so it reflects every write landed by then.
 */
export const loadMyAppConfig = (
  store: JotaiStore,
  environment: IEnvironment = RelayEnvironment,
): Promise<void> => {
  const start = () => {
    const read = readMyAppConfigs(store, environment).finally(() => {
      if (runningLoads.get(store) === read) runningLoads.delete(store);
    });
    runningLoads.set(store, read);
    return read;
  };
  const running = runningLoads.get(store);
  if (!running) return start();
  const queued =
    queuedLoads.get(store) ??
    running.then(() => {
      queuedLoads.delete(store);
      return start();
    });
  queuedLoads.set(store, queued);
  return queued;
};

const commitMyUserConfig = (
  environment: IEnvironment,
  config: AppConfigDocument,
) =>
  new Promise<void>((resolve, reject) => {
    commitMutation<useAppConfigMyUpsertMutation>(environment, {
      mutation: myUpsertMutation,
      variables: { input: { items: [{ configName: 'userConfig', config }] } },
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

/** Unqueued: callers run it inside `serializeWrite(MY_QUEUE_KEY, …)`. */
const writeMyUserConfig = async (
  store: JotaiStore,
  environment: IEnvironment,
  subKey: AppConfigSubKey,
  update: AppConfigUpdate,
) => {
  const { status, configs } = store.get(myAppConfigState);
  if (status !== 'loaded') {
    throw new Error('userConfig could not be read, so it is not written');
  }
  // The merged view is the base: DOMAIN-scope `userConfig` keys are copied into the USER document.
  const next = applySubKey(configs.userConfig ?? {}, subKey, update);
  await commitMyUserConfig(environment, next);
  const latest = store.get(myAppConfigState);
  store.set(myAppConfigState, {
    ...latest,
    configs: { ...latest.configs, userConfig: next },
  });
};

/**
 * `userConfig` at `subKey` with its setter and reset. `set` writes the USER
 * document; `reset` removes the key there and reloads, so the DOMAIN-scope
 * default shows again. Both reject before sign-in or after a failed first read.
 */
export const useMyAppConfig = <T = unknown>(
  subKey: AppConfigSubKey,
): [
  T | undefined,
  (
    update: T | undefined | ((current: T | undefined) => T | undefined),
  ) => Promise<void>,
  () => Promise<void>,
] => {
  'use memo';
  const store = useStore();
  const environment = useRelayEnvironment();
  const { configs } = useAtomValue(myAppConfigState);
  const value = _.get(configs.userConfig, subKey) as T | undefined;

  const set = (
    update: T | undefined | ((current: T | undefined) => T | undefined),
  ) =>
    serializeWrite(MY_QUEUE_KEY, () =>
      writeMyUserConfig(store, environment, subKey, update),
    );

  // One queued task, so a write sent during the reset builds on the reloaded document.
  const reset = () =>
    serializeWrite(MY_QUEUE_KEY, async () => {
      await writeMyUserConfig(store, environment, subKey, undefined);
      await loadMyAppConfig(store, environment);
    });

  return [value, set, reset];
};

/** `loaded` once sign-in stored an answer; `set` and `reset` refuse otherwise. */
export const useMyAppConfigStatus = (): MyAppConfigState['status'] => {
  'use memo';
  return useAtomValue(myAppConfigState).status;
};

/**
 * The merged `domainConfig` or `publicConfigByDomain` at `subKey` (pass
 * `[domainName, ...]` for a domain's public slice). Read only.
 */
export const useMyAppConfigValue = <T = AppConfigDocument>(
  configName: MergedAppConfigName,
  subKey?: AppConfigSubKey,
): T | undefined => {
  'use memo';
  const doc = useAtomValue(myAppConfigState).configs[configName];
  return (subKey === undefined ? doc : _.get(doc, subKey)) as T | undefined;
};

const scopeRefOf = (scope: AppConfigScope) =>
  scope.type === 'public'
    ? { scopeType: 'PUBLIC' as const }
    : {
        scopeType:
          scope.type === 'domain' ? ('DOMAIN' as const) : ('USER' as const),
        scopeId: scope.id,
      };

const queueKeyOf = (scope: AppConfigScope) =>
  scope.type === 'public' ? 'PUBLIC:' : `${scope.type}:${scope.id}`;

/** Each requested name's document; `undefined` when the scope was not readable. */
const scopedDocumentsOf = (
  fragments: useAppConfigScopedQuery$data['scopedAppConfigFragmentsByNames'],
  names: ReadonlyArray<string>,
): AppConfigDocuments | undefined => {
  if (!fragments) return undefined;
  return Object.fromEntries(
    names.map((name, index) => [
      name,
      (fragments[index]?.config ?? undefined) as AppConfigDocument | undefined,
    ]),
  );
};

/** The read as the store holds it once a read still in flight lands; from the network when Relay collected it. */
const readCurrentDocuments = async (
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

/** Points the read at each written fragment: a first write, or one after a purge, returns an id the read does not hold. */
const linkWrittenFragments = (
  root: RecordProxy,
  args: useAppConfigScopedQuery$variables,
  written: ReadonlyArray<RecordProxy | null>,
) => {
  const field = 'scopedAppConfigFragmentsByNames';
  const names = args.configNames as ReadonlyArray<string>;
  const read = root.getLinkedRecords(field, args) ?? names.map(() => null);
  root.setLinkedRecords(
    names.map(
      (name, index) =>
        written.find((record) => record?.getValue('configName') === name) ??
        read[index] ??
        null,
    ),
    field,
    args,
  );
};

const commitScopedUpsert = (
  environment: IEnvironment,
  variables: useAppConfigScopedQuery$variables,
  items: Array<{ configName: string; config: AppConfigDocument }>,
) =>
  new Promise<void>((resolve, reject) => {
    commitMutation<useAppConfigUpsertMutation>(environment, {
      mutation: upsertMutation,
      variables: { input: { scope: variables.scope, items } },
      updater: (store) =>
        linkWrittenFragments(
          store.getRoot(),
          variables,
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

/**
 * One scope's raw documents, read from the network each time the screen
 * mounts. `upsertScopedAppConfig` writes on the documents read, one mutation,
 * and resolves with what it wrote; a write to PUBLIC or the signed-in domain
 * reloads `myAppConfigState`. Suspends; post-login only.
 */
export const useScopedAppConfig = (
  scope: AppConfigScope,
  configNames: Array<AppConfigName>,
) => {
  'use memo';
  const environment = useRelayEnvironment();
  const store = useStore();
  const { id: signedInDomainId } = useCurrentDomain();
  const variables: useAppConfigScopedQuery$variables = {
    scope: scopeRefOf(scope),
    configNames,
  };
  const data = useLazyLoadQuery<useAppConfigScopedQuery>(
    scopedQuery,
    variables,
    { fetchPolicy: 'network-only' },
  );

  const upsertScopedAppConfig = async (
    changes: AppConfigChange | Array<AppConfigChange>,
  ): Promise<AppConfigDocuments> => {
    const list = _.castArray(changes);
    const missing = list.find((c) => !configNames.includes(c.configName));
    if (missing) {
      throw new Error(
        `useScopedAppConfig: ${missing.configName} was not requested`,
      );
    }
    const operation = createOperationDescriptor(
      getRequest(scopedQuery),
      variables,
    );
    const written = await serializeWrite(queueKeyOf(scope), async () => {
      const docs = scopedDocumentsOf(
        (await readCurrentDocuments(environment, operation))
          .scopedAppConfigFragmentsByNames,
        configNames,
      );
      // The base would be empty, so the write would erase the stored document.
      if (!docs) {
        throw new Error(`useScopedAppConfig: ${scope.type} could not be read`);
      }
      for (const change of list) {
        docs[change.configName] = applySubKey(
          docs[change.configName] ?? {},
          change.subKey,
          change.value,
        );
      }
      const touched = _.uniq(list.map((c) => c.configName));
      await commitScopedUpsert(
        environment,
        variables,
        touched.map((configName) => ({
          configName,
          config: docs[configName] ?? {},
        })),
      );
      // A mount's read sent before the write landed would put the old document back: read once more after it.
      const lateRead = __internal.getPromiseForActiveRequest(
        environment,
        operation.request,
      );
      if (lateRead) {
        await lateRead.catch(() => undefined);
        await fetchQuery<useAppConfigScopedQuery>(
          environment,
          scopedQuery,
          variables,
          { fetchPolicy: 'network-only' },
        )
          .toPromise()
          .catch(() => undefined);
      }
      return _.pick(docs, touched);
    });
    if (
      scope.type === 'public' ||
      (scope.type === 'domain' && scope.id === signedInDomainId)
    ) {
      // Not awaited. Queued with the userConfig writes, so its answer cannot
      // replace a `set` that lands while it reads.
      serializeWrite(MY_QUEUE_KEY, () => loadMyAppConfig(store, environment));
    }
    return written;
  };

  return {
    scopedAppConfig: scopedDocumentsOf(
      data.scopedAppConfigFragmentsByNames,
      configNames,
    ),
    upsertScopedAppConfig,
  };
};
