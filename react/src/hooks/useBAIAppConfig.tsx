/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useCurrentDomainValue } from '.';
import { useBAIAppConfigDomainIdQuery } from '../__generated__/useBAIAppConfigDomainIdQuery.graphql';
import { useBAIAppConfigMergedQuery } from '../__generated__/useBAIAppConfigMergedQuery.graphql';
import { useBAIAppConfigMyRawQuery } from '../__generated__/useBAIAppConfigMyRawQuery.graphql';
import {
  useBAIAppConfigMyUpsertMutation,
  useBAIAppConfigMyUpsertMutation$data,
} from '../__generated__/useBAIAppConfigMyUpsertMutation.graphql';
import { useBAIAppConfigScopedRawQuery } from '../__generated__/useBAIAppConfigScopedRawQuery.graphql';
import {
  useBAIAppConfigScopedUpsertMutation,
  useBAIAppConfigScopedUpsertMutation$data,
} from '../__generated__/useBAIAppConfigScopedUpsertMutation.graphql';
import { atom, useAtomValue, useSetAtom } from 'jotai';
import * as _ from 'lodash-es';
import { useEffect, useState } from 'react';
import {
  commitMutation,
  fetchQuery,
  graphql,
  useLazyLoadQuery,
  useRelayEnvironment,
} from 'react-relay';
import type { IEnvironment } from 'relay-runtime';

/**
 * App config service documents this app reads (FR-1964). Reads are the
 * deep-merged view across allow-listed scopes (public < domain < user);
 * writes replace ONE scope's whole fragment document, so every setter
 * re-reads that scope's raw fragment first and edits on top of it —
 * writing the merged value back would freeze admin-set defaults into the
 * user's own fragment.
 */
export type AppConfigName = 'userConfig' | 'domainConfig';
export type AppConfigDocument = Record<string, any>;

const APP_CONFIG_NAMES: Array<AppConfigName> = ['userConfig', 'domainConfig'];

type MergedAppConfigs = Partial<Record<AppConfigName, AppConfigDocument>>;

// undefined until the post-login loader has fetched once.
const mergedAppConfigsAtom = atom<MergedAppConfigs | undefined>(undefined);
const appConfigsFetchKeyAtom = atom(0);

const mergedQuery = graphql`
  query useBAIAppConfigMergedQuery($configNames: [String!]!) {
    myAppConfigs(configNames: $configNames) {
      configName
      config
    }
  }
`;

const myRawQuery = graphql`
  query useBAIAppConfigMyRawQuery($configNames: [String!]!) {
    myAppConfigFragmentsByNames(configNames: $configNames) {
      id
      configName
      config
    }
  }
`;

const scopedRawQuery = graphql`
  query useBAIAppConfigScopedRawQuery(
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

const myUpsertMutation = graphql`
  mutation useBAIAppConfigMyUpsertMutation(
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

const scopedUpsertMutation = graphql`
  mutation useBAIAppConfigScopedUpsertMutation(
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

const applySubKey = (
  base: AppConfigDocument,
  subKey: string,
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
 * Fetch every app config document this app uses in ONE request and publish
 * the merged view to the shared atom. Mount once in the post-login layout;
 * value hooks below never fetch on their own.
 */
export const useBAIAppConfigsLoader = () => {
  'use memo';
  const relayEnv = useRelayEnvironment();
  const fetchKey = useAtomValue(appConfigsFetchKeyAtom);
  const setMergedConfigs = useSetAtom(mergedAppConfigsAtom);

  useEffect(() => {
    let disposed = false;
    fetchQuery<useBAIAppConfigMergedQuery>(
      relayEnv,
      mergedQuery,
      { configNames: APP_CONFIG_NAMES },
      { fetchPolicy: 'network-only' },
    )
      .toPromise()
      .then((data) => {
        if (disposed) return;
        const next: MergedAppConfigs = {};
        data?.myAppConfigs?.forEach((node) => {
          next[node.configName as AppConfigName] = node.config ?? {};
        });
        setMergedConfigs(next);
      });
    return () => {
      disposed = true;
    };
  }, [relayEnv, fetchKey, setMergedConfigs]);
};

/** Re-fetch the merged app configs (call after any fragment write). */
export const useBAIRefreshAppConfigs = () => {
  'use memo';
  const setFetchKey = useSetAtom(appConfigsFetchKeyAtom);
  return () => setFetchKey((k) => k + 1);
};

const useMergedAppConfigValue = <T,>(
  configName: AppConfigName,
  subKey: string,
): T | undefined => {
  'use memo';
  const mergedConfigs = useAtomValue(mergedAppConfigsAtom);
  return _.get(mergedConfigs?.[configName], subKey) as T | undefined;
};

/**
 * Domain-wide setting readable by every signed-in user of the domain
 * (config `domainConfig`, admin-writable only). Read-only by design; admins
 * write through `useBAIPrivateDomainConfigForAdmin`.
 */
export const useBAIPrivateDomainConfigValue = <T,>(
  subKey: string,
): T | undefined => {
  'use memo';
  return useMergedAppConfigValue<T>('domainConfig', subKey);
};

/**
 * Read-only variant of `useBAIMyPersonalConfig`. Touches only the shared
 * atom (no Relay context), so it is safe in providers mounted outside
 * `RelayEnvironmentProvider` (e.g. the theme chain).
 */
export const useBAIMyPersonalConfigValue = <T,>(
  subKey: string,
): T | undefined => {
  'use memo';
  return useMergedAppConfigValue<T>('userConfig', subKey);
};

/**
 * The current user's personal setting (config `userConfig`): reads the
 * merged view (domain defaults < own overrides), writes only the user's own
 * user-scope fragment.
 */
export const useBAIMyPersonalConfig = <T,>(
  subKey: string,
): [T | undefined, (nextValue: T | undefined) => Promise<void>] => {
  'use memo';
  const relayEnv = useRelayEnvironment();
  const refresh = useBAIRefreshAppConfigs();
  const value = useMergedAppConfigValue<T>('userConfig', subKey);

  const setValue = async (nextValue: T | undefined) => {
    const raw = await fetchQuery<useBAIAppConfigMyRawQuery>(
      relayEnv,
      myRawQuery,
      { configNames: ['userConfig'] },
      { fetchPolicy: 'network-only' },
    ).toPromise();
    const rawDoc =
      (raw?.myAppConfigFragmentsByNames?.[0]?.config as
        AppConfigDocument | undefined) ?? {};
    await commitMyUpsert(relayEnv, {
      configName: 'userConfig',
      config: applySubKey(rawDoc, subKey, nextValue),
    });
    refresh();
  };

  return [value, setValue];
};

const commitMyUpsert = (
  relayEnv: IEnvironment,
  item: { configName: string; config: AppConfigDocument },
) =>
  new Promise<useBAIAppConfigMyUpsertMutation$data>((resolve, reject) => {
    commitMutation<useBAIAppConfigMyUpsertMutation>(relayEnv, {
      mutation: myUpsertMutation,
      variables: { input: { items: [item] } },
      onCompleted: (response, errors) => {
        if (errors?.length) {
          reject(new Error(errors.map((e) => e.message).join('\n')));
          return;
        }
        try {
          throwOnFailed(response.myUpsertAppConfigFragments.failed);
        } catch (e) {
          reject(e);
          return;
        }
        resolve(response);
      },
      onError: reject,
    });
  });

const commitScopedUpsert = (
  relayEnv: IEnvironment,
  scopeId: string,
  item: { configName: string; config: AppConfigDocument },
) =>
  new Promise<useBAIAppConfigScopedUpsertMutation$data>((resolve, reject) => {
    commitMutation<useBAIAppConfigScopedUpsertMutation>(relayEnv, {
      mutation: scopedUpsertMutation,
      variables: {
        input: {
          scope: { scopeType: 'DOMAIN', scopeId },
          items: [item],
        },
      },
      onCompleted: (response, errors) => {
        if (errors?.length) {
          reject(new Error(errors.map((e) => e.message).join('\n')));
          return;
        }
        try {
          throwOnFailed(response.scopedUpsertAppConfigFragments.failed);
        } catch (e) {
          reject(e);
          return;
        }
        resolve(response);
      },
      onError: reject,
    });
  });

/**
 * Admin view of ONE config's domain-scope fragment: `value` is the raw
 * fragment's subKey (what this domain's admins wrote — NOT the merged view),
 * `set` re-reads the raw fragment and replaces only the subKey. Suspends;
 * post-login admin surfaces only.
 */
const useBAIDomainScopedConfigForAdmin = <T,>(
  configName: AppConfigName,
  subKey: string,
  domainName?: string,
): [T | undefined, (nextValue: T | undefined) => Promise<void>] => {
  'use memo';
  const relayEnv = useRelayEnvironment();
  const refresh = useBAIRefreshAppConfigs();
  const currentDomainName = useCurrentDomainValue();
  const targetDomainName = domainName ?? currentDomainName;
  const [rawFetchKey, setRawFetchKey] = useState(0);

  const { domainV2 } = useLazyLoadQuery<useBAIAppConfigDomainIdQuery>(
    graphql`
      query useBAIAppConfigDomainIdQuery($domainName: String!) {
        domainV2(domainName: $domainName) {
          id
          entityId
        }
      }
    `,
    { domainName: targetDomainName },
  );
  const domainId = domainV2?.entityId;

  const rawData = useLazyLoadQuery<useBAIAppConfigScopedRawQuery>(
    scopedRawQuery,
    {
      scope: { scopeType: 'DOMAIN', scopeId: domainId },
      configNames: [configName],
    },
    { fetchKey: rawFetchKey, fetchPolicy: 'network-only' },
  );
  const value = _.get(
    rawData?.scopedAppConfigFragmentsByNames?.[0]?.config,
    subKey,
  ) as T | undefined;

  const setValue = async (nextValue: T | undefined) => {
    if (!domainId) {
      throw new Error(`Domain not found: ${targetDomainName}`);
    }
    const raw = await fetchQuery<useBAIAppConfigScopedRawQuery>(
      relayEnv,
      scopedRawQuery,
      {
        scope: { scopeType: 'DOMAIN', scopeId: domainId },
        configNames: [configName],
      },
      { fetchPolicy: 'network-only' },
    ).toPromise();
    const rawDoc =
      (raw?.scopedAppConfigFragmentsByNames?.[0]?.config as
        AppConfigDocument | undefined) ?? {};
    await commitScopedUpsert(relayEnv, domainId, {
      configName,
      config: applySubKey(rawDoc, subKey, nextValue),
    });
    setRawFetchKey((k) => k + 1);
    refresh();
  };

  return [value, setValue];
};

/** Admin editor for `domainConfig` (e.g. the domain theme). */
export const useBAIPrivateDomainConfigForAdmin = <T,>(
  subKey: string,
  domainName?: string,
) => useBAIDomainScopedConfigForAdmin<T>('domainConfig', subKey, domainName);

/**
 * Admin editor for `userConfig`'s DOMAIN-scope fragment — the domain-wide
 * defaults under every user's personal config (e.g. the theme family
 * catalog).
 */
export const useBAIUserConfigDomainDefaultsForAdmin = <T,>(
  subKey: string,
  domainName?: string,
) => useBAIDomainScopedConfigForAdmin<T>('userConfig', subKey, domainName);
