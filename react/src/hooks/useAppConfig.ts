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
 * - `useMyAppConfig` reads that atom; only `userConfig` is written from it.
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

// The `userConfig` the server last accepted (read or written): the base a failed write rolls back to.
const confirmedUserConfigs = new WeakMap<JotaiStore, AppConfigDocument>();

/** Leaf paths where two documents differ; arrays and scalars are leaves. */
const changedPaths = (
  a: unknown,
  b: unknown,
  path: Array<string> = [],
): Array<Array<string>> => {
  if (_.isPlainObject(a) && _.isPlainObject(b)) {
    const keys = _.union(_.keys(a), _.keys(b));
    return keys.flatMap((key) =>
      changedPaths(
        (a as AppConfigDocument)[key],
        (b as AppConfigDocument)[key],
        [...path, key],
      ),
    );
  }
  return _.isEqual(a, b) ? [] : [path];
};

/** `target` with the value of `source` at each path (`undefined` removes it). */
const withPaths = (
  target: AppConfigDocument,
  source: AppConfigDocument,
  paths: Array<Array<string>>,
): AppConfigDocument => {
  const next = _.cloneDeep(target);
  for (const path of paths) {
    const value = _.get(source, path);
    if (value === undefined) _.unset(next, path);
    else _.set(next, path, _.cloneDeep(value));
  }
  return next;
};

/**
 * Stores a `myAppConfigs` answer (the sign-in query's or `loadMyAppConfig`'s).
 * A `userConfig` change not sent yet is applied again on the answer. A failed
 * read keeps an earlier answer as the base; with none, writes are refused.
 */
export const setMyAppConfigs = (
  store: JotaiStore,
  rows:
    | ReadonlyArray<{ configName: string; config: unknown } | null>
    | null
    | undefined,
) => {
  if (rows) {
    const configs = toDocuments(rows);
    const server = configs.userConfig ?? {};
    const confirmed = confirmedUserConfigs.get(store);
    const current = store.get(myAppConfigState).configs.userConfig;
    if (confirmed && current) {
      configs.userConfig = withPaths(
        server,
        current,
        changedPaths(confirmed, current),
      );
    }
    confirmedUserConfigs.set(store, server);
    store.set(myAppConfigState, { status: 'loaded', configs });
  } else if (store.get(myAppConfigState).status !== 'loaded') {
    store.set(myAppConfigState, { status: 'failed', configs: {} });
  }
};

/** Back to the state before sign-in, for joining another server. */
export const clearMyAppConfigs = (store: JotaiStore) => {
  confirmedUserConfigs.delete(store);
  store.set(myAppConfigState, { status: 'idle', configs: {} });
};

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

/**
 * Changes `userConfig` in the atom at once; `sendMyUserConfig` stores it. Throws
 * while the status is not `loaded`, since there is no document to build on.
 */
export const applyMyUserConfig = (
  store: JotaiStore,
  subKey: AppConfigSubKey,
  update: AppConfigUpdate,
) => {
  const { status, configs } = store.get(myAppConfigState);
  if (status !== 'loaded') {
    throw new Error('userConfig could not be read, so it is not written');
  }
  // The merged view is the base: DOMAIN-scope `userConfig` keys are copied into the USER document.
  store.set(myAppConfigState, {
    status,
    configs: {
      ...configs,
      userConfig: applySubKey(configs.userConfig ?? {}, subKey, update),
    },
  });
};

/** Unqueued: callers run it inside `serializeWrite(MY_QUEUE_KEY, …)`. */
const sendMyUserConfigNow = async (
  store: JotaiStore,
  environment: IEnvironment,
) => {
  const sent = store.get(myAppConfigState).configs.userConfig ?? {};
  const confirmed = confirmedUserConfigs.get(store) ?? {};
  if (_.isEqual(sent, confirmed)) return;
  try {
    await commitMyUserConfig(environment, sent);
    confirmedUserConfigs.set(store, sent);
  } catch (error) {
    // Roll back only what this write carried, and only where nothing changed it since.
    const latest = store.get(myAppConfigState);
    const current = latest.configs.userConfig ?? {};
    const failed = changedPaths(confirmed, sent).filter((path) =>
      _.isEqual(_.get(current, path), _.get(sent, path)),
    );
    store.set(myAppConfigState, {
      ...latest,
      configs: {
        ...latest.configs,
        userConfig: withPaths(current, confirmed, failed),
      },
    });
    throw error;
  }
};

/** Sends the atom's `userConfig` as the USER document, after the writes queued before it. */
export const sendMyUserConfig = (
  store: JotaiStore,
  environment: IEnvironment = RelayEnvironment,
): Promise<void> =>
  serializeWrite(MY_QUEUE_KEY, () => sendMyUserConfigNow(store, environment));

export type MyAppConfigSetter<T> = (
  update: T | undefined | ((current: T | undefined) => T | undefined),
) => Promise<void>;

/**
 * One merged document from the atom, at `subKey` (pass `[domainName, ...]` for
 * a domain's `publicConfigByDomain` slice), with the atom's read status.
 * Only `userConfig` gets `set` (shows the change at once, then writes the USER
 * document; a failed write rolls the change back) and `reset` (removes the key
 * there and reloads, so the DOMAIN-scope default shows again); both reject
 * while the status is not `loaded`.
 */
export function useMyAppConfig<T = unknown>(
  configName: 'userConfig',
  subKey: AppConfigSubKey,
): [
  T | undefined,
  MyAppConfigSetter<T>,
  () => Promise<void>,
  MyAppConfigState['status'],
];
export function useMyAppConfig<T = AppConfigDocument>(
  configName: MergedAppConfigName,
  subKey?: AppConfigSubKey,
): [T | undefined, undefined, undefined, MyAppConfigState['status']];
export function useMyAppConfig(
  configName: AppConfigName,
  subKey?: AppConfigSubKey,
) {
  'use memo';
  const store = useStore();
  const environment = useRelayEnvironment();
  const { status, configs } = useAtomValue(myAppConfigState);
  const doc = configs[configName];
  const value = subKey === undefined ? doc : _.get(doc, subKey);

  if (configName !== 'userConfig' || subKey === undefined) {
    return [value, undefined, undefined, status];
  }

  const set: MyAppConfigSetter<unknown> = (update) => {
    try {
      applyMyUserConfig(store, subKey, update);
    } catch (error) {
      return Promise.reject(error);
    }
    return sendMyUserConfig(store, environment);
  };

  // One queued task: the write, then the reload that brings the DOMAIN default back.
  const reset = () => {
    try {
      applyMyUserConfig(store, subKey, undefined);
    } catch (error) {
      return Promise.reject(error);
    }
    return serializeWrite(MY_QUEUE_KEY, async () => {
      await sendMyUserConfigNow(store, environment);
      await loadMyAppConfig(store, environment);
    });
  };

  return [value, set, reset, status];
}

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
