import { gqlAdmin } from './admin-api';
import { waitForGraphQL } from './dashboard-util';
import type { APIRequestContext, Page } from '@playwright/test';

type AccountSettings = Record<string, unknown>;

// The `userConfig.settings` an upsert writes (ADR 0035), or undefined.
const writtenSettings = (variables: any): AccountSettings | undefined => {
  const item = variables?.input?.items?.find(
    (entry: any) => entry?.configName === 'userConfig',
  );
  const config =
    typeof item?.config === 'string' ? JSON.parse(item.config) : item?.config;
  return config?.settings;
};

/**
 * Resolves when an account settings write whose `settings` pass `matches`
 * lands. Start it before the change: the write is debounced by 500ms.
 */
export const waitForAccountSettingsWrite = (
  page: Page,
  matches: (settings: AccountSettings) => boolean,
  timeout = 15_000,
) =>
  waitForGraphQL(
    page,
    'useAppConfigMyUpsertMutation',
    (variables) => {
      const settings = writtenSettings(variables);
      return !!settings && matches(settings);
    },
    timeout,
  );

/** Resolves when a write stores `name` as `value`; `undefined` means removed. */
export const waitForAccountSettingWrite = (
  page: Page,
  name: string,
  value: unknown,
  timeout?: number,
) =>
  waitForAccountSettingsWrite(
    page,
    (settings) =>
      value === undefined
        ? !(name in settings)
        : JSON.stringify(settings[name]) === JSON.stringify(value),
    timeout,
  );

/** Resolves once MainLayout has started the account settings sync. */
export const waitForAccountSettingsSync = (page: Page) =>
  page.waitForFunction(() => (globalThis as any).__mainLayoutReady === true);

// The signed-in account's own `userConfig` fragment, not the merged view.
const readMyUserConfig = async (
  api: APIRequestContext,
): Promise<Record<string, any>> => {
  const data = await gqlAdmin<{
    myAppConfigFragmentsByNames: Array<{ config: unknown } | null>;
  }>(
    api,
    `query { myAppConfigFragmentsByNames(configNames: ["userConfig"]) { config } }`,
  );
  const config = data.myAppConfigFragmentsByNames?.[0]?.config;
  const parsed = typeof config === 'string' ? JSON.parse(config) : config;
  return parsed && typeof parsed === 'object' ? parsed : {};
};

/** The stored value of account setting `name`; `undefined` when unset. */
export const readAccountSettingViaApi = async (
  api: APIRequestContext,
  name: string,
): Promise<unknown> => (await readMyUserConfig(api)).settings?.[name];

/**
 * Stores `value` as account setting `name` of the `api` account, keeping its
 * other settings; `undefined` removes the key. The app picks it up on its
 * next full load.
 */
export const writeAccountSettingViaApi = async (
  api: APIRequestContext,
  name: string,
  value: unknown,
): Promise<void> => {
  const config = await readMyUserConfig(api);
  const settings = { ...(config.settings ?? {}) };
  if (value === undefined) delete settings[name];
  else settings[name] = value;
  await gqlAdmin(
    api,
    `mutation ($input: MyUpsertAppConfigFragmentsInput!) {
      myAtomicBulkUpsertAppConfigFragments(input: $input) { items { id } }
    }`,
    {
      input: {
        items: [{ configName: 'userConfig', config: { ...config, settings } }],
      },
    },
  );
};
